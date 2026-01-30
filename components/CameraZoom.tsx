/**
 * CameraZoom - Componente para Animação de Zoom da Câmera
 * 
 * Gerencia o zoom suave da câmera ao interagir com objetos
 * 
 * Uso: Adicione dentro do Canvas no page.tsx
 */
"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3, Quaternion } from "three";
import { useInteraction } from "./interaction/useInteraction";

export function CameraZoom() {
  const { camera } = useThree();
  
  // Posição e rotação originais da câmera
  const originalPosition = useRef(new Vector3());
  const originalRotation = useRef(new Quaternion());
  
  // Posição e rotação alvo
  const targetPosition = useRef(new Vector3());
  const targetRotation = useRef(new Quaternion());
  const lookAtTarget = useRef(new Vector3());
  
  // Controle de animação
  const isAnimating = useRef(false);
  const animationProgress = useRef(0);
  const isZoomingIn = useRef(false);
  
  // Estado do zoom
  const zoomState = useInteraction((state) => state.zoomState);

  // Detecta quando inicia ou termina o zoom
  useEffect(() => {
    if (zoomState.isZooming && !isAnimating.current) {
      // === INICIA ZOOM ===
      // Salva posição e rotação atuais
      originalPosition.current.copy(camera.position);
      originalRotation.current.copy(camera.quaternion);
      
      // Define alvo do zoom
      if (zoomState.targetPosition) {
        targetPosition.current.set(...zoomState.targetPosition);
      }
      if (zoomState.targetLookAt) {
        lookAtTarget.current.set(...zoomState.targetLookAt);
        
        // Calcula a rotação necessária para olhar para o objeto
        const tempCam = camera.clone();
        tempCam.position.copy(targetPosition.current);
        tempCam.lookAt(lookAtTarget.current);
        targetRotation.current.copy(tempCam.quaternion);
      }
      
      isAnimating.current = true;
      isZoomingIn.current = true;
      animationProgress.current = 0;
      
    } else if (!zoomState.isZooming && isAnimating.current && isZoomingIn.current) {
      // === INICIA ZOOM OUT ===
      // O alvo agora é a posição original
      targetPosition.current.copy(originalPosition.current);
      targetRotation.current.copy(originalRotation.current);
      
      isZoomingIn.current = false;
      animationProgress.current = 0;
    }
  }, [zoomState.isZooming, camera]);

  // Anima a câmera a cada frame
  useFrame((state, delta) => {
    if (!isAnimating.current) return;

    // Velocidade da animação
    const speed = isZoomingIn.current ? 3.5 : 4.5; // Zoom out mais rápido
    animationProgress.current += delta * speed;

    if (animationProgress.current >= 1) {
      // Animação completa
      animationProgress.current = 1;
      if (!isZoomingIn.current) {
        // Finaliza zoom out
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

    // === INTERPOLA POSIÇÃO ===
    const startPos = isZoomingIn.current 
      ? originalPosition.current 
      : camera.position.clone();
    
    camera.position.lerpVectors(startPos, targetPosition.current, progress);

    // === INTERPOLA ROTAÇÃO (para centralizar objeto) ===
    const startRot = isZoomingIn.current
      ? originalRotation.current
      : camera.quaternion.clone();
    
    camera.quaternion.slerpQuaternions(startRot, targetRotation.current, progress);
    
    // Durante o zoom in, força a câmera a olhar para o objeto
    // Isso garante que o objeto fique perfeitamente centralizado
    if (isZoomingIn.current && progress > 0.1) {
      camera.lookAt(lookAtTarget.current);
    }
  });

  return null; // Componente invisível
}