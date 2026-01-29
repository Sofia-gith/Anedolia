/**
 * Página de Teste - Cena 3D do Apartamento
 *
 * Esta página renderiza a cena principal do jogo com:
 * - Ambiente 3D interativo usando React Three Fiber
 * - Sistema de física com Rapier para colisões e gravidade
 * - Controles de primeira pessoa (WASD + Mouse)
 * - Modelo 3D do apartamento
 */
"use client";

// === IMPORTS ===
// Modelo 3D do apartamento (gerado pelo gltfjsx)
import { Model as Apartamento } from "@/components/Apartamento";
// Componente do jogador com física e movimentação
import { Player } from "@/components/Player";
// Efeitos visuais de anedonia (dessaturação, vinheta, etc)
// import { AnedoliaEffects } from "@/components/AnedoliaEffects";
// Helpers do drei: ambiente HDR, controles de teclado e mouse
import {
  Environment,
  OrbitControls,
  KeyboardControls,
  PointerLockControls,
} from "@react-three/drei";
// Sistema de física Rapier para colisões e gravidade
import { Physics, RigidBody } from "@react-three/rapier";
// Canvas principal do React Three Fiber
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

/**
 * Mapeamento de teclas para controles do jogador
 * - forward/backward: movimento frente/trás
 * - left/right: movimento lateral
 * - jump: pulo (não implementado ainda)
 *
 * Cada ação aceita múltiplas teclas (setas e WASD)
 */
const map = [
  { name: "forward", keys: ["ArrowUp", "w", "W"] },
  { name: "backward", keys: ["ArrowDown", "s", "S"] },
  { name: "left", keys: ["ArrowLeft", "a", "A"] },
  { name: "right", keys: ["ArrowRight", "d", "D"] },
  { name: "jump", keys: ["Space"] },
];

export default function Teste() {
  return (
    // KeyboardControls: Provedor de contexto que captura inputs do teclado
    // O componente Player acessa essas teclas via useKeyboardControls()
    <KeyboardControls map={map}>
      {/* Container fullscreen com fundo escuro */}
      <div style={{ width: "100vw", height: "100vh", background: "#111" }}>
        {/* 
          Canvas: Área de renderização 3D
          - position: posição inicial da câmera (x, y, z)
          - fov: campo de visão em graus (75 é bom para primeira pessoa)
        */}
        <Canvas camera={{ position: [0, 2, 0], fov: 75 }}>
          {/* Suspense: Aguarda carregamento dos assets 3D */}
          <Suspense fallback={null}>
            {/* 
              Physics: Motor de física Rapier
              Tudo dentro dele terá simulação de física (gravidade, colisões)
            */}
            <Physics debug>
              {/* === ILUMINAÇÃO === */}
              {/* Luz ambiente: ilumina toda a cena uniformemente */}
              <ambientLight intensity={1.5} />
              {/* Luz direcional: simula luz do sol, cria sombras */}
              <directionalLight position={[10, 10, 5]} intensity={1} />

              {/* Environment: Iluminação HDR baseada em imagem (reflexos realistas) */}
              <Environment preset="city" />

              {/* === JOGADOR === */}
              {/* Player: Cápsula física que representa o jogador */}
              <Player />

              {/* 
                Chão invisível: Impede o player de cair infinitamente
                - type="fixed": corpo estático (não se move)
                - colliders="cuboid": colisão em formato de caixa
                - args=[100, 0.1, 100]: largura, altura, profundidade
              */}
              <RigidBody type="fixed" colliders="cuboid" position={[0, 0, 0]}>
                <mesh visible={false}>
                  <boxGeometry args={[100, 0.1, 100]} />
                </mesh>
              </RigidBody>

              {/* 
                PointerLockControls: Trava o mouse na tela ao clicar
                Permite olhar ao redor movendo o mouse (estilo FPS)
              */}
              <PointerLockControls />

              {/* Modelo 3D do apartamento */}
              <Apartamento />
            </Physics>

            {/* 
              AnedoliaEffects: Efeitos de pós-processamento
              - colorProgress: 0 = cinza total, 1 = cores restauradas
              - Aumentar esse valor conforme o jogador interage com objetos
            */}
            {/* <AnedoliaEffects colorProgress={0} /> */}
          </Suspense>
        </Canvas>
      </div>
    </KeyboardControls>
  );
}
