/**
 * useInteraction - Hook para Sistema de Interação com Objetos
 *
 * Gerencia o estado global de interações no jogo:
 * - Qual objeto está próximo do jogador
 * - Se o jogador pode interagir
 * - Callbacks de interação
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
  onInteract: () => void; // Função a executar quando interagir
}

/**
 * Estado global de interações
 */
interface InteractionState {
  // Objeto mais próximo que pode ser interagido
  nearestObject: InteractableObject | null;

  // Registra um objeto como disponível para interação
  setNearestObject: (obj: InteractableObject | null) => void;

  // Executa a interação com o objeto mais próximo
  interact: () => void;
}

/**
 * Store Zustand para gerenciar interações
 * Acessível de qualquer componente
 */
export const useInteraction = create<InteractionState>((set, get) => ({
  nearestObject: null,

  setNearestObject: (obj) => set({ nearestObject: obj }),

  interact: () => {
    const { nearestObject } = get();
    if (nearestObject) {
      nearestObject.onInteract();
    }
  },
}));