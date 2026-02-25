"use client";
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { useInteraction } from "../interaction/useInteraction";
import {
  isValidObject,
  isTriggerObject,
  GAME_OBJECTS,
  OBJECT_TEXTS,
  type ObjectId,
} from "@/core";

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
  // ✅ Core validates the object and provides its metadata
  const isKnown = isValidObject(objeto);
  const id = objeto as ObjectId;
  const texto = isKnown
    ? OBJECT_TEXTS[id]
    : `You examine the ${objeto}.`;
  const displayName = isKnown
    ? GAME_OBJECTS[id].displayName
    : objeto.charAt(0).toUpperCase() + objeto.slice(1);

  const objectPosition = useRef(new Vector3(...position));
  const playerVec = useRef(new Vector3());
  const isNearbyRef = useRef(false);
  const lastInteractTime = useRef(0);
  const COOLDOWN_MS = 500;

  const { play: playAudio } = useInteractionAudio(audioPath ?? "");

  const setNearbyObject = useInteraction((s) => s.setNearbyObject);
  const setActiveInteraction = useInteraction((s) => s.setActiveInteraction);
  const markInteracted = useInteraction((s) => s.markInteracted);

  // ── Proximity detection ──
  useFrame(() => {
    const [px, py, pz] = useInteraction.getState().playerPosition;
    playerVec.current.set(px, py, pz);
    const distance = playerVec.current.distanceTo(objectPosition.current);
    const nearby = distance <= interactionDistance;

    if (nearby === isNearbyRef.current) return;
    isNearbyRef.current = nearby;

    if (nearby) {
      setNearbyObject({ objeto, name: displayName });
    } else {
      const current = useInteraction.getState().nearbyObject;
      if (current?.objeto === objeto) setNearbyObject(null);
    }
  });

  // ── E key interaction ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "e" && e.key !== "E") return;
      if (!isNearbyRef.current) return;
      if (useInteraction.getState().activeInteraction) return;

      const now = Date.now();
      if (now - lastInteractTime.current < COOLDOWN_MS) return;
      lastInteractTime.current = now;

      e.preventDefault();
      if (audioPath) playAudio();
      onInteract?.(texto);

      // ✅ Core decides if this is a trigger — no hardcoded "mirror" string
      if (isKnown && isTriggerObject(id)) {
        markInteracted(objeto);
      } else {
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