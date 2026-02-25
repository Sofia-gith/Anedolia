/**
 * GameSession — Core Domain
 *
 * The game's state machine and session data.
 * Defines valid states and the transitions between them.
 *
 * No external dependencies — pure types and transition functions.
 */

import { ObjectId, isValidObject, isTriggerObject, isEndingComplete } from "./InteractionRules";
import { calculateColorProgress } from "./ColorProgress";

// ─── State machine ────────────────────────────────────────────────────────────

export type GameState =
  | "intro"        // Narrative intro slides
  | "waking_up"    // Character on bed, waiting for SPACE
  | "standing_up"  // Stand-up animation playing
  | "playing";     // Free exploration

/** Valid transitions between game states */
const VALID_TRANSITIONS: Record<GameState, GameState[]> = {
  intro:        ["waking_up"],
  waking_up:    ["standing_up"],
  standing_up:  ["playing"],
  playing:      [],
};

export function canTransition(from: GameState, to: GameState): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

// ─── Session data ─────────────────────────────────────────────────────────────

export interface GameSession {
  state: GameState;
  interactedObjects: ObjectId[];
  colorProgress: number;
  endingTriggered: boolean;
  endingComplete: boolean;
}

export function createInitialSession(): GameSession {
  return {
    state: "intro",
    interactedObjects: [],
    colorProgress: 0,
    endingTriggered: false,
    endingComplete: false,
  };
}

// ─── Session reducers (pure functions — return new session, never mutate) ─────

export function transitionState(
  session: GameSession,
  to: GameState,
): GameSession {
  if (!canTransition(session.state, to)) {
    console.warn(`Invalid transition: ${session.state} → ${to}`);
    return session;
  }
  return { ...session, state: to };
}

export function recordInteraction(
  session: GameSession,
  rawId: string,
): GameSession {
  // Ignore unknown objects
  if (!isValidObject(rawId)) return session;

  const id = rawId as ObjectId;

  // Handle trigger object (mirror)
  if (isTriggerObject(id)) {
    const endingComplete = isEndingComplete(session.interactedObjects);
    return {
      ...session,
      endingTriggered: true,
      endingComplete,
    };
  }

  // Ignore already-interacted objects
  if (session.interactedObjects.includes(id)) return session;

  const interactedObjects = [...session.interactedObjects, id];
  const colorProgress = calculateColorProgress(interactedObjects);

  return { ...session, interactedObjects, colorProgress };
}