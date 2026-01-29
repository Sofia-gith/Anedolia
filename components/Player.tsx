/**
 * Componente Player - Controle do Jogador em Primeira Pessoa
 *
 * Este componente gerencia:
 * - Corpo físico do jogador (cápsula com colisão)
 * - Movimentação via teclado (WASD)
 * - Sincronização da câmera com a posição do jogador
 * - Interação com objetos pressionando E
 *
 * Dependências:
 * - @react-three/drei: useKeyboardControls para capturar teclas
 * - @react-three/fiber: useFrame para atualizar a cada frame
 * - @react-three/rapier: RigidBody e CapsuleCollider para física
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

  // Velocidade de movimento do jogador (unidades por segundo)
  const speed = 5;

  // Referência para debounce da tecla E (evita múltiplas interações)
  const lastInteractTime = useRef(0);
  const interactCooldown = 500; // 500ms entre interações

  /**
   * useFrame: Executa a cada frame de renderização (~60fps)
   *
   * @param state - Estado do Three.js (contém câmera, cena, etc)
   */
  useFrame((state) => {
    // Aguarda o corpo físico estar inicializado
    if (!rb.current) return;

    // === CAPTURA DE INPUT ===
    // Obtém o estado atual das teclas (true = pressionada)
    const { forward, backward, left, right, interact: interactKey } = getKeys();

    // === SISTEMA DE INTERAÇÃO ===
    // Verifica se tecla E foi pressionada e se passou o cooldown
    const now = Date.now();
    if (interactKey && now - lastInteractTime.current > interactCooldown) {
      interact(); // Executa interação com objeto mais próximo
      lastInteractTime.current = now;
    }

    // === CÁLCULO DE MOVIMENTO ===
    // Cria vetor de velocidade baseado nas teclas pressionadas
    // Sistema de coordenadas: X = esquerda/direita, Z = frente/trás
    const velocity = new THREE.Vector3(0, 0, 0);
    if (forward) velocity.z -= speed; // W ou ↑: move para frente (-Z)
    if (backward) velocity.z += speed; // S ou ↓: move para trás (+Z)
    if (left) velocity.x -= speed; // A ou ←: move para esquerda (-X)
    if (right) velocity.x += speed; // D ou →: move para direita (+X)

    // === APLICAÇÃO DA FÍSICA ===
    // Preserva a velocidade vertical (Y) para manter a gravidade funcionando
    const currentVel = rb.current.linvel();

    // Define a velocidade linear do corpo físico
    rb.current.setLinvel(
      { x: velocity.x, y: currentVel.y, z: velocity.z },
      true, // wakeUp: garante que o corpo não "durma"
    );

    // === SINCRONIZAÇÃO DA CÂMERA ===
    // Posiciona a câmera na "cabeça" do jogador (primeira pessoa)
    const translation = rb.current.translation();
    state.camera.position.set(
      translation.x, // Mesma posição X do jogador
      translation.y + 0.8, // 0.8 unidades acima (altura dos olhos - REDUZIDO)
      translation.z, // Mesma posição Z do jogador
    );
  });

  return (
   
    
    <RigidBody
      ref={rb}
      colliders={false}
      enabledRotations={[false, false, false]}
      position={[0, 1, 0]} // Spawn um pouco mais baixo também
    >
      {/**
       * CapsuleCollider: Forma de colisão do jogador
       *
       * args={[halfHeight, radius]}
       * - halfHeight (0.5): Metade da altura do cilindro central = 1.0 unidade
       * - radius (0.3): Raio das esferas nas pontas = 0.6 unidade total
       *
       * Altura total = 0.5 * 2 + 0.3 * 2 = 1.0 + 0.6 = 1.6 unidades
       * 
       * Com câmera +0.8, visão fica a 1.6 + 0.8 = ~2.4 unidades do chão
       */}
      <CapsuleCollider args={[0.5, 0.3]} />
    </RigidBody>
  );
}