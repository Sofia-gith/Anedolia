'use client';

import { useState } from 'react';

export default function TestPage() {
  const [prompt, setPrompt] = useState('Diga olá em português');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const testGemini = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      const data = await res.json();
      setResponse(data.text || JSON.stringify(data));
    } catch (error) {
      setResponse('Erro: ' + error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 Teste Gemini API</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-semibold">Prompt:</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-3 bg-gray-800 rounded border border-gray-700 h-24"
            />
          </div>

          <button
            onClick={testGemini}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded font-semibold"
          >
            {loading ? '⏳ Gerando...' : '🚀 Testar API'}
          </button>

          {response && (
            <div className="mt-6 p-4 bg-gray-800 rounded border border-gray-700">
              <h2 className="font-semibold mb-2">📝 Resposta:</h2>
              <pre className="whitespace-pre-wrap text-green-400">{response}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}