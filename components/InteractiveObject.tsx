"use client";
import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";

/**
 * Hook para reproduzir som de interação
 */
function useInteractionAudio(audioPath: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(audioPath);
    audioRef.current.volume = 0.5; // Volume ajustável (0.0 a 1.0)
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioPath]);

  const play = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reinicia o áudio
      audioRef.current.play().catch((error) => {
        console.warn("Erro ao reproduzir áudio:", error);
      });
    }
  };

  return { play };
}

/**
 * Textos padrão para cada objeto interativo
 */
const OBJECT_TEXTS: Record<string, string> = {
  livros: "Some philosophy and sci-fi books... It's been a while since I read anything.",
  café: "The coffee machine. Another day, another coffee. The routine continues.",
  quadro: "An abstract painting on the wall. Does it mean anything?",
  planta: "A green plant. At least it's still alive, unlike my motivation.",
  espelho: "My reflection stares back at me. Do I still recognize myself?",
};

/**
 * Wrapper component for 3D objects that trigger texts with E key (proximity)
 * Simplified version without Gemini dependency
 *
 * Usage:
 * <InteractiveObject objeto="café" position={[x, y, z]} />
 */
export function InteractiveObject({
  objeto,
  position = [0, 0, 0],
  interactionDistance = 2.5,
  children,
  onInteract,
  audioPath, // Som opcional
}: {
  objeto: string;
  position?: [number, number, number];
  interactionDistance?: number;
  children?: React.ReactNode;
  onInteract?: (texto: string) => void;
  audioPath?: string; // Caminho opcional para som customizado
}) {
  const texto = OBJECT_TEXTS[objeto] || `You examine the ${objeto}.`;
  const objectPosition = useRef(new Vector3(...position));
  const [isNearby, setIsNearby] = useState(false);
  const lastInteractTime = useRef(0);
  const interactCooldown = 500;
  const { play: playAudio } = useInteractionAudio(audioPath || "");

  const handleInteraction = () => {
    // Reproduz o áudio se fornecido
    if (audioPath) {
      playAudio();
    }

    if (onInteract) {
      onInteract(texto);
    }
    // Dispatches custom event for external UI
    window.dispatchEvent(
      new CustomEvent("showGeminiText", {
        detail: { objeto, texto },
      }),
    );
    console.log(`✨ Interacted with ${objeto}:`, texto);
  };

  // Detects proximity every frame using PLAYER POSITION
  useFrame(() => {
    // Gets current player position from global store
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const playerPos = (window as any).__playerPosition || [0, 0, 0];
    const playerVector = new Vector3(playerPos[0], playerPos[1], playerPos[2]);

    const distance = playerVector.distanceTo(objectPosition.current);
    const nearby = distance <= interactionDistance;

    if (nearby !== isNearby) {
      setIsNearby(nearby);
    }
  });

  // Listens to E key when nearby
  useEffect(() => {
    if (!isNearby) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "e" || e.key === "E") && isNearby) {
        const now = Date.now();
        if (now - lastInteractTime.current > interactCooldown) {
          e.preventDefault();
          handleInteraction();
          lastInteractTime.current = now;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isNearby, texto]);

  // Emits proximity event for external UI to show prompt
  useEffect(() => {
    if (isNearby) {
      window.dispatchEvent(
        new CustomEvent("objectNearby", {
          detail: {
            objeto,
            name: objeto.charAt(0).toUpperCase() + objeto.slice(1),
          },
        }),
      );
    } else {
      window.dispatchEvent(
        new CustomEvent("objectFar", {
          detail: { objeto },
        }),
      );
    }
  }, [isNearby, objeto]);

  return <group position={position}>{children}</group>;
}
