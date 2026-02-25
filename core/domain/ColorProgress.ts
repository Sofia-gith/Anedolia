/**
 * ColorProgress — Core Domain
 *
 * Pure calculation: given a list of interacted objects,
 * returns a value between 0 and 1 representing visual progress.
 *
 * No external dependencies — just math.
 */

import { GAME_OBJECTS, ObjectId } from "./InteractionRules";

/**
 * Calculates the color saturation progress based on which
 * objects the player has interacted with.
 *
 * Trigger objects (mirror) are excluded — they have colorWeight: 0
 * by definition in InteractionRules, so no special case needed here.
 *
 * @returns A value clamped between 0 and 1
 */
export function calculateColorProgress(interacted: ObjectId[]): number {
  const total = interacted.reduce(
    (acc, id) => acc + GAME_OBJECTS[id].colorWeight,
    0,
  );
  return Math.min(total, 1);
}