"use client";

import { useState, useRef, useEffect } from "react";
import { useInteraction } from "@/components/interaction/useInteraction";
import {
  calculateColorProgress,
  isEndingComplete,
  isTriggerObject,
  isValidObject,
  type ObjectId,
} from "@/core";

interface UseGameProgressOptions {
  onEndingTriggered: (allComplete: boolean) => void;
  fadeOutRainAudio: () => void;
  playEndAudio: () => void;
}

/**
 * useGameProgress — Adapter (State)
 *
 * Bridges the Zustand interaction store with the core domain:
 * - Delegates color progress calculation to core/ColorProgress
 * - Delegates ending completion check to core/InteractionRules
 * - Delegates trigger detection to core/InteractionRules
 */
export function useGameProgress({
  onEndingTriggered,
  fadeOutRainAudio,
  playEndAudio,
}: UseGameProgressOptions) {
  const [colorProgress, setColorProgress] = useState(0);
  const endingHandledRef = useRef(false);

  const interactedObjects = useInteraction((s) => s.interactedObjects);

  useEffect(() => {
    if (interactedObjects.length === 0) return;

    // Filter to valid, non-trigger objects for progress calculation
    const collectibles = interactedObjects
      .filter(isValidObject)
      .filter((id) => !isTriggerObject(id as ObjectId)) as ObjectId[];

    // ✅ Core calculates progress — no weights defined here
    setColorProgress(calculateColorProgress(collectibles));

    // ✅ Core detects the trigger object — no hardcoded "mirror" string here
    const triggerInteracted = interactedObjects
      .filter(isValidObject)
      .some((id) => isTriggerObject(id as ObjectId));

    if (triggerInteracted && !endingHandledRef.current) {
      endingHandledRef.current = true;

      // ✅ Core checks if ending is complete — no hardcoded list here
      const allComplete = isEndingComplete(collectibles);

      if (allComplete) {
        fadeOutRainAudio();
        setTimeout(playEndAudio, 2000);
      }

      onEndingTriggered(allComplete);
    }
  }, [interactedObjects, fadeOutRainAudio, playEndAudio, onEndingTriggered]);

  return { colorProgress };
}