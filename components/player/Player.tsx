/**
 * Player - First-Person Physics Controller
 *
 * Manages:
 * - Physics capsule body
 * - WASD movement aligned with camera direction
 * - Smooth velocity interpolation
 * - Player position sync → Zustand store (replaces window.__playerPosition)
 * - E key interaction via Zustand store
 */
import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  RigidBody,
  CapsuleCollider,
  RapierRigidBody,
} from "@react-three/rapier";
import { useRef } from "react";
import * as THREE from "three";
import { useInteraction } from "../interaction/useInteraction";

const VELOCITY_LERP_FACTOR = 8;
const STOP_THRESHOLD = 0.01;

export function Player() {
  const rb = useRef<RapierRigidBody>(null);
  const [, getKeys] = useKeyboardControls();

  // Interaction store actions
  const interact = useInteraction((s) => s.interact);
  const setPlayerPosition = useInteraction((s) => s.setPlayerPosition);
  const zoomState = useInteraction((s) => s.zoomState);

  const speed = 5;
  const lastInteractTime = useRef(0);
  const interactCooldown = 500;

  // Reusable vectors
  const _cameraDir = useRef(new THREE.Vector3());
  const _rightDir = useRef(new THREE.Vector3());
  const _targetVel = useRef(new THREE.Vector3());
  const _smoothedVel = useRef(new THREE.Vector3(0, 0, 0));
  const _up = useRef(new THREE.Vector3(0, 1, 0));

  useFrame((state, delta) => {
    if (!rb.current) return;

    const dt = Math.min(delta, 0.1);
    const { forward, backward, left, right, interact: interactKey } = getKeys();

    // ── Sync player position to store (replaces window.__playerPosition) ──
    const translation = rb.current.translation();
    setPlayerPosition([translation.x, translation.y + 0.8, translation.z]);

    // ── Interaction (E key via legacy zoom system) ──
    const now = Date.now();
    if (interactKey && now - lastInteractTime.current > interactCooldown) {
      const playerPos: [number, number, number] = [
        translation.x,
        translation.y + 0.8,
        translation.z,
      ];
      interact(playerPos);
      lastInteractTime.current = now;
    }

    // ── Freeze movement during camera zoom ──
    if (zoomState.isZooming) {
      rb.current.setLinvel({ x: 0, y: rb.current.linvel().y, z: 0 }, true);
      _smoothedVel.current.set(0, 0, 0);
      return;
    }

    // ── Movement ──
    const targetVel = _targetVel.current.set(0, 0, 0);

    if (forward || backward || left || right) {
      const cameraDir = _cameraDir.current;
      state.camera.getWorldDirection(cameraDir);
      cameraDir.y = 0;
      cameraDir.normalize();

      const rightDir = _rightDir.current;
      rightDir.crossVectors(cameraDir, _up.current).normalize();

      if (forward) targetVel.add(cameraDir);
      if (backward) targetVel.sub(cameraDir);
      if (left) targetVel.sub(rightDir);
      if (right) targetVel.add(rightDir);

      if (targetVel.lengthSq() > 0) {
        targetVel.normalize().multiplyScalar(speed);
      }
    }

    // ── Smooth velocity ──
    const smoothedVel = _smoothedVel.current;
    const lerpT = 1 - Math.exp(-VELOCITY_LERP_FACTOR * dt);
    smoothedVel.x = THREE.MathUtils.lerp(smoothedVel.x, targetVel.x, lerpT);
    smoothedVel.z = THREE.MathUtils.lerp(smoothedVel.z, targetVel.z, lerpT);

    const isInput = forward || backward || left || right;
    if (
      !isInput &&
      Math.abs(smoothedVel.x) < STOP_THRESHOLD &&
      Math.abs(smoothedVel.z) < STOP_THRESHOLD
    ) {
      smoothedVel.x = 0;
      smoothedVel.z = 0;
    }

    // ── Apply physics ──
    const currentVel = rb.current.linvel();
    rb.current.setLinvel(
      { x: smoothedVel.x, y: currentVel.y, z: smoothedVel.z },
      true,
    );

    // ── Camera follow (when not zooming) ──
    if (!zoomState.isZooming) {
      state.camera.position.set(translation.x, translation.y + 0.8, translation.z);
    }
  });

  return (
    <RigidBody
      ref={rb}
      colliders={false}
      enabledRotations={[false, false, false]}
      position={[0, 1, 0]}
    >
      <CapsuleCollider args={[0.5, 0.3]} />
    </RigidBody>
  );
}