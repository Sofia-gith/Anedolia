/**
 * IntroNarrativa - Game Introduction Sequence (ENGLISH VERSION)
 * 
 * Shows a visual narrative with images and texts before gameplay
 * Transition: Image 1 (happiness) -> Image 2 (monotony) -> Image 3 (routine) -> Image 4 (change) -> Gameplay
 * 
 * CHANGES:
 * - Removed automatic advance (no more 3-second timer)
 * - Player MUST press SPACE to advance
 * - All text translated to English
 */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Slide {
  imagePath: string;
  texto: string;
  // duracao removed - no automatic advance
}

interface IntroNarrativaProps {
  onComplete: () => void; // Callback when intro finishes
}

export function IntroNarrativa({ onComplete }: IntroNarrativaProps) {
  const [slideAtual, setSlideAtual] = useState(0);
  const [fadeState, setFadeState] = useState<'in' | 'visible' | 'out'>('in');
  const [podeAvancar, setPodeAvancar] = useState(false);

  // Define narrative slides (IN ENGLISH)
  const slides: Slide[] = [
    {
      imagePath: "/intro/parte1.png",
      texto: "Back then, everything was simpler, easier",
    },
    {
      imagePath: "/intro/parte2.png", 
      texto: "What happened?",
    },
    {
      imagePath: "/intro/parte3.png",
      texto: "Every day is the same",
    },
    {
      imagePath: "/intro/parte4.png",
      texto: "...",
    },
  ];

  // Controls initial fade in
  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeState('visible');
      setPodeAvancar(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [slideAtual]);

  // ❌ REMOVED: Automatic advance after duration
  // Now player MUST press SPACE to continue

  // Listener for SPACE key
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
        // Next slide
        setSlideAtual(slideAtual + 1);
        setFadeState('in');
      } else {
        // Intro finished
        onComplete();
      }
    }, 800); // Fade out duration
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
      {/* Image */}
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
          alt="Narrative"
          fill
          style={{
            objectFit: 'contain',
            filter: 'grayscale(100%)',
          }}
          priority
        />
      </div>

      {/* Narrative text */}
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

      {/* Progress indicator */}
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

      {/* Arrow to advance (right side) */}
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

      {/* Pulse animation for arrow */}
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

      {/* Key hint (discrete in corner) */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '14px',
          fontFamily: 'monospace',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: '8px 16px',
          borderRadius: '4px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        Press SPACE to continue
      </div>
    </div>
  );
}