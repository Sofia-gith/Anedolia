/**
 * Main Page - Third Person Game (WITH WAKE UP SEQUENCE)
 *
 * Flow:
 * 1. Narrative intro (images + texts)
 * 2. Character sitting on bed
 * 3. Stand up animation (SPACE key ONLY)
 * 4. Normal gameplay
 */
"use client";

import { IntroNarrativa } from "@/components/IntroNarrativa";
import { WakeUpSequence } from "@/components/WakeUpSequence";
import { EndGameSequence } from "@/components/EndGameSequence";
import { Player3D } from "@/components/Player3D";
import { CameraThirdPerson } from "@/components/CameraThirdPerson";
// ✅ Now imports the canonical Apartamento directly (InteractableObject removed)
import { Model as Apartamento } from "@/components/Apartamento";
import { AnedoliaEffects } from "@/components/effects/AnedoliaEffects";
import { GeminiTextDisplay } from "@/components/GeminiTextDisplay";
import GenGemini from "@/components/GenGemini";
// ✅ Single source of truth for all interaction state
import { useInteraction } from "@/components/interaction/useInteraction";
import { CameraZoom } from "@/components/CameraZoom";

import { Environment, KeyboardControls } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

// ─── Keyboard mapping ─────────────────────────────────────────────────────────

