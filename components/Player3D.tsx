/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Player3D - VERSÃO COM SCALES E OFFSETS SEPARADOS
 *
 * Solução: Cada animação tem seu próprio scale E offset
 * - Se o personagem fica "baixinho" andando, aumentamos o scale da animação Walk
 * - Mantemos offsets separados para ajuste fino de altura
 *
 * Melhorias de movimento:
 * - Aceleração/desaceleração suave (lerp de velocidade)
 * - Rotação interpolada (sem snapping)
 * - Normalização diagonal (velocidade constante em todas as direções)
 * - Delta-time independent (consistente em qualquer framerate)
 * - Objetos reutilizados para reduzir GC
 */
"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls, useGLTF, useAnimations } from "@react-three/drei";
import {
  RigidBody,
  CapsuleCollider,
  RapierRigidBody,
} from "@react-three/rapier";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";
import { useInteraction } from "./interaction/useInteraction";

// ============================================================
// CONFIGURAÇÕES
// ============================================================
const SPAWN = { x: 1.5, y: 1.0, z: -4.5 };
const RESPAWN_LIMIT_Y = -5;

//  OFFSETS Y SEPARADOS (controla posição vertical)
const IDLE_Y_OFFSET = -0.1; // Parado
const WALK_Y_OFFSET = 0.6; // Andando para frente
const WALKBACK_Y_OFFSET = 0.6; // Andando para trás

//  SCALES SEPARADOS (controla tamanho/altura do modelo)
// Se o personagem fica "baixinho" andando, AUMENTE o WALK_SCALE
const IDLE_SCALE = 0.2; // Parado - tamanho normal
const WALK_SCALE = 0.32; // Andando - 10% maior (ajuste conforme necessário)
const WALKBACK_SCALE = 0.32; // Andando pra trás - 10% maior

// ROTAÇÃO INTERNA DE CADA MODELO (compensa orientação padrão diferente dos GLBs)
// Os GLBs apontam 90° fora do eixo esperado por atan2(x,z), então compensamos aqui.
// Todos os modelos usam o MESMO offset para manter consistência ao trocar animação.
const MODEL_ROTATION_OFFSET = 4.7; // Compensa orientação nativa dos GLBs
const IDLE_ROTATION_OFFSET = MODEL_ROTATION_OFFSET;
const WALK_ROTATION_OFFSET = MODEL_ROTATION_OFFSET;
const WALKBACK_ROTATION_OFFSET = MODEL_ROTATION_OFFSET;

// MOVIMENTO SUAVE
const VELOCITY_LERP_FACTOR = 8; // Quão rápido acelera/desacelera (maior = mais responsivo)
const ROTATION_LERP_FACTOR = 10; // Quão rápido roda (maior = mais responsivo)
const STOP_THRESHOLD = 0.01; // Abaixo disso, considera parado

type AnimState = "idle" | "walk" | "walkBack";

