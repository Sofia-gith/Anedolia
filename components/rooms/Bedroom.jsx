"use client";
import React from "react";

export function Bedroom({ nodes, materials }) {
  return (
    <group name="bedroom">
      {/* Abajour 1 */}
      <group position={[394.697, 60, -346.511]} rotation={[-Math.PI / 2, 0, 2.356]}>
        <group position={[44.206, -4.169, 151.174]} rotation={[-Math.PI, Math.PI / 9, -Math.PI]}>
          <mesh
            geometry={nodes["4_Bedroom_Abajour_4_Metal_Black_Glossy_0"].geometry}
            material={materials["4_Metal_Black_Glossy"]}
          />
          <mesh
            geometry={nodes["4_Bedroom_Abajour_4_Light_Material_0"].geometry}
            material={materials["4_Light_Material"]}
          />
          <mesh
            geometry={nodes["4_Bedroom_Abajour_4_Metal_Chrome_0"].geometry}
            material={materials["4_Metal_Chrome"]}
          />
        </group>
      </group>

      {/* Abajour 2 */}
      <group position={[394.697, 60, -663.857]} rotation={[-Math.PI / 2, 0, -2.356]}>
        <group position={[44.206, -4.169, 151.174]} rotation={[-Math.PI, Math.PI / 9, -Math.PI]}>
          <mesh
            geometry={nodes["4_Bedroom_Abajour_4_Metal_Black_Glossy_0_1"].geometry}
            material={materials["4_Metal_Black_Glossy"]}
          />
          <mesh
            geometry={nodes["4_Bedroom_Abajour_4_Light_Material_0_1"].geometry}
            material={materials["4_Light_Material"]}
          />
          <mesh
            geometry={nodes["4_Bedroom_Abajour_4_Metal_Chrome_0_1"].geometry}
            material={materials["4_Metal_Chrome"]}
          />
        </group>
      </group>

      {/* Material do Quarto (Cama, etc) */}
      <mesh
        geometry={nodes["3_Bedroom_Material_#126_0"].geometry}
        material={materials.Material_126}
        position={[300.496, 24, -504.853]}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* Tablet */}
      <mesh
        geometry={nodes["7_Tablet_Material_#139_0"].geometry}
        material={materials.Material_139}
        position={[368.359, 60, -632.894]}
        rotation={[-Math.PI / 2, 0, 2.299]}
      />
    </group>
  );
}