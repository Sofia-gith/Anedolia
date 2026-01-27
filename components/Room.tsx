"use client";
import { OrbitControls, Sky } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import Wall from "./Wall";
import Floor from "./Floor";
import Bed from "./Bed";

export default function Bedroom() {
  return (
    <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
      <Physics debug>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <group>
          <Floor
            position={[0, -0.5, 0]}
            args={[10, 1, 10]}
            color="lightgray"
            receiveShadow
          />

          <Bed />

          <Wall position={[0, 2, -5]} args={[10, 5, 1]} color="white" />

          <Wall position={[5, 2, 0]} args={[1, 5, 11]} color="white" />
        </group>
      </Physics>

      <Sky sunPosition={[100, 20, 100]} />
      <OrbitControls />
    </Canvas>
  );
}
