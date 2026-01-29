/**
 * InteractionPrompt - UI de Prompt de Interação
 *
 * Exibe uma mensagem na tela quando o jogador está próximo
 * de um objeto interativo.
 *
 * Exemplo: "Pressione E para interagir com Cafeteira"
 *
 * Estilização:
 * - Posicionado no centro inferior da tela
 * - Fundo semi-transparente
 * - Texto destacado
 * - Ícone de tecla E
 */
"use client";

import { useInteraction } from "./useInteraction";

export function InteractionPrompt() {
  // Obtém objeto mais próximo do state global
  const nearestObject = useInteraction((state) => state.nearestObject);

  // Não renderiza nada se não há objeto próximo
  if (!nearestObject) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20%",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        pointerEvents: "none", // Não bloqueia cliques
      }}
    >
      {/* Container do prompt */}
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
        {/* Ícone da tecla E */}
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

        {/* Texto do prompt */}
        <div
          style={{
            color: "#fff",
            fontSize: "16px",
            fontWeight: "500",
          }}
        >
          Interagir com <strong>{nearestObject.name}</strong>
        </div>
      </div>

      {/* Indicador de distância (opcional - pode remover se não quiser) */}
      <div
        style={{
          textAlign: "center",
          marginTop: "8px",
          color: "rgba(255, 255, 255, 0.6)",
          fontSize: "12px",
        }}
      >
        Distância: {nearestObject.distance.toFixed(2)}m
      </div>
    </div>
  );
}