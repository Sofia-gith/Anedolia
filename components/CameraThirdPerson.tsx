/**
 * CameraThirdPerson - Câmera Over-the-Shoulder
 *
 * Câmera bem próxima, atrás e ligeiramente acima do personagem.
 * Pensada para espaços fechados (apartamento).
 *
 * Como funciona:
 * - yaw / pitch são ângulos controlados pelo mouse
 * - A cada frame calcula a posição ideal usando coordenadas esféricas
 *   ao redor do personagem
 * - Lerp suave (delta-time independent) para seguir sem sacudir
 * - Durante zoom (interação) a câmera para — quem controla é o CameraZoom
 */
"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useInteraction } from "./interaction/useInteraction";

interface CameraThirdPersonProps {
  targetPosition: THREE.Vector3;
  /** Distância da câmera ao personagem */
  distance?: number;
  /** Altura do ponto que a câmera mira no personagem (peito/cabeça) */
  lookAtHeight?: number;
  /** Fator de suavidade para posição (maior = mais responsivo) */
  positionSmoothing?: number;
  /** Fator de suavidade para lookAt (maior = mais responsivo) */
  lookAtSmoothing?: number;
  /** Velocidade de rotação do mouse */
  rotationSpeed?: number;
}

export function CameraThirdPerson({
  targetPosition,
  distance = 1.8,
  lookAtHeight = 0.8,
  positionSmoothing = 8,
  lookAtSmoothing = 12,
  rotationSpeed = 0.002,
}: CameraThirdPersonProps) {
  const { camera, gl } = useThree();

  // Ângulos de órbita ao redor do personagem
  const yaw = useRef(0);
  const pitch = useRef(0.3);

  // Posições suavizadas (usadas para lerp entre frames)
  const smoothPos = useRef(new THREE.Vector3());
  const smoothLook = useRef(new THREE.Vector3());
  const initialized = useRef(false);

  // Vetores reutilizáveis (evita alocação por frame)
  const _idealPos = useRef(new THREE.Vector3());
  const _idealLook = useRef(new THREE.Vector3());

  // Não controla durante zoom de interação
  const zoomState = useInteraction((state) => state.zoomState);

  // ---------- pointer lock + rotação ----------
  useEffect(() => {
    const canvas = gl.domElement;
    let locked = false;

    const onMove = (e: MouseEvent) => {
      if (!locked) return;
      yaw.current -= e.movementX * rotationSpeed;

      pitch.current -= e.movementY * rotationSpeed;
      // limita entre -40° e +55°
      pitch.current = Math.max(-0.7, Math.min(0.95, pitch.current));
    };

    const onLockChange = () => {
      locked = document.pointerLockElement === canvas;
    };

    const onClick = () => canvas.requestPointerLock();

    canvas.addEventListener("click", onClick);
    document.addEventListener("pointerlockchange", onLockChange);
    document.addEventListener("mousemove", onMove);

    return () => {
      canvas.removeEventListener("click", onClick);
      document.removeEventListener("pointerlockchange", onLockChange);
      document.removeEventListener("mousemove", onMove);
    };
  }, [gl, rotationSpeed]);

  // ---------- atualiza câmera todo frame ----------
  useFrame((_, delta) => {
    // durante zoom quem manda é o CameraZoom
    if (zoomState.isZooming) return;

    // Clamp delta para evitar saltos (ex: aba inativa)
    const dt = Math.min(delta, 0.1);

    // === posição ideal em coordenadas esféricas ===
    const cosP = Math.cos(pitch.current);
    const sinP = Math.sin(pitch.current);
    const sinY = Math.sin(yaw.current);
    const cosY = Math.cos(yaw.current);

    const idealPos = _idealPos.current.set(
      targetPosition.x + distance * sinY * cosP,
      targetPosition.y + lookAtHeight + distance * sinP,
      targetPosition.z + distance * cosY * cosP,
    );

    // ponto que a câmera mira (peito do personagem)
    const idealLook = _idealLook.current.set(
      targetPosition.x,
      targetPosition.y + lookAtHeight,
      targetPosition.z,
    );

    // === inicializa no primeiro frame ===
    if (!initialized.current) {
      smoothPos.current.copy(idealPos);
      smoothLook.current.copy(idealLook);
      initialized.current = true;
    }

    // === lerp suave (delta-time independent) ===
    const posT = 1 - Math.exp(-positionSmoothing * dt);
    const lookT = 1 - Math.exp(-lookAtSmoothing * dt);

    smoothPos.current.lerp(idealPos, posT);
    smoothLook.current.lerp(idealLook, lookT);

    camera.position.copy(smoothPos.current);
    camera.lookAt(smoothLook.current);
  });

  return null;
}
