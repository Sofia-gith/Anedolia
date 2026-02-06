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
import { Canvas, useThree } from "@react-three/fiber";
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

// === POSIÇÃO DA CAMA (baseado no modelo do apartamento) ===
const BED_POSITION: [number, number, number] = [3.0, 1.0, -4.8];
const BED_ROTATION = 0; 
const characterOffset = -0.45;

// === POSIÇÃO INICIAL DO JOGADOR (na frente da cama após levantar) ===
const PLAYER_SPAWN_POSITION: [number, number, number] = [
  BED_POSITION[0],           // Mesmo X da cama
  BED_POSITION[1],           // Mesma altura
  BED_POSITION[2] + 0.8,     // Um pouco à frente da cama
];

// === ROTAÇÃO INICIAL DO JOGADOR (virado para frente) ===
// 0 = virado para Z+ (trás)
// Math.PI / 2 = virado para a esquerda
// Math.PI = virado para Z- (frente)
// Math.PI * 1.5 = virado para a direita
const PLAYER_INITIAL_ROTATION = Math.PI * 1.5; // Ajuste conforme a orientação do modelo

// === POSIÇÃO DA CÂMERA DURANTE DESPERTAR ===
const WAKEUP_CAMERA_POSITION: [number, number, number] = [
  2.5,   // X - Mais para a lateral
  1.4,   // Y - Altura média
  -3.5,  // Z - Mais próximo
];

const WAKEUP_CAMERA_LOOKAT: [number, number, number] = [
  3.0,   // X - Centro da cama
  0.8,   // Y - Altura 
  -5.0,  // Z - Profundidade
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
 * CAMERA POSITION HELPER - COMPONENTE DE AJUSTE
 * Use as teclas para ajustar a posição da câmera durante o wake up
 */
function CameraPositionHelper() {
  const { camera } = useThree();
  const [cameraPos, setCameraPos] = useState({
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
  });

  useEffect(() => {
    const step = 0.1; // Passo menor para ajuste mais fino

    const handleKeyDown = (e: KeyboardEvent) => {
      // Previne conflito com o prompt de "Space para levantar"
      if (e.code === "Space") return;
      
      const newPos = { ...cameraPos };

      switch (e.key) {
        case "ArrowLeft": newPos.x -= step; break;
        case "ArrowRight": newPos.x += step; break;
        case "ArrowUp": newPos.z -= step; break;
        case "ArrowDown": newPos.z += step; break;
        case "q": case "Q": newPos.y += step; break;
        case "e": case "E": newPos.y -= step; break;
        
        // Presets úteis para encontrar o ângulo ideal
        case "1": // Vista mais à esquerda (padrão corrigido)
          newPos.x = 0.5; newPos.y = 1.8; newPos.z = -2.5;
          break;
        case "2": // Vista mais central
          newPos.x = 1.5; newPos.y = 1.7; newPos.z = -2.5;
          break;
        case "3": // Vista lateral direita
          newPos.x = 5.0; newPos.y = 1.6; newPos.z = -5.0;
          break;
        case "4": // Vista de cima (aérea)
          newPos.x = 3.0; newPos.y = 4.0; newPos.z = -5.0;
          break;
        default: return;
      }

      setCameraPos(newPos);
      camera.position.set(newPos.x, newPos.y, newPos.z);
      camera.lookAt(BED_POSITION[0], BED_POSITION[1] + 0.7, BED_POSITION[2]);
      
      console.log(`📷 Câmera: [${newPos.x.toFixed(1)}, ${newPos.y.toFixed(1)}, ${newPos.z.toFixed(1)}]`);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [camera, cameraPos]);

  return null;
}

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
    new THREE.Vector3(...PLAYER_SPAWN_POSITION),
  );

  return (
    <>
      <Physics>
        {/* === ILUMINAÇÃO === */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="city" />

        {/* === HELPER DE POSIÇÃO DA CÂMERA (REMOVER DEPOIS) === */}
        {(gameState === "waking_up" || gameState === "standing_up") && (
          <CameraPositionHelper />
        )}

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
            initialPosition={PLAYER_SPAWN_POSITION}
            initialRotation={PLAYER_INITIAL_ROTATION}
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

    // Inicia automaticamente após 4 segundos se não apertar espaço
    setTimeout(() => {
      setGameState((current) => {
        if (current === "waking_up") {
          setShowWakeUpPrompt(false);
          return "standing_up";
        }
        return current;
      });
    }, 5000);
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

            {/* === INSTRUÇÕES DE AJUSTE (TEMPORÁRIO) === */}
            {(gameState === "waking_up" || gameState === "standing_up") && (
              <div
                style={{
                  position: "absolute",
                  bottom: "20px",
                  left: "20px",
                  color: "white",
                  fontFamily: "monospace",
                  fontSize: "12px",
                  background: "rgba(0,0,0,0.8)",
                  padding: "15px",
                  borderRadius: "5px",
                  maxWidth: "350px",
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: "8px", color: "#4CAF50" }}>
                  🔧 MODO AJUSTE DE CÂMERA
                </div>
                <div style={{ marginBottom: "5px" }}>
                  <strong>Setas:</strong> Move câmera (horizontal)
                </div>
                <div style={{ marginBottom: "5px" }}>
                  <strong>Q/E:</strong> Sobe/Desce câmera
                </div>
                <div style={{ marginBottom: "5px" }}>
                  <strong>1-4:</strong> Posições preset
                </div>
                <div style={{ marginTop: "10px", fontSize: "10px", opacity: 0.7, borderTop: "1px solid #444", paddingTop: "8px" }}>
                  📍 Veja coordenadas no console (F12)<br/>
                  🎯 Quando encontrar a posição ideal, copie os valores<br/>
                  ❌ Remova o CameraPositionHelper depois
                </div>
              </div>
            )}

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