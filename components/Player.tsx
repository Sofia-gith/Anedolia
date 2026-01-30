/**
 * Componente Player - Controle do Jogador em Primeira Pessoa com ZOOM
 *
 * Este componente gerencia:
 * - Corpo físico do jogador (cápsula com colisão)
 * - Movimentação via teclado (WASD) ALINHADA COM A DIREÇÃO DO OLHAR
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
      // Passa a posição atual do jogador para o sistema de interação
      const translation = rb.current.translation();
      const playerPos: [number, number, number] = [
        translation.x,
        translation.y + 0.8, // Altura da câmera
        translation.z
      ];
      interact(playerPos); // Executa interação com objeto mais próximo (ativa zoom)
      lastInteractTime.current = now;
    }

    // === DESABILITA MOVIMENTO DURANTE ZOOM ===
    // Se está fazendo zoom, não permite movimento
    if (zoomState.isZooming) {
      rb.current.setLinvel({ x: 0, y: rb.current.linvel().y, z: 0 }, true);
      return;
    }

    // === CÁLCULO DE MOVIMENTO BASEADO NA DIREÇÃO DO OLHAR ===
    // Cria vetor de movimento inicial
    const velocity = new THREE.Vector3(0, 0, 0);
    
    // Captura a direção para onde a câmera está olhando
    const cameraDirection = new THREE.Vector3();
    state.camera.getWorldDirection(cameraDirection);
    
    // Remove o componente vertical (Y) para movimento apenas no plano horizontal
    cameraDirection.y = 0;
    cameraDirection.normalize(); // Normaliza para manter velocidade consistente

    // Calcula o vetor "para a direita" (perpendicular à frente)
    const rightDirection = new THREE.Vector3();
    rightDirection.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));
    rightDirection.normalize();

    // Aplica movimento baseado nas teclas pressionadas
    // W/↑: move para onde você está olhando
    if (forward) {
      velocity.add(cameraDirection.clone().multiplyScalar(speed));
    }
    // S/↓: move para trás (oposto da direção do olhar)
    if (backward) {
      velocity.add(cameraDirection.clone().multiplyScalar(-speed));
    }
    // A/←: move para a esquerda (perpendicular ao olhar)
    if (left) {
      velocity.add(rightDirection.clone().multiplyScalar(-speed));
    }
    // D/→: move para a direita (perpendicular ao olhar)
    if (right) {
      velocity.add(rightDirection.clone().multiplyScalar(speed));
    }

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