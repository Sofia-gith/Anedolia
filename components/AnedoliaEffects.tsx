/**
 * AnedoliaEffects - Sistema de Pós-Processamento Visual
 *
 * Este componente aplica efeitos visuais na cena inteira para criar
 * a atmosfera de "anedonia" - um mundo sem vida, dessaturado e sombrio.
 *
 * Principais efeitos:
 * - Dessaturação: Remove cores, deixando em tons de cinza
 * - Vinheta: Escurece as bordas da tela
 * - Brilho/Contraste: Ajusta a intensidade visual
 *
 * Props:
 * - colorProgress: 0 = totalmente cinza, 1 = cores completas
 *
 * Uso futuro: Ao interagir com objetos, aumentar colorProgress
 * para restaurar cores gradualmente.
 */
"use client";

import {
  EffectComposer,
  HueSaturation,
  Vignette,
  BrightnessContrast,
} from "@react-three/postprocessing";

interface AnedoliaEffectsProps {
  /**
   * Progresso de restauração de cor (0 a 1)
   * - 0: Mundo completamente cinza (anedonia total)
   * - 0.5: Parcialmente colorido (50% das cores)
   * - 1: Cores totalmente restauradas (cura completa)
   */
  colorProgress?: number;

  /**
   * Intensidade da vinheta (escurecimento das bordas)
   * - 0: Sem vinheta
   * - 0.5: Vinheta moderada (padrão)
   * - 1: Vinheta intensa
   */
  vignetteIntensity?: number;

  /**
   * Ajuste de brilho (-1 a 1)
   * - Valores negativos: mais escuro
   * - 0: normal
   * - Valores positivos: mais claro
   */
  brightness?: number;

  /**
   * Ajuste de contraste (-1 a 1)
   * - Valores negativos: menos contraste
   * - 0: normal
   * - Valores positivos: mais contraste
   */
  contrast?: number;
}

export function AnedoliaEffects({
  colorProgress = 0, // Começa totalmente cinza
  vignetteIntensity = 0.4, // Vinheta moderada
  brightness = -0.1, // Levemente mais escuro
  contrast = 0.1, // Leve aumento de contraste
}: AnedoliaEffectsProps) {
  /**
   * Calcula a saturação baseada no progresso
   * - saturação -1 = completamente dessaturado (cinza)
   * - saturação 0 = cores normais
   *
   * Fórmula: lerp de -1 (cinza) para 0 (colorido) baseado no progresso
   */
  const saturation = -1 + colorProgress; // -1 quando progress=0, 0 quando progress=1

  /**
   * A vinheta diminui conforme as cores voltam
   * Isso simboliza a "abertura" da visão do personagem
   */
  const vignetteOffset = 0.3 + colorProgress * 0.2; // Expande com progresso
  const vignetteDarkness = vignetteIntensity * (1 - colorProgress * 0.5); // Clareia com progresso

  return (
    <EffectComposer>
      {/* 
        HueSaturation: Controla a saturação das cores
        - hue: rotação de matiz (não usamos)
        - saturation: -1 (cinza) a 0 (normal) a 1 (super saturado)
      */}
      <HueSaturation hue={0} saturation={saturation} />

      {/* 
        Vignette: Escurece as bordas da tela
        - offset: distância do centro onde começa o escurecimento
        - darkness: intensidade do escurecimento
        
        Cria sensação de visão "fechada", como túnel
      */}
      <Vignette offset={vignetteOffset} darkness={vignetteDarkness} />

      {/* 
        BrightnessContrast: Ajusta luminosidade e contraste
        - brightness: -1 (preto) a 0 (normal) a 1 (branco)
        - contrast: -1 (sem contraste) a 0 (normal) a 1 (alto contraste)
      */}
      <BrightnessContrast brightness={brightness} contrast={contrast} />
    </EffectComposer>
  );
}
