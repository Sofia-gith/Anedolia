"use client";
import React from "react";

export function Bathroom({ nodes, materials }) {
  return (
    <group name="bathroom">
      {/* Lixeira do Banheiro */}
      <group position={[382.996, 0, 27.998]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          geometry={nodes["4_Bathroom_Trash_Can_4_Metal_Chrome_0"].geometry}
          material={materials["4_Metal_Chrome"]}
          position={[11.5, -2.5, 0]}
        />
      </group>

      {/* Grade do Chuveiro */}
      <mesh
        geometry={nodes["4_Bathroom_Grid_4_Metal_Shower_0"].geometry}
        material={materials["4_Metal_Shower"]}
        position={[172.861, 2, 33.91]}
        rotation={[-Math.PI / 2, 0, Math.PI]}
      />

      {/* Torneira do Banheiro */}
      <mesh
        geometry={nodes["4_Bathroom_Faucet_4_Metal_Chrome_0"].geometry}
        material={materials["4_Metal_Chrome"]}
        position={[394.949, 98, -47.746]}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* Chuveiro */}
      <mesh
        geometry={nodes["4_Bathroom_Shower_4_Metal_Shower_0"].geometry}
        material={materials["4_Metal_Shower"]}
        position={[173.411, 218.378, 34.308]}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* Material/Móveis do Banheiro */}
      <mesh
        geometry={nodes["3_Bathroom_Material_#124_0"].geometry}
        material={materials.Material_124}
        position={[382.996, 15, -47.747]}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* Espelho do Banheiro */}
      <group position={[409.496, 100, -47.747]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          geometry={nodes["4_BathRoom_Mirror__4_Metal_Black_Rough_0"].geometry}
          material={materials["4_Metal_Black_Rough"]}
        />
        <mesh
          geometry={nodes["4_BathRoom_Mirror__4_Mirror_0"].geometry}
          material={materials["4_Mirror"]}
        />
      </group>

      {/* Prateleira do Banheiro 1 */}
      <group position={[412.996, 120, 45.397]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh
          geometry={nodes["4_Bathroom_Shelf_4_Metal_Chrome_0"].geometry}
          material={materials["4_Metal_Chrome"]}
        />
        <mesh
          geometry={nodes["4_Bathroom_Shelf_4_Glass_0"].geometry}
          material={materials["4_Glass"]}
        />
        <mesh
          geometry={nodes["4_Bathroom_Shelf_4_Fabric_Towel_0"].geometry}
          material={materials["4_Fabric_Towel"]}
        />
        <mesh
          geometry={nodes["4_Bathroom_Shelf_4_Ceramic_0"].geometry}
          material={materials["4_Ceramic"]}
        />
        <mesh
          geometry={nodes["4_Bathroom_Shelf_4_Bathroom_Wood_0"].geometry}
          material={materials["4_Bathroom_Wood"]}
        />
      </group>

      {/* Prateleira do Banheiro 2 */}
      <group position={[202.815, 100, 106.974]} rotation={[Math.PI, 0, -Math.PI]}>
        <mesh
          geometry={nodes["4_Bathroom_Shelf_4_Metal_Chrome_0_1"].geometry}
          material={materials["4_Metal_Chrome"]}
        />
        <mesh
          geometry={nodes["4_Bathroom_Shelf_4_Glass_0_1"].geometry}
          material={materials["4_Glass"]}
        />
        <mesh
          geometry={nodes["4_Bathroom_Shelf_4_Ceramic_0_1"].geometry}
          material={materials["4_Ceramic"]}
        />
        <mesh
          geometry={nodes["4_Bathroom_Shelf_4_Plastic_Cream_Shower_0"].geometry}
          material={materials["4_Plastic_Cream_Shower"]}
        />
      </group>

      {/* Caixa do Banheiro */}
      <group position={[221.828, 10, 48.391]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          geometry={nodes["4_Bathroom_Box_4_Metal_Chrome_0"].geometry}
          material={materials["4_Metal_Chrome"]}
        />
        <mesh
          geometry={nodes["4_Bathroom_Box_4_Glass_0"].geometry}
          material={materials["4_Glass"]}
        />
      </group>

      {/* Descarga */}
      <group position={[376.016, 0, 62.211]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]} scale={0.043}>
        <mesh
          geometry={nodes["4_Bathroom_Flush_4_Metal_Chrome_0"].geometry}
          material={materials["4_Metal_Chrome"]}
          position={[-457.2, -850.9, 0]}
        />
      </group>

      {/* Papel Higiênico */}
      <group position={[338.996, 81, 46.747]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]}>
        <mesh
          geometry={nodes["4_Bathroom_Paper_4_Metal_Chrome_0"].geometry}
          material={materials["4_Metal_Chrome"]}
        />
        <mesh
          geometry={nodes["4_Bathroom_Paper_4_Ceramic_0"].geometry}
          material={materials["4_Ceramic"]}
        />
      </group>

      {/* Toalha */}
      <group position={[201.996, 120, 45.747]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          geometry={nodes["4_Bathroom_Towel_4_Metal_Chrome_0"].geometry}
          material={materials["4_Metal_Chrome"]}
        />
        <mesh
          geometry={nodes["4_Bathroom_Towel_4_Fabric_Towel_0"].geometry}
          material={materials["4_Fabric_Towel"]}
        />
      </group>

      {/* Sabonete */}
      <group position={[376.996, 120, 45.747]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          geometry={nodes["4_Bathroom_Soap_4_Metal_Chrome_0"].geometry}
          material={materials["4_Metal_Chrome"]}
        />
        <mesh
          geometry={nodes["4_Bathroom_Soap_4_Ceramic_0"].geometry}
          material={materials["4_Ceramic"]}
        />
      </group>
    </group>
  );
}