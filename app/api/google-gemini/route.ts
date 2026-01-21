import { GoogleGenAI } from "@google/genai";
import { env } from "@/config/env";

export async function GET() {
  if (!env.googleGeminiApiKey) {
    return new Response(JSON.stringify({ error: "Missing GOOGLE_API_KEY" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: env.googleGeminiApiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents:
        "Faça um poema sobre variáveis de ambiente em programação em tom humorístico, em português, menos de 50 palavras",
    });

    console.log("Generated Content:", response.text);
  } catch (err) {
    console.error("Error generating content:", err);
  }
}
