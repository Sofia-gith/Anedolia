"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { INTRO_SLIDES } from "@/core";

interface IntroNarrativaProps {
  onComplete: () => void;
}

/**
 * IntroNarrativa — UI Adapter
 *
 * Renders the intro slide sequence.
 * Slide content comes from core/Narrative — nothing hardcoded here.
 */
export function IntroNarrativa({ onComplete }: IntroNarrativaProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fadeState, setFadeState] = useState<"in" | "visible" | "out">("in");
  const [canAdvance, setCanAdvance] = useState(false);

  const slide = INTRO_SLIDES[currentSlide];

  // Fade in on each slide mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeState("visible");
      setCanAdvance(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentSlide]);

  const advanceSlide = () => {
    if (!canAdvance) return;
    setCanAdvance(false);
    setFadeState("out");

    setTimeout(() => {
      if (currentSlide < INTRO_SLIDES.length - 1) {
        setCurrentSlide(currentSlide + 1);
        setFadeState("in");
      } else {
        onComplete();
      }
    }, 800);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && canAdvance) {
        e.preventDefault();
        advanceSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canAdvance, currentSlide]);

  return (
    <div
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
      }}
    >
      {/* Slide image */}
      <div
        style={{
          position: "relative",
          width: "80vw",
          maxWidth: "1200px",
          height: "60vh",
          marginBottom: "40px",
          opacity: fadeState === "in" ? 0 : 1,
          transform: fadeState === "in" ? "scale(0.95)" : "scale(1)",
          transition: "opacity 0.8s ease-in-out, transform 0.8s ease-in-out",
        }}
      >
        <Image
          src={slide.imagePath}
          alt="Narrative"
          fill
          style={{ objectFit: "contain", filter: "grayscale(100%)" }}
          priority
        />
      </div>

      {/* Slide text */}
      <div
        style={{
          maxWidth: "800px",
          padding: "0 40px",
          textAlign: "center",
          opacity: fadeState === "in" ? 0 : 1,
          transform: fadeState === "in" ? "translateY(20px)" : "translateY(0)",
          transition: "opacity 1s ease-in-out 0.3s, transform 1s ease-in-out 0.3s",
        }}
      >
        <p
          style={{
            color: "#fff",
            fontSize: "24px",
            lineHeight: "1.6",
            fontStyle: "italic",
            textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
            margin: 0,
          }}
        >
          {slide.text}
        </p>
      </div>

      {/* Progress dots */}
      <div style={{ position: "absolute", bottom: "80px", display: "flex", gap: "12px" }}>
        {INTRO_SLIDES.map((_, i) => (
          <div
            key={i}
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: i === currentSlide ? "#fff" : "rgba(255,255,255,0.3)",
              transition: "background-color 0.3s ease",
            }}
          />
        ))}
      </div>

      {/* Advance arrow */}
      {canAdvance && (
        <div
          onClick={advanceSlide}
          style={{
            position: "absolute",
            right: "40px",
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
            fontSize: "48px",
            color: "rgba(255,255,255,0.4)",
            userSelect: "none",
            animation: "pulse 2s ease-in-out infinite",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.8)";
            e.currentTarget.style.transform = "translateY(-50%) translateX(5px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.4)";
            e.currentTarget.style.transform = "translateY(-50%)";
          }}
        >
          →
        </div>
      )}

      {/* Key hint */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          color: "rgba(255,255,255,0.5)",
          fontSize: "14px",
          fontFamily: "monospace",
          backgroundColor: "rgba(0,0,0,0.5)",
          padding: "8px 16px",
          borderRadius: "4px",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        Press SPACE to continue
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}