"use client";
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { useInteraction } from "../interaction/useInteraction";

// ─── Audio hook ───────────────────────────────────────────────────────────────

function useInteractionAudio(audioPath: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioPath) return;
    audioRef.current = new Audio(audioPath);
    audioRef.current.volume = 0.5;
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [audioPath]);

  const play = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch((err) => console.warn("Audio error:", err));
  };

  return { play };
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const OBJECT_TEXTS: Record<string, string> = {
  books: "Some philosophy and sci-fi books... It's been a while since I read anything.",
  coffee: "The coffee machine. Another day, another coffee. The routine continues.",
  frame: "An abstract painting on the wall. Does it mean anything?",
  plant: "A green plant. At least it's still alive, unlike my motivation.",
  mirror: "My reflection stares back at me. Do I still recognize myself?",
};

const OBJECT_DISPLAY_NAMES: Record<string, string> = {
  books: "Books",
  coffee: "Coffee Machine",
  frame: "Picture Frame",
  plant: "Plant",
  mirror: "Mirror",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface InteractiveObjectProps {
  objeto: string;
  position?: [number, number, number];
  interactionDistance?: number;
  children?: React.ReactNode;
  onInteract?: (texto: string) => void;
  audioPath?: string;
}

export function InteractiveObject({
  objeto,
  position = [0, 0, 0],
  interactionDistance = 2.5,
  children,
  onInteract,
  audioPath,
}: InteractiveObjectProps) {
  const texto =
    OBJECT_TEXTS[objeto] ?? `You examine the ${objeto}.`;

  const displayName =
    OBJECT_DISPLAY_NAMES[objeto] ??
    objeto.charAt(0).toUpperCase() + objeto.slice(1);

  // Internal refs
  const objectPosition = useRef(new Vector3(...position));
  const playerVec = useRef(new Vector3());
  const isNearbyRef = useRef(false);
  const lastInteractTime = useRef(0);
  const COOLDOWN_MS = 500;

  // Audio
  const { play: playAudio } = useInteractionAudio(audioPath ?? "");

  // Store selectors (read)
  const activeInteraction = useInteraction((s) => s.activeInteraction);

  // Store actions (write)
  const setNearbyObject = useInteraction((s) => s.setNearbyObject);
  const setActiveInteraction = useInteraction((s) => s.setActiveInteraction);
  const markInteracted = useInteraction((s) => s.markInteracted);

  // ── Proximity detection (reads playerPosition directly from store to avoid per-render subscription) ──
  useFrame(() => {
    const [px, py, pz] = useInteraction.getState().playerPosition;
    playerVec.current.set(px, py, pz);
    const distance = playerVec.current.distanceTo(objectPosition.current);
    const nearby = distance <= interactionDistance;

    if (nearby === isNearbyRef.current) return; // no change
    isNearbyRef.current = nearby;

    if (nearby) {
      setNearbyObject({ objeto, name: displayName });
    } else {
      // Only clear if we are still the registered nearby object
      const current = useInteraction.getState().nearbyObject;
      if (current?.objeto === objeto) {
        setNearbyObject(null);
      }
    }
  });

  // ── E key interaction ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "e" && e.key !== "E") return;
      if (!isNearbyRef.current) return;
      // If another modal is open, ignore
      if (useInteraction.getState().activeInteraction) return;

      const now = Date.now();
      if (now - lastInteractTime.current < COOLDOWN_MS) return;
      lastInteractTime.current = now;

      e.preventDefault();

      if (audioPath) playAudio();
      onInteract?.(texto);

      if (objeto === "mirror") {
        // Mirror triggers the end game — mark immediately (no modal)
        markInteracted(objeto);
      } else {
        // All other objects: open the text modal
        setActiveInteraction({ objeto, texto });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objeto, texto, audioPath]);

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      const current = useInteraction.getState().nearbyObject;
      if (current?.objeto === objeto) setNearbyObject(null);
    };
  }, [objeto, setNearbyObject]);

  return <group position={position}>{children}</group>;
}