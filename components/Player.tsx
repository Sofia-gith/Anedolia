/**
 * Componente Player - Controle do Jogador em Primeira Pessoa com ZOOM
 *
 * Este componente gerencia:
 * - Corpo físico do jogador (cápsula com colisão)
 * - Movimentação via teclado (WASD)
 * - Sincronização da câmera com a posição do jogador
 * - Interação com objetos pressionando E
 * - Sistema de zoom ao interagir
 */
import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  RigidBody,
  CapsuleCollider,
  RapierRigidBody,
} from "@react-three/rapier";
import { useRef } from "react";
import * as THREE from "three";
import { useInteraction } from "./interaction/useInteraction";

export function Player() {
  // Referência ao corpo rígido do Rapier (para aplicar física)
  const rb = useRef<RapierRigidBody>(null);

  // Hook para acessar o estado das teclas pressionadas
  const [, getKeys] = useKeyboardControls();

  // Hook de interação para acessar objetos próximos
  const interact = useInteraction((state) => state.interact);
  const zoomState = useInteraction((state) => state.zoomState);

  // Velocidade de movimento do jogador (unidades por segundo)
  const speed = 5;

  // Referência para debounce da tecla E (evita múltiplas interações)
  const lastInteractTime = useRef(0);
  const interactCooldown = 500; // 500ms entre interações

  /**
   * useFrame: Executa a cada frame de renderização (~60fps)
   */
  useFrame((state) => {
    // Aguarda o corpo físico estar inicializado
    if (!rb.current) return;

    // === CAPTURA DE INPUT ===
    const { forward, backward, left, right, interact: interactKey } = getKeys();

    // === SISTEMA DE INTERAÇÃO ===
    // Verifica se tecla E foi pressionada e se passou o cooldown
    const now = Date.now();
    if (interactKey && now - lastInteractTime.current > interactCooldown) {
      interact(); // Executa interação com objeto mais próximo (ativa zoom)
      lastInteractTime.current = now;
    }

    // === DESABILITA MOVIMENTO DURANTE ZOOM ===
    // Se está fazendo zoom, não permite movimento
    if (zoomState.isZooming) {
      rb.current.setLinvel({ x: 0, y: rb.current.linvel().y, z: 0 }, true);
      return;
    }

    // === CÁLCULO DE MOVIMENTO ===
    const velocity = new THREE.Vector3(0, 0, 0);
    if (forward) velocity.z -= speed;
    if (backward) velocity.z += speed;
    if (left) velocity.x -= speed;
    if (right) velocity.x += speed;

    // === APLICAÇÃO DA FÍSICA ===
    const currentVel = rb.current.linvel();
    rb.current.setLinvel(
      { x: velocity.x, y: currentVel.y, z: velocity.z },
      true,
    );

    // === SINCRONIZAÇÃO DA CÂMERA ===
    // Durante zoom, a câmera é controlada pelo CameraZoom component
    // Caso contrário, segue o jogador normalmente
    if (!zoomState.isZooming) {
      const translation = rb.current.translation();
      state.camera.position.set(
        translation.x,
        translation.y + 0.8,
        translation.z,
      );
    }
  });

  return (
    <RigidBody
      ref={rb}
      colliders={false}
      enabledRotations={[false, false, false]}
      position={[0, 1, 0]}
    >
      <CapsuleCollider args={[0.5, 0.3]} />
    </RigidBody>
  );
}