const map = [
  { name: "forward", keys: ["ArrowUp", "w", "W"] },
  { name: "backward", keys: ["ArrowDown", "s", "S"] },
  { name: "left", keys: ["ArrowLeft", "a", "A"] },
  { name: "right", keys: ["ArrowRight", "d", "D"] },
  { name: "jump", keys: ["Space"] },
  { name: "interact", keys: ["e", "E"] },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const OBJECT_COLOR_VALUES: Record<string, number> = {
  coffee: 0.1,
  plant: 0.15,
  books: 0.2,
  mirror: 0.25,
  frame: 0.3,
};

const REQUIRED_OBJECTS_FOR_COMPLETE_ENDING = [
  "coffee",
  "plant",
  "books",
  "frame",
];

const BED_POSITION: [number, number, number] = [3.0, 1.0, -4.8];
const BED_ROTATION = 0;

const PLAYER_SPAWN_POSITION: [number, number, number] = [
  BED_POSITION[0],
  BED_POSITION[1],
  BED_POSITION[2] + 0.8,
];

const PLAYER_INITIAL_ROTATION = Math.PI * 1.5;

const WAKEUP_CAMERA_POSITION: [number, number, number] = [2.5, 1.4, -3.5];
const WAKEUP_CAMERA_LOOKAT: [number, number, number] = [3.0, 0.8, -5.0];

// ─── Types ────────────────────────────────────────────────────────────────────

type GameState = "intro" | "waking_up" | "standing_up" | "playing";

// ─── Camera helper (dev tool — remove before shipping) ───────────────────────

function CameraPositionHelper() {
  const { camera } = useThree();
  const [cameraPos, setCameraPos] = useState({
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
  });

  useEffect(() => {
    const step = 0.1;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") return;

      const newPos = { ...cameraPos };

      switch (e.key) {
        case "ArrowLeft":   newPos.x -= step; break;
        case "ArrowRight":  newPos.x += step; break;
        case "ArrowUp":     newPos.z -= step; break;
        case "ArrowDown":   newPos.z += step; break;
        case "q": case "Q": newPos.y += step; break;
        case "e": case "E": newPos.y -= step; break;
        case "1": newPos.x = 0.5; newPos.y = 1.8; newPos.z = -2.5; break;
        case "2": newPos.x = 1.5; newPos.y = 1.7; newPos.z = -2.5; break;
        case "3": newPos.x = 5.0; newPos.y = 1.6; newPos.z = -5.0; break;
        case "4": newPos.x = 3.0; newPos.y = 4.0; newPos.z = -5.0; break;
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

// ─── Scene ────────────────────────────────────────────────────────────────────

function Scene({
  colorProgress,
  gameState,
  onWakeUpComplete,
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
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="city" />

        {/* Dev camera helper — remove before final build */}
        {(gameState === "waking_up" || gameState === "standing_up") && (
          <CameraPositionHelper />
        )}

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

        <RigidBody type="fixed" colliders="cuboid" position={[0, 0, 0]}>
          <mesh visible={false}>
            <boxGeometry args={[100, 0.1, 100]} />
          </mesh>
        </RigidBody>

        {/* ✅ Canonical apartment — InteractiveObject components are self-contained inside */}
        <Apartamento />

        {/* Camera zoom animation (triggered by Player3D interact → store) */}
        {gameState === "playing" && <CameraZoom />}
      </Physics>

      <AnedoliaEffects colorProgress={colorProgress} />
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Teste() {
  const [colorProgress, setColorProgress] = useState(0);
  const [gameState, setGameState] = useState<GameState>("intro");
  const [showWakeUpPrompt, setShowWakeUpPrompt] = useState(false);
  const [showEndGame, setShowEndGame] = useState(false);
  const [allInteractionsComplete, setAllInteractionsComplete] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const mirrorHandledRef = useRef(false);


  const storeInteractedObjects = useInteraction((s) => s.interactedObjects);
  const activeInteraction = useInteraction((s) => s.activeInteraction);

  // ─── Rain audio ──
  const rainAudioRef = useRef<HTMLAudioElement | null>(null);
  const rainStoppedRef = useRef(false);

  const startRainAudio = useCallback(() => {
    if (rainAudioRef.current || rainStoppedRef.current) return;
    const audio = new Audio("/songs/rain_bg_song.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    rainAudioRef.current = audio;
    audio.play().catch((err) => console.warn("🌧️ Rain audio blocked:", err));
  }, []);

  const pauseRainAudio = useCallback(() => {
    if (rainAudioRef.current && !rainStoppedRef.current) {
      rainAudioRef.current.pause();
    }
  }, []);

  const resumeRainAudio = useCallback(() => {
    if (rainAudioRef.current && !rainStoppedRef.current) {
      rainAudioRef.current.play().catch(console.warn);
    }
  }, []);

  const fadeOutRainAudio = useCallback((duration = 2000) => {
    if (!rainAudioRef.current || rainStoppedRef.current) return;
    rainStoppedRef.current = true;
    const audio = rainAudioRef.current;
    const startVolume = audio.volume;
    const steps = 20;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      audio.volume = Math.max(0, startVolume * (1 - step / steps));
      if (step >= steps) {
        clearInterval(interval);
        audio.pause();
      }
    }, duration / steps);
  }, []);

  // ─── End audio ──
  const endAudioRef = useRef<HTMLAudioElement | null>(null);

  const playEndAudio = useCallback(() => {
    if (endAudioRef.current) return;
    const audio = new Audio("/songs/end_bg_song.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    endAudioRef.current = audio;
    audio.play().catch((err) => console.warn("🎵 End audio blocked:", err));
  }, []);

  // ─── Game state transitions ──
  const handleIntroComplete = () => {
    setGameState("waking_up");
    setTimeout(() => setShowWakeUpPrompt(true), 1000);
  };

  const handleWakeUpComplete = () => {
    setGameState("playing");
  };

  // ─── Start rain after intro ──
  useEffect(() => {
    if (gameState !== "intro") startRainAudio();
  }, [gameState, startRainAudio]);

  // ─── Pause/resume rain based on modal state (replaces showGeminiText / interactionDismissed events) ──
  useEffect(() => {
    if (activeInteraction) {
      pauseRainAudio();
    } else {
      resumeRainAudio();
    }
  }, [activeInteraction, pauseRainAudio, resumeRainAudio]);

  // ─── Track interactions and trigger end game (replaces objectInteracted event) ──
  useEffect(() => {
    if (storeInteractedObjects.length === 0) return;

    // Update color progress
    const newProgress = storeInteractedObjects.reduce(
      (acc, obj) => acc + (OBJECT_COLOR_VALUES[obj] ?? 0),
      0,
    );
    setColorProgress(Math.min(newProgress, 1));

    // Handle mirror (triggers end game) — only once
    if (storeInteractedObjects.includes("mirror") && !mirrorHandledRef.current) {
      mirrorHandledRef.current = true;

      const allCompleted = REQUIRED_OBJECTS_FOR_COMPLETE_ENDING.every((req) =>
        storeInteractedObjects.includes(req),
      );

      console.log("🪞 Mirror interacted");
      console.log(`   Interacted: ${storeInteractedObjects.join(", ")}`);
      console.log(`   All complete: ${allCompleted}`);

      if (allCompleted) {
        fadeOutRainAudio();
        setTimeout(playEndAudio, 2000);
      }

      setAllInteractionsComplete(allCompleted);
      setShowEndGame(true);
    }
  }, [storeInteractedObjects, fadeOutRainAudio, playEndAudio]);

  // ─── Cleanup audio on unmount ──
  useEffect(() => {
    return () => {
      rainAudioRef.current?.pause();
      rainAudioRef.current = null;
      endAudioRef.current?.pause();
      endAudioRef.current = null;
    };
  }, []);

  // ─── SPACE key to stand up ──
  useEffect(() => {
    if (gameState !== "waking_up") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setGameState("standing_up");
        setShowWakeUpPrompt(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState]);

  // ─── Hide instructions after 5 seconds ──
  useEffect(() => {
    if (gameState !== "playing") return;
    const timer = setTimeout(() => setShowInstructions(false), 5000);
    return () => clearTimeout(timer);
  }, [gameState]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <GenGemini>
      {gameState === "intro" && (
        <IntroNarrativa onComplete={handleIntroComplete} />
      )}

      {gameState !== "intro" && (
        <KeyboardControls map={map}>
          <div
            style={{ width: "100vw", height: "100vh", background: "#111" }}
            tabIndex={0}
            onMouseDown={(e) => e.currentTarget.focus()}
          >
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

            {/* Stand up prompt */}
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
                Press <strong>SPACE</strong> to stand up
              </div>
            )}

            {/* Controls overlay */}
            {gameState === "playing" && showInstructions && (
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
                <div><strong>Controls:</strong></div>
                <div>WASD - Move</div>
                <div>Mouse - Rotate camera</div>
                <div>Space - Run</div>
                <div>E - Interact</div>
                <div style={{ marginTop: "10px", fontSize: "12px", opacity: 0.7 }}>
                  Click on screen to lock mouse
                </div>
              </div>
            )}

            {/* Interaction UI (proximity prompt + modal) */}
            {gameState === "playing" && <GeminiTextDisplay />}
          </div>

          <style jsx>{`
            @keyframes pulse {
              0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
              50% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
            }
          `}</style>
        </KeyboardControls>
      )}

      {showEndGame && (
        <EndGameSequence
          allInteractionsComplete={allInteractionsComplete}
          onClose={() => {
            setShowEndGame(false);
            console.log("🎮 End game closed — back to gameplay");
          }}
        />
      )}
    </GenGemini>
  );
}