/**
 * IntroNarrativa - Sequência de Introdução do Jogo
 * 
 * Mostra uma narrativa visual com imagens e textos antes do gameplay
 * Transição: Imagem 1 (felicidade) -> Imagem 2 (monotonia) -> Imagem 3 (rotina) -> Imagem 4 (mudança) -> Gameplay
 */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Slide {
  imagePath: string;
  texto: string;
  duracao?: number; // duração em ms antes de passar automaticamente (opcional)
}

interface IntroNarrativaProps {
  onComplete: () => void; // Callback quando a intro terminar
}

export function IntroNarrativa({ onComplete }: IntroNarrativaProps) {
  const [slideAtual, setSlideAtual] = useState(0);
  const [fadeState, setFadeState] = useState<'in' | 'visible' | 'out'>('in');
  const [podeAvancar, setPodeAvancar] = useState(false);

  // Define os slides da narrativa
  const slides: Slide[] = [
    {
      imagePath: "/intro/parte1.png",
      texto: "nessa época tudo é mais simples mais fácil",
      duracao: 4000, // 4 segundos
    },
    {
      imagePath: "/intro/parte2.png", 
      texto: "o que aconteceu?",
      duracao: 4000,
    },
    {
      imagePath: "/intro/parte3.png",
      texto: "Todos os dias são iguais",
      duracao: 4000,
    },
    {
      imagePath: "/intro/parte4.png",
      texto: "...",
      duracao: 4000,
    },
  ];
  // Controla o fade in inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeState('visible');
      setPodeAvancar(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [slideAtual]);

  // Avança automaticamente após a duração (se definida)
  useEffect(() => {
    const slide = slides[slideAtual];
    if (slide.duracao && podeAvancar) {
      const timer = setTimeout(() => {
        avancarSlide();
      }, slide.duracao);
      return () => clearTimeout(timer);
    }
  }, [slideAtual, podeAvancar]);

  // Listener para tecla ESPAÇO
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && podeAvancar) {
        e.preventDefault();
        avancarSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [podeAvancar, slideAtual]);

  const avancarSlide = () => {
    if (!podeAvancar) return;
    
    setPodeAvancar(false);
    setFadeState('out');

    setTimeout(() => {
      if (slideAtual < slides.length - 1) {
        // Próximo slide
        setSlideAtual(slideAtual + 1);
        setFadeState('in');
      } else {
        // Terminou a intro
        onComplete();
      }
    }, 800); // Duração do fade out
  };

  const pularIntro = () => {
    setFadeState('out');
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  const slide = slides[slideAtual];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        opacity: fadeState === 'out' ? 0 : 1,
        transition: 'opacity 0.8s ease-in-out',
      }}
    >
      {/* Imagem */}
      <div
        style={{
          position: 'relative',
          width: '80vw',
          maxWidth: '1200px',
          height: '60vh',
          marginBottom: '40px',
          opacity: fadeState === 'in' ? 0 : 1,
          transform: fadeState === 'in' ? 'scale(0.95)' : 'scale(1)',
          transition: 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out',
        }}
      >
        <Image
          src={slide.imagePath}
          alt="Narrativa"
          fill
          style={{
            objectFit: 'contain',
            filter: 'grayscale(100%)',
          }}
          priority
        />
      </div>

      {/* Texto narrativo */}
      <div
        style={{
          maxWidth: '800px',
          padding: '0 40px',
          textAlign: 'center',
          opacity: fadeState === 'in' ? 0 : 1,
          transform: fadeState === 'in' ? 'translateY(20px)' : 'translateY(0)',
          transition: 'opacity 1s ease-in-out 0.3s, transform 1s ease-in-out 0.3s',
        }}
      >
        <p
          style={{
            color: '#fff',
            fontSize: '24px',
            lineHeight: '1.6',
            fontStyle: 'italic',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
            margin: 0,
          }}
        >
          {slide.texto}
        </p>
      </div>

      {/* Indicador de progresso */}
      <div
        style={{
          position: 'absolute',
          bottom: '80px',
          display: 'flex',
          gap: '12px',
        }}
      >
        {slides.map((_, index) => (
          <div
            key={index}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: index === slideAtual ? '#fff' : 'rgba(255, 255, 255, 0.3)',
              transition: 'background-color 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* Seta para avançar (lado direito) */}
      {podeAvancar && (
        <div
          onClick={avancarSlide}
          style={{
            position: 'absolute',
            right: '40px',
            top: '50%',
            transform: 'translateY(-50%)',
            cursor: 'pointer',
            fontSize: '48px',
            color: 'rgba(255, 255, 255, 0.4)',
            transition: 'all 0.3s ease',
            userSelect: 'none',
            animation: 'pulse 2s ease-in-out infinite',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
            e.currentTarget.style.transform = 'translateY(-50%) translateX(5px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)';
            e.currentTarget.style.transform = 'translateY(-50%) translateX(0)';
          }}
        >
          →
        </div>
      )}

      {/* Animação de pulso para a seta */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>

      {/* Hint de tecla (discreto no canto) */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          color: 'rgba(255, 255, 255, 0.3)',
          fontSize: '11px',
          fontFamily: 'monospace',
        }}
      >
        ESPAÇO para avançar
      </div>
    </div>
  );
}