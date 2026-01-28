"use client";
import React from "react";

export function Structure({ nodes, materials }) {
  return (
    <group name="structure">
      {/* Maçanetas */}
      <group position={[-188.092, 103, -689.156]} rotation={[-Math.PI / 2, 0, Math.PI]}>
        <mesh
          geometry={nodes["2_Handles_4_Metal_Chrome_0"].geometry}
          material={materials["4_Metal_Chrome"]}
          position={[-10.244, 0, 0]}
        />
      </group>

      {/* Estrutura Principal */}
      <mesh
        geometry={nodes["1_Structure_Material_#122_0"].geometry}
        material={materials.Material_122}
        position={[-75.227, 0, -255.302]}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* Portas e Janelas */}
      <mesh
        geometry={nodes["2_Door_Windows_Material_#123_0"].geometry}
        material={materials.Material_123}
        position={[58.259, 0, -430.606]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
      />

      {/* Guarda-corpo/Corrimão */}
      <mesh
        geometry={nodes["2_Railing_4_Metal_Black_Railing_0"].geometry}
        material={materials["4_Metal_Black_Railing"]}
        position={[-105.807, -3, -894.386]}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* Closet */}
      <mesh
        geometry={nodes["3_Closet_Material_#133_0"].geometry}
        material={materials.Material_133}
        position={[209.062, 0, -213.096]}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* Quadro/Picture */}
      <mesh
        geometry={nodes["3_Picture_Material_#131_0"].geometry}
        material={materials.Material_131}
        position={[112.295, 110, -2.142]}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* Espelho do Closet */}
      <mesh
        geometry={nodes["4_Closet_Mirror_4_Mirror_0"].geometry}
        material={materials["4_Mirror"]}
        position={[209.062, 0, -213.096]}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* Vidros/Glass */}
      <mesh
        geometry={nodes["4_Glass_4_Glass_0"].geometry}
        material={materials["4_Glass"]}
        position={[-2.728, 49, -706.162]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <mesh
        geometry={nodes["4_Glass_4_Glass_0_1"].geometry}
        material={materials["4_Glass"]}
        position={[313.893, 76, -701.957]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <mesh
        geometry={nodes["4_Glass_4_Glass_0_2"].geometry}
        material={materials["4_Glass"]}
        position={[236.893, 76, -704.957]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <mesh
        geometry={nodes["4_Glass_4_Glass_0_3"].geometry}
        material={materials["4_Glass"]}
        position={[-140.149, 31.5, -749.111]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </group>
  );
}