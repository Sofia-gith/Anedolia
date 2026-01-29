"use client";
import { useEffect, useState, useCallback } from "react";
import { GoogleGenAI } from "@google/genai";

const FALLBACKS: Record<string, string> = {
  café: "O aroma do café preenche o ar, trazendo à tona lembranças de manhãs aquecidas por esperança. Um tom sutil de cor dança na xícara, como se a vida sussurrasse: ainda há calor aqui.",
  planta:
    "A planta na janela resiste, mesmo sem sol. Suas folhas buscam luz, e ao tocá-las, sinto um verde tímido pulsar, como se a esperança brotasse devagar dentro de mim.",
  livros:
    "As páginas amareladas sussurram segredos que o tempo tentou apagar. Entre linhas e versos, minha própria história recupera o matiz do que vivi.",
  espelho:
    "O reflexo não é mais uma sombra turva. Ao encontrar meu olhar, a cor volta ao meu rosto, provando que eu ainda existo além da névoa.",
  quadro:
    "A moldura vazia transbordou em matizes infinitos; a memória agora é uma obra completa, pintada com a cor da minha alma.",
};

// Chaves fixas das interações
const KEYS = ["café", "planta", "livros", "espelho", "quadro"];

const PROMPT = `Gere 5 textos sentimentais, cada um sobre recuperar cor e memória, para um jogo chamado Anedolia. Responda em CSV, uma linha por chave: chave,texto. As chaves são: café, planta, livros, espelho, quadro. O texto deve ser breve, profundo e emocional, refletindo a progressão de cor e sentimento do personagem.`;

// Função utilitária para parsear CSV simples (sem vírgulas nos textos)
function parseCSVToMap(csv: string): Record<string, string> {
  const lines = csv.split(/\r?\n/);
  const map: Record<string, string> = {};
  for (const line of lines) {
    const [key, ...rest] = line.split(",");
    if (key && rest.length) {
      map[key.trim()] = rest.join(",").trim();
    }
  }
  return map;
}

export default function GenGemini({
  onReady,
}: { onReady?: (texts: Record<string, string>) => void } = {}) {
  const [texts, setTexts] = useState<Record<string, string>>(FALLBACKS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    async function fetchGemini() {
      setLoading(true);
      setError("");
      try {
        const genAI = new GoogleGenAI({
          apiKey: "",
        });
        const result = await genAI.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: PROMPT,
        });
        const csv = result.text;
        if (!csv) throw new Error("Resposta vazia do Gemini");
        const parsed = parseCSVToMap(csv);
        // Garante que todas as chaves existam, usando fallback se faltar
        const merged: Record<string, string> = { ...FALLBACKS };
        for (const key of KEYS) {
          if (parsed[key]) merged[key] = parsed[key];
        }
        if (!cancelled) {
          setTexts(merged);
          if (onReady) onReady(merged);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Erro ao chamar Gemini";
        setError(message);
        setTexts(FALLBACKS);
        if (onReady) onReady(FALLBACKS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchGemini();
    return () => {
      cancelled = true;
    };
  }, [onReady]);

  // Função para exibir texto por chave
  const getTexto = useCallback(
    (key: string) => {
      return texts[key] || FALLBACKS[key] || "";
    },
    [texts],
  );

  // Exemplo de UI: lista de botões para testar cada interação
  const [selected, setSelected] = useState<string>("");

  if (loading) return <div>Carregando textos...</div>;

  return (
    <div>
      {error && (
        <div style={{ color: "red", marginBottom: 8 }}>
          Erro: {error} (usando textos de fallback)
        </div>
      )}
      <div style={{ marginBottom: 12 }}>
        {KEYS.map((key) => (
          <button
            key={key}
            style={{
              marginRight: 8,
              padding: "4px 12px",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: selected === key ? "#e0e0e0" : "#fff",
            }}
            onClick={() => setSelected(key)}
          >
            {key}
          </button>
        ))}
      </div>
      {selected && (
        <div
          style={{
            fontStyle: "italic",
            fontSize: 18,
            color: "#444",
            maxWidth: 500,
          }}
        >
          {getTexto(selected)}
        </div>
      )}
    </div>
  );
}
