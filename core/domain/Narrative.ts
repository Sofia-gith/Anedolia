/**
 * Narrative — Core Domain
 *
 * All narrative content: intro slides, ending screens,
 * and interaction texts shown when the player examines objects.
 *
 * Pure data — no React, no components, no external dependencies.
 */

import { ObjectId } from "./InteractionRules";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NarrativeSlide {
  imagePath: string;
  text: string;
}

export interface EndingContent {
  imagePath: string;
  mainText: string;
  subText: string;
  hintText?: string;
  isAnimated: boolean;
}

// ─── Intro slides ─────────────────────────────────────────────────────────────

export const INTRO_SLIDES: NarrativeSlide[] = [
  { imagePath: "/intro/parte1.png", text: "Back then, everything was simpler, easier" },
  { imagePath: "/intro/parte2.png", text: "What happened?" },
  { imagePath: "/intro/parte3.png", text: "Every day is the same" },
  { imagePath: "/intro/parte4.png", text: "..." },
];

// ─── Object interaction texts ─────────────────────────────────────────────────

export const OBJECT_TEXTS: Record<ObjectId, string> = {
  coffee: "The coffee machine. Another day, another coffee. The routine continues.",
  plant:  "A green plant. At least it's still alive, unlike my motivation.",
  books:  "Some philosophy and sci-fi books... It's been a while since I read anything.",
  frame:  "An abstract painting on the wall. Does it mean anything?",
  mirror: "My reflection stares back at me. Do I still recognize myself?",
};

// ─── Endings ──────────────────────────────────────────────────────────────────

export const ENDING_COMPLETE: EndingContent = {
  imagePath: "/endGame/smile.gif",
  mainText: "Maybe I still recognize myself after all...",
  subText: ":)",
  isAnimated: true,
};

export const ENDING_INCOMPLETE: EndingContent = {
  imagePath: "/endGame/primeiro_slide.png",
  mainText: "Do I still recognize myself?",
  subText: "...",
  hintText: "Perhaps if I explore more, I might find myself again...",
  isAnimated: false,
};

export function getEndingContent(isComplete: boolean): EndingContent {
  return isComplete ? ENDING_COMPLETE : ENDING_INCOMPLETE;
}