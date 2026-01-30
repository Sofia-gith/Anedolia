"use client";
import { RigidBody } from "@react-three/rapier";

interface WallProps {
  position: [number, number, number];
  args: [number, number, number];
  color: string;
}

export default function Wall({ position, args, color }: WallProps) {
  return (
    <RigidBody type="fixed">
      <mesh position={position}>
        <boxGeometry args={args} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  );
}
