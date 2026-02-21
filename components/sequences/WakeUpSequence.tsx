"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations, Text } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";

interface WakeUpSequenceProps {
  bedPosition?: [number, number, number];
  bedRotation?: number;
  onComplete: () => void;
  startAnimation?: boolean;
  cameraPosition?: [number, number, number];
  cameraLookAt?: [number, number, number];
}

export function WakeUpSequence({
  bedPosition = [3.0, 0.55, -5.0],
  bedRotation = 0,
  onComplete,
  startAnimation = false,
  cameraPosition = [2.5, 1.4, -3.5],
  cameraLookAt = [3.0, 0.8, -5.0],
}: WakeUpSequenceProps) {
  const groupRef = useRef<THREE.Group>(null);
  const hasStarted = useRef(false);
  const [isComplete, setIsComplete] = useState(false);
  const { camera } = useThree();

  // OFFSET crítico - ajuste isso!
  const [characterOffset, setCharacterOffset] = useState(-0.45);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Carrega o modelo COM animação
  const { scene, animations } = useGLTF("/models/Sit To Stand.glb");

  // Clona e aplica a POSE SENTADA (frame 0)
  const clone = useMemo(() => {
    const clonedScene = SkeletonUtils.clone(scene);

    // Se houver animações, aplica o frame 0 (sentado)
    if (animations && animations.length > 0) {
      const mixer = new THREE.AnimationMixer(clonedScene);
      const action = mixer.clipAction(animations[0]);
      action.time = 0; // Frame 0 = pose sentada
      action.play();
      mixer.update(0); // Aplica a pose
    }

    // Configura materiais
    clonedScene.traverse((node: THREE.Object3D) => {
      const mesh = node as THREE.Mesh;
      if (mesh.isMesh || (node as THREE.SkinnedMesh).isSkinnedMesh) {
        if (mesh.material) {
          const mat = Array.isArray(mesh.material)
            ? mesh.material[0]
            : mesh.material;
          if (mat) {
            const clonedMat = mat.clone();
            clonedMat.transparent = false;
            clonedMat.opacity = 1;
            clonedMat.depthWrite = true;
            clonedMat.depthTest = true;
            if (Array.isArray(mesh.material)) {
              mesh.material = [clonedMat];
            } else {
              mesh.material = clonedMat;
            }
          }
        }
      }
    });

    return clonedScene;
  }, [scene, animations]);

  // Configura animação REAL
  const { mixer } = useAnimations(animations, groupRef);

  // Posiciona a câmera
  useEffect(() => {
    camera.position.set(...cameraPosition);
    camera.lookAt(...cameraLookAt);

    // DEBUG: Listener para ajustes
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "n" || e.key === "N") {
        setCharacterOffset((prev) => prev - 0.05);
        console.log(`🔻 OFFSET: ${characterOffset - 0.05}`);
      }
      if (e.key === "m" || e.key === "M") {
        setCharacterOffset((prev) => prev + 0.05);
        console.log(`🔺 OFFSET: ${characterOffset + 0.05}`);
      }
      if (e.key === "0") {
        setCharacterOffset(-0.45);
        console.log(`🔄 OFFSET resetado para: -0.45`);
      }
      // Mostra coordenadas
      if (e.key === "c" || e.key === "C") {
        console.log(
          `📍 Personagem: [${bedPosition[0]}, ${bedPosition[1] + characterOffset}, ${bedPosition[2]}]`,
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [camera, cameraPosition, cameraLookAt, characterOffset, bedPosition]);

  // Inicia animação REAL quando startAnimation = true
  useEffect(() => {
    if (
      startAnimation &&
      !hasStarted.current &&
      mixer &&
      animations.length > 0
    ) {
      hasStarted.current = true;

      // Get action directly from mixer to avoid immutability lint issue with `actions`
      const clip = animations[0];
      const action = mixer.clipAction(clip);

      if (action) {
        console.log("🎬 Iniciando animação de levantar");

        // Configura animação
        action.reset();
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
        action.time = 0; // Começa sentado

        // Remove tracks de movimento global (se houver)
        const hasRootMotion = clip.tracks.some(
          (track) =>
            track.name.includes(".position") ||
            track.name.includes("Translation"),
        );

        if (hasRootMotion) {
          console.log("⚠️ Animação tem root motion - pode mover personagem");
        }

        // Fade in e play
        action.fadeIn(0.3);
        action.play();

        // Monitora progresso
        const checkProgress = () => {
          if (action && action.time < clip.duration - 0.1) {
            setAnimationProgress(action.time / clip.duration);
            requestAnimationFrame(checkProgress);
          }
        };
        requestAnimationFrame(checkProgress);
      }
    }
  }, [startAnimation, mixer, animations]);

  // Verifica fim da animação
  useFrame((state, delta) => {
    if (mixer && hasStarted.current && !isComplete) {
      mixer.update(delta);

      const action = mixer.clipAction(animations[0]);
      if (action && action.time >= action.getClip().duration - 0.05) {
        setIsComplete(true);
        onComplete();
      }
    }
  });

  return (
    <>
      {/* Personagem NA CAMA - OFFSET DINÂMICO */}
      <group
        ref={groupRef}
        position={[
          bedPosition[0],
          bedPosition[1] + characterOffset,
          bedPosition[2],
        ]}
        rotation={[0, bedRotation, 0]}
        scale={0.2}
      >
        <primitive object={clone} />
      </group>

      {/* DEBUG VISUAL - ESSENCIAL! */}

      {/* 1. SUPERFÍCIE DA CAMA (onde senta) */}
      <mesh position={[3.0, 0.65, -5.0]}>
        <boxGeometry args={[1.0, 0.02, 0.8]} />
        <meshBasicMaterial color="red" transparent opacity={0.5} />
      </mesh>

      {/* 2. CHÃO (referência) */}
      <mesh position={[3.0, 0, -5.0]}>
        <boxGeometry args={[2.0, 0.01, 2.0]} />
        <meshBasicMaterial color="gray" transparent opacity={0.3} />
      </mesh>

      {/* 3. MARCADOR DO PERSONAGEM */}
      <mesh
        position={[
          bedPosition[0],
          bedPosition[1] + characterOffset,
          bedPosition[2],
        ]}
      >
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="lime" />
      </mesh>

      {/* 4. ASSENTO ESPERADO (0.5 acima do pivot) */}
      <mesh
        position={[
          bedPosition[0],
          bedPosition[1] + characterOffset + 0.5,
          bedPosition[2],
        ]}
      >
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="yellow" />
      </mesh>

      {/* 5. TEXTO DE AJUDA */}
      <Text
        position={[bedPosition[0], bedPosition[1] + 0.9, bedPosition[2]]}
        fontSize={0.07}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {`Sentado: ${(bedPosition[1] + characterOffset).toFixed(2)}`}
      </Text>

      <Text
        position={[bedPosition[0], bedPosition[1] + 1.0, bedPosition[2]]}
        fontSize={0.07}
        color="yellow"
        anchorX="center"
        anchorY="middle"
      >
        {`Assento: ${(bedPosition[1] + characterOffset + 0.5).toFixed(2)}`}
      </Text>

      <Text
        position={[bedPosition[0] - 1.2, bedPosition[1] + 0.8, bedPosition[2]]}
        fontSize={0.05}
        color="cyan"
        anchorX="center"
        anchorY="middle"
      >
        {`N/M: Ajustar altura\nC: Coordenadas\n0: Reset`}
      </Text>
    </>
  );
}

// Preload
useGLTF.preload("/models/Sit To Stand.glb");
