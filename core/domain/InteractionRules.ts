/**
 * InteractionRules — Core Domain
 *
 * Single source of truth for all interactive objects in the game.
 * No external dependencies — pure data and pure functions.
 *
 * Rules encoded here:
 * - Which objects exist and their display names
 * - How much each contributes to the color progress (0 = none)
 * - Which are required for the complete ending
 * - Which act as a trigger (mirror) rather than a collectible
 */

// ─── Object definition ────────────────────────────────────────────────────────

export interface ObjectRule {
  /** Name shown in the proximity prompt UI */
  displayName: string;
  /** Contribution to the color progress (0–1 scale, summed across objects) */
  colorWeight: number;
  /** Must be interacted with for the "complete" ending */
  requiredForEnding: boolean;
  /**
   * Trigger objects end the game when interacted with.
   * They do NOT contribute to color progress and are NOT collectibles.
   */
  isTrigger: boolean;
}

// ─── Game objects ─────────────────────────────────────────────────────────────

export const GAME_OBJECTS = {
  coffee: { displayName: "Coffee Machine", colorWeight: 0.1,  requiredForEnding: true,  isTrigger: false },
  plant:  { displayName: "Plant",          colorWeight: 0.15, requiredForEnding: true,  isTrigger: false },
  books:  { displayName: "Books",          colorWeight: 0.2,  requiredForEnding: true,  isTrigger: false },
  frame:  { displayName: "Picture Frame",  colorWeight: 0.3,  requiredForEnding: true,  isTrigger: false },
  mirror: { displayName: "Mirror",         colorWeight: 0,    requiredForEnding: false, isTrigger: true  },
} as const satisfies Record<string, ObjectRule>;

export type ObjectId = keyof typeof GAME_OBJECTS;

// ─── Derived queries (pure functions) ────────────────────────────────────────

/** All object IDs in the game */
export const ALL_OBJECT_IDS = Object.keys(GAME_OBJECTS) as ObjectId[];

/** Objects required to be interacted with for the complete ending */
export const REQUIRED_FOR_ENDING = ALL_OBJECT_IDS.filter(
  (id) => GAME_OBJECTS[id].requiredForEnding,
);

/** Objects that trigger the end game sequence when interacted with */
export const TRIGGER_OBJECTS = ALL_OBJECT_IDS.filter(
  (id) => GAME_OBJECTS[id].isTrigger,
);

/** Returns true if the given id is a valid game object */
export function isValidObject(id: string): id is ObjectId {
  return id in GAME_OBJECTS;
}

/** Returns true if this object should trigger the end game */
export function isTriggerObject(id: ObjectId): boolean {
  return GAME_OBJECTS[id].isTrigger;
}

/** Returns true if all required objects have been interacted with */
export function isEndingComplete(interacted: ObjectId[]): boolean {
  return REQUIRED_FOR_ENDING.every((req) => interacted.includes(req));
}