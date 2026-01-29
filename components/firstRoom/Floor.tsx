"use client";
import { RigidBody } from "@react-three/rapier";

interface FloorProps {
  position: [number, number, number];
  args: [number, number, number];
  color: string;
  receiveShadow?: boolean;
}

export default function Floor({
  position,
  args,
  color,
  receiveShadow = false,
}: FloorProps) {
  return (
    <RigidBody type="fixed">
      <mesh receiveShadow={receiveShadow} position={position}>
        <boxGeometry args={args} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  );
}
