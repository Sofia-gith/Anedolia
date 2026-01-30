/**
 * useInteraction - Hook para Sistema de Interação com Objetos + ZOOM
 *
 * Gerencia o estado global de interações no jogo:
 * - Qual objeto está próximo do jogador
 * - Se o jogador pode interagir
 * - Callbacks de interação
 * - Sistema de zoom na câmera ao interagir (NOVO!)
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
  position: [number, number, number]; // Posição 3D do objeto (NOVO!)
  onInteract: () => void; // Função a executar quando interagir
}

/**
 * Estado de zoom da câmera (NOVO!)
 */
interface ZoomState {
  isZooming: boolean; // Se está fazendo zoom
  targetPosition: [number, number, number] | null; // Posição alvo do zoom
  targetLookAt: [number, number, number] | null; // Para onde olhar
  duration: number; // Duração da animação em ms
}

/**
 * Estado global de interações
 */
interface InteractionState {
  // Objeto mais próximo que pode ser interagido
  nearestObject: InteractableObject | null;

  // Estado do zoom (NOVO!)
  zoomState: ZoomState;

  // Registra um objeto como disponível para interação
  setNearestObject: (obj: InteractableObject | null) => void;

  // Executa a interação com o objeto mais próximo
  interact: () => void;

  // Inicia o zoom para um objeto (NOVO!)
  startZoom: (
    targetPosition: [number, number, number],
    targetLookAt: [number, number, number],
    duration?: number
  ) => void;

  // Finaliza o zoom e volta à posição original (NOVO!)
  endZoom: () => void;
}

/**
 * Store Zustand para gerenciar interações
 * Acessível de qualquer componente
 */
export const useInteraction = create<InteractionState>((set, get) => ({
  nearestObject: null,

  // Estado inicial do zoom (NOVO!)
  zoomState: {
    isZooming: false,
    targetPosition: null,
    targetLookAt: null,
    duration: 1000,
  },

  setNearestObject: (obj) => set({ nearestObject: obj }),

  interact: () => {
    const { nearestObject } = get();
    if (nearestObject) {
      // Executa callback de interação
      nearestObject.onInteract();

      // Inicia zoom para o objeto (NOVO!)
      const objectPos = nearestObject.position;
      // Calcula posição da câmera (um pouco atrás e acima do objeto)
      const cameraOffset: [number, number, number] = [
        objectPos[0],
        objectPos[1] + 0.3,
        objectPos[2] + 1.5,
      ];

      get().startZoom(cameraOffset, objectPos, 800);

      // Volta ao normal após 2 segundos
      setTimeout(() => {
        get().endZoom();
      }, 2000);
    }
  },

  // Função para iniciar zoom (NOVO!)
  startZoom: (targetPosition, targetLookAt, duration = 1000) => {
    set({
      zoomState: {
        isZooming: true,
        targetPosition,
        targetLookAt,
        duration,
      },
    });
  },

  // Função para finalizar zoom (NOVO!)
  endZoom: () => {
    set({
      zoomState: {
        isZooming: false,
        targetPosition: null,
        targetLookAt: null,
        duration: 1000,
      },
    });
  },
}));