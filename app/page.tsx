/**
 * Página Principal - Jogo em Terceira Pessoa (VERSÃO CORRIGIDA)
 *
 * Esta página renderiza a cena 3D com:
 * - Personagem 3D com animações
 * - Câmera em terceira pessoa (over-the-shoulder)
 * - Sistema de física com Rapier
 * - Controles WASD + Mouse
 * - Sistema de interação (tecla E)
 * - Integração com API Google Gemini
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
import { GeminiTextDisplay } from "@/components/GeminiTextDisplay";
import GenGemini from "@/components/GenGemini";

import { Environment, KeyboardControls } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect } from "react";
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

// Define color progress per object (percentage each object adds)
const OBJECT_COLOR_VALUES: Record<string, number> = {
  café: 0.1,
  planta: 0.15,
  livros: 0.2,
  espelho: 0.25,
  quadro: 0.3,
};

/**
 * Componente interno da cena (precisa estar dentro do Canvas)
 */
function Scene({ colorProgress }: { colorProgress: number }) {
  // Estado da posição do jogador (atualizado pelo Player3D)
  const [playerPosition, setPlayerPosition] = useState(
    new THREE.Vector3(0, 1, 0),
  );

  return (
    <>
      <Physics>
        {/* === ILUMINAÇÃO === */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="city" />

        {/* === JOGADOR 3D === */}
        <Player3D
          modelPath="/models/character_final_.glb"
          scale={0.2}
          speed={3}
          runSpeed={6}
          onPositionChange={setPlayerPosition}
        />

        {/* === CÂMERA EM TERCEIRA PESSOA === */}
        <CameraThirdPerson
          targetPosition={playerPosition}
          distance={1.8}
          lookAtHeight={0.8}
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
      <AnedoliaEffects colorProgress={colorProgress} />
    </>
  );
}

export default function Teste() {
  const [interactedObjects, setInteractedObjects] = useState<Set<string>>(
    new Set(),
  );
  const [colorProgress, setColorProgress] = useState(0);

  useEffect(() => {
    const handleObjectInteracted = (e: CustomEvent) => {
      const { objeto } = e.detail;

      // Check if this object was already interacted with
      if (!interactedObjects.has(objeto)) {
        const newInteractedObjects = new Set(interactedObjects);
        newInteractedObjects.add(objeto);
        setInteractedObjects(newInteractedObjects);

        // Calculate new color progress - accumulates permanently
        const colorValue = OBJECT_COLOR_VALUES[objeto] || 0.1;
        const newProgress = Math.min(colorProgress + colorValue, 1);
        setColorProgress(newProgress);

        console.log(
          `Color progress: ${newProgress * 100}% (${objeto} added ${colorValue * 100}%)`,
        );
      }
    };

    window.addEventListener(
      "objectInteracted",
      handleObjectInteracted as EventListener,
    );

    return () => {
      window.removeEventListener(
        "objectInteracted",
        handleObjectInteracted as EventListener,
      );
    };
  }, [interactedObjects, colorProgress]);

  return (
    <GenGemini>
      <KeyboardControls map={map}>
        <div
          style={{ width: "100vw", height: "100vh", background: "#111" }}
          tabIndex={0}
          onMouseDown={(e) => {
            // Garante que o div tenha foco quando clicado
            e.currentTarget.focus();
          }}
        >
          {/* Canvas único - corrigido */}
          <Canvas
            camera={{ position: [0, 1.8, 1.8], fov: 75 }}
            onCreated={({ gl }) => {
              // Garante que o canvas receba inputs de teclado
              gl.domElement.style.outline = "none";
            }}
          >
            <Suspense fallback={null}>
              <Scene colorProgress={colorProgress} />
            </Suspense>
          </Canvas>

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
            <div>
              <strong>Controles:</strong>
            </div>
            <div>WASD - Mover</div>
            <div>Mouse - Girar câmera</div>
            <div>Space - Correr</div>
            <div>E - Interagir</div>
            <div style={{ marginTop: "10px", fontSize: "12px", opacity: 0.7 }}>
              Clique na tela para travar o mouse
            </div>
          </div>

          {/* UI de texto do Gemini FORA do Canvas */}
          <GeminiTextDisplay />
        </div>
      </KeyboardControls>
    </GenGemini>
  );
}
