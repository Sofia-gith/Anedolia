/**
 * Narrative — Core Domain
 *
 * All narrative content for the game: intro slides and ending screens.
 * Pure data — no React, no components, no external dependencies.
 *
 * Keeping narrative content here means:
 * - Easy to translate or edit without touching UI components
 * - Testable independently of rendering
 * - Clear separation between "what the story says" and "how it's shown"
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NarrativeSlide {
  imagePath: string;
  text: string;
}

export interface EndingContent {
  imagePath: string;
  mainText: string;
  subText: string;
  hintText?: string; // Shown only on the incomplete ending
  isAnimated: boolean;
}

// ─── Intro ────────────────────────────────────────────────────────────────────

export const INTRO_SLIDES: NarrativeSlide[] = [
  {
    imagePath: "/intro/parte1.png",
    text: "Back then, everything was simpler, easier",
  },
  {
    imagePath: "/intro/parte2.png",
    text: "What happened?",
  },
  {
    imagePath: "/intro/parte3.png",
    text: "Every day is the same",
  },
  {
    imagePath: "/intro/parte4.png",
    text: "...",
  },
];

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

/** Returns the correct ending content based on session outcome */
export function getEndingContent(isComplete: boolean): EndingContent {
  return isComplete ? ENDING_COMPLETE : ENDING_INCOMPLETE;
}