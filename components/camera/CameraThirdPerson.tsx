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
 * - Raycast contra paredes: se a posição ideal está atrás de uma parede,
 *   a câmera é puxada para frente do obstáculo (evita clipping)
 * - Lerp suave (delta-time independent) para seguir sem sacudir
 * - Durante zoom (interação) a câmera para — quem controla é o CameraZoom
 */
"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useRapier, interactionGroups } from "@react-three/rapier";
import * as THREE from "three";
import { useInteraction } from "../interaction/useInteraction";

// Collision-group mask: camera ray tests only against group 0 (environment)
const CAMERA_RAY_GROUPS = interactionGroups([0], [0]);

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
  /** Margem mínima antes da parede (evita clipping no near plane) */
  wallOffset?: number;
}

export function CameraThirdPerson({
  targetPosition,
  distance = 1.8,
  lookAtHeight = 0.8,
  positionSmoothing = 8,
  lookAtSmoothing = 12,
  rotationSpeed = 0.002,
  wallOffset = 0.25,
}: CameraThirdPersonProps) {
  const { camera, gl } = useThree();
  const { world, rapier } = useRapier();

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
  const _rayDir = useRef(new THREE.Vector3());

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

    // === RAYCAST ANTI-CLIPPING ===
    // Lança raio do personagem até a posição ideal da câmera.
    // Se bater numa parede, puxa a câmera para frente do obstáculo.
    const rayDir = _rayDir.current.copy(idealPos).sub(idealLook);
    const maxDist = rayDir.length();
    if (maxDist > 0.01) {
      rayDir.divideScalar(maxDist); // normaliza
      const ray = new rapier.Ray(
        { x: idealLook.x, y: idealLook.y, z: idealLook.z },
        { x: rayDir.x, y: rayDir.y, z: rayDir.z },
      );
      const hit = world.castRay(
        ray,
        maxDist,
        true,
        undefined,
        CAMERA_RAY_GROUPS,
      );
      if (hit !== null) {
        const hitDist = hit.timeOfImpact;
        // Puxa para antes da parede, respeitando wallOffset
        const clampedDist = Math.max(hitDist - wallOffset, 0.1);
        if (clampedDist < maxDist) {
          idealPos.copy(idealLook).addScaledVector(rayDir, clampedDist);
        }
      }
    }

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
