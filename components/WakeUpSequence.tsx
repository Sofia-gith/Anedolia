/**
 * WakeUpSequence - Sequência de Despertar
 * 
 * Gerencia a transição da intro narrativa para o gameplay:
 * 1. Intro narrativa (IntroNarrativa)
 * 2. Personagem sentado na cama
 * 3. Animação de levantar (Sit To Stand)
 * 4. Libera controles para o jogador
 */
"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";

interface WakeUpSequenceProps {
  /** Posição da cama no cenário */
  bedPosition?: [number, number, number];
  /** Rotação do personagem (para ficar de frente correta) */
  bedRotation?: number;
  /** Callback quando termina de levantar */
  onComplete: () => void;
  /** Se deve começar a animação imediatamente */
  startAnimation?: boolean;
  /** Posição da câmera durante a sequência */
  cameraPosition?: [number, number, number];
  /** Para onde a câmera deve olhar */
  cameraLookAt?: [number, number, number];
}

export function WakeUpSequence({
  bedPosition = [0, 0.5, 0],
  bedRotation = 0,
  onComplete,
  startAnimation = false,
  cameraPosition,
  cameraLookAt,
}: WakeUpSequenceProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { camera } = useThree();

  // Carrega o modelo de levantar
  const { scene, animations } = useGLTF("/models/Sit To Stand.glb");

  // Clona a cena para evitar problemas de instância
  const clone = useMemo(() => {
    const clonedScene = SkeletonUtils.clone(scene);
    
    // Configura materiais
    clonedScene.traverse((node: any) => {
      if (node.isMesh || node.isSkinnedMesh) {
        if (node.material) {
          if (Array.isArray(node.material)) {
            node.material = node.material.map((mat: any) => {
              const clonedMat = mat.clone();
              clonedMat.transparent = false;
              clonedMat.opacity = 1;
              clonedMat.depthWrite = true;
              clonedMat.depthTest = true;
              return clonedMat;
            });
          } else {
            node.material = node.material.clone();
            node.material.transparent = false;
            node.material.opacity = 1;
            node.material.depthWrite = true;
            node.material.depthTest = true;
          }
        }
      }
    });
    
    return clonedScene;
  }, [scene]);

  const { actions, mixer } = useAnimations(animations, groupRef);

  // Posiciona a câmera quando o componente monta
  useEffect(() => {
    if (cameraPosition && cameraLookAt) {
      camera.position.set(...cameraPosition);
      camera.lookAt(...cameraLookAt);
    }
  }, [camera, cameraPosition, cameraLookAt]);

  // Inicia a animação quando startAnimation = true
  useEffect(() => {
    if (startAnimation && !hasStarted) {
      setHasStarted(true);
      
      const action = Object.values(actions)[0];
      if (action) {
        console.log("🛏️ Iniciando animação de levantar da cama");
        
        // Remove tracks de posição para não mover o personagem pelo cenário
        const clip = action.getClip();
        clip.tracks = clip.tracks.filter(
          (track) => !track.name.toLowerCase().includes('position')
        );
        
        // Configura a animação para tocar uma vez
        action.reset();
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true; // Mantém na pose final
        action.fadeIn(0.3);
        action.play();
      }
    }
  }, [startAnimation, hasStarted, actions]);

  // Detecta quando a animação termina
  useFrame(() => {
    if (!mixer || !hasStarted || isComplete) return;

    const action = Object.values(actions)[0];
    if (action && action.time >= action.getClip().duration - 0.1) {
      if (!isComplete) {
        console.log("✅ Animação de levantar completa");
        setIsComplete(true);
        onComplete();
      }
    }
  });

  return (
    <group 
      ref={groupRef} 
      position={bedPosition}
      rotation={[0, bedRotation, 0]}
      scale={0.2} // Ajuste o scale conforme seu personagem
    >
      <primitive object={clone} />
    </group>
  );
}

// Preload do modelo
useGLTF.preload("/models/Sit To Stand.glb");