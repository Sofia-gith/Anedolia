"use client";
import React, { useEffect, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { RigidBody } from "@react-three/rapier";
import { InteractiveObject } from "./InteractiveObject";
import { PictureFrame } from "./PictureFrame";
import { Book } from "./Book";
import * as THREE from 'three';

export function Model(props) {
  const { scene } = useGLTF('/apartamento.glb')
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

     
      {/* Primeiro livro (deitado) */}
      <Book 
        position={[4.00, 0.67, -4.10]} 
        rotation={[0, Math.PI / 4, 0]}   
        scale={0.08}                     
      />
      
      {/* Segundo livro (empilhado) */}
      <Book 
        position={[4.20, 0.67, -4.10]}  
        rotation={[0, -Math.PI / 6, 0]}  
        scale={0.07}                
      />
      
      {/* Área de interação dos livros */}
      <InteractiveObject
        objeto="livros"
        position={[3.65, 0.81, -3.76]}
        interactionDistance={1.3}
      />

      {/* Máquina de café */}
      <InteractiveObject
        objeto="café"
        position={[-1.78, 0.91, 0.9]}
        interactionDistance={1.8}
      />

      {/* QUADRO NA PAREDE */}
      <PictureFrame 
        position={[3.90, 0.66, -7.0]}
        rotation={[0, Math.PI, 0]}
        scale={0.07}
      />
      
      {/* Área de interação do quadro */}
      <InteractiveObject
        objeto="quadro"
        position={[3.95, 1.5, -6.64]}
        interactionDistance={2.0}
      />

      {/* PLANTA ao lado da TV */}
      <InteractiveObject
        objeto="planta"
        position={[-1.5, 0.72, -8.0]} 
        interactionDistance={2.0}
      />

      <InteractiveObject
        objeto="espelho"
        position={[4.0, 1.2, -0.5]}
        interactionDistance={1.8}
      />

    </group>
  )
}

useGLTF.preload('/apartamento.glb')