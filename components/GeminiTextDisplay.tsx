"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * UI Component que exibe os textos do Gemini com imagem
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

  // Mapeia o nome do objeto para o nome do arquivo da imagem
  const imageMap: Record<string, string> = {
    café: "cafe.png",
    planta: "planta.png",
    livros: "livro.png",
    espelho: "espelho.png",
    quadro: "quadro.png",
  };

  const imagePath = imageMap[currentText.objeto] || "cafe.png";

  return (
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
      onClick={() => setCurrentText(null)}
    >
      {/* Imagem no centro */}
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
          src={`/images/${imagePath}`}
          alt={currentText.objeto}
          width={400}
          height={400}
          style={{
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>

      {/* Texto embaixo */}
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
  );
}
