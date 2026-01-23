import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt é obrigatório' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY não configurada');
      return NextResponse.json(
        { error: 'API Key não configurada no servidor' },
        { status: 500 }
      );
    }

    console.log('🚀 Chamando Gemini API...');
    
    // Usar gemini-2.0-flash que está disponível para você
    const model = 'gemini-2.0-flash';
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Erro da API Gemini:', data);
      return NextResponse.json(
        { 
          error: 'Erro ao chamar API Gemini',
          details: data.error?.message || JSON.stringify(data)
        },
        { status: response.status }
      );
    }

    // Verificar se a resposta foi bloqueada por segurança
    if (data.promptFeedback?.blockReason) {
      return NextResponse.json(
        { 
          error: 'Conteúdo bloqueado',
          details: `Razão: ${data.promptFeedback.blockReason}`
        },
        { status: 400 }
      );
    }

    // Verificar se há candidatos na resposta
    if (!data.candidates || data.candidates.length === 0) {
      return NextResponse.json(
        { 
          error: 'Nenhuma resposta gerada',
          details: JSON.stringify(data)
        },
        { status: 500 }
      );
    }

    const text = data.candidates[0].content.parts[0].text;
    
    console.log('✅ Resposta recebida com sucesso!');
    
    return NextResponse.json({ text });

  } catch (error: any) {
    console.error('❌ Erro no servidor:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error.message
      },
      { status: 500 }
    );
  }
}