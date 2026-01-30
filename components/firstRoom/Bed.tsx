"use client";
import { RigidBody } from "@react-three/rapier";

export default function Bed() {
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <mesh position={[0, 0.5, -2]}>
        <boxGeometry args={[2, 1, 4]} />
        <meshStandardMaterial color="brown" />
      </mesh>
    </RigidBody>
  );
}
