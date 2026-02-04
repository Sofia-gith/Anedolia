"use client";
import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3, Raycaster } from "three";
import { useGeminiText } from "./GenGemini";

/**
 * Componente wrapper para objetos 3D que disparam textos do Gemini com tecla E (proximidade)
 * Agora auto-contido: gerencia proximidade, tecla E, e exibe prompt próprio
 *
 * Uso:
 * <InteractiveObject objeto="café" position={[x, y, z]}>
 *   <mesh>...</mesh>
 * </InteractiveObject>
 */
export function InteractiveObject({
  objeto,
  position = [0, 0, 0],
  interactionDistance = 2.5,
  children,
  onInteract,
}: {
  objeto: string;
  position?: [number, number, number];
  interactionDistance?: number;
  children: React.ReactNode;
  onInteract?: (texto: string) => void;
}) {
  const texto = useGeminiText(objeto);
  const objectPosition = useRef(new Vector3(...position));
  const [isNearby, setIsNearby] = useState(false);
  const lastInteractTime = useRef(0);
  const interactCooldown = 500;

  const handleInteraction = () => {
    if (onInteract) {
      onInteract(texto);
    }
    // Dispara evento customizado para a UI externa
    window.dispatchEvent(
      new CustomEvent("showGeminiText", {
        detail: { objeto, texto },
      }),
    );
    console.log(`Interagiu com ${objeto}:`, texto);
  };

  // Detecta proximidade a cada frame usando a POSIÇÃO DO JOGADOR
  useFrame(() => {
    // Obtém a posição atual do jogador do store global
    const playerPos = (window as any).__playerPosition || [0, 0, 0];
    const playerVector = new Vector3(playerPos[0], playerPos[1], playerPos[2]);

    const distance = playerVector.distanceTo(objectPosition.current);
    const nearby = distance <= interactionDistance;

    if (nearby !== isNearby) {
      setIsNearby(nearby);
    }
  });

  // Escuta tecla E quando próximo
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

  // Emite evento de proximidade para UI externa mostrar prompt
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
