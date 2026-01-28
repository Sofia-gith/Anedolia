"use client";
import React from "react";

export function LivingRoom({ nodes, materials }) {
  return (
    <group name="living-room">
      {/* TV */}
      <group position={[42.144, 46, -515.541]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <group position={[0, 0.75, 5]}>
          <mesh
            geometry={nodes["4_TV_4_TV_Black+Logo_Samsung_0"].geometry}
            material={materials["4_TV_BlackLogo_Samsung"]}
          />
          <mesh
            geometry={nodes["4_TV_4_Metal_Black_Glossy_0"].geometry}
            material={materials["4_Metal_Black_Glossy"]}
          />
        </group>
      </group>

      {/* Luminária de Pedestal */}
      <group position={[-248.35, 0, -410.339]} rotation={[-Math.PI / 2, 0, Math.PI / 9]}>
        <group position={[44.206, -4.169, 151.174]} rotation={[-Math.PI, Math.PI / 9, -Math.PI]}>
          <mesh
            geometry={nodes["4_Lamp_Pedestal_4_Metal_Black_Glossy_0"].geometry}
            material={materials["4_Metal_Black_Glossy"]}
          />
          <mesh
            geometry={nodes["4_Lamp_Pedestal_4_Light_Material_0"].geometry}
            material={materials["4_Light_Material"]}
          />
          <mesh
            geometry={nodes["4_Lamp_Pedestal_4_Metal_Chrome_0"].geometry}
            material={materials["4_Metal_Chrome"]}
          />
        </group>
      </group>

      {/* Móveis/Material da Sala */}
      <mesh
        geometry={nodes["3_Living_Room_Material_#130_0"].geometry}
        material={materials.Material_130}
        position={[-97.503, 0.2, -523.939]}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* Detalhe em Metal Dourado */}
      <mesh
        geometry={nodes["4_Living_Room_Metal_4_Metal_Gold_0"].geometry}
        material={materials["4_Metal_Gold"]}
        position={[-74.212, 20, -531.605]}
        rotation={[0, -Math.PI / 2, 0]}
      />
    </group>
  );
}