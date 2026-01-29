/*
 * ApartamentoComInteracao - Wrapper para adicionar interatividade ao apartamento
 *
 * Este componente:
 * 1. Renderiza o modelo original do Apartamento completo
 * 2. Adiciona objetos interativos como camadas separadas em posições específicas
 *
 * Vantagem: Não modifica o arquivo Apartamento.jsx original
 */
"use client";

import { useState } from "react";
import { Model as ApartamentoOriginal } from "../Apartamento";
import { InteractableObject } from "./InteractableObject";

export function ApartamentoComInteracao(props) {
  // Estado para controlar se a cafeteira foi ativada
  const [coffeeMachineActive, setCoffeeMachineActive] = useState(false);

  // Função executada quando jogador interage com a cafeteira
  const handleCoffeeMachineInteract = () => {
    setCoffeeMachineActive(!coffeeMachineActive);
    console.log(
      coffeeMachineActive ? "☕ Cafeteira desligada!" : "☕ Fazendo café...",
    );

    // Aqui você pode adicionar:
    // - Som de cafeteira
    // - Partículas de vapor
    // - Restaurar cores (AnedoliaEffects)
  };

  return (
    <group>
      {/* Modelo original do apartamento - sem modificações */}
      <ApartamentoOriginal {...props} />

      {/* 
        Objetos interativos posicionados sobre o modelo original
        A posição precisa ser ajustada testando no jogo
      */}
      <InteractableObject
        id="coffeeMachine"
        name="Cafeteira"
        position={[-1.98, 1.01, 0.999]} // Posição aproximada da cafeteira na cozinha
        interactionDistance={2.5}
        onInteract={handleCoffeeMachineInteract}
      >
        {/* 
          Esfera invisível apenas para detectar interação
          O mesh visual já está no modelo original
        */}
        <mesh visible={false}>
          <sphereGeometry args={[0.3]} />
        </mesh>

        {/* 
          Opcional: Adicionar uma luz que acende quando ativa
          para dar feedback visual
        */}
        {coffeeMachineActive && (
          <pointLight
            position={[0, 0, 0]}
            intensity={2}
            distance={2}
            color="#ff6b00"
          />
        )}
      </InteractableObject>

      {/* 
        ADICIONE MAIS OBJETOS INTERATIVOS AQUI
        
        Exemplo - TV:
        <InteractableObject
          id="tv"
          name="Televisão"
          position={[0.47, 0.51, -5.73]}
          onInteract={() => console.log("TV ligada!")}
        >
          <mesh visible={false}>
            <boxGeometry args={[0.5, 0.3, 0.1]} />
          </mesh>
        </InteractableObject>
      */}
    </group>
  );
}
