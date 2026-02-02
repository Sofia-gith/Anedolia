"use client";
import { ThreeEvent } from "@react-three/fiber";
import { useGeminiText } from "./GenGemini";

/**
 * Componente wrapper para objetos 3D que disparam textos do Gemini ao serem clicados
 *
 * Uso:
 * <InteractiveObject objeto="café">
 *   <mesh>...</mesh>
 * </InteractiveObject>
 */
export function InteractiveObject({
  objeto,
  children,
  onInteract,
}: {
  objeto: string;
  children: React.ReactNode;
  onInteract?: (texto: string) => void;
}) {
  const texto = useGeminiText(objeto);

  const handleClick = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (onInteract) {
      onInteract(texto);
    }
    // Dispara evento customizado para a UI externa
    window.dispatchEvent(
      new CustomEvent("showGeminiText", {
        detail: { objeto, texto },
      }),
    );
    console.log(`Interagiu com ${objeto}:`, texto);
  };

  return (
    <group
      onClick={handleClick}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
      }}
    >
      {children}
    </group>
  );
}