/** Interpola ângulo pelo caminho mais curto */
function lerpAngle(from: number, to: number, t: number): number {
  let diff = to - from;
  // Normaliza para [-PI, PI]
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return from + diff * t;
}

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
      const clip = firstAction.getClip();
      clip.tracks = clip.tracks.filter((track) => {
        const name = track.name.toLowerCase();
        // Remove position tracks AND root-level quaternion tracks
        // Root quaternion tracks override the character's facing direction
        if (name.includes("position")) return false;
        if (name.includes("quaternion") && !name.includes(".")) return false;
        // Filter armature/hips root rotation (e.g. "Armature.quaternion")
        const parts = track.name.split(".");
        if (parts.length === 2 && parts[1] === "quaternion") {
          const boneName = parts[0].toLowerCase();
          if (
            boneName === "armature" ||
            boneName.includes("hips") ||
            boneName.includes("root")
          )
            return false;
        }
        return true;
      });

      firstAction.reset().fadeIn(0.2).play();
      return () => {
        firstAction.fadeOut(0.2);
      };
    }
  }, [actions]);

  return (
    <group
      ref={ref}
      scale={scale}
      position={[0, IDLE_Y_OFFSET, 0]}
      rotation={[0, IDLE_ROTATION_OFFSET, 0]}
    >
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
      clip.tracks = clip.tracks.filter((track) => {
        const name = track.name.toLowerCase();
        if (name.includes("position")) return false;
        if (name.includes("quaternion") && !name.includes(".")) return false;
        const parts = track.name.split(".");
        if (parts.length === 2 && parts[1] === "quaternion") {
          const boneName = parts[0].toLowerCase();
          if (
            boneName === "armature" ||
            boneName.includes("hips") ||
            boneName.includes("root")
          )
            return false;
        }
        return true;
      });

      firstAction.reset().fadeIn(0.2).play();
      return () => {
        firstAction.fadeOut(0.2);
      };
    }
  }, [actions]);

  return (
    <group
      ref={ref}
      scale={scale}
      position={[0, WALK_Y_OFFSET, 0]}
      rotation={[0, WALK_ROTATION_OFFSET, 0]}
    >
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
      clip.tracks = clip.tracks.filter((track) => {
        const name = track.name.toLowerCase();
        if (name.includes("position")) return false;
        if (name.includes("quaternion") && !name.includes(".")) return false;
        const parts = track.name.split(".");
        if (parts.length === 2 && parts[1] === "quaternion") {
          const boneName = parts[0].toLowerCase();
          if (
            boneName === "armature" ||
            boneName.includes("hips") ||
            boneName.includes("root")
          )
            return false;
        }
        return true;
      });

      firstAction.reset().fadeIn(0.2).play();
      return () => {
        firstAction.fadeOut(0.2);
      };
    }
  }, [actions]);

  return (
    <group
      ref={ref}
      scale={scale}
      position={[0, WALKBACK_Y_OFFSET, 0]}
      rotation={[0, WALKBACK_ROTATION_OFFSET, 0]}
    >
      <primitive object={clone} />
    </group>
  );
}

// ============================================================
// PLAYER3D PRINCIPAL
// ============================================================

interface Player3DProps {
  modelPath?: string;
  scale?: number; // Este scale base agora é ignorado, usamos os scales individuais
  speed?: number;
  runSpeed?: number;
  initialPosition?: [number, number, number];
  initialRotation?: number;
  onPositionChange?: (position: THREE.Vector3) => void;
}

