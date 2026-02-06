"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

const FALLBACKS: Record<string, string> = {
  café: "The aroma of coffee fills the air, bringing back memories of mornings warmed by hope. A subtle tone of color dances in the cup, as if life whispers: there's still warmth here.",
  planta:
    "The plant by the window persists, even without sun. Its leaves seek light, and when I touch them, I feel a timid green pulse, as if hope slowly sprouts within me.",
  livros:
    "The yellowed pages whisper secrets that time tried to erase. Between lines and verses, my own story recovers the hue of what I lived.",
  espelho:
    "The reflection is no longer a blurred shadow. Meeting my gaze, color returns to my face, proving I still exist beyond the fog.",
  quadro:
    "The empty frame overflowed with infinite hues; the memory is now a complete work, painted with the color of my soul.",
};

// Fixed interaction keys
const KEYS = ["café", "planta", "livros", "espelho", "quadro"];

// Utility function to parse simple CSV
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

// Context to share texts with all components
interface GeminiContextType {
  texts: Record<string, string>;
  loading: boolean;
  error: string;
  getTexto: (key: string) => string;
}

const GeminiContext = createContext<GeminiContextType | null>(null);

// Hook to access texts in any child component
export function useGeminiText(key: string): string {
  const context = useContext(GeminiContext);
  if (!context) {
    throw new Error("useGeminiText must be used inside GenGemini");
  }
  return context.getTexto(key);
}

// Hook to access entire context
export function useGemini(): GeminiContextType {
  const context = useContext(GeminiContext);
  if (!context) {
    throw new Error("useGemini must be used inside GenGemini");
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
        // Calls server API Route
        // API Route is at: app/api/gemini-route/route.ts
        const response = await fetch('/api/gemini-route');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        const csv = data.text;
        if (!csv) {
          throw new Error("Empty response from Gemini");
        }
        
        const parsed = parseCSVToMap(csv);
        
        // Ensures all keys exist, using fallback if missing
        const merged: Record<string, string> = { ...FALLBACKS };
        for (const key of KEYS) {
          if (parsed[key]) {
            merged[key] = parsed[key];
          }
        }
        
        if (!cancelled) {
          setTexts(merged);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error calling Gemini";
        console.error("Gemini error:", message);
        setError(message);
        // Uses fallbacks on error
        setTexts(FALLBACKS);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
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