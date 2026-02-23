"use client";
import { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { Group } from "three";
import { InteractiveObject } from "../sequences/InteractiveObject";
import { PictureFrame } from "./PictureFrame";
import { Book } from "./Book";

interface ApartamentoProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}

export function Model({ position, rotation, scale }: ApartamentoProps) {
  const { scene } = useGLTF("/apartamento.glb");
  const sceneRef = useRef<Group>(null);

  const clonedScene = scene.clone();

  return (
    <group ref={sceneRef}>
      {/* Main structure (walls, floor, fixed furniture) */}
      <RigidBody type="fixed" colliders="trimesh">
        <primitive object={clonedScene} position={position} rotation={rotation} scale={scale} />
      </RigidBody>

      {/* ── Interactive objects ────────────────────────────────── */}

      {/* Books */}
      <Book
        position={[4.0, 0.67, -4.1]}
        rotation={[0, Math.PI / 4, 0]}
        scale={0.08}
      />
      <Book
        position={[4.2, 0.67, -4.1]}
        rotation={[0, -Math.PI / 6, 0]}
        scale={0.07}
      />
      <InteractiveObject
        objeto="books"
        position={[3.65, 0.81, -3.76]}
        interactionDistance={1.3}
        audioPath="/songs/paper_song.mp3"
      />

      {/* Coffee machine */}
      <InteractiveObject
        objeto="coffee"
        position={[-1.78, 0.91, 0.9]}
        interactionDistance={1.8}
        audioPath="/songs/water_song.mp3"
      />

      {/* Picture frame */}
      <PictureFrame
        position={[3.9, 0.66, -7.0]}
        rotation={[0, Math.PI, 0]}
        scale={0.07}
      />
      <InteractiveObject
        objeto="frame"
        position={[3.95, 1.5, -6.64]}
        interactionDistance={2.0}
        audioPath="/songs/frame_song.mp3"
      />

      {/* Plant */}
      <InteractiveObject
        objeto="plant"
        position={[-1.5, 0.72, -8.0]}
        interactionDistance={2.0}
        audioPath="/songs/sheet_song.mp3"
      />

      {/* Mirror */}
      <InteractiveObject
        objeto="mirror"
        position={[4.0, 1.2, -0.5]}
        interactionDistance={1.8}
      />
    </group>
  );
}

useGLTF.preload("/apartamento.glb");