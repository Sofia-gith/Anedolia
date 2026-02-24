/**
 * page.tsx — Game Orchestrator
 *
 * Responsible only for:
 * - Game state machine (intro → waking_up → standing_up → playing)
 * - Rendering the correct sequence/scene for each state
 * - UI overlays (stand-up prompt, controls hint)
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { Suspense } from "react";

import { IntroNarrativa } from "@/components/sequences/IntroNarrativa";
import { EndGameSequence } from "@/components/sequences/EndGameSequence";
import { GeminiTextDisplay } from "@/components/GeminiTextDisplay";
import GenGemini from "@/components/GenGemini";

import { GameScene, GameState } from "@/components/scene/GameScene";
import { useGameAudio } from "@/hooks/useGameAudio";
import { useGameProgress } from "@/hooks/useGameProgress";

// ─── Keyboard mapping ─────────────────────────────────────────────────────────

const KEYBOARD_MAP = [
  { name: "forward",  keys: ["ArrowUp",    "w", "W"] },
  { name: "backward", keys: ["ArrowDown",  "s", "S"] },
  { name: "left",     keys: ["ArrowLeft",  "a", "A"] },
  { name: "right",    keys: ["ArrowRight", "d", "D"] },
  { name: "jump",     keys: ["Space"] },
  { name: "interact", keys: ["e", "E"] },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [showWakeUpPrompt, setShowWakeUpPrompt] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showEndGame, setShowEndGame] = useState(false);
  const [allInteractionsComplete, setAllInteractionsComplete] = useState(false);

  const gameStarted = gameState !== "intro";

  // ── Hooks ──
  const { fadeOutRainAudio, playEndAudio } = useGameAudio(gameStarted);

  const handleMirrorTriggered = useCallback((allComplete: boolean) => {
    setAllInteractionsComplete(allComplete);
    setShowEndGame(true);
  }, []);

  const { colorProgress } = useGameProgress({
    onEndingTriggered: handleMirrorTriggered,
    fadeOutRainAudio,
    playEndAudio,
  });

  // ── Game state transitions ──
  const handleIntroComplete = () => {
    setGameState("waking_up");
    setTimeout(() => setShowWakeUpPrompt(true), 1000);
  };

  const handleWakeUpComplete = () => {
    setGameState("playing");
  };

  // ── SPACE to stand up ──
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

  // ── Hide instructions after 5 seconds ──
  useEffect(() => {
    if (gameState !== "playing") return;
    const timer = setTimeout(() => setShowInstructions(false), 5000);
    return () => clearTimeout(timer);
  }, [gameState]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <GenGemini>
      {gameState === "intro" && (
        <IntroNarrativa onComplete={handleIntroComplete} />
      )}

      {gameStarted && (
        <KeyboardControls map={KEYBOARD_MAP}>
          <div
            style={{ width: "100vw", height: "100vh", background: "#111" }}
            tabIndex={0}
            onMouseDown={(e) => e.currentTarget.focus()}
          >
            <Canvas
              camera={{ position: [0, 1.8, 1.8], fov: 75 }}
              onCreated={({ gl }) => { gl.domElement.style.outline = "none"; }}
            >
              <Suspense fallback={null}>
                <GameScene
                  colorProgress={colorProgress}
                  gameState={gameState}
                  onWakeUpComplete={handleWakeUpComplete}
                />
              </Suspense>
            </Canvas>

            {showWakeUpPrompt && <WakeUpPrompt />}
            {gameState === "playing" && showInstructions && <ControlsOverlay />}
            {gameState === "playing" && <GeminiTextDisplay />}
          </div>

          <style jsx>{`
            @keyframes pulse {
              0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
              50%       { opacity: 1;   transform: translate(-50%, -50%) scale(1.05); }
            }
          `}</style>
        </KeyboardControls>
      )}

      {showEndGame && (
        <EndGameSequence
          allInteractionsComplete={allInteractionsComplete}
          onClose={() => setShowEndGame(false)}
        />
      )}
    </GenGemini>
  );
}

// ─── UI sub-components ────────────────────────────────────────────────────────

function WakeUpPrompt() {
  return (
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
  );
}

function ControlsOverlay() {
  return (
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
  );
}