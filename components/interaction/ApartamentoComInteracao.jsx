/*
 * ApartamentoComInteracao - Versão Simples Completa
 * Com CAFETEIRA e PLANTA interativas
 */
"use client";

import { useState } from "react";
import { InteractableObject } from "./InteractableObject";
import { Model as Apartamento } from "../Apartamento";

export function ApartamentoComInteracao(props) {
  // ===== ESTADOS =====
  
  // Cafeteira: ligada ou desligada?
  const [cafeAtivo, setCafeAtivo] = useState(false);
  
  // Planta: foi tocada?
  const [plantaTocada, setPlantaTocada] = useState(false);

  // ===== FUNÇÕES =====

  // Quando apertar E na cafeteira
  const aoTocarCafe = () => {
    setCafeAtivo(!cafeAtivo);
    console.log(cafeAtivo ? "☕ Cafeteira desligada!" : "☕ Fazendo café...");
  };

  // Quando apertar E na planta
  const aoTocarPlanta = () => {
    setPlantaTocada(true);
    console.log("🌿 Você tocou na planta!");
  };

  return (
    <group>
      {/* O apartamento original */}
      <Apartamento {...props} />

      {/* ===== CAFETEIRA INTERATIVA ===== */}
      <InteractableObject
        id="cafeteira"
        name="Cafeteira"
        position={[-1.98, 1.01, 0.999]}
        interactionDistance={2.5}
        onInteract={aoTocarCafe}
      >
        {/* Área invisível para detectar */}
        <mesh visible={false}>
          <sphereGeometry args={[0.3]} />
        </mesh>
        
        {/* Luz laranja quando liga */}
        {cafeAtivo && (
          <pointLight
            position={[0, 0, 0]}
            intensity={2}
            distance={2}
            color="#ff6b00"
          />
        )}
      </InteractableObject>

      {/* ===== PLANTA INTERATIVA ===== */}
      <InteractableObject
        id="planta"
        name="Planta"
        position={[-2.42, 0.91, -2.10]}
        interactionDistance={2.0}
        onInteract={aoTocarPlanta}
      >
        {/* Área invisível para detectar */}
        <mesh visible={false}>
          <sphereGeometry args={[0.4]} />
        </mesh>
        
        {/* Luz verde quando toca */}
        {plantaTocada && (
          <pointLight
            position={[0, 0.5, 0]}
            intensity={1.5}
            distance={2}
            color="#00ff88"
          />
        )}
      </InteractableObject>
    </group>
  );
}