import { GoogleGenAI } from "@google/genai";

const PROMPT = `Gere 5 textos sentimentais, cada um sobre recuperar cor e memória, para um jogo chamado Anedolia. Responda em CSV, uma linha por chave: chave,texto. As chaves são: café, planta, livros, espelho, quadro. O texto deve ser breve, profundo e emocional, refletindo a progressão de cor e sentimento do personagem.`;

export async function GET() {
  console.log("=== INICIANDO CHAMADA GEMINI ===");
  
  const apiKey = process.env.GOOGLE_API_KEY;
  console.log("API Key presente?", !!apiKey);
  console.log("API Key (primeiros 10 chars):", apiKey?.substring(0, 10));

  if (!apiKey) {
    console.error("❌ GOOGLE_API_KEY não está definida");
    return Response.json(
      { error: "Missing GOOGLE_API_KEY" },
      { status: 500 }
    );
  }

  try {
    console.log("Criando instância GoogleGenAI...");
    const ai = new GoogleGenAI({ apiKey });
    console.log("✓ GoogleGenAI criado");
    
    const modelsToTry = [
      "gemini-3-pro-preview",
      "gemini-3-flash-preview",
      "gemini-2.5-flash",
    ];
    
    let responseText = null;
    let successfulModel = "";
    
    // Tenta cada modelo até um funcionar
    for (const modelName of modelsToTry) {
      try {
        console.log(`Tentando modelo: ${modelName}...`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: PROMPT,
        });
        
        responseText = response.text;
        successfulModel = modelName;
        console.log(`✓ Modelo ${modelName} funcionou!`);
        break;
      } catch (modelError) {
        console.log(`❌ Modelo ${modelName} falhou:`, modelError instanceof Error ? modelError.message : String(modelError));
        continue;
      }
    }

    if (!responseText) {
      throw new Error("Nenhum modelo Gemini disponível funcionou. Verifique sua API key ou os modelos disponíveis.");
    }

    console.log(`✓ Usando modelo: ${successfulModel}`);
    console.log("Texto recebido:", responseText.substring(0, 100));

    return Response.json({ text: responseText });
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