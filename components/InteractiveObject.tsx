"use client";
import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";

/**
 * Hook to play interaction audio
 */
function useInteractionAudio(audioPath: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioPath) return;
    audioRef.current = new Audio(audioPath);
    audioRef.current.volume = 0.5;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioPath]);

  const play = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.warn("Error playing audio:", error);
      });
    }
  };

  return { play };
}

/**
 * Default texts for each interactive object
 * Supports both English and Portuguese names
 */
const OBJECT_TEXTS: Record<string, string> = {
  books:
    "Some philosophy and sci-fi books... It's been a while since I read anything.",
  coffee:
    "The coffee machine. Another day, another coffee. The routine continues.",
  frame: "An abstract painting on the wall. Does it mean anything?",
  plant: "A green plant. At least it's still alive, unlike my motivation.",
  mirror: "My reflection stares back at me. Do I still recognize myself?",
};

/**
 * Map English names to Portuguese (canonical) names
 */
const NAME_MAPPING: Record<string, string> = {
  books: "books",
  coffee: "coffee",
  frame: "frame",
  plant: "plant",
  mirror: "mirror",
};

/**
 * Wrapper component for 3D objects that trigger texts with E key (proximity)
 * Simplified version without Gemini dependency
 *
 * Usage:
 * <InteractiveObject objeto="café" position={[x, y, z]} />
 * <InteractiveObject objeto="coffee" position={[x, y, z]} /> // Also works!
 */
export function InteractiveObject({
  objeto,
  position = [0, 0, 0],
  interactionDistance = 2.5,
  children,
  onInteract,
  audioPath,
}: {
  objeto: string;
  position?: [number, number, number];
  interactionDistance?: number;
  children?: React.ReactNode;
  onInteract?: (texto: string) => void;
  audioPath?: string;
}) {
  // Convert English name to Portuguese (canonical) if needed
  const canonicalName = NAME_MAPPING[objeto] || objeto;

  const texto =
    OBJECT_TEXTS[objeto] ||
    OBJECT_TEXTS[canonicalName] ||
    `You examine the ${objeto}.`;
  const objectPosition = useRef(new Vector3(...position));
  const [isNearby, setIsNearby] = useState(false);
  const isInteractingRef = useRef(false);
  const lastInteractTime = useRef(0);
  const interactCooldown = 500;
  const { play: playAudio } = useInteractionAudio(audioPath || "");

  const handleInteraction = () => {
    // Toggle interaction state: only play audio when opening, not closing
    const isOpening = !isInteractingRef.current;
    isInteractingRef.current = isOpening;

    // Play audio only on the first press (opening interaction)
    if (isOpening && audioPath) {
      playAudio();
    }

    if (onInteract) {
      onInteract(texto);
    }

    // Dispatches event to page.tsx (used for progress and mirror)
    // ALWAYS uses canonical Portuguese name for consistency
    window.dispatchEvent(
      new CustomEvent("objectInteracted", {
        detail: { objeto: canonicalName },
      }),
    );

    // For mirror, don't show old Gemini UI
    // The final sequence will be controlled by page.tsx
    if (canonicalName !== "espelho") {
      // Dispatches custom event for external UI
      window.dispatchEvent(
        new CustomEvent("showGeminiText", {
          detail: { objeto: canonicalName, texto },
        }),
      );
    }

    console.log(
      `✨ Interacted with ${objeto} (canonical: ${canonicalName}):`,
      texto,
    );
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
      // Reset interaction state when player walks away
      if (!nearby) {
        isInteractingRef.current = false;
      }
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
            objeto: canonicalName,
            name:
              canonicalName.charAt(0).toUpperCase() + canonicalName.slice(1),
          },
        }),
      );
    } else {
      window.dispatchEvent(
        new CustomEvent("objectFar", {
          detail: { objeto: canonicalName },
        }),
      );
    }
  }, [isNearby, canonicalName]);

  return <group position={position}>{children}</group>;
}
