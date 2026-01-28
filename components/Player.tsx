/**
 * Componente Player - Controle do Jogador em Primeira Pessoa
 *
 * Este componente gerencia:
 * - Corpo físico do jogador (cápsula com colisão)
 * - Movimentação via teclado (WASD)
 * - Sincronização da câmera com a posição do jogador
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

export function Player() {
  // Referência ao corpo rígido do Rapier (para aplicar física)
  const rb = useRef<RapierRigidBody>(null);

  // Hook para acessar o estado das teclas pressionadas
  // O primeiro elemento [subscribeKeys] é ignorado, usamos apenas getKeys
  const [, getKeys] = useKeyboardControls();

  // Velocidade de movimento do jogador (unidades por segundo)
  const speed = 5;

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
    const { forward, backward, left, right } = getKeys();

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
    // Sem isso, o jogador flutuaria ao invés de cair
    const currentVel = rb.current.linvel();

    // Define a velocidade linear do corpo físico
    // - x, z: controlados pelo jogador
    // - y: controlado pela gravidade
    rb.current.setLinvel(
      { x: velocity.x, y: currentVel.y, z: velocity.z },
      true, // wakeUp: garante que o corpo não "durma" (otimização do Rapier)
    );

    // === SINCRONIZAÇÃO DA CÂMERA ===
    // Posiciona a câmera na "cabeça" do jogador (primeira pessoa)
    const translation = rb.current.translation();
    state.camera.position.set(
      translation.x, // Mesma posição X do jogador
      translation.y + 1.5, // 1.5 unidades acima (altura dos olhos)
      translation.z, // Mesma posição Z do jogador
    );
    // Nota: A rotação da câmera é controlada pelo PointerLockControls
  });

  return (
    /**
     * RigidBody: Corpo físico do jogador
     *
     * - ref: Referência para manipular via código
     * - colliders={false}: Desativa collider automático (usamos CapsuleCollider)
     * - enabledRotations: [X, Y, Z] - Trava rotações para evitar "tombar"
     * - position: Posição inicial [x, y, z] - Ajuste Y para spawnar dentro da casa
     */
    <RigidBody
      ref={rb}
      colliders={false}
      enabledRotations={[false, false, false]}
      position={[0, 2, 0]} // AJUSTE AQUI para mudar spawn inicial
    >
      {/**
       * CapsuleCollider: Forma de colisão do jogador
       *
       * args={[halfHeight, radius]}
       * - halfHeight (0.75): Metade da altura do cilindro central
       * - radius (0.5): Raio das esferas nas pontas
       *
       * Altura total = halfHeight * 2 + radius * 2 = 2.5 unidades
       */}
      <CapsuleCollider args={[0.75, 0.5]} />
    </RigidBody>
  );
}
