/**
 * IGameActions — Port (Driving / In)
 *
 * Defines what the outside world (UI, player input) can ask the core to do.
 * Adapters call these methods — they never manipulate session state directly.
 */

import { GameState } from "../domain/GameSession";

export interface IGameActions {
  /** Advance the game to the next state (e.g. intro → waking_up) */
  advanceState(to: GameState): void;

  /** Record that the player interacted with an object */
  interact(objectId: string): void;
}