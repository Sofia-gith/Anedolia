/**
 * InteractableObject - Componente para Objetos Interativos
 *
 * Envolve objetos 3D tornando-os interativos:
 * - Detecta quando o jogador está próximo (distância configurável)
 * - Registra-se no sistema de interação
 * - Executa callback quando jogador pressiona E
 *
 * Props:
 * - id: identificador único
 * - name: nome para exibir na UI
 * - position: posição 3D do objeto
 * - interactionDistance: distância máxima para interagir (padrão: 2)
 * - onInteract: função executada ao interagir
 * - children: mesh/group do objeto 3D
 *
 * Exemplo de uso:
 * <InteractableObject
 *   id="coffeeMachine"
 *   name="Cafeteira"
 *   position={[-1.78, 0.91, 0.899]}
 *   onInteract={() => console.log("Fazendo café!")}
 * >
 *   <mesh>...</mesh>
 * </InteractableObject>
 */
"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { useInteraction } from "./useInteraction";

interface InteractableObjectProps {
  id: string;
  name: string;
  position: [number, number, number];
  interactionDistance?: number;
  onInteract: () => void;
  children: React.ReactNode;
}

export function InteractableObject({
  id,
  name,
  position,
  interactionDistance = 2,
  onInteract,
  children,
}: InteractableObjectProps) {
  // Referência para a posição do objeto no mundo 3D
  const objectPosition = useRef(new Vector3(...position));

  // Acesso à câmera (que representa a posição do jogador)
  const { camera } = useThree();

  // Hook de interação global
  const setNearestObject = useInteraction((state) => state.setNearestObject);

  // Atualiza a cada frame para calcular distância
  useFrame(() => {
    // Calcula distância entre câmera (jogador) e objeto
    const distance = camera.position.distanceTo(objectPosition.current);

    // Se está dentro da distância de interação
    if (distance <= interactionDistance) {
      // Registra como objeto mais próximo
      setNearestObject({
        id,
        name,
        distance,
        onInteract,
      });
    } else {
      // Se este objeto estava registrado, remove
      const current = useInteraction.getState().nearestObject;
      if (current && current.id === id) {
        setNearestObject(null);
      }
    }
  });

  // Cleanup: remove registro quando componente desmonta
  useEffect(() => {
    return () => {
      const current = useInteraction.getState().nearestObject;
      if (current && current.id === id) {
        setNearestObject(null);
      }
    };
  }, [id, setNearestObject]);

  return <group position={position}>{children}</group>;
}
