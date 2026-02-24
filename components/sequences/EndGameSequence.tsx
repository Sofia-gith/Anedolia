"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getEndingContent } from "@/core";

interface EndGameSequenceProps {
  onClose?: () => void;
  allInteractionsComplete?: boolean;
}

/**
 * EndGameSequence — UI Adapter
 *
 * Renders the final screen after the mirror interaction.
 * All content (texts, images, flags) comes from core/Narrative.
 */
export function EndGameSequence({
  onClose,
  allInteractionsComplete = false,
}: EndGameSequenceProps) {
  const [fadeState, setFadeState] = useState<"in" | "visible" | "out">("in");
  const [showText, setShowText] = useState(false);

  // ✅ Core provides the correct content — no conditionals about strings here
  const ending = getEndingContent(allInteractionsComplete);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeState("visible"), 500);
    const textTimer = setTimeout(() => setShowText(true), 2000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(textTimer);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Escape" || e.code === "Space") {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleClose = () => {
    setFadeState("out");
    setTimeout(() => onClose?.(), 800);
  };

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        opacity: fadeState === "out" ? 0 : 1,
        transition: "opacity 0.8s ease-in-out",
        cursor: "pointer",
      }}
    >
      {/* Ending image / GIF */}
      <div
        style={{
          position: "relative",
          width: "80vw",
          maxWidth: "800px",
          height: "60vh",
          marginBottom: "40px",
          opacity: fadeState === "in" ? 0 : 1,
          transform: fadeState === "in" ? "scale(0.9)" : "scale(1)",
          transition: "opacity 1.2s ease-in-out, transform 1.2s ease-in-out",
        }}
      >
        <Image
          src={ending.imagePath}
          alt="Mirror reflection"
          fill
          style={{
            objectFit: "contain",
            filter: allInteractionsComplete ? "none" : "grayscale(100%) brightness(0.7)",
          }}
          priority
          unoptimized={ending.isAnimated}
        />
      </div>

      {/* Ending texts */}
      {showText && (
        <div
          style={{
            maxWidth: "800px",
            padding: "0 40px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: allInteractionsComplete ? "#fff" : "rgba(255,255,255,0.6)",
              fontSize: "28px",
              lineHeight: "1.6",
              fontStyle: "italic",
              textShadow: "2px 2px 8px rgba(0,0,0,0.9)",
              margin: 0,
              marginBottom: "20px",
            }}
          >
            {ending.mainText}
          </p>
          <p
            style={{
              color: allInteractionsComplete ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.4)",
              fontSize: "18px",
              textShadow: "1px 1px 4px rgba(0,0,0,0.8)",
              margin: 0,
            }}
          >
            {ending.subText}
          </p>

          {ending.hintText && (
            <p
              style={{
                color: "rgba(255,200,100,0.7)",
                fontSize: "16px",
                marginTop: "30px",
                textShadow: "1px 1px 4px rgba(0,0,0,0.8)",
              }}
            >
              {ending.hintText}
            </p>
          )}
        </div>
      )}

      {/* Close hint */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          color: "rgba(255,255,255,0.5)",
          fontSize: "14px",
          fontFamily: "monospace",
          backgroundColor: "rgba(0,0,0,0.5)",
          padding: "8px 16px",
          borderRadius: "4px",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        Press ESC, SPACE or click anywhere to continue
      </div>
    </div>
  );
}