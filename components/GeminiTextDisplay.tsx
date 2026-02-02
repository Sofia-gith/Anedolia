"use client";
import { useEffect, useState } from "react";

/**
 * UI Component que exibe os textos do Gemini
 * Deve ser renderizado FORA do Canvas, ao lado dele
 */
export function GeminiTextDisplay() {
  const [currentText, setCurrentText] = useState<{
    objeto: string;
    texto: string;
  } | null>(null);

  useEffect(() => {
    const handleShowText = (e: CustomEvent) => {
      console.log("Evento recebido:", e.detail);
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

  console.log("Estado atual:", currentText);

  if (!currentText) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 30,
        left: 30,
        right: 30,
        background: "rgba(0, 0, 0, 0.75)",
        color: "#f4a261",
        padding: "16px 24px",
        borderRadius: 8,
        fontStyle: "italic",
        fontSize: 16,
        zIndex: 1000,
        cursor: "pointer",
        backdropFilter: "blur(8px)",
        border: "2px solid rgba(244, 162, 97, 0.3)",
        maxWidth: "800px",
        margin: "0 auto",
        textAlign: "center",
        lineHeight: "1.6",
      }}
      onClick={() => setCurrentText(null)}
    >
      {currentText.texto}
    </div>
  );
}
