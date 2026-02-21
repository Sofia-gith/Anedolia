/**
 * useInteraction - Unified Interaction Store
 *
 * Single source of truth for all interaction state in the game:
 *  - Player position (replaces window.__playerPosition)
 *  - Nearby object for UI prompt (replaces objectNearby / objectFar events)
 *  - Active interaction modal (replaces showGeminiText event + window.__interactionModalOpen)
 *  - Interacted objects list (replaces objectInteracted event)
 *  - Camera zoom state (unchanged)
 */
"use client";

import { create } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NearbyObjectInfo {
  objeto: string;
  name: string;
}

interface ActiveInteractionInfo {
  objeto: string;
  texto: string;
}

/** Used by the legacy InteractableObject / zoom system */
interface InteractableObjectDef {
  id: string;
  name: string;
  distance: number;
  position: [number, number, number];
  onInteract: () => void;
}

interface ZoomState {
  isZooming: boolean;
  targetPosition: [number, number, number] | null;
  targetLookAt: [number, number, number] | null;
  duration: number;
  playerPosition: [number, number, number] | null;
}

// ─── Store interface ──────────────────────────────────────────────────────────

interface InteractionState {
  // ── Player position (replaces window.__playerPosition) ──
  playerPosition: [number, number, number];
  setPlayerPosition: (position: [number, number, number]) => void;

  // ── Nearby object (replaces objectNearby / objectFar events) ──
  nearbyObject: NearbyObjectInfo | null;
  setNearbyObject: (obj: NearbyObjectInfo | null) => void;

  // ── Active modal (replaces showGeminiText event + __interactionModalOpen) ──
  activeInteraction: ActiveInteractionInfo | null;
  setActiveInteraction: (info: ActiveInteractionInfo | null) => void;

  // ── Interaction history (replaces objectInteracted event) ──
  interactedObjects: string[];
  markInteracted: (objeto: string) => void;

  // ── Legacy zoom system (InteractableObject / CameraZoom) ──
  nearestObject: InteractableObjectDef | null;
  setNearestObject: (obj: InteractableObjectDef | null) => void;

  zoomState: ZoomState;
  startZoom: (
    targetPosition: [number, number, number],
    targetLookAt: [number, number, number],
    playerPosition: [number, number, number],
    duration?: number,
  ) => void;
  endZoom: () => void;
  interact: (playerPosition: [number, number, number]) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useInteraction = create<InteractionState>((set, get) => ({
  // ── Player position ──
  playerPosition: [0, 0, 0],
  setPlayerPosition: (position) => set({ playerPosition: position }),

  // ── Nearby object ──
  nearbyObject: null,
  setNearbyObject: (obj) => set({ nearbyObject: obj }),

  // ── Active modal ──
  activeInteraction: null,
  setActiveInteraction: (info) => set({ activeInteraction: info }),

  // ── Interaction history ──
  interactedObjects: [],
  markInteracted: (objeto) => {
    const { interactedObjects } = get();
    if (!interactedObjects.includes(objeto)) {
      set({ interactedObjects: [...interactedObjects, objeto] });
    }
  },

  // ── Legacy zoom system ──
  nearestObject: null,
  setNearestObject: (obj) => set({ nearestObject: obj }),

  zoomState: {
    isZooming: false,
    targetPosition: null,
    targetLookAt: null,
    playerPosition: null,
    duration: 1000,
  },

  interact: (playerPosition) => {
    const { nearestObject } = get();
    if (!nearestObject) return;

    nearestObject.onInteract();

    const objectPos = nearestObject.position;
    const dx = objectPos[0] - playerPosition[0];
    const dy = objectPos[1] - playerPosition[1];
    const dz = objectPos[2] - playerPosition[2];
    const length = Math.sqrt(dx * dx + dy * dy + dz * dz);

    const nx = dx / length;
    const nz = dz / length;
    const zoomDistance = 1.2;

    const cameraOffset: [number, number, number] = [
      objectPos[0] - nx * zoomDistance,
      objectPos[1] + 0.2,
      objectPos[2] - nz * zoomDistance,
    ];

    get().startZoom(cameraOffset, objectPos, playerPosition, 800);

    setTimeout(() => {
      get().endZoom();
    }, 2500);
  },

  startZoom: (targetPosition, targetLookAt, playerPosition, duration = 1000) => {
    set({
      zoomState: {
        isZooming: true,
        targetPosition,
        targetLookAt,
        playerPosition,
        duration,
      },
    });
  },

  endZoom: () => {
    set({
      zoomState: {
        isZooming: false,
        targetPosition: null,
        targetLookAt: null,
        playerPosition: null,
        duration: 1000,
      },
    });
  },
}));