export function Player3D({
  scale = 0.2, // Mantido para compatibilidade, mas não usado diretamente
  speed = 3,
  runSpeed = 6,
  initialPosition,
  initialRotation = 0,
  onPositionChange,
}: Player3DProps) {
  const rb = useRef<RapierRigidBody>(null);
  const rotationRef = useRef(initialRotation);

  // Usa initialPosition se fornecida, caso contrário usa SPAWN padrão
  const spawnPosition =
    initialPosition ||
    ([SPAWN.x, SPAWN.y, SPAWN.z] as [number, number, number]);

  const [animState, setAnimState] = useState<AnimState>("idle");
  const [rotation, setRotation] = useState(initialRotation);
  const [, getKeys] = useKeyboardControls();

  const interact = useInteraction((state) => state.interact);
  const zoomState = useInteraction((state) => state.zoomState);

  const lastInteractTime = useRef(0);
  const interactCooldown = 500;

  // === VETORES REUTILIZÁVEIS (evita alocação por frame) ===
  const _velocity = useRef(new THREE.Vector3());
  const _cameraDir = useRef(new THREE.Vector3());
  const _rightDir = useRef(new THREE.Vector3());
  const _targetVel = useRef(new THREE.Vector3());
  const _currentSmoothedVel = useRef(new THREE.Vector3(0, 0, 0));
  const _position = useRef(new THREE.Vector3());
  const _up = useRef(new THREE.Vector3(0, 1, 0));

  // Rastreia o último animState para evitar re-renders desnecessários
  const lastAnimState = useRef<AnimState>("idle");

  useFrame((state, delta) => {
    if (!rb.current) return;

    // Clamp delta para evitar saltos enormes (ex: tab inativo)
    const dt = Math.min(delta, 0.1);

    const {
      forward,
      backward,
      left,
      right,
      interact: interactKey,
      jump,
    } = getKeys();
    const translation = rb.current.translation();

    // === RESPAWN ===
    if (translation.y < RESPAWN_LIMIT_Y) {
      rb.current.setTranslation(
        { x: spawnPosition[0], y: spawnPosition[1], z: spawnPosition[2] },
        true,
      );
      rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      rb.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
      _currentSmoothedVel.current.set(0, 0, 0);
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
      _currentSmoothedVel.current.set(0, 0, 0);
      if (lastAnimState.current !== "idle") {
        lastAnimState.current = "idle";
        setAnimState("idle");
      }
      return;
    }

    // === CÁLCULO DA VELOCIDADE ALVO ===
    const targetVel = _targetVel.current.set(0, 0, 0);
    const isMoving = forward || backward || left || right;
    let goingBackward = false;

    if (isMoving) {
      const cameraDir = _cameraDir.current;
      state.camera.getWorldDirection(cameraDir);
      cameraDir.y = 0;
      cameraDir.normalize();

      const rightDir = _rightDir.current;
      rightDir.crossVectors(cameraDir, _up.current);
      rightDir.normalize();

      if (forward) targetVel.add(cameraDir);
      if (backward) {
        targetVel.sub(cameraDir);
        if (!forward) goingBackward = true;
      }
      if (left) targetVel.sub(rightDir);
      if (right) targetVel.add(rightDir);

      // Normaliza para velocidade constante em qualquer direção (diagonal fix)
      if (targetVel.lengthSq() > 0) {
        const currentSpeed = jump ? runSpeed : speed;
        targetVel.normalize().multiplyScalar(currentSpeed);
      }
    }

    // === INTERPOLAÇÃO SUAVE DE VELOCIDADE ===
    const smoothedVel = _currentSmoothedVel.current;
    const lerpT = 1 - Math.exp(-VELOCITY_LERP_FACTOR * dt);
    smoothedVel.x = THREE.MathUtils.lerp(smoothedVel.x, targetVel.x, lerpT);
    smoothedVel.z = THREE.MathUtils.lerp(smoothedVel.z, targetVel.z, lerpT);

    // Snap para zero quando perto (evita deslizar infinitamente)
    if (
      Math.abs(smoothedVel.x) < STOP_THRESHOLD &&
      Math.abs(smoothedVel.z) < STOP_THRESHOLD &&
      !isMoving
    ) {
      smoothedVel.x = 0;
      smoothedVel.z = 0;
    }

    // === ROTAÇÃO SUAVE ===
    if (isMoving && targetVel.lengthSq() > 0 && !goingBackward) {
      const targetAngle = Math.atan2(targetVel.x, targetVel.z);
      const rotLerpT = 1 - Math.exp(-ROTATION_LERP_FACTOR * dt);
      rotationRef.current = lerpAngle(
        rotationRef.current,
        targetAngle,
        rotLerpT,
      );
      setRotation(rotationRef.current);
    }

    // === ESTADO DE ANIMAÇÃO (evita re-renders desnecessários) ===
    const horizontalSpeedSq =
      smoothedVel.x * smoothedVel.x + smoothedVel.z * smoothedVel.z;
    let newAnimState: AnimState;
    if (horizontalSpeedSq < 0.1) {
      newAnimState = "idle";
    } else if (goingBackward) {
      newAnimState = "walkBack";
    } else {
      newAnimState = "walk";
    }
    if (lastAnimState.current !== newAnimState) {
      lastAnimState.current = newAnimState;
      setAnimState(newAnimState);
    }

    // === APLICA FÍSICA ===
    const currentVel = rb.current.linvel();
    rb.current.setLinvel(
      { x: smoothedVel.x, y: currentVel.y, z: smoothedVel.z },
      true,
    );

    // === NOTIFICA POSIÇÃO ===
    const position = _position.current.set(
      translation.x,
      translation.y,
      translation.z,
    );
    if (onPositionChange) {
      onPositionChange(position);
    }

    // Armazena posição globalmente para detecção de proximidade
    (window as any).__playerPosition = [
      translation.x,
      translation.y,
      translation.z,
    ];
  });

  return (
    <RigidBody
      ref={rb}
      colliders={false}
      enabledRotations={[false, false, false]}
      position={spawnPosition}
      type="dynamic"
      lockRotations={true}
      friction={0.7}
      restitution={0}
      linearDamping={0.5}
    >
      {/* Collider */}
      <CapsuleCollider args={[0.2, 0.3]} position={[0, 0.4, 0]} />

      {/* Grupo de rotação */}
      <group rotation={[0, rotation, 0]}>
        {animState === "idle" && <IdleModel scale={IDLE_SCALE} />}
        {animState === "walk" && <WalkModel scale={WALK_SCALE} />}
        {animState === "walkBack" && <WalkBackModel scale={WALKBACK_SCALE} />}
      </group>
    </RigidBody>
  );
}

// Preload
useGLTF.preload("/models/character_final_.glb");
useGLTF.preload("/models/Walking.glb");
useGLTF.preload("/models/Walking_Backwards.glb");
