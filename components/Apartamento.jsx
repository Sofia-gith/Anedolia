/**
 * Apartamento - VERSÃO HÍBRIDA COM INTERAÇÕES
 * 
 * Esta versão:
 * - Carrega o modelo base completo (sem erros)
 * - Permite adicionar InteractiveObjects em objetos específicos
 * - Separa objetos interativos da estrutura principal
 */
"use client";
import React, { useEffect, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { RigidBody } from "@react-three/rapier";
import { InteractiveObject } from "./InteractiveObject";
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
      {/* Adicione aqui os objetos que você quer interagir */}
      {/* ===================================================== */}

      {/* Exemplo: Livros na mesa de cabeceira */}
      <InteractiveObject
        objeto="livros"
        position={[3.65, 0.81, -3.76]}
        interactionDistance={1.3}
      >
        {/* Você pode adicionar o modelo específico aqui se quiser */}
        {/* ou deixar vazio para usar apenas a posição */}
      </InteractiveObject>

      {/* Exemplo: Máquina de café */}
      <InteractiveObject
        objeto="café"
        position={[-1.78, 0.91, 0.9]}
        interactionDistance={1.8}
      >
        {/* Modelo do café aqui (opcional) */}
      </InteractiveObject>

      {/* Exemplo: Quadro na parede */}
      <InteractiveObject
        objeto="quadro"
        position={[3.95, 0.6, -6.64]}
        interactionDistance={2.0}
      >
        {/* Modelo do quadro aqui (opcional) */}
      </InteractiveObject>

      {/* Adicione mais InteractiveObjects conforme necessário */}
    </group>
  )
}

useGLTF.preload('/apartamento.glb')

/**
 * COMO ENCONTRAR AS POSIÇÕES DOS OBJETOS:
 * 
 * 1. Adicione este código temporariamente dentro do componente:
 * 
 *    useEffect(() => {
 *      scene.traverse((child) => {
 *        if (child.isMesh) {
 *          console.log(`${child.name}:`, child.position);
 *        }
 *      });
 *    }, []);
 * 
 * 2. Abra o console (F12) e veja os nomes e posições
 * 3. Use essas posições nos InteractiveObjects acima
 */