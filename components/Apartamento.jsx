"use client";
import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { InteractiveObject } from "./InteractiveObject";
import { PictureFrame } from "./PictureFrame";
import { Book } from "./Book";

export function Model(props) {
  const { scene } = useGLTF("/apartamento.glb");
  const sceneRef = useRef();

  // Clone o modelo para evitar conflitos
  const clonedScene = scene.clone();

  return (
    <group ref={sceneRef}>
      {/* ESTRUTURA PRINCIPAL (paredes, chão, móveis fixos) */}
      <RigidBody type="fixed" colliders="trimesh">
        <primitive object={clonedScene} {...props} />
      </RigidBody>

      {/* ===================================================== */}
      {/* OBJETOS INTERATIVOS */}
      {/* ===================================================== */}

      {/* 📚 LIVROS na mesa de cabeceira - AGORA VISÍVEIS! */}
      {/* Primeiro livro (deitado) */}
      <Book
        position={[4.0, 0.67, -4.1]} // Posição na mesa de cabeceira
        rotation={[0, Math.PI / 4, 0]} // Levemente rotacionado
        scale={0.08} // Tamanho ajustável
      />

      {/* Segundo livro (empilhado) */}
      <Book
        position={[4.2, 0.67, -4.1]} // Levemente deslocado
        rotation={[0, -Math.PI / 6, 0]} // Rotação diferente
        scale={0.07} // Um pouco menor
      />

      {/* Área de interação dos livros */}
      <InteractiveObject
        objeto="books"
        position={[3.65, 0.81, -3.76]}
        interactionDistance={1.3}
        audioPath="/songs/paper_song.mp3"
      />

      {/* Máquina de café */}
      <InteractiveObject
        objeto="coffee"
        position={[-1.78, 0.91, 0.9]}
        interactionDistance={1.8}
        audioPath="/songs/water_song.mp3"
      />

      {/* 🖼️ QUADRO NA PAREDE */}
      <PictureFrame
        position={[3.9, 0.66, -7.0]}
        rotation={[0, Math.PI, 0]}
        scale={0.07}
      />

      {/* Área de interação do quadro */}
      <InteractiveObject
        objeto="frame"
        position={[3.95, 1.5, -6.64]}
        interactionDistance={2.0}
      />

      {/* 🌿 PLANTA ao lado da TV */}
      <InteractiveObject
        objeto="plant"
        position={[-1.5, 0.72, -8.0]}
        interactionDistance={2.0}
      />

      <InteractiveObject
        objeto="mirror"
        position={[4.0, 1.2, -0.5]}
        interactionDistance={1.8}
      />
    </group>
  );
}

useGLTF.preload("/apartamento.glb");
