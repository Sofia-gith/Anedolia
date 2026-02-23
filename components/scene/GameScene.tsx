"use client";

import { useState } from "react";
import { Environment, KeyboardControls } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";

import { Player3D } from "@/components/player/Player3D";
import { CameraThirdPerson } from "@/components/camera/CameraThirdPerson";
import { CameraZoom } from "@/components/camera/CameraZoom";
import { WakeUpSequence } from "@/components/sequences/WakeUpSequence";
import { AnedoliaEffects } from "@/components/effects/AnedoliaEffects";
import { Model as Apartamento } from "@/components/scene/Apartamento";

// ─── Constants (shared with page.tsx via import if needed) ────────────────────

export const BED_POSITION: [number, number, number] = [3.0, 1.0, -4.8];
export const BED_ROTATION = 0;
export const PLAYER_SPAWN_POSITION: [number, number, number] = [
  BED_POSITION[0],
  BED_POSITION[1],
  BED_POSITION[2] + 0.8,
];
export const PLAYER_INITIAL_ROTATION = Math.PI * 1.5;
export const WAKEUP_CAMERA_POSITION: [number, number, number] = [2.5, 1.4, -3.5];
export const WAKEUP_CAMERA_LOOKAT: [number, number, number] = [3.0, 0.8, -5.0];

// ─── Types ────────────────────────────────────────────────────────────────────

export type GameState = "intro" | "waking_up" | "standing_up" | "playing";

// ─── GameScene ────────────────────────────────────────────────────────────────

interface GameSceneProps {
  colorProgress: number;
  gameState: GameState;
  onWakeUpComplete: () => void;
}

export function GameScene({ colorProgress, gameState, onWakeUpComplete }: GameSceneProps) {
  const [playerPosition, setPlayerPosition] = useState(
    new THREE.Vector3(...PLAYER_SPAWN_POSITION),
  );

  const isWaking = gameState === "waking_up" || gameState === "standing_up";
  const isPlaying = gameState === "playing";

  return (
    <>
      <Physics>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="city" />

        {isWaking && (
          <WakeUpSequence
            bedPosition={BED_POSITION}
            bedRotation={BED_ROTATION}
            onComplete={onWakeUpComplete}
            startAnimation={gameState === "standing_up"}
            cameraPosition={WAKEUP_CAMERA_POSITION}
            cameraLookAt={WAKEUP_CAMERA_LOOKAT}
          />
        )}

        {isPlaying && (
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

        {isPlaying && (
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

        <Apartamento />

        {isPlaying && <CameraZoom />}
      </Physics>

      <AnedoliaEffects colorProgress={colorProgress} />
    </>
  );
}