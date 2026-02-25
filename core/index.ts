/**
 * Core — Public API
 *
 * Everything the adapters need from the core is exported from here.
 * Adapters should import from "@/core" — never from internal paths.
 */

// Domain
export * from "./domain/InteractionRules";
export * from "./domain/ColorProgress";
export * from "./domain/GameSession";
export * from "./domain/Narrative";

// Ports
export type { IGameActions } from "./ports/in/IGameActions";
export type { IGameEvents } from "./ports/out/IGameEvents";