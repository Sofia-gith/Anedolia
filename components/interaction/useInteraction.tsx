/**
 * useInteraction - Hook para Sistema de Interação com Objetos + ZOOM FRONTAL
 *
 * Gerencia o estado global de interações no jogo:
 * - Qual objeto está próximo do jogador
 * - Se o jogador pode interagir
 * - Callbacks de interação
 * - NOVO: Calcula posição da câmera de FRENTE para o objeto
 *
 * Uso:
 * - Componentes InteractableObject registram-se aqui
 * - Player verifica se há objeto próximo e executa ação
 * - UI exibe prompt baseado no estado
 */
"use client";

import { create } from "zustand";

/**
 * Interface do objeto interativo
 */
interface InteractableObject {
  id: string; // Identificador único do objeto
  name: string; // Nome para exibir na UI ("Cafeteira", "Porta", etc)
  distance: number; // Distância atual do jogador
  position: [number, number, number]; // Posição 3D do objeto
  onInteract: () => void; // Função a executar quando interagir
}

/**
 * Estado de zoom da câmera
 */
interface ZoomState {
  isZooming: boolean; // Se está fazendo zoom
  targetPosition: [number, number, number] | null; // Posição alvo do zoom
  targetLookAt: [number, number, number] | null; // Para onde olhar (centro do objeto)
  duration: number; // Duração da animação em ms
  playerPosition: [number, number, number] | null; // Posição do jogador ao iniciar zoom
}

/**
 * Estado global de interações
 */
interface InteractionState {
  // Objeto mais próximo que pode ser interagido
  nearestObject: InteractableObject | null;

  // Estado do zoom
  zoomState: ZoomState;

  // Registra um objeto como disponível para interação
  setNearestObject: (obj: InteractableObject | null) => void;

  // Executa a interação com o objeto mais próximo
  interact: (playerPosition: [number, number, number]) => void;

  // Inicia o zoom para um objeto
  startZoom: (
    targetPosition: [number, number, number],
    targetLookAt: [number, number, number],
    playerPosition: [number, number, number],
    duration?: number
  ) => void;

  // Finaliza o zoom e volta à posição original
  endZoom: () => void;
}

/**
 * Store Zustand para gerenciar interações
 * Acessível de qualquer componente
 */
export const useInteraction = create<InteractionState>((set, get) => ({
  nearestObject: null,

  zoomState: {
    isZooming: false,
    targetPosition: null,
    targetLookAt: null,
    playerPosition: null,
    duration: 1000,
  },

  setNearestObject: (obj) => set({ nearestObject: obj }),

  interact: (playerPosition) => {
    const { nearestObject } = get();
    if (nearestObject) {
      // Executa callback de interação
      nearestObject.onInteract();

      // === CÁLCULO DA POSIÇÃO FRONTAL AO OBJETO ===
      const objectPos = nearestObject.position;
      
      // Calcula o vetor da posição do jogador para o objeto
      const directionToObject = [
        objectPos[0] - playerPosition[0],
        objectPos[1] - playerPosition[1],
        objectPos[2] - playerPosition[2],
      ];

      // Normaliza o vetor (comprimento = 1)
      const length = Math.sqrt(
        directionToObject[0] ** 2 +
        directionToObject[1] ** 2 +
        directionToObject[2] ** 2
      );

      const normalizedDirection = [
        directionToObject[0] / length,
        directionToObject[1] / length,
        directionToObject[2] / length,
      ];

      // Distância do zoom (o quão perto a câmera fica do objeto)
      const zoomDistance = 1.2;

      // Posição da câmera: na direção oposta de onde o jogador veio
      // Isso garante que a câmera fique DE FRENTE para o objeto
      const cameraOffset: [number, number, number] = [
        objectPos[0] - normalizedDirection[0] * zoomDistance,  // Oposto X
        objectPos[1] + 0.2,                                     // Altura ajustada
        objectPos[2] - normalizedDirection[2] * zoomDistance,  // Oposto Z
      ];

      // O targetLookAt é exatamente a posição do objeto
      // Isso faz a câmera olhar diretamente para o centro do objeto
      get().startZoom(cameraOffset, objectPos, playerPosition, 800);

      // Volta ao normal após 2.5 segundos
      setTimeout(() => {
        get().endZoom();
      }, 2500);
    }
  },

  startZoom: (targetPosition, targetLookAt, playerPosition, duration = 1000) => {
    set({
      zoomState: {
        isZooming: true,
        targetPosition,
        targetLookAt,
        playerPosition,
        duration,
      },
    });
  },

  endZoom: () => {
    set({
      zoomState: {
        isZooming: false,
        targetPosition: null,
        targetLookAt: null,
        playerPosition: null,
        duration: 1000,
      },
    });
  },
}));