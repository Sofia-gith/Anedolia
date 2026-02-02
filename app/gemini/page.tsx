"use client";
import dynamic from "next/dynamic";
import GenGemini from "@/components/GenGemini";

// Importa o Canvas apenas no cliente, não no servidor
const Canvas = dynamic(
  () => import("@react-three/fiber").then((mod) => mod.Canvas),
  { 
    ssr: false,
    loading: () => <div>Carregando Canvas 3D...</div>
  }
);

export default function TestePage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Teste Gemini</h1>
      <GenGemini>
        <div style={{ width: "100%", height: "500px" }}>
          <Canvas>
            <ambientLight intensity={0.5} />
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="orange" />
            </mesh>
          </Canvas>
        </div>
      </GenGemini>
    </div>
  );
}