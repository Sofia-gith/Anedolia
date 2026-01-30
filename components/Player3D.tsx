/**
 * Player3D - Jogador em Terceira Pessoa com Animações
 * 
 * Componente que gerencia:
 * - Modelo 3D visível do personagem
 * - Sistema de animações (idle, walk, run)
 * - Física e colisão
 * - Movimento via teclado (WASD)
 * - Rotação do personagem na direção do movimento
 * - Interação com objetos (tecla E)
 */
"use client";

import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls, useGLTF, useAnimations } from "@react-three/drei";
import { RigidBody, CapsuleCollider, RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { useInteraction } from "./interaction/useInteraction";

interface Player3DProps {
  modelPath?: string;
  scale?: number;
  speed?: number;
  runSpeed?: number;
  onPositionChange?: (position: THREE.Vector3) => void; // Callback para posição
}

export function Player3D({
  modelPath = "/models/character_final_.glb",
  scale = 1,
  speed = 3,
  runSpeed = 6,
  onPositionChange,
}: Player3DProps) {
  // Referências
  const rb = useRef<RapierRigidBody>(null);
  const modelRef = useRef<THREE.Group>(null);
  
  // Estado de animação
  const [currentAnimation, setCurrentAnimation] = useState("idle");
  
  // Controles de teclado
  const [, getKeys] = useKeyboardControls();
  
  // Sistema de interação
  const interact = useInteraction((state) => state.interact);
  const zoomState = useInteraction((state) => state.zoomState);
  
  // Debounce de interação
  const lastInteractTime = useRef(0);
  const interactCooldown = 500;

  // Carrega o modelo GLTF
  const { scene, animations } = useGLTF(modelPath);
  const { actions, names } = useAnimations(animations, modelRef);

  // Mapeia nomes de animações do Mixamo para nomes simplificados
  const animationMap: Record<string, string> = {
    idle: names.find(name => name.toLowerCase().includes("idle")) || names[0],
    walk: names.find(name => name.toLowerCase().includes("walk") && !name.toLowerCase().includes("back")) || names[1],
    run: names.find(name => name.toLowerCase().includes("run")) || names[2],
  };

  // Troca de animação suave
  useEffect(() => {
    const animationName = animationMap[currentAnimation];
    const action = actions[animationName];
    
    if (action) {
      action.reset().fadeIn(0.2).play();
      
      return () => {
        action.fadeOut(0.2);
      };
    }
  }, [currentAnimation, actions, animationMap]);

  // Lógica de movimento e animação
  useFrame((state) => {
    if (!rb.current || !modelRef.current) return;

    const { forward, backward, left, right, interact: interactKey, jump } = getKeys();

    // === SISTEMA DE INTERAÇÃO ===
    const now = Date.now();
    if (interactKey && now - lastInteractTime.current > interactCooldown) {
      const translation = rb.current.translation();
      const playerPos: [number, number, number] = [
        translation.x,
        translation.y + 1,
        translation.z
      ];
      interact(playerPos);
      lastInteractTime.current = now;
    }

    // === DESABILITA MOVIMENTO DURANTE ZOOM ===
    if (zoomState.isZooming) {
      rb.current.setLinvel({ x: 0, y: rb.current.linvel().y, z: 0 }, true);
      setCurrentAnimation("idle");
      return;
    }

    // === CÁLCULO DE MOVIMENTO ===
    const velocity = new THREE.Vector3(0, 0, 0);
    const isMoving = forward || backward || left || right;
    
    if (isMoving) {
      // Direção da câmera (sem componente Y)
      const cameraDirection = new THREE.Vector3();
      state.camera.getWorldDirection(cameraDirection);
      cameraDirection.y = 0;
      cameraDirection.normalize();

      // Direção para a direita
      const rightDirection = new THREE.Vector3();
      rightDirection.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));
      rightDirection.normalize();

      // Velocidade (corrida com Space)
      const currentSpeed = jump ? runSpeed : speed;

      // Aplica movimento
      if (forward) velocity.add(cameraDirection.clone().multiplyScalar(currentSpeed));
      if (backward) velocity.add(cameraDirection.clone().multiplyScalar(-currentSpeed));
      if (left) velocity.add(rightDirection.clone().multiplyScalar(-currentSpeed));
      if (right) velocity.add(rightDirection.clone().multiplyScalar(currentSpeed));

      // === ROTAÇÃO DO PERSONAGEM ===
      if (velocity.length() > 0) {
        const angle = Math.atan2(velocity.x, velocity.z);
        modelRef.current.rotation.y = angle;
      }

      // === ANIMAÇÃO ===
      setCurrentAnimation(jump ? "run" : "walk");
    } else {
      setCurrentAnimation("idle");
    }

    // === APLICA FÍSICA ===
    const currentVel = rb.current.linvel();
    rb.current.setLinvel(
      { x: velocity.x, y: currentVel.y, z: velocity.z },
      true
    );
    
    // === SINCRONIZA POSIÇÃO DO MODELO COM RIGIDBODY ===
    const translation = rb.current.translation();
    const position = new THREE.Vector3(translation.x, translation.y, translation.z);
    
    // Notifica callback se existir
    if (onPositionChange) {
      onPositionChange(position);
    }
  });

  return (
    <RigidBody
      ref={rb}
      colliders={false}
      enabledRotations={[false, false, false]}
      position={[0, 1, 0]}
      type="dynamic"
    >
      {/* Colisão */}
      <CapsuleCollider args={[0.5, 0.3]} />
      
      {/* Modelo 3D */}
      <group ref={modelRef} scale={scale}>
        <primitive object={scene} />
      </group>
    </RigidBody>
  );
}

// Preload do modelo
useGLTF.preload("/models/character_final_.glb");