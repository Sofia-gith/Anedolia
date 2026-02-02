"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
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

// Context para compartilhar textos com todos os componentes
interface GeminiContextType {
  texts: Record<string, string>;
  loading: boolean;
  error: string;
  getTexto: (key: string) => string;
}

const GeminiContext = createContext<GeminiContextType | null>(null);

// Hook para acessar os textos em qualquer componente filho
export function useGeminiText(key: string): string {
  const context = useContext(GeminiContext);
  if (!context) {
    throw new Error("useGeminiText deve ser usado dentro de GenGemini");
  }
  return context.getTexto(key);
}

// Hook para acessar todo o contexto
export function useGemini(): GeminiContextType {
  const context = useContext(GeminiContext);
  if (!context) {
    throw new Error("useGemini deve ser usado dentro de GenGemini");
  }
  return context;
}

// Provider component
export default function GenGemini({ children }: { children: ReactNode }) {
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
          apiKey: "AIzaSyCDNqFyxZjMgkSmMx_T81dNtd5ckfW7c5Q",
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
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Erro ao chamar Gemini";
        setError(message);
        setTexts(FALLBACKS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchGemini();
    return () => {
      cancelled = true;
    };
  }, []);

  const getTexto = (key: string): string => {
    return texts[key] || FALLBACKS[key] || "";
  };

  const value: GeminiContextType = {
    texts,
    loading,
    error,
    getTexto,
  };

  return (
    <GeminiContext.Provider value={value}>{children}</GeminiContext.Provider>
  );
}
