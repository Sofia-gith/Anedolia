/**
 * Componente Player - Controle do Jogador em Primeira Pessoa com ZOOM
 *
 * Este componente gerencia:
 * - Corpo físico do jogador (cápsula com colisão)
 * - Movimentação via teclado (WASD) ALINHADA COM A DIREÇÃO DO OLHAR
 * - Aceleração/desaceleração suave (lerp de velocidade)
 * - Normalização diagonal (velocidade constante em todas as direções)
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

// Suavidade do movimento (maior = mais responsivo)
const VELOCITY_LERP_FACTOR = 8;
const STOP_THRESHOLD = 0.01;

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

  // Vetores reutilizáveis (evita alocação por frame)
  const _cameraDir = useRef(new THREE.Vector3());
  const _rightDir = useRef(new THREE.Vector3());
  const _targetVel = useRef(new THREE.Vector3());
  const _smoothedVel = useRef(new THREE.Vector3(0, 0, 0));
  const _up = useRef(new THREE.Vector3(0, 1, 0));

  /**
   * useFrame: Executa a cada frame de renderização (~60fps)
   */
  useFrame((state, delta) => {
    // Aguarda o corpo físico estar inicializado
    if (!rb.current) return;

    // Clamp delta para evitar saltos enormes
    const dt = Math.min(delta, 0.1);

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
        translation.z,
      ];
      interact(playerPos); // Executa interação com objeto mais próximo (ativa zoom)
      lastInteractTime.current = now;
    }

    // === DESABILITA MOVIMENTO DURANTE ZOOM ===
    // Se está fazendo zoom, não permite movimento
    if (zoomState.isZooming) {
      rb.current.setLinvel({ x: 0, y: rb.current.linvel().y, z: 0 }, true);
      _smoothedVel.current.set(0, 0, 0);
      return;
    }

    // === CÁLCULO DE VELOCIDADE ALVO BASEADO NA DIREÇÃO DO OLHAR ===
    const targetVel = _targetVel.current.set(0, 0, 0);

    if (forward || backward || left || right) {
      // Captura a direção para onde a câmera está olhando
      const cameraDir = _cameraDir.current;
      state.camera.getWorldDirection(cameraDir);
      cameraDir.y = 0;
      cameraDir.normalize();

      // Calcula o vetor "para a direita" (perpendicular à frente)
      const rightDir = _rightDir.current;
      rightDir.crossVectors(cameraDir, _up.current);
      rightDir.normalize();

      // Aplica direções
      if (forward) targetVel.add(cameraDir);
      if (backward) targetVel.sub(cameraDir);
      if (left) targetVel.sub(rightDir);
      if (right) targetVel.add(rightDir);

      // Normaliza para velocidade constante em qualquer direção
      if (targetVel.lengthSq() > 0) {
        targetVel.normalize().multiplyScalar(speed);
      }
    }

    // === INTERPOLAÇÃO SUAVE DE VELOCIDADE ===
    const smoothedVel = _smoothedVel.current;
    const lerpT = 1 - Math.exp(-VELOCITY_LERP_FACTOR * dt);
    smoothedVel.x = THREE.MathUtils.lerp(smoothedVel.x, targetVel.x, lerpT);
    smoothedVel.z = THREE.MathUtils.lerp(smoothedVel.z, targetVel.z, lerpT);

    // Snap para zero quando quase parado
    const isInput = forward || backward || left || right;
    if (
      Math.abs(smoothedVel.x) < STOP_THRESHOLD &&
      Math.abs(smoothedVel.z) < STOP_THRESHOLD &&
      !isInput
    ) {
      smoothedVel.x = 0;
      smoothedVel.z = 0;
    }

    // === APLICAÇÃO DA FÍSICA ===
    const currentVel = rb.current.linvel();
    rb.current.setLinvel(
      { x: smoothedVel.x, y: currentVel.y, z: smoothedVel.z },
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
