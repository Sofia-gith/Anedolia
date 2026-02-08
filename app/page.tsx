/**
 * Main Page - Third Person Game (WITH WAKE UP SEQUENCE)
 *
 * Flow:
 * 1. Narrative intro (images + texts)
 * 2. Character sitting on bed
 * 3. Stand up animation (SPACE key ONLY - NO automatic timer)
 * 4. Normal gameplay
 * 
 * CHANGES FOR HACKATHON:
 * - Removed 3-second automatic timer
 * - Player MUST press SPACE to stand up
 * - All text translated to English
 */
"use client";

// === IMPORTS ===

import { IntroNarrativa } from "@/components/IntroNarrativa";
import { WakeUpSequence } from "@/components/WakeUpSequence";
import { EndGameSequence } from "@/components/EndGameSequence";
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
 * Keyboard mapping for player controls
 */
const map = [
  { name: "forward", keys: ["ArrowUp", "w", "W"] },
  { name: "backward", keys: ["ArrowDown", "s", "S"] },
  { name: "left", keys: ["ArrowLeft", "a", "A"] },
  { name: "right", keys: ["ArrowRight", "d", "D"] },
  { name: "jump", keys: ["Space"] },
  { name: "interact", keys: ["e", "E"] },
];

// Color progress per object
const OBJECT_COLOR_VALUES: Record<string, number> = {
  café: 0.1,
  planta: 0.15,
  livros: 0.2,
  espelho: 0.25,
  quadro: 0.3,
};

// Objetos necessários para o final completo (excluindo o espelho que é o trigger)
const REQUIRED_OBJECTS_FOR_COMPLETE_ENDING = [
  'café',
  'planta', 
  'livros',
  'quadro'
];

// === BED POSITION (based on apartment model) ===
const BED_POSITION: [number, number, number] = [3.0, 1.0, -4.8];
const BED_ROTATION = 0; 
const characterOffset = -0.45;

// === INITIAL PLAYER POSITION (in front of bed after standing up) ===
const PLAYER_SPAWN_POSITION: [number, number, number] = [
  BED_POSITION[0],           // Same X as bed
  BED_POSITION[1],           // Same height
  BED_POSITION[2] + 0.8,     // Slightly in front of bed
];

// === INITIAL PLAYER ROTATION (facing forward) ===
// 0 = facing Z+ (back)
// Math.PI / 2 = facing left
// Math.PI = facing Z- (front)
// Math.PI * 1.5 = facing right
const PLAYER_INITIAL_ROTATION = Math.PI * 1.5; // Adjust based on model orientation

// === CAMERA POSITION DURING WAKE UP ===
const WAKEUP_CAMERA_POSITION: [number, number, number] = [
  2.5,   // X - More to the side
  1.4,   // Y - Medium height
  -3.5,  // Z - Closer
];

const WAKEUP_CAMERA_LOOKAT: [number, number, number] = [
  3.0,   // X - Center of bed
  0.8,   // Y - Height 
  -5.0,  // Z - Depth
];

/**
 * Game states
 */
type GameState = 
  | "intro"           // Showing narrative intro
  | "waking_up"       // Character on bed, about to stand
  | "standing_up"     // Standing animation
  | "playing";        // Normal gameplay

/**
 * CAMERA POSITION HELPER - ADJUSTMENT COMPONENT
 * Use keys to adjust camera position during wake up
 */
