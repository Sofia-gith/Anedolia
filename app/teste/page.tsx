/**
 * Página Principal - Jogo em Terceira Pessoa (COM SEQUÊNCIA DE DESPERTAR)
 *
 * Fluxo:
 * 1. Intro narrativa (imagens + textos)
 * 2. Personagem sentado na cama
 * 3. Animação de levantar (tecla ESPAÇO ou automático após 2s)
 * 4. Gameplay normal
 */
"use client";

// === IMPORTS ===
import { IntroNarrativa } from "@/components/IntroNarrativa";
import { WakeUpSequence } from "@/components/WakeUpSequence";
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
  { name: "jump", keys: ["Space"] },
  { name: "interact", keys: ["e", "E"] },
];

// Progresso de cor por objeto
const OBJECT_COLOR_VALUES: Record<string, number> = {
  café: 0.1,
  planta: 0.15,
  livros: 0.2,
  espelho: 0.25,
  quadro: 0.3,
};

// === POSIÇÃO DA CAMA (ajuste conforme seu apartamento) ===
const BED_POSITION: [number, number, number] = [1.5, 0.5, -4.5];
const BED_ROTATION = Math.PI; // Personagem virado para frente ao levantar

// === POSIÇÃO DA CÂMERA DURANTE DESPERTAR ===
// Câmera posicionada no corredor/banheiro, olhando para o quarto
const WAKEUP_CAMERA_POSITION: [number, number, number] = [
  1.5,  // X - Alinhado com a cama (ajuste conforme necessário)
  1.7,  // Y - Altura dos olhos
  -1.5, // Z - Na entrada do quarto/corredor (mais positivo = mais longe)
];

const WAKEUP_CAMERA_LOOKAT: [number, number, number] = [
  1.5,  // X - Centro da cama
  1.2,  // Y - Altura do personagem
  -4.5, // Z - Profundidade da cama
];

/**
 * Estados do jogo
 */
type GameState = 
  | "intro"           // Mostrando intro narrativa
  | "waking_up"       // Personagem na cama, prestes a levantar
  | "standing_up"     // Animação de levantar
  | "playing";        // Gameplay normal

/**
 * Componente interno da cena
 */
