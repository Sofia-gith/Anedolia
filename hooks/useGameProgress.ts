"use client";

import { useState, useRef, useEffect } from "react";
import { useInteraction } from "@/components/interaction/useInteraction";

const OBJECT_COLOR_VALUES: Record<string, number> = {
  coffee: 0.1,
  plant: 0.15,
  books: 0.2,
  mirror: 0.25,
  frame: 0.3,
};

const REQUIRED_FOR_COMPLETE_ENDING = ["coffee", "plant", "books", "frame"];

interface UseGameProgressOptions {
  onMirrorTriggered: (allComplete: boolean) => void;
  fadeOutRainAudio: () => void;
  playEndAudio: () => void;
}

/**
 * useGameProgress
 *
 * Tracks which objects the player has interacted with and:
 * - Computes the color progress value (drives AnedoliaEffects saturation)
 * - Detects mirror interaction and triggers the end game sequence
 */
export function useGameProgress({
  onMirrorTriggered,
  fadeOutRainAudio,
  playEndAudio,
}: UseGameProgressOptions) {
  const [colorProgress, setColorProgress] = useState(0);
  const mirrorHandledRef = useRef(false);

  const interactedObjects = useInteraction((s) => s.interactedObjects);

  useEffect(() => {
    if (interactedObjects.length === 0) return;

    // Recalculate color progress from scratch to keep it in sync
    const newProgress = interactedObjects.reduce(
      (acc, obj) => acc + (OBJECT_COLOR_VALUES[obj] ?? 0),
      0,
    );
    setColorProgress(Math.min(newProgress, 1));

    // Mirror triggers the end game — only once
    if (interactedObjects.includes("mirror") && !mirrorHandledRef.current) {
      mirrorHandledRef.current = true;

      const allComplete = REQUIRED_FOR_COMPLETE_ENDING.every((req) =>
        interactedObjects.includes(req),
      );

      if (allComplete) {
        fadeOutRainAudio();
        setTimeout(playEndAudio, 2000);
      }

      onMirrorTriggered(allComplete);
    }
  }, [interactedObjects, fadeOutRainAudio, playEndAudio, onMirrorTriggered]);

  return { colorProgress };
}