interface EnvConfig {
  // Google Gemini API
  googleGeminiApiKey: string;

  // Node Environment
  nodeEnv: string;
  isDevelopment: boolean;
  isProduction: boolean;

  // Outras configurações podem ser adicionadas aqui
}

/**
 * Valida e retorna as variáveis de ambiente necessárias 
 */
function getEnvConfig(): EnvConfig {
  const googleGeminiApiKey = process.env.GOOGLE_API_KEY;

  if (!googleGeminiApiKey) {
    throw new Error(
      "GOOGLE_API_KEY não está definida nas variáveis de ambiente",
    );
  }

  const nodeEnv = process.env.NODE_ENV || "development";

  return {
    googleGeminiApiKey,
    nodeEnv,
    isDevelopment: nodeEnv === "development",
    isProduction: nodeEnv === "production",
  };
}

// Exporta a configuração validada
export const env = getEnvConfig();

// Exporta o tipo para uso em outros arquivos
export type { EnvConfig };
