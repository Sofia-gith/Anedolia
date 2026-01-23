"use client";
import { OrbitControls, Sky } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { RigidBody, CuboidCollider, Physics } from "@react-three/rapier";

export default function Bedroom() {
  return (
    <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
      <Physics debug>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <group>
          {/* CHÃO */}
          <RigidBody type="fixed">
            <mesh receiveShadow position={[0, -0.5, 0]}>
              <boxGeometry args={[10, 1, 10]} />
              <meshStandardMaterial color="lightgray" />
            </mesh>
          </RigidBody>

          {/* PAREDE */}
          <RigidBody type="fixed">
            <mesh position={[0, 2, -5]}>
              <boxGeometry args={[10, 5, 1]} />
              <meshStandardMaterial color="white" />
            </mesh>
          </RigidBody>
        </group>
      </Physics>

        <Sky sunPosition={[100, 20, 100]} />
        <OrbitControls />





    </Canvas>
  );
}
