/**
 * CameraThirdPerson - Câmera em Terceira Pessoa
 * 
 * Segue o jogador suavemente mantendo uma distância fixa.
 * Permite rotação com o mouse (horizontal e vertical).
 * 
 * Características:
 * - Segue o player com interpolação suave (lerp)
 * - Rotação horizontal (yaw) e vertical (pitch)
 * - Limites de rotação vertical para evitar inversão
 */
"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface CameraThirdPersonProps {
  targetPosition: THREE.Vector3; // Posição do jogador
  distance?: number;
  height?: number;
  smoothness?: number;
  rotationSpeed?: number;
}

export function CameraThirdPerson({
  targetPosition,
  distance = 5,
  height = 2,
  smoothness = 0.1,
  rotationSpeed = 0.002,
}: CameraThirdPersonProps) {
  const { camera, gl } = useThree();
  
  // Ângulos de rotação
  const theta = useRef(0); // Rotação horizontal (yaw)
  const phi = useRef(0.3); // Rotação vertical (pitch)
  
  // Posição ideal da câmera
  const idealPosition = useRef(new THREE.Vector3());
  const idealLookAt = useRef(new THREE.Vector3());

  // Controle de mouse
  useEffect(() => {
    const canvas = gl.domElement;
    let isLocked = false;

    const onMouseMove = (event: MouseEvent) => {
      if (!isLocked) return;

      // Atualiza ângulos baseado no movimento do mouse
      theta.current -= event.movementX * rotationSpeed;
      phi.current -= event.movementY * rotationSpeed;

      // Limita rotação vertical (evita virar de cabeça para baixo)
      const minPhi = -Math.PI / 3; // -60 graus
      const maxPhi = Math.PI / 3;  // +60 graus
      phi.current = Math.max(minPhi, Math.min(maxPhi, phi.current));
    };

    const onPointerLockChange = () => {
      isLocked = document.pointerLockElement === canvas;
    };

    const onClick = () => {
      canvas.requestPointerLock();
    };

    // Event listeners
    canvas.addEventListener("click", onClick);
    document.addEventListener("pointerlockchange", onPointerLockChange);
    document.addEventListener("mousemove", onMouseMove);

    return () => {
      canvas.removeEventListener("click", onClick);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [gl, rotationSpeed]);

  // Atualiza posição da câmera a cada frame
  useFrame(() => {
    // === CALCULA POSIÇÃO IDEAL DA CÂMERA ===
    // Posição em coordenadas esféricas
    const x = targetPosition.x + distance * Math.sin(theta.current) * Math.cos(phi.current);
    const y = targetPosition.y + height + distance * Math.sin(phi.current);
    const z = targetPosition.z + distance * Math.cos(theta.current) * Math.cos(phi.current);

    idealPosition.current.set(x, y, z);
    idealLookAt.current.copy(targetPosition);
    idealLookAt.current.y += height / 2; // Olha um pouco acima dos pés

    // === INTERPOLAÇÃO SUAVE (LERP) ===
    camera.position.lerp(idealPosition.current, smoothness);
    
    // Atualiza direção do olhar
    const currentLookAt = new THREE.Vector3();
    camera.getWorldDirection(currentLookAt);
    currentLookAt.multiplyScalar(10).add(camera.position);
    currentLookAt.lerp(idealLookAt.current, smoothness);
    
    camera.lookAt(currentLookAt);
  });

  return null; // Componente invisível
}