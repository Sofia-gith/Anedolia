/**
 * Página Principal - Jogo em Terceira Pessoa
 *
 * Esta página renderiza a cena 3D com:
 * - Personagem 3D com animações
 * - Câmera em terceira pessoa
 * - Sistema de física com Rapier
 * - Controles WASD + Mouse
 * - Sistema de interação (tecla E)
 * - UI de prompt de interação
 */
"use client";

// === IMPORTS ===
import { InteractionPrompt } from "@/components/ui/InteractionPrompt";
import { Player3D } from "@/components/Player3D";
import { CameraThirdPerson } from "@/components/CameraThirdPerson";
import { ApartamentoComInteracao as Apartamento } from "@/components/interaction/ApartamentoComInteracao";
import { AnedoliaEffects } from "@/components/effects/AnedoliaEffects";
import { CameraZoom } from "@/components/CameraZoom";
import { Environment, KeyboardControls } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import * as THREE from "three";

/**
 * Mapeamento de teclas para controles do jogador
 */
const map = [
  { name: "forward", keys: ["ArrowUp", "w", "W"] },
  { name: "backward", keys: ["ArrowDown", "s", "S"] },
  { name: "left", keys: ["ArrowLeft", "a", "A"] },
  { name: "right", keys: ["ArrowRight", "d", "D"] },
  { name: "jump", keys: ["Space"] }, // Usado para correr
  { name: "interact", keys: ["e", "E"] },
];

/**
 * Componente interno da cena (precisa estar dentro do Canvas)
 */
function Scene() {
  // Estado da posição do jogador (atualizado pelo Player3D)
  const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3(0, 1, 0));

  return (
    <>
      <Suspense fallback={null}>
        <Physics>
          {/* === ILUMINAÇÃO === */}
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Environment preset="city" />

          {/* === JOGADOR 3D === */}
          <Player3D 
            modelPath="/models/character_final_.glb"
            scale={1}
            speed={3}
            runSpeed={6}
            onPositionChange={setPlayerPosition}
          />

          {/* === CÂMERA EM TERCEIRA PESSOA === */}
          <CameraThirdPerson
            targetPosition={playerPosition}
            distance={5}
            height={2}
            smoothness={0.1}
            rotationSpeed={0.002}
          />

          {/* === CHÃO INVISÍVEL === */}
          <RigidBody type="fixed" colliders="cuboid" position={[0, 0, 0]}>
            <mesh visible={false}>
              <boxGeometry args={[100, 0.1, 100]} />
            </mesh>
          </RigidBody>

          {/* === MODELO DO APARTAMENTO === */}
          <Apartamento />

          {/* === SISTEMA DE ZOOM DA CÂMERA === */}
          <CameraZoom />
        </Physics>

        {/* === EFEITOS VISUAIS === */}
        <AnedoliaEffects colorProgress={0} />
      </Suspense>
    </>
  );
}

export default function Teste() {
  return (
    <KeyboardControls map={map}>
      <div style={{ width: "100vw", height: "100vh", background: "#111" }}>
        {/* Canvas 3D */}
        <Canvas camera={{ position: [0, 5, 10], fov: 75 }}>
          <Scene />
        </Canvas>

        {/* === UI DE INTERAÇÃO === */}
        <InteractionPrompt />

        {/* === INSTRUÇÕES === */}
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            color: "white",
            fontFamily: "monospace",
            fontSize: "14px",
            background: "rgba(0,0,0,0.5)",
            padding: "10px",
            borderRadius: "5px",
            pointerEvents: "none",
          }}
        >
          <div><strong>Controles:</strong></div>
          <div>WASD - Mover</div>
          <div>Mouse - Girar câmera</div>
          <div>Space - Correr</div>
          <div>E - Interagir</div>
          <div style={{ marginTop: "10px", fontSize: "12px", opacity: 0.7 }}>
            Clique na tela para travar o mouse
          </div>
        </div>
      </div>
    </KeyboardControls>
  );
}