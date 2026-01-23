# Copilot context — Anedolia (essencial)

Resumo curto:
Anedolia é um jogo narrativo Next.js que usa a Google Gemini API para gerar conteúdo dinâmico.

Usos principais para o Copilot:

- Referência rápida para executar o projeto em desenvolvimento

Notas para o Copilot ao sugerir mudanças:

- Prefira alterações focadas nas áreas solicitadas; evite tocar em arquivos não relacionados.
- Não inclua chaves reais em código. Use variáveis de ambiente.
- Mantenha o uso do arquivo `config/env.ts` para validação e acesso às variáveis de ambiente.
- Use TypeScript e respeite o estilo existente.

## Design do Jogo

Conceito: Jogadores acordam em mundo em escala de cinza e exploram sua casa. Interagir com objetos dispara memórias que restauram cor ao mundo.

**Estrutura em 3 atos:**
1. **Act 1 (Quarto)**: Mundo grayscale, 3 objetos interativos, introdução aos controles
2. **Act 2 (Sala)**: 10-20% cor restaurada, 2 sequências de flashback, diálogos gerados por Gemini
3. **Act 3 (Banheiro)**: Interação com espelho, cor totalmente restaurada, conclusão emocional

**Controles:** WASD (movimento), Mouse (olhar), Click (interagir)

**Integração Gemini:** Gera pensamentos internos do personagem, diálogos de flashback, descrições de memórias, mensagem final

**Estilo Visual:**
- Personagem: Silhueta simples (inspirado LIMBO/INSIDE)
- Ambientes: Low-poly, geometria limpa
- Transição de cor: Grayscale → Pastel → Vibrante
- Paleta: Inicial `#3a3a3a`, Mid `#8b9a9f`, Final `#f4a261`, `#e76f51`, `#2a9d8f`

## Roadmap de Desenvolvimento

**Semana 1 (Jan 17-23):**
- [x] Setup do projeto
- [ ] Protótipo básico com formas geométricas
- [ ] Sistema de movimento do jogador
- [ ] Sistema de interação (raycasting)
- [ ] Integração da API Gemini

**Semana 2 (Jan 24-30):**
- [ ] Criação de modelos 3D no Blender
- [ ] Substituir primitivas por modelos
- [ ] Shader de progressão de cor
- [ ] Sistema de flashback
- [ ] Polish da UI

**Semana 3 (Jan 31 - Fev 9):**
- [ ] Sound design
- [ ] Polish visual final
- [ ] Correção de bugs
- [ ] Vídeo demo (max 3 min)
- [ ] Documentação / Submissão Devpost

## Requisitos do Hackathon

**Checklist de submissão:**
- [ ] Usa Gemini 3 API
- [ ] Trabalho original criado durante o hackathon
- [ ] Repositório público no GitHub
- [ ] Descrição ~200 palavras
- [ ] Vídeo demo 3min (YouTube/Vimeo)
- [ ] Documentação/legendas em inglês
- [ ] Link de demo funcional ou app AI Studio

**Critérios de julgamento:**
- Execução Técnica (40%): qualidade do código, uso de Gemini
- Potencial de Impacto (20%): utilidade no mundo real
- Inovação/Fator Wow (30%): originalidade
- Apresentação/Demo (10%): clareza e documentação

Contato/autor:
Sofia Floriano — https://github.com/Sofia-gith
