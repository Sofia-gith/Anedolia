/*
 * ApartamentoComInteracao - Versão Completa
 * Com CAFETEIRA, PLANTA VERDE, LIVROS e ESPELHO
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
  
  // Livros: foram lidos?
  const [livrosLidos, setLivrosLidos] = useState(false);
  const [contadorLivros, setContadorLivros] = useState(0);
  
  // Espelho: foi olhado?
  const [espelhoOlhado, setEspelhoOlhado] = useState(false);
  const [contadorEspelho, setContadorEspelho] = useState(0);

  // ===== FUNÇÕES =====

  // Quando apertar E na cafeteira
  const aoTocarCafe = () => {
    setCafeAtivo(!cafeAtivo);
    console.log(cafeAtivo ? "☕ Cafeteira desligada!" : "☕ Fazendo café...");
  };

  // Quando apertar E na planta verde
  const aoTocarPlanta = () => {
    setPlantaTocada(true);
    console.log("🌿 Você tocou na planta verde!");
  };

  // Quando apertar E nos livros
  const aoTocarLivros = () => {
    setLivrosLidos(true);
    const novoContador = contadorLivros + 1;
    setContadorLivros(novoContador);
    
    const mensagens = [
      "📚 Você pega um livro da estante...",
      "📖 'Memórias de um Solitário' - parece interessante.",
      "📚 Você folheia as páginas lentamente.",
      "📖 As palavras trazem conforto...",
      "📚 Você sente uma conexão com as histórias.",
      "📖 Cada livro tem sua própria jornada.",
    ];
    
    const indice = (novoContador - 1) % mensagens.length;
    console.log(mensagens[indice]);
  };

  // Quando apertar E no espelho
  const aoOlharEspelho = () => {
    setEspelhoOlhado(true);
    const novoContador = contadorEspelho + 1;
    setContadorEspelho(novoContador);
    
    const mensagens = [
      "🪞 Você olha para o espelho...",
      "🪞 Seu reflexo olha de volta.",
      "🪞 Você vê sinais de cansaço em seu rosto.",
      "🪞 Quando foi a última vez que sorriu?",
      "🪞 Os olhos refletem uma tristeza profunda.",
      "🪞 Você se reconhece?",
      "🪞 Há esperança por trás desses olhos.",
      "🪞 Talvez amanhã seja diferente...",
    ];
    
    const indice = (novoContador - 1) % mensagens.length;
    console.log(mensagens[indice]);
  };

  return (
    <group>
      {/* O apartamento original */}
      <Apartamento {...props} />

      {/* ===== CAFETEIRA(cozinha) ===== */}
      <InteractableObject
        id="cafeteira"
        name="Cafeteira"
        position={[-1.98, 1.01, 0.999]}
        interactionDistance={2.5}
        onInteract={aoTocarCafe}
      >
        <mesh visible={false}>
          <sphereGeometry args={[0.3]} />
        </mesh>
        
        {cafeAtivo && (
          <pointLight
            position={[0, 0, 0]}
            intensity={2}
            distance={2}
            color="#ff6b00"
          />
        )}
      </InteractableObject>

      {/* ===== PLANTA VERDE(ao lado da TV) ===== */}
      <InteractableObject
        id="planta"
        name="Planta"
        position={[0.30, 0.83, -6.37]}
        interactionDistance={2.0}
        onInteract={aoTocarPlanta}
      >
        <mesh visible={false}>
          <sphereGeometry args={[0.4]} />
        </mesh>
        
        {plantaTocada && (
          <pointLight
            position={[0, 0.5, 0]}
            intensity={1.5}
            distance={2}
            color="#00ff88"
          />
        )}
      </InteractableObject>

      {/* ===== LIVROS INTERATIVOS (estante do quarto) ===== */}
      <InteractableObject
        id="livros"
        name="Livros"
        position={[0.90, 1.37, -5.96]}
        interactionDistance={2.0}
        onInteract={aoTocarLivros}
      >
        <mesh visible={false}>
          <boxGeometry args={[0.5, 0.6, 0.3]} />
        </mesh>
        
        {livrosLidos && (
          <pointLight
            position={[0, 0, 0]}
            intensity={1.2}
            distance={2.5}
            color="#ffdd88"
          />
        )}
      </InteractableObject>

      {/* ===== ESPELHO INTERATIVO (banheiro) ===== */}
      <InteractableObject
        id="espelho"
        name="Espelho"
        position={[4.09, 1.00, -0.48]}
        interactionDistance={2.0}
        onInteract={aoOlharEspelho}
      >
        <mesh visible={false}>
          <boxGeometry args={[0.6, 0.8, 0.1]} />
        </mesh>
        
        {espelhoOlhado && (
          <pointLight
            position={[0, 0, 0.3]}
            intensity={1.0}
            distance={2}
            color="#aaccff"
          />
        )}
      </InteractableObject>
    </group>
  );
}