function CameraPositionHelper() {
  const { camera } = useThree();
  const [cameraPos, setCameraPos] = useState({
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
  });

  useEffect(() => {
    const step = 0.1; // Smaller step for finer adjustment

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevents conflict with "Space to stand" prompt
      if (e.code === "Space") return;
      
      const newPos = { ...cameraPos };

      switch (e.key) {
        case "ArrowLeft": newPos.x -= step; break;
        case "ArrowRight": newPos.x += step; break;
        case "ArrowUp": newPos.z -= step; break;
        case "ArrowDown": newPos.z += step; break;
        case "q": case "Q": newPos.y += step; break;
        case "e": case "E": newPos.y -= step; break;
        
        // Useful presets to find ideal angle
        case "1": // More left view (corrected default)
          newPos.x = 0.5; newPos.y = 1.8; newPos.z = -2.5;
          break;
        case "2": // More central view
          newPos.x = 1.5; newPos.y = 1.7; newPos.z = -2.5;
          break;
        case "3": // Right side view
          newPos.x = 5.0; newPos.y = 1.6; newPos.z = -5.0;
          break;
        case "4": // Top view (aerial)
          newPos.x = 3.0; newPos.y = 4.0; newPos.z = -5.0;
          break;
        default: return;
      }

      setCameraPos(newPos);
      camera.position.set(newPos.x, newPos.y, newPos.z);
      camera.lookAt(BED_POSITION[0], BED_POSITION[1] + 0.7, BED_POSITION[2]);
      
      console.log(`📷 Camera: [${newPos.x.toFixed(1)}, ${newPos.y.toFixed(1)}, ${newPos.z.toFixed(1)}]`);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [camera, cameraPos]);

  return null;
}

/**
 * Internal scene component
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
        {/* === LIGHTING === */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="city" />

        {/* === CAMERA POSITION HELPER (REMOVE LATER) === */}
        {(gameState === "waking_up" || gameState === "standing_up") && (
          <CameraPositionHelper />
        )}

        {/* === WAKE UP SEQUENCE === */}
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

        {/* === 3D PLAYER (only appears after standing) === */}
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

        {/* === THIRD PERSON CAMERA === */}
        {gameState === "playing" && (
          <CameraThirdPerson
            targetPosition={playerPosition}
            distance={1.8}
            lookAtHeight={0.8}
            positionSmoothing={8}
            lookAtSmoothing={12}
            rotationSpeed={0.002}
          />
        )}

        {/* === INVISIBLE FLOOR === */}
        <RigidBody type="fixed" colliders="cuboid" position={[0, 0, 0]}>
          <mesh visible={false}>
            <boxGeometry args={[100, 0.1, 100]} />
          </mesh>
        </RigidBody>

        {/* === APARTMENT MODEL === */}
        <Apartamento />

        {/* === CAMERA ZOOM SYSTEM === */}
        {gameState === "playing" && <CameraZoom />}
      </Physics>

      {/* === VISUAL EFFECTS === */}
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
  const [showEndGame, setShowEndGame] = useState(false);
  const [allInteractionsComplete, setAllInteractionsComplete] = useState(false);

  // Manages state transitions
  const handleIntroComplete = () => {
    console.log("📖 Narrative intro complete");
    setGameState("waking_up");
    
    // Shows wake up prompt after 1 second
    setTimeout(() => {
      setShowWakeUpPrompt(true);
    }, 1000);

    // ❌ REMOVED: Automatic timer after 4 seconds
    // Player MUST press SPACE now!
  };

  const handleWakeUpComplete = () => {
    console.log("🚶 Character stood up - gameplay unlocked");
    setGameState("playing");
  };

  // Listener for SPACE key during waking_up
  useEffect(() => {
    if (gameState !== "waking_up") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        console.log("⌨️ Space pressed - starting animation");
        setGameState("standing_up");
        setShowWakeUpPrompt(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState]);

  // Interacted objects system
  useEffect(() => {
    const handleObjectInteracted = (e: CustomEvent) => {
      const { objeto } = e.detail;

      // Detecta interação com o espelho e mostra sequência final
      if (objeto === "espelho") {
        // Verifica se todas as outras interações foram completadas
        const allCompleted = REQUIRED_OBJECTS_FOR_COMPLETE_ENDING.every(
          reqObject => interactedObjects.has(reqObject)
        );
        
        console.log("🪞 Mirror interacted");
        console.log(`   Interacted objects: ${Array.from(interactedObjects).join(', ')}`);
        console.log(`   All interactions complete: ${allCompleted}`);
        
        setAllInteractionsComplete(allCompleted);
        setShowEndGame(true);
        return;
      }

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
      {/* === NARRATIVE INTRO === */}
      {gameState === "intro" && (
        <IntroNarrativa onComplete={handleIntroComplete} />
      )}

      {/* === GAME === */}
      {gameState !== "intro" && (
        <KeyboardControls map={map}>
          <div
            style={{ width: "100vw", height: "100vh", background: "#111" }}
            tabIndex={0}
            onMouseDown={(e) => {
              e.currentTarget.focus();
            }}
          >
            {/* Single canvas */}
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

            {/* === ADJUSTMENT INSTRUCTIONS (TEMPORARY) === */}
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
                  🔧 CAMERA ADJUSTMENT MODE
                </div>
                <div style={{ marginBottom: "5px" }}>
                  <strong>Arrows:</strong> Move camera (horizontal)
                </div>
                <div style={{ marginBottom: "5px" }}>
                  <strong>Q/E:</strong> Move camera up/down
                </div>
                <div style={{ marginBottom: "5px" }}>
                  <strong>1-4:</strong> Preset positions
                </div>
                <div style={{ marginTop: "10px", fontSize: "10px", opacity: 0.7, borderTop: "1px solid #444", paddingTop: "8px" }}>
                   See coordinates in console (F12)<br/>
                   When you find ideal position, copy values<br/>
                   Remove CameraPositionHelper after
                </div>
              </div>
            )}

            {/* === PROMPT TO STAND UP === */}
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
                  Press <strong>SPACE</strong> to stand up
                </div>
                {/* ❌ REMOVED: "(or wait 3 seconds)" text */}
              </div>
            )}

            {/* === INSTRUCTIONS (only shows during gameplay) === */}
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
                  <strong>Controls:</strong>
                </div>
                <div>WASD - Move</div>
                <div>Mouse - Rotate camera</div>
                <div>Space - Run</div>
                <div>E - Interact</div>
                <div style={{ marginTop: "10px", fontSize: "12px", opacity: 0.7 }}>
                  Click on screen to lock mouse
                </div>
              </div>
            )}

            {/* Gemini text UI */}
            {gameState === "playing" && <GeminiTextDisplay />}
          </div>

          {/* Pulse animation for prompt */}
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

      {/* === END GAME SEQUENCE (Mirror interaction) === */}
      {showEndGame && (
        <EndGameSequence 
          allInteractionsComplete={allInteractionsComplete}
          onClose={() => {
            setShowEndGame(false);
            console.log("🎮 End game sequence closed - back to gameplay");
          }}
        />
      )}
    </GenGemini>
  );
}