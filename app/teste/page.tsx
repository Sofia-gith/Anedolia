/**
 * Página de Teste - Cena 3D do Apartamento com SISTEMA DE ZOOM
 *
 * Esta página renderiza a cena principal do jogo com:
 * - Ambiente 3D interativo usando React Three Fiber
 * - Sistema de física com Rapier para colisões e gravidade
 * - Controles de primeira pessoa (WASD + Mouse)
 * - Sistema de interação com objetos (tecla E)
 * - NOVO: Sistema de zoom ao interagir
 * - UI de prompt de interação
 * - Modelo 3D do apartamento com objetos interativos
 */
"use client";

// === IMPORTS ===
import { InteractionPrompt } from "@/components/ui/InteractionPrompt";
import { Player } from "@/components/Player";
import { ApartamentoComInteracao as Apartamento } from "@/components/interaction/ApartamentoComInteracao";
import { AnedoliaEffects } from "@/components/effects/AnedoliaEffects";
import { CameraZoom } from "@/components/CameraZoom";
import {
  Environment,
  KeyboardControls,
  PointerLockControls,
} from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

/**
 * Mapeamento de teclas para controles do jogador
 */
const map = [
  { name: "forward", keys: ["ArrowUp", "w", "W"] },
  { name: "backward", keys: ["ArrowDown", "s", "S"] },
  { name: "left", keys: ["ArrowLeft", "a", "A"] },
  { name: "right", keys: ["ArrowRight", "d", "D"] },
  { name: "jump", keys: ["Space"] },
  { name: "interact", keys: ["e", "E"] },
];

export default function Teste() {
  return (
    <KeyboardControls map={map}>
      <div style={{ width: "100vw", height: "100vh", background: "#111" }}>
        <Canvas camera={{ position: [0, 2, 0], fov: 75 }}>
          <Suspense fallback={null}>
            <Physics>
              {/* === ILUMINAÇÃO === */}
              <ambientLight intensity={1.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <Environment preset="city" />

              {/* === JOGADOR === */}
              <Player />

              {/* === CHÃO INVISÍVEL === */}
              <RigidBody type="fixed" colliders="cuboid" position={[0, 0, 0]}>
                <mesh visible={false}>
                  <boxGeometry args={[100, 0.1, 100]} />
                </mesh>
              </RigidBody>

              {/* === CONTROLES DE MOUSE === */}
              <PointerLockControls />

              {/* === MODELO DO APARTAMENTO === */}
              <Apartamento />

              {/* === SISTEMA DE ZOOM DA CÂMERA === */}
              <CameraZoom />
            </Physics>

            {/* === EFEITOS VISUAIS === */}
            <AnedoliaEffects colorProgress={0} />
          </Suspense>
        </Canvas>

        {/* === UI DE INTERAÇÃO === */}
        <InteractionPrompt />
      </div>
    </KeyboardControls>
  );
}