import GenGemini from "@/components/GenGemini";
import { Canvas } from "@react-three/fiber";
import { Model } from "@/components/Apartamento";

export default function TestePage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Teste Gemini</h1>
      <GenGemini>
        <Canvas>
          {/* componente do apartamento -> dentro dele envolver os objetos */}
        </Canvas>
      </GenGemini>
    </div>
  );
}
