/**
 * Página de Teste - Cena 3D do Apartamento com SISTEMA DE ZOOM
 *
 * Esta página renderiza a cena principal do jogo com:
 * - Ambiente 3D interativo usando React Three Fiber
 * - Sistema de física com Rapier para colisões e gravidade
 * - Controles de primeira pessoa (WASD + Mouse)
 * - Sistema de interação com objetos (tecla E)
 * - NOVO: Sistema de zoom ao interagir
 * - UI de prompt de interação
 * - Modelo 3D do apartamento com objetos interativos
 */
"use client";

// === IMPORTS ===
import { InteractionPrompt } from "@/components/ui/InteractionPrompt";
import { Player } from "@/components/Player";
import { ApartamentoComInteracao as Apartamento } from "@/components/interaction/ApartamentoComInteracao";
// Efeitos visuais de anedonia (dessaturação, vinheta, etc)
import { AnedoliaEffects } from "@/components/effects/AnedoliaEffects";
import { CameraZoom } from "@/components/CameraZoom";
// UI para exibir textos do Gemini
import { GeminiTextDisplay } from "@/components/GeminiTextDisplay";
// Helpers do drei: ambiente HDR, controles de teclado e mouse
import {
  Environment,
  KeyboardControls,
  PointerLockControls,
} from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect } from "react";
import GenGemini from "@/components/GenGemini";

/**
 * Mapeamento de teclas para controles do jogador
 */
const map = [
  { name: "forward", keys: ["ArrowUp", "w", "W"] },
  { name: "backward", keys: ["ArrowDown", "s", "S"] },
  { name: "left", keys: ["ArrowLeft", "a", "A"] },
  { name: "right", keys: ["ArrowRight", "d", "D"] },
  { name: "jump", keys: ["Space"] },
  { name: "interact", keys: ["e", "E"] },
];

// Define color progress per object (percentage each object adds)
const OBJECT_COLOR_VALUES: Record<string, number> = {
  café: 0.9, // 10%
  planta: 0.15, // 15%
  livros: 0.2, // 20%
  espelho: 0.25, // 25%
  quadro: 0.3, // 30%
};

export default function Teste() {
  const [interactedObjects, setInteractedObjects] = useState<Set<string>>(
    new Set(),
  );
  const [targetColorProgress, setTargetColorProgress] = useState(0);
  const [currentColorProgress, setCurrentColorProgress] = useState(0);
  const [isColorActive, setIsColorActive] = useState(false);

  // Smooth color transition animation
  useEffect(() => {
    if (!isColorActive) {
      // Fade out smoothly
      if (currentColorProgress > 0) {
        const fadeOutInterval = setInterval(() => {
          setCurrentColorProgress((prev) => {
            const newValue = prev - 0.01;
            if (newValue <= 0) {
              clearInterval(fadeOutInterval);
              return 0;
            }
            return newValue;
          });
        }, 16); // ~60fps

        return () => clearInterval(fadeOutInterval);
      }
    } else {
      // Fade in smoothly
      if (currentColorProgress < targetColorProgress) {
        const fadeInInterval = setInterval(() => {
          setCurrentColorProgress((prev) => {
            const newValue = prev + 0.01;
            if (newValue >= targetColorProgress) {
              clearInterval(fadeInInterval);
              return targetColorProgress;
            }
            return newValue;
          });
        }, 16); // ~60fps

        return () => clearInterval(fadeInInterval);
      }
    }
  }, [isColorActive, targetColorProgress, currentColorProgress]);

  useEffect(() => {
    const handleObjectInteracted = (e: CustomEvent) => {
      const { objeto } = e.detail;

      // Check if this object was already interacted with
      if (!interactedObjects.has(objeto)) {
        const newInteractedObjects = new Set(interactedObjects);
        newInteractedObjects.add(objeto);
        setInteractedObjects(newInteractedObjects);

        // Calculate new color progress
        const colorValue = OBJECT_COLOR_VALUES[objeto] || 0.1;
        const newProgress = Math.min(targetColorProgress + colorValue, 1);
        setTargetColorProgress(newProgress);
        setIsColorActive(true);

        console.log(`Color progress: ${newProgress * 100}%`);

        // Fade back to grayscale after 6 seconds
        setTimeout(() => {
          setIsColorActive(false);
        }, 6000);
      }
    };

    window.addEventListener(
      "objectInteracted",
      handleObjectInteracted as EventListener,
    );

    return () => {
      window.removeEventListener(
        "objectInteracted",
        handleObjectInteracted as EventListener,
      );
    };
  }, [interactedObjects, targetColorProgress]);
  return (
    <KeyboardControls map={map}>
      <div style={{ width: "100vw", height: "100vh", background: "#111" }}>
        {/* 
          Canvas: Área de renderização 3D
          - position: posição inicial da câmera (x, y, z)
          - fov: campo de visão em graus (75 é bom para primeira pessoa)
        */}
        <GenGemini>
          <Canvas camera={{ position: [0, 2, 0], fov: 75 }}>
            {/* Suspense: Aguarda carregamento dos assets 3D */}
            <Suspense fallback={null}>
              {/* 
              Physics: Motor de física Rapier
              Tudo dentro dele terá simulação de física (gravidade, colisões)
            */}
              <Physics>
                {/* === ILUMINAÇÃO === */}
                {/* Luz ambiente: ilumina toda a cena uniformemente */}
                <ambientLight intensity={1.5} />
                {/* Luz direcional: simula luz do sol, cria sombras */}
                <directionalLight position={[10, 10, 5]} intensity={1} />

                {/* Environment: Iluminação HDR baseada em imagem (reflexos realistas) */}
                <Environment preset="city" />

                {/* === JOGADOR === */}
                {/* Player: Cápsula física que representa o jogador */}
                <Player />

                {/* 
                Chão invisível: Impede o player de cair infinitamente
                - type="fixed": corpo estático (não se move)
                - colliders="cuboid": colisão em formato de caixa
                - args=[100, 0.1, 100]: largura, altura, profundidade
              */}
                <RigidBody type="fixed" colliders="cuboid" position={[0, 0, 0]}>
                  <mesh visible={false}>
                    <boxGeometry args={[100, 0.1, 100]} />
                  </mesh>
                </RigidBody>

                {/* 
                PointerLockControls: Trava o mouse na tela ao clicar
                Permite olhar ao redor movendo o mouse (estilo FPS)
              */}
                <PointerLockControls />

                {/* Modelo 3D do apartamento */}
                <Apartamento />
              </Physics>

              {/* 
              AnedoliaEffects: Efeitos de pós-processamento
              - colorProgress: 0 = cinza total, 1 = cores restauradas
              - Aumentar esse valor conforme o jogador interage com objetos
            */}
              <AnedoliaEffects colorProgress={currentColorProgress} />
            </Suspense>
          </Canvas>
        </GenGemini>

        {/* UI de texto FORA do Canvas */}
        <GeminiTextDisplay />
      </div>
    </KeyboardControls>
  );
}