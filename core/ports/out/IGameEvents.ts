/**
 * IGameEvents — Port (Driven / Out)
 *
 * Events the core emits when its state changes.
 * Adapters (audio, UI, effects) subscribe to these and react accordingly.
 *
 * The core knows nothing about WHO listens — it just emits.
 */

import { GameState } from "../domain/GameSession";

export interface IGameEvents {
  /** Fired when the game transitions to a new state */
  onStateChanged(state: GameState): void;

  /** Fired when a new object is successfully interacted with */
  onObjectInteracted(objectId: string): void;

  /** Fired when color progress value changes (0–1) */
  onColorProgressChanged(value: number): void;

  /** Fired when the mirror (trigger) is interacted with */
  onEndingTriggered(isComplete: boolean): void;

  /** Fired when an interaction modal opens (e.g. pause audio) */
  onModalOpened(): void;

  /** Fired when an interaction modal closes (e.g. resume audio) */
  onModalClosed(): void;
}