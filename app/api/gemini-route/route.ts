import { GoogleGenAI } from "@google/genai";

const PROMPT = `Gere 5 textos sentimentais, cada um sobre recuperar cor e memória, para um jogo chamado Anedolia. Responda em CSV, uma linha por chave: chave,texto. As chaves são: café, planta, livros, espelho, quadro. O texto deve ser breve, profundo e emocional, refletindo a progressão de cor e sentimento do personagem.`;

export async function GET() {
  console.log("=== INICIANDO CHAMADA GEMINI ===");
  
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  console.log("API Key presente?", !!apiKey);
  console.log("API Key (primeiros 10 chars):", apiKey?.substring(0, 10));

  if (!apiKey) {
    console.error("❌ GOOGLE_GEMINI_API_KEY não está definida");
    return Response.json(
      { error: "Missing GOOGLE_GEMINI_API_KEY" },
      { status: 500 }
    );
  }

  try {
    console.log("Criando instância GoogleGenAI...");
    const ai = new GoogleGenAI({ apiKey });
    console.log("✓ GoogleGenAI criado");
    
    console.log("Gerando conteúdo...");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: PROMPT,
    });
    console.log("✓ Conteúdo gerado");

    const text = response.text;
    console.log("Texto recebido:", text?.substring(0, 100));

    if (!text) {
      throw new Error("Resposta vazia do Gemini");
    }

    return Response.json({ text });
  } catch (err) {
    console.error("❌ ERRO COMPLETO:", err);
    console.error("Tipo do erro:", typeof err);
    console.error("Nome do erro:", err instanceof Error ? err.name : "unknown");
    console.error("Mensagem:", err instanceof Error ? err.message : String(err));
    console.error("Stack:", err instanceof Error ? err.stack : "no stack");
    
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return Response.json({ 
      error: message,
      details: err instanceof Error ? err.stack : String(err)
    }, { status: 500 });
  }
}