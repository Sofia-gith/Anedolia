"use client";
import React from 'react';
import { useGLTF } from '@react-three/drei';

interface PictureFrameProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export function PictureFrame({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  scale = 1 
}: PictureFrameProps) {
  const { scene } = useGLTF('/picture_frame.glb');
  
  // Clone o modelo para evitar conflitos
  const clonedScene = scene.clone();

  // Configura materiais (opcional - ajuste se necessário)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clonedScene.traverse((node: any) => {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
}

// Preload do modelo
useGLTF.preload('/picture_frame.glb');