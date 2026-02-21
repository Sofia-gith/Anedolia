/**
 * CameraPositionHelper - Ferramenta para ajustar posições visualmente
 * 
 * Use este componente temporariamente para encontrar as posições ideais
 * Controles:
 * - Setas: Move a câmera
 * - Q/E: Move para cima/baixo
 * - 1-9: Posições preset
 */
"use client";

import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";

interface Position {
  x: number;
  y: number;
  z: number;
}

export function CameraPositionHelper() {
  const { camera } = useThree();
  const [cameraPos, setCameraPos] = useState<Position>({
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
  });

  useEffect(() => {
    const step = 0.5; // Tamanho do passo

    const handleKeyDown = (e: KeyboardEvent) => {
      const newPos = { ...cameraPos };

      switch (e.key) {
        // Movimento horizontal
        case "ArrowLeft":
          newPos.x -= step;
          break;
        case "ArrowRight":
          newPos.x += step;
          break;
        case "ArrowUp":
          newPos.z -= step;
          break;
        case "ArrowDown":
          newPos.z += step;
          break;
        
        // Movimento vertical
        case "q":
        case "Q":
          newPos.y += step;
          break;
        case "e":
        case "E":
          newPos.y -= step;
          break;

        // Presets úteis
        case "1": // Vista frontal do quarto
          newPos.x = 1.0;
          newPos.y = 1.6;
          newPos.z = -3.0;
          break;
        case "2": // Vista lateral direita
          newPos.x = 5.0;
          newPos.y = 1.6;
          newPos.z = -4.0;
          break;
        case "3": // Vista diagonal
          newPos.x = 2.0;
          newPos.y = 1.8;
          newPos.z = -2.0;
          break;
        case "4": // Vista de cima
          newPos.x = 3.5;
          newPos.y = 4.0;
          newPos.z = -4.0;
          break;
        
        default:
          return;
      }

      setCameraPos(newPos);
      camera.position.set(newPos.x, newPos.y, newPos.z);
      
      // Sempre olha para a cama
      camera.lookAt(3.5, 1.2, -4.0);
      
      // Log para copiar valores
      console.log(`Câmera: [${newPos.x.toFixed(1)}, ${newPos.y.toFixed(1)}, ${newPos.z.toFixed(1)}]`);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [camera, cameraPos]);

  return null;
}

/**
 * COMO USAR:
 * 
 * 1. Adicione no Scene temporariamente:
 *    <CameraPositionHelper />
 * 
 * 2. Use as teclas:
 *    - Setas: Move horizontal
 *    - Q/E: Sobe/desce
 *    - 1-4: Posições preset
 * 
 * 3. Quando encontrar a posição ideal:
 *    - Veja o console para os valores exatos
 *    - Copie para WAKEUP_CAMERA_POSITION
 * 
 * 4. Remova este componente depois
 */