/**
 * CameraZoom - Componente para Animação de Zoom da Câmera
 * 
 * Gerencia o zoom suave da câmera ao interagir com objetos.
 * Funciona salvando a posição original do jogador e interpolando
 * suavemente entre a posição atual e a posição do zoom.
 * 
 * Uso: Adicione dentro do Canvas no page.tsx
 */
"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { useInteraction } from "./interaction/useInteraction";

export function CameraZoom() {
  const { camera } = useThree();
  
  // Posição original da câmera (do jogador)
  const originalPosition = useRef(new Vector3());
  const targetPosition = useRef(new Vector3());
  const targetLookAt = useRef(new Vector3());
  
  // Controle de animação
  const isAnimating = useRef(false);
  const animationProgress = useRef(0);
  const isZoomingIn = useRef(false);
  
  // Estado do zoom
  const zoomState = useInteraction((state) => state.zoomState);

  // Detecta quando inicia ou termina o zoom
  useEffect(() => {
    if (zoomState.isZooming && !isAnimating.current) {
      // Inicia zoom
      originalPosition.current.copy(camera.position);
      if (zoomState.targetPosition) {
        targetPosition.current.set(...zoomState.targetPosition);
      }
      if (zoomState.targetLookAt) {
        targetLookAt.current.set(...zoomState.targetLookAt);
      }
      isAnimating.current = true;
      isZoomingIn.current = true;
      animationProgress.current = 0;
    } else if (!zoomState.isZooming && isAnimating.current && isZoomingIn.current) {
      // Inicia zoom out (volta ao normal)
      targetPosition.current.copy(originalPosition.current);
      isZoomingIn.current = false;
      animationProgress.current = 0;
    }
  }, [zoomState.isZooming, camera]);

  // Anima a câmera a cada frame
  useFrame((state, delta) => {
    if (!isAnimating.current) return;

    // Velocidade da animação (mais rápido = maior valor)
    const speed = isZoomingIn.current ? 3 : 4; // Zoom out mais rápido
    animationProgress.current += delta * speed;

    if (animationProgress.current >= 1) {
      // Animação completa
      animationProgress.current = 1;
      if (!isZoomingIn.current) {
        isAnimating.current = false;
      }
    }

    // Função de easing suave (ease-in-out)
    const easeInOutCubic = (t: number) => {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const progress = easeInOutCubic(animationProgress.current);

    // Interpola posição da câmera
    const startPos = isZoomingIn.current 
      ? originalPosition.current 
      : camera.position.clone();
    
    camera.position.lerpVectors(startPos, targetPosition.current, progress);

    // Faz a câmera olhar para o objeto (apenas no zoom in)
    if (isZoomingIn.current && zoomState.targetLookAt) {
      camera.lookAt(targetLookAt.current);
    }
  });

  return null; // Componente invisível
}