"use client";
import { Model as Apartamento } from "@/components/Apartamento";
import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

export default function Teste() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#111" }}>
      <Canvas camera={{ position: [10, 10, 10], fov: 50}}>
        <Suspense fallback={null}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[20, 10, 5]} intensity={1} />
          <Environment preset="city" />

          <Apartamento />
          
          <OrbitControls />
        </Suspense>
      </Canvas>
    </div>
  );
}
