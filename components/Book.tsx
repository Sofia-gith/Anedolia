"use client";
import React from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
interface BookProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export function Book({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: BookProps) {
  const { scene } = useGLTF("/book_.glb");

  // Clone o modelo para evitar conflitos
  const clonedScene = scene.clone();

  // Configura materiais (opcional - ajuste se necessário)
  clonedScene.traverse((node: THREE.Object3D) => {
    if ((node as THREE.Mesh).isMesh) {
      (node as THREE.Mesh).castShadow = true;
      (node as THREE.Mesh).receiveShadow = true;
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
}

// Preload do modelo
useGLTF.preload("/book_.glb");
