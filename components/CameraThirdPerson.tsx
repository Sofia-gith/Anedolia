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
 * - Lerp suave para seguir sem sacudir
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
  /** Suavidade do lerp (0.05 = muito suave, 0.15 = mais firme) */
  smoothness?: number;
  /** Velocidade de rotação do mouse */
  rotationSpeed?: number;
}

export function CameraThirdPerson({
  targetPosition,
  distance = 1.8,        // curto — fica dentro da casa
  lookAtHeight = 0.8,    // mira no peito do personagem
  smoothness = 0.1,
  rotationSpeed = 0.002,
}: CameraThirdPersonProps) {
  const { camera, gl } = useThree();

  // Ângulos de órbita ao redor do personagem
  const yaw = useRef(0);       // horizontal (mouse X)
  const pitch = useRef(0.3);   // vertical   (mouse Y) — começa um pouco acima

  // Posições suavizadas (usadas para lerp entre frames)
  const smoothPos = useRef(new THREE.Vector3());
  const smoothLook = useRef(new THREE.Vector3());
  const initialized = useRef(false);

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
  useFrame(() => {
    // durante zoom quem manda é o CameraZoom
    if (zoomState.isZooming) return;

    // === posição ideal em coordenadas esféricas ===
    const cosP = Math.cos(pitch.current);
    const sinP = Math.sin(pitch.current);
    const sinY = Math.sin(yaw.current);
    const cosY = Math.cos(yaw.current);

    const idealX = targetPosition.x + distance * sinY * cosP;
    const idealY = targetPosition.y + lookAtHeight + distance * sinP;
    const idealZ = targetPosition.z + distance * cosY * cosP;

    const idealPos = new THREE.Vector3(idealX, idealY, idealZ);

    // ponto que a câmera mira (peito do personagem)
    const idealLook = new THREE.Vector3(
      targetPosition.x,
      targetPosition.y + lookAtHeight,
      targetPosition.z
    );

    // === inicializa no primeiro frame ===
    if (!initialized.current) {
      smoothPos.current.copy(idealPos);
      smoothLook.current.copy(idealLook);
      initialized.current = true;
    }

    // === lerp suave ===
    smoothPos.current.lerp(idealPos, smoothness);
    smoothLook.current.lerp(idealLook, smoothness);

    camera.position.copy(smoothPos.current);
    camera.lookAt(smoothLook.current);
  });

  return null;
}