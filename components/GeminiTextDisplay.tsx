"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

/**
 * UI Component that displays Gemini texts with image
 * Now only displays - doesn't manage interaction
 * Must be rendered OUTSIDE the Canvas, alongside it
 */
export function GeminiTextDisplay() {
  const [currentText, setCurrentText] = useState<{
    objeto: string;
    texto: string;
  } | null>(null);
  const [nearbyObject, setNearbyObject] = useState<{
    objeto: string;
    name: string;
  } | null>(null);

  const handleClose = useCallback(() => {
    // Unlock the pointer if it's locked (for 3D controls)
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }

    // Dispatch event to increment color progress
    if (currentText) {
      window.dispatchEvent(
        new CustomEvent("objectInteracted", {
          detail: { objeto: currentText.objeto },
        }),
      );
    }

    setCurrentText(null);
  }, [currentText]);

  // Listens to show text event
  useEffect(() => {
    const handleShowText = (e: CustomEvent) => {
      console.log("Event received:", e.detail);
      setCurrentText(e.detail);
    };

    window.addEventListener("showGeminiText", handleShowText as EventListener);

    return () => {
      window.removeEventListener(
        "showGeminiText",
        handleShowText as EventListener,
      );
    };
  }, []);

  // Listens to proximity events
  useEffect(() => {
    const handleNearby = (e: CustomEvent) => {
      setNearbyObject(e.detail);
    };

    const handleFar = () => {
      setNearbyObject(null);
    };

    window.addEventListener("objectNearby", handleNearby as EventListener);
    window.addEventListener("objectFar", handleFar as EventListener);

    return () => {
      window.removeEventListener("objectNearby", handleNearby as EventListener);
      window.removeEventListener("objectFar", handleFar as EventListener);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.code === "Space" || e.key === "e" || e.key === "E") &&
        currentText
      ) {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentText, handleClose]);

  // Maps object name to image filename
  const imageMap: Record<string, string> = {
    // English keys (used by InteractiveObject in Apartamento.jsx)
    coffee: "cafe.png",
    plant: "planta.png",
    books: "livro.png",
    mirror: "espelho.png",
    frame: "quadro.png",
    // Portuguese keys (legacy / Apartamento0)
    café: "cafe.png",
    planta: "planta.png",
    livros: "livro.png",
    espelho: "espelho.png",
    quadro: "quadro.png",
  };

  return (
    <>
      {/* Interaction prompt when nearby */}
      {nearbyObject && !currentText && (
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
            <div
              style={{
                color: "#fff",
                fontSize: "16px",
                fontWeight: "500",
              }}
            >
              Interact with <strong>{nearbyObject.name}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Text and image modal */}
      {currentText && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            cursor: "pointer",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(10px)",
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
        >
          {/* Image in center */}
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
              src={`/images/${imageMap[currentText.objeto] || "cafe.png"}`}
              alt={currentText.objeto}
              width={400}
              height={400}
              style={{
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>

          {/* Text below */}
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
            {currentText.texto}
          </div>
        </div>
      )}
    </>
  );
}
