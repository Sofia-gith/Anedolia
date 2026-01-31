/**
 * Player3D - Jogador em Terceira Pessoa (VERSÃO CORRIGIDA - v3)
 *
 * Correção de altura: Offset POSITIVO para levantar o personagem
 */
"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls, useGLTF, useAnimations } from "@react-three/drei";
import { RigidBody, CapsuleCollider, RapierRigidBody } from "@react-three/rapier";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";
import { useInteraction } from "./interaction/useInteraction";

// ============================================================
// CONFIGURAÇÕES
// ============================================================
const SPAWN = { x: 0, y: 1, z: 0 };
const RESPAWN_LIMIT_Y = -5;

// CORRIGIDO: Offset POSITIVO para LEVANTAR o modelo
// Se ainda estiver baixo, aumente este valor (ex: 0.0, 0.1, 0.2)
const MODEL_Y_OFFSET = -0.1;

type AnimState = "idle" | "walk" | "walkBack";

// ============================================================
// SUB-COMPONENTES
// ============================================================

/** Modelo parado */
function IdleModel({ scale }: { scale: number }) {
  const ref = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/character_final_.glb");
  
  // Clone usando SkeletonUtils para garantir animações independentes
  const clone = useMemo(() => {
    const clonedScene = SkeletonUtils.clone(scene);
    
    // Corrige materiais para evitar transparência
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

  const { actions } = useAnimations(animations, ref);

  useEffect(() => {
    const firstAction = Object.values(actions)[0];
    if (firstAction) {
      // Remove root motion
      const clip = firstAction.getClip();
      clip.tracks = clip.tracks.filter(
        (track) => !track.name.toLowerCase().includes('position')
      );
      
      firstAction.reset().fadeIn(0.2).play();
      return () => { firstAction.fadeOut(0.2); };
    }
  }, [actions]);

  return (
    <group ref={ref} scale={scale} position={[0, MODEL_Y_OFFSET, 0]}>
      <primitive object={clone} />
    </group>
  );
}

/** Modelo andando para frente */
function WalkModel({ scale }: { scale: number }) {
  const ref = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/Walking.glb");
  
  const clone = useMemo(() => {
    const clonedScene = SkeletonUtils.clone(scene);
    
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

  const { actions } = useAnimations(animations, ref);

  useEffect(() => {
    const firstAction = Object.values(actions)[0];
    if (firstAction) {
      const clip = firstAction.getClip();
      clip.tracks = clip.tracks.filter(
        (track) => !track.name.toLowerCase().includes('position')
      );
      
      firstAction.reset().fadeIn(0.2).play();
      return () => { firstAction.fadeOut(0.2); };
    }
  }, [actions]);

  return (
    <group ref={ref} scale={scale} position={[0, MODEL_Y_OFFSET, 0]}>
      <primitive object={clone} />
    </group>
  );
}

/** Modelo andando para trás */
function WalkBackModel({ scale }: { scale: number }) {
  const ref = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/Walking_Backwards.glb");
  
  const clone = useMemo(() => {
    const clonedScene = SkeletonUtils.clone(scene);
    
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

  const { actions } = useAnimations(animations, ref);

  useEffect(() => {
    const firstAction = Object.values(actions)[0];
    if (firstAction) {
      const clip = firstAction.getClip();
      clip.tracks = clip.tracks.filter(
        (track) => !track.name.toLowerCase().includes('position')
      );
      
      firstAction.reset().fadeIn(0.2).play();
      return () => { firstAction.fadeOut(0.2); };
    }
  }, [actions]);

  return (
    <group ref={ref} scale={scale} position={[0, MODEL_Y_OFFSET, 0]}>
      <primitive object={clone} />
    </group>
  );
}

// ============================================================
// PLAYER3D PRINCIPAL
// ============================================================

interface Player3DProps {
  modelPath?: string;
  scale?: number;
  speed?: number;
  runSpeed?: number;
  onPositionChange?: (position: THREE.Vector3) => void;
}

export function Player3D({
  scale = 0.2,
  speed = 3,
  runSpeed = 6,
  onPositionChange,
}: Player3DProps) {
  const rb = useRef<RapierRigidBody>(null);
  const rotationRef = useRef(0);

  const [animState, setAnimState] = useState<AnimState>("idle");
  const [rotation, setRotation] = useState(0);
  const [, getKeys] = useKeyboardControls();

  const interact = useInteraction((state) => state.interact);
  const zoomState = useInteraction((state) => state.zoomState);

  const lastInteractTime = useRef(0);
  const interactCooldown = 500;

  useFrame((state) => {
    if (!rb.current) return;

    const { forward, backward, left, right, interact: interactKey, jump } = getKeys();
    const translation = rb.current.translation();

    // === RESPAWN ===
    if (translation.y < RESPAWN_LIMIT_Y) {
      rb.current.setTranslation(SPAWN, true);
      rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      rb.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }

    // === INTERAÇÃO ===
    const now = Date.now();
    if (interactKey && now - lastInteractTime.current > interactCooldown) {
      const playerPos: [number, number, number] = [
        translation.x,
        translation.y + 1,
        translation.z,
      ];
      interact(playerPos);
      lastInteractTime.current = now;
    }

    // === DESABILITA MOVIMENTO DURANTE ZOOM ===
    if (zoomState.isZooming) {
      rb.current.setLinvel({ x: 0, y: rb.current.linvel().y, z: 0 }, true);
      setAnimState("idle");
      return;
    }

    // === MOVIMENTO ===
    const velocity = new THREE.Vector3(0, 0, 0);
    const isMoving = forward || backward || left || right;
    let goingBackward = false;

    if (isMoving) {
      const cameraDirection = new THREE.Vector3();
      state.camera.getWorldDirection(cameraDirection);
      cameraDirection.y = 0;
      cameraDirection.normalize();

      const rightDirection = new THREE.Vector3();
      rightDirection.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));
      rightDirection.normalize();

      const currentSpeed = jump ? runSpeed : speed;

      if (forward) velocity.add(cameraDirection.clone().multiplyScalar(currentSpeed));
      if (backward) {
        velocity.add(cameraDirection.clone().multiplyScalar(-currentSpeed));
        if (!forward) goingBackward = true;
      }
      if (left) velocity.add(rightDirection.clone().multiplyScalar(-currentSpeed));
      if (right) velocity.add(rightDirection.clone().multiplyScalar(currentSpeed));

      // === ROTAÇÃO ===
      if (velocity.length() > 0 && !goingBackward) {
        const angle = Math.atan2(velocity.x, velocity.z);
        rotationRef.current = angle;
        setRotation(angle);
      }

      // === ESTADO DE ANIMAÇÃO ===
      setAnimState(goingBackward ? "walkBack" : "walk");
    } else {
      setAnimState("idle");
    }

    // === APLICA FÍSICA ===
    const currentVel = rb.current.linvel();
    rb.current.setLinvel(
      { x: velocity.x, y: currentVel.y, z: velocity.z },
      true,
    );

    // === NOTIFICA POSIÇÃO ===
    const position = new THREE.Vector3(translation.x, translation.y, translation.z);
    if (onPositionChange) {
      onPositionChange(position);
    }
  });

  return (
    <RigidBody
      ref={rb}
      colliders={false}
      enabledRotations={[false, false, false]}
      position={[SPAWN.x, SPAWN.y, SPAWN.z]}
      type="dynamic"
      lockRotations={true}
      friction={0.7}
      restitution={0}
      linearDamping={0.5}
    >
      {/* Collider - ajuste se necessário */}
      <CapsuleCollider args={[0.2, 0.3]} position={[0, 0.4, 0]} />

      {/* Grupo de rotação */}
      <group rotation={[0, rotation, 0]}>
        {animState === "idle" && <IdleModel scale={scale} />}
        {animState === "walk" && <WalkModel scale={scale} />}
        {animState === "walkBack" && <WalkBackModel scale={scale} />}
      </group>
    </RigidBody>
  );
}

// Preload
useGLTF.preload("/models/character_final_.glb");
useGLTF.preload("/models/Walking.glb");
useGLTF.preload("/models/Walking_Backwards.glb");