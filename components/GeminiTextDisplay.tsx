"use client";
import { useCallback, useEffect } from "react";
import Image from "next/image";
import { useInteraction } from "./interaction/useInteraction";

/**
 * GeminiTextDisplay
 *
 * Displays the interaction modal and proximity prompt.
 * Reads state directly from the Zustand store — no window events.
 * Must be rendered OUTSIDE the Canvas, alongside it.
 */
export function GeminiTextDisplay() {
  // ── Store reads ──
  const nearbyObject = useInteraction((s) => s.nearbyObject);
  const activeInteraction = useInteraction((s) => s.activeInteraction);

  // ── Store actions ──
  const setActiveInteraction = useInteraction((s) => s.setActiveInteraction);
  const markInteracted = useInteraction((s) => s.markInteracted);

  // ── Close modal ──
  const handleClose = useCallback(() => {
    if (!activeInteraction) return;

    // Mark interaction as complete when the player dismisses the modal
    markInteracted(activeInteraction.objeto);
    setActiveInteraction(null);

    // Re-acquire pointer lock so the player can move without clicking again
    requestAnimationFrame(() => {
      const canvas = document.querySelector("canvas");
      if (canvas && !document.pointerLockElement) {
        canvas.requestPointerLock();
      }
    });
  }, [activeInteraction, markInteracted, setActiveInteraction]);

  // ── Keyboard shortcut to close modal (E or Space) ──
  useEffect(() => {
    if (!activeInteraction) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === "e" || e.key === "E") {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeInteraction, handleClose]);

  // ── Image mapping ──
  const imageMap: Record<string, string> = {
    coffee: "cafe.png",
    plant: "planta.png",
    books: "livro.png",
    mirror: "espelho.png",
    frame: "quadro.png",
  };

  return (
    <>
      {/* Proximity prompt */}
      {nearbyObject && !activeInteraction && (
        <div
          style={{
            position: "fixed",
            bottom: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              background: "rgba(0, 0, 0, 0.8)",
              padding: "16px 24px",
              borderRadius: "12px",
              border: "2px solid rgba(255, 255, 255, 0.3)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                padding: "8px 16px",
                borderRadius: "6px",
                border: "2px solid rgba(255, 255, 255, 0.4)",
                fontFamily: "monospace",
                fontSize: "18px",
                fontWeight: "bold",
                color: "#fff",
                minWidth: "40px",
                textAlign: "center",
              }}
            >
              E
            </div>
            <div style={{ color: "#fff", fontSize: "16px", fontWeight: "500" }}>
              Interact with <strong>{nearbyObject.name}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Interaction modal */}
      {activeInteraction && (
        <div
          onClick={handleClose}
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            cursor: "pointer",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Object image */}
          <div
            style={{
              marginBottom: "40px",
              border: "3px solid rgba(244, 162, 97, 0.5)",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(244, 162, 97, 0.3)",
            }}
          >
            <Image
              src={`/images/${imageMap[activeInteraction.objeto] ?? "cafe.png"}`}
              alt={activeInteraction.objeto}
              width={400}
              height={400}
              style={{ objectFit: "cover", display: "block" }}
            />
          </div>

          {/* Interaction text */}
          <div
            style={{
              background: "rgba(0, 0, 0, 0.75)",
              color: "#f4a261",
              padding: "16px 24px",
              borderRadius: 8,
              fontStyle: "italic",
              fontSize: 18,
              border: "2px solid rgba(244, 162, 97, 0.3)",
              maxWidth: "800px",
              textAlign: "center",
              lineHeight: "1.6",
            }}
          >
            {activeInteraction.texto}
          </div>
        </div>
      )}
    </>
  );
}