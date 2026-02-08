/**
 * EndGameSequence - Final do Jogo (Interação com Espelho)
 * 
 * Mostra conteúdo diferente baseado nas interações:
 * - Se completou todas as interações: GIF smile.gif (final positivo)
 * - Se não completou: Imagem estática questionando (final incompleto)
 */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface EndGameSequenceProps {
  onClose?: () => void; // Callback quando fecha a sequência
  allInteractionsComplete?: boolean; // Se todas as outras interações foram feitas
}

export function EndGameSequence({ onClose, allInteractionsComplete = false }: EndGameSequenceProps) {
  const [fadeState, setFadeState] = useState<'in' | 'visible' | 'out'>('in');
  const [showText, setShowText] = useState(false);

  // Define conteúdo baseado em se completou todas as interações
  const imagePath = allInteractionsComplete 
    ? "/endGame/smile.gif"         
    : "/endGame/primeiro_slide.png";     
  
  const mainText = allInteractionsComplete
    ? "Maybe I still recognize myself after all..."
    : "Do I still recognize myself?";
  
  const subText = allInteractionsComplete
    ? ":)"
    : "...";
  
  const isAnimated = allInteractionsComplete; // GIF só no final positivo

  // Fade in inicial
  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeState('visible');
    }, 500);

    // Mostra o texto após 2 segundos
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(textTimer);
    };
  }, []);

  // Listener para ESC ou clique para fechar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' || e.code === 'Space') {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClose = () => {
    setFadeState('out');
    setTimeout(() => {
      if (onClose) onClose();
    }, 800);
  };

  return (
    <div
      onClick={handleClose}
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
        cursor: 'pointer',
      }}
    >
      {/* Imagem/GIF do Espelho - Condicional */}
      <div
        style={{
          position: 'relative',
          width: '80vw',
          maxWidth: '800px',
          height: '60vh',
          marginBottom: '40px',
          opacity: fadeState === 'in' ? 0 : 1,
          transform: fadeState === 'in' ? 'scale(0.9)' : 'scale(1)',
          transition: 'opacity 1.2s ease-in-out, transform 1.2s ease-in-out',
        }}
      >
        <Image
          src={imagePath}
          alt="Mirror reflection"
          fill
          style={{
            objectFit: 'contain',
            filter: allInteractionsComplete ? 'none' : 'grayscale(100%) brightness(0.7)',
          }}
          priority
          unoptimized={isAnimated} // Só desabilita otimização para GIF
        />
      </div>

      {/* Texto reflexivo - Condicional */}
      {showText && (
        <div
          style={{
            maxWidth: '800px',
            padding: '0 40px',
            textAlign: 'center',
            opacity: showText ? 1 : 0,
            transform: showText ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 1s ease-in-out, transform 1s ease-in-out',
          }}
        >
          <p
            style={{
              color: allInteractionsComplete ? '#fff' : 'rgba(255, 255, 255, 0.6)',
              fontSize: '28px',
              lineHeight: '1.6',
              fontStyle: 'italic',
              textShadow: '2px 2px 8px rgba(0, 0, 0, 0.9)',
              margin: 0,
              marginBottom: '20px',
            }}
          >
            {mainText}
          </p>
          <p
            style={{
              color: allInteractionsComplete ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.4)',
              fontSize: '18px',
              textShadow: '1px 1px 4px rgba(0, 0, 0, 0.8)',
              margin: 0,
            }}
          >
            {subText}
          </p>
          
          {/* Hint se não completou todas as interações */}
          {!allInteractionsComplete && (
            <p
              style={{
                color: 'rgba(255, 200, 100, 0.7)',
                fontSize: '16px',
                marginTop: '30px',
                fontStyle: 'normal',
                textShadow: '1px 1px 4px rgba(0, 0, 0, 0.8)',
              }}
            >
              Perhaps if I explore more, I might find myself again...
            </p>
          )}
        </div>
      )}

      {/* Hint para fechar */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '14px',
          fontFamily: 'monospace',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: '8px 16px',
          borderRadius: '4px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        Press ESC, SPACE or click anywhere to continue
      </div>
    </div>
  );
}