function Scene({ 
  colorProgress, 
  gameState,
  onWakeUpComplete 
}: { 
  colorProgress: number;
  gameState: GameState;
  onWakeUpComplete: () => void;
}) {
  const [playerPosition, setPlayerPosition] = useState(
    new THREE.Vector3(...BED_POSITION),
  );

  return (
    <>
      <Physics>
        {/* === ILUMINAÇÃO === */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="city" />

        {/* === SEQUÊNCIA DE DESPERTAR === */}
        {(gameState === "waking_up" || gameState === "standing_up") && (
          <WakeUpSequence
            bedPosition={BED_POSITION}
            bedRotation={BED_ROTATION}
            onComplete={onWakeUpComplete}
            startAnimation={gameState === "standing_up"}
            cameraPosition={WAKEUP_CAMERA_POSITION}
            cameraLookAt={WAKEUP_CAMERA_LOOKAT}
          />
        )}

        {/* === JOGADOR 3D (só aparece após levantar) === */}
        {gameState === "playing" && (
          <Player3D
            modelPath="/models/character_final_.glb"
            scale={0.2}
            speed={3}
            runSpeed={6}
            onPositionChange={setPlayerPosition}
          />
        )}

        {/* === CÂMERA EM TERCEIRA PESSOA === */}
        {gameState === "playing" && (
          <CameraThirdPerson
            targetPosition={playerPosition}
            distance={1.8}
            lookAtHeight={0.8}
            smoothness={0.1}
            rotationSpeed={0.002}
          />
        )}

        {/* === CHÃO INVISÍVEL === */}
        <RigidBody type="fixed" colliders="cuboid" position={[0, 0, 0]}>
          <mesh visible={false}>
            <boxGeometry args={[100, 0.1, 100]} />
          </mesh>
        </RigidBody>

        {/* === MODELO DO APARTAMENTO === */}
        <Apartamento />

        {/* === SISTEMA DE ZOOM DA CÂMERA === */}
        {gameState === "playing" && <CameraZoom />}
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
  const [gameState, setGameState] = useState<GameState>("intro");
  const [showWakeUpPrompt, setShowWakeUpPrompt] = useState(false);

  // Gerencia transições de estado
  const handleIntroComplete = () => {
    console.log("📖 Intro narrativa completa");
    setGameState("waking_up");
    
    // Mostra prompt para levantar após 1 segundo
    setTimeout(() => {
      setShowWakeUpPrompt(true);
    }, 1000);

    // Inicia automaticamente após 3 segundos se não apertar espaço
    setTimeout(() => {
      if (gameState === "waking_up") {
        setGameState("standing_up");
        setShowWakeUpPrompt(false);
      }
    }, 3000);
  };

  const handleWakeUpComplete = () => {
    console.log("🚶 Personagem levantou - gameplay liberado");
    setGameState("playing");
  };

  // Listener para tecla ESPAÇO durante waking_up
  useEffect(() => {
    if (gameState !== "waking_up") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        console.log("⌨️ Espaço pressionado - iniciando animação");
        setGameState("standing_up");
        setShowWakeUpPrompt(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState]);

  // Sistema de objetos interagidos
  useEffect(() => {
    const handleObjectInteracted = (e: CustomEvent) => {
      const { objeto } = e.detail;

      if (!interactedObjects.has(objeto)) {
        const newInteractedObjects = new Set(interactedObjects);
        newInteractedObjects.add(objeto);
        setInteractedObjects(newInteractedObjects);

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
      {/* === INTRO NARRATIVA === */}
      {gameState === "intro" && (
        <IntroNarrativa onComplete={handleIntroComplete} />
      )}

      {/* === JOGO === */}
      {gameState !== "intro" && (
        <KeyboardControls map={map}>
          <div
            style={{ width: "100vw", height: "100vh", background: "#111" }}
            tabIndex={0}
            onMouseDown={(e) => {
              e.currentTarget.focus();
            }}
          >
            {/* Canvas único */}
            <Canvas
              camera={{ position: [0, 1.8, 1.8], fov: 75 }}
              onCreated={({ gl }) => {
                gl.domElement.style.outline = "none";
              }}
            >
              <Suspense fallback={null}>
                <Scene 
                  colorProgress={colorProgress}
                  gameState={gameState}
                  onWakeUpComplete={handleWakeUpComplete}
                />
              </Suspense>
            </Canvas>

            {/* === PROMPT PARA LEVANTAR === */}
            {showWakeUpPrompt && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: "white",
                  fontFamily: "monospace",
                  fontSize: "24px",
                  textAlign: "center",
                  background: "rgba(0,0,0,0.7)",
                  padding: "30px 50px",
                  borderRadius: "10px",
                  animation: "pulse 2s ease-in-out infinite",
                }}
              >
                <div style={{ marginBottom: "15px" }}>
                  Pressione <strong>ESPAÇO</strong> para levantar
                </div>
                <div style={{ fontSize: "14px", opacity: 0.6 }}>
                  (ou aguarde 3 segundos)
                </div>
              </div>
            )}

            {/* === INSTRUÇÕES (só mostra durante gameplay) === */}
            {gameState === "playing" && (
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
            )}

            {/* UI de texto do Gemini */}
            {gameState === "playing" && <GeminiTextDisplay />}
          </div>

          {/* Animação de pulso para o prompt */}
          <style jsx>{`
            @keyframes pulse {
              0%, 100% {
                opacity: 0.7;
                transform: translate(-50%, -50%) scale(1);
              }
              50% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1.05);
              }
            }
          `}</style>
        </KeyboardControls>
      )}
    </GenGemini>
  );
}