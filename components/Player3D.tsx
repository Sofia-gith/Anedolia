/**
 * Player3D - Jogador em Terceira Pessoa
 *
 * Usa três modelos .glb separados para cada estado:
 *   - character_final_.glb  → idle (parado)
 *   - Walking.glb           → andando para frente / laterais
 *   - Walking_Backwards.glb → andando para trás
 *
 * Como useGLTF não pode ser chamado condicionalmente, cada modelo
 * é um sub-componente próprio. O Player3D decide qual renderizar.
 */
"use client";

import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls, useGLTF, useAnimations } from "@react-three/drei";
import { RigidBody, CapsuleCollider, RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { useInteraction } from "./interaction/useInteraction";

// ============================================================
// CONFIGURAÇÕES
// ============================================================
const SPAWN = { x: 0, y: 1, z: 0 };
const RESPAWN_LIMIT_Y = -5;

// Offset Y do modelo dentro do RigidBody para os pés tocarem o chão.
// Se ainda voar → diminui (ex: -0.5). Se entrar no chão → aumenta (ex: -0.35).
const MODEL_Y_OFFSET = -0.45;

// Tipo de estado de movimento
type AnimState = "idle" | "walk" | "walkBack";

// ============================================================
// SUB-COMPONENTES — um por modelo .glb
// ============================================================

/** Modelo parado */
function IdleModel({ scale }: { scale: number }) {
  const ref = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/character_final_.glb");
  const { actions } = useAnimations(animations, ref);

  useEffect(() => {
    const firstAction = Object.values(actions)[0];
    if (firstAction) {
      firstAction.reset().fadeIn(0.2).play();
      return () => { firstAction.fadeOut(0.2); };
    }
  }, [actions]);

  return (
    <group ref={ref} scale={scale} position={[0, MODEL_Y_OFFSET, 0]}>
      <primitive object={scene} />
    </group>
  );
}

/** Modelo andando para frente */
function WalkModel({ scale }: { scale: number }) {
  const ref = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/Walking.glb");
  const { actions } = useAnimations(animations, ref);

  useEffect(() => {
    const firstAction = Object.values(actions)[0];
    if (firstAction) {
      firstAction.reset().fadeIn(0.2).play();
      return () => { firstAction.fadeOut(0.2); };
    }
  }, [actions]);

  return (
    <group ref={ref} scale={scale} position={[0, MODEL_Y_OFFSET, 0]}>
      <primitive object={scene} />
    </group>
  );
}

/** Modelo andando para trás */
function WalkBackModel({ scale }: { scale: number }) {
  const ref = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/Walking_Backwards.glb");
  const { actions } = useAnimations(animations, ref);

  useEffect(() => {
    const firstAction = Object.values(actions)[0];
    if (firstAction) {
      firstAction.reset().fadeIn(0.2).play();
      return () => { firstAction.fadeOut(0.2); };
    }
  }, [actions]);

  return (
    <group ref={ref} scale={scale} position={[0, MODEL_Y_OFFSET, 0]}>
      <primitive object={scene} />
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
      // Quando vai para trás mantém a rotação atual (não vira)
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
    >
      <CapsuleCollider args={[0.15, 0.25]} />

      {/* Grupo de rotação — gira o modelo na direção do movimento */}
      <group rotation={[0, rotation, 0]}>
        {animState === "idle" && <IdleModel scale={scale} />}
        {animState === "walk" && <WalkModel scale={scale} />}
        {animState === "walkBack" && <WalkBackModel scale={scale} />}
      </group>
    </RigidBody>
  );
}

// Preload dos três modelos para não ter delay na troca
useGLTF.preload("/models/character_final_.glb");
useGLTF.preload("/models/Walking.glb");
useGLTF.preload("/models/Walking_Backwards.glb");