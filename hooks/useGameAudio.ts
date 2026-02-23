"use client";

import { useRef, useCallback, useEffect } from "react";
import { useInteraction } from "@/components/interaction/useInteraction";

/**
 * useGameAudio
 *
 * Manages all background audio for the game:
 * - Rain ambience (starts after intro, pauses during interaction modals)
 * - End game music (plays after mirror interaction if all objects complete)
 *
 * Returns only the controls that page.tsx needs to call externally.
 */
export function useGameAudio(gameStarted: boolean) {
  const rainAudioRef = useRef<HTMLAudioElement | null>(null);
  const rainStoppedRef = useRef(false);
  const endAudioRef = useRef<HTMLAudioElement | null>(null);

  const activeInteraction = useInteraction((s) => s.activeInteraction);

  // ── Rain controls ─────────────────────────────────────────────────────────

  const startRainAudio = useCallback(() => {
    if (rainAudioRef.current || rainStoppedRef.current) return;
    const audio = new Audio("/songs/rain_bg_song.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    rainAudioRef.current = audio;
    audio.play().catch((err) => console.warn("Rain audio blocked:", err));
  }, []);

  const pauseRainAudio = useCallback(() => {
    if (rainAudioRef.current && !rainStoppedRef.current) {
      rainAudioRef.current.pause();
    }
  }, []);

  const resumeRainAudio = useCallback(() => {
    if (rainAudioRef.current && !rainStoppedRef.current) {
      rainAudioRef.current.play().catch(console.warn);
    }
  }, []);

  const fadeOutRainAudio = useCallback((duration = 2000) => {
    if (!rainAudioRef.current || rainStoppedRef.current) return;
    rainStoppedRef.current = true;
    const audio = rainAudioRef.current;
    const startVolume = audio.volume;
    const steps = 20;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      audio.volume = Math.max(0, startVolume * (1 - step / steps));
      if (step >= steps) {
        clearInterval(interval);
        audio.pause();
      }
    }, duration / steps);
  }, []);

  // ── End audio ─────────────────────────────────────────────────────────────

  const playEndAudio = useCallback(() => {
    if (endAudioRef.current) return;
    const audio = new Audio("/songs/end_bg_song.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    endAudioRef.current = audio;
    audio.play().catch((err) => console.warn("End audio blocked:", err));
  }, []);

  // ── Effects ───────────────────────────────────────────────────────────────

  // Start rain when game world appears
  useEffect(() => {
    if (gameStarted) startRainAudio();
  }, [gameStarted, startRainAudio]);

  // Pause rain while an interaction modal is open, resume when dismissed
  useEffect(() => {
    if (activeInteraction) {
      pauseRainAudio();
    } else {
      resumeRainAudio();
    }
  }, [activeInteraction, pauseRainAudio, resumeRainAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      rainAudioRef.current?.pause();
      rainAudioRef.current = null;
      endAudioRef.current?.pause();
      endAudioRef.current = null;
    };
  }, []);

  return { fadeOutRainAudio, playEndAudio };
}