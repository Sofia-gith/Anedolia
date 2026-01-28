"use client";
import React from "react";

export function Kitchen({ nodes, materials }) {
  return (
    <group name="kitchen">
      {/* Freezer/Geladeira */}
      <group position={[-104.742, 0, 69.533]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          geometry={nodes["4_Kitchen_Freezer_4_Metal_Stainless_0"].geometry}
          material={materials["4_Metal_Stainless"]}
        />
        <mesh
          geometry={nodes["4_Kitchen_Freezer_4_Metal_Grey_Rough_0"].geometry}
          material={materials["4_Metal_Grey_Rough"]}
        />
        <mesh
          geometry={nodes["4_Kitchen_Freezer_4_Metal_Black_Rough_0"].geometry}
          material={materials["4_Metal_Black_Rough"]}
        />
      </group>

      {/* Microondas */}
      <group position={[-255.742, 140, -48.092]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          geometry={nodes["4_Kitchen_Microwave_4_Metal_Grey_Rough_0"].geometry}
          material={materials["4_Metal_Grey_Rough"]}
        />
        <mesh
          geometry={nodes["4_Kitchen_Microwave_4_Metal_Chrome_0"].geometry}
          material={materials["4_Metal_Chrome"]}
        />
        <mesh
          geometry={nodes["4_Kitchen_Microwave_4_Metal_Stainless_0"].geometry}
          material={materials["4_Metal_Stainless"]}
        />
      </group>

      {/* Máquina de Lavar */}
      <group position={[-243.992, 12, -205.342]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          geometry={nodes["4_Kitchen_WashMachine_4_Metal_Stainless_0"].geometry}
          material={materials["4_Metal_Stainless"]}
        />
        <mesh
          geometry={nodes["4_Kitchen_WashMachine_4_Metal_Grey_Rough_0"].geometry}
          material={materials["4_Metal_Grey_Rough"]}
        />
      </group>

      {/* Torneira da Cozinha */}
      <mesh
        geometry={nodes["4_Kithchen_Faucet_4_Metal_Chrome_0"].geometry}
        material={materials["4_Metal_Chrome"]}
        position={[-266.992, 91, -126.698]}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* Pia da Cozinha */}
      <mesh
        geometry={nodes["4_Kitchen_Sink_4_Metal_Stainless_0"].geometry}
        material={materials["4_Metal_Stainless"]}
        position={[-241.492, 89, -126.842]}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* Pote de Açúcar */}
      <mesh
        geometry={nodes["7_Sugar_Pot_Material_#142_0"].geometry}
        material={materials.Material_142}
        position={[-268.529, 91, 100.599]}
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
      />

      {/* Pote de Café */}
      <mesh
        geometry={nodes["7_Coffee_Pot_Material_#141_0"].geometry}
        material={materials.Material_141}
        position={[-238.936, 91, 101.781]}
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
      />

      {/* Pote de Chocolate */}
      <mesh
        geometry={nodes["7_Chocolate_Pot_Material_#143_0"].geometry}
        material={materials.Material_143}
        position={[-253.51, 91, 100.748]}
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
      />

      {/* Máquina de Café */}
      <mesh
        geometry={nodes["7_Coffee_machine_Material_#140_0"].geometry}
        material={materials.Material_140}
        position={[-178.32, 91, 89.944]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        scale={0.1}
      />

      {/* Tábua de Carne */}
      <mesh
        geometry={nodes["7_Meat_Board_Material_#144_0"].geometry}
        material={materials.Material_144}
        position={[-274.791, 106.834, 10.561]}
        rotation={[-Math.PI / 2, 1.472, Math.PI / 2]}
        scale={0.8}
      />

      {/* Xícaras */}
      <mesh
        geometry={nodes["7_Cup_4_Ceramic_0"].geometry}
        material={materials["4_Ceramic"]}
        position={[-198.439, 91.083, 67.189]}
        rotation={[0, -Math.PI / 2, 0]}
      />
      <mesh
        geometry={nodes["7_Cup_4_Ceramic_0_1"].geometry}
        material={materials["4_Ceramic"]}
        position={[-211.552, 91.083, 67.189]}
        rotation={[0, -Math.PI / 2, 0]}
      />

      {/* Alça da Cozinha */}
      <group position={[-241.992, 140.5, -225.279]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          geometry={nodes["4_Kitchen_Handle_06_4_Metal_Gold_0"].geometry}
          material={materials["4_Metal_Gold"]}
          position={[2, 0, 0]}
        />
      </group>

      {/* Forno */}
      <group position={[-213.492, 49, -48.092]} rotation={[0, Math.PI / 2, 0]}>
        <mesh
          geometry={nodes["4_Kitchen_Oven_4_Metal_Black_Glossy_0"].geometry}
          material={materials["4_Metal_Black_Glossy"]}
        />
        <mesh
          geometry={nodes["4_Kitchen_Oven_4_Metal_Stainless_0"].geometry}
          material={materials["4_Metal_Stainless"]}
        />
        <mesh
          geometry={nodes["4_Kitchen_Oven_4_Glass_0"].geometry}
          material={materials["4_Glass"]}
        />
      </group>

      {/* Cooktop */}
      <group position={[-234.992, 91.5, -27.095]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          geometry={nodes["4_Kitchen_Cooktop_4_Metal_Black_Glossy_0"].geometry}
          material={materials["4_Metal_Black_Glossy"]}
        />
        <mesh
          geometry={nodes["4_Kitchen_Cooktop_4_Metal_White_Glossy_0"].geometry}
          material={materials["4_Metal_White_Glossy"]}
        />
      </group>

      {/* Mesa da Cozinha */}
      <group position={[-276.492, 0, 107.533]} rotation={[-Math.PI / 2, 0, 0]}>
        <group position={[-23, 0, 0]}>
          <mesh
            geometry={nodes["3_Kitchen_Material_#129_0"].geometry}
            material={materials.Material_129}
          />
          <mesh
            geometry={nodes["3_Kitchen_Material_#129_0_1"].geometry}
            material={materials.Material_129}
          />
          <mesh
            geometry={nodes["3_Kitchen_Material_#129_0_2"].geometry}
            material={materials.Material_129}
          />
          <mesh
            geometry={nodes["3_Kitchen_Material_#129_0_3"].geometry}
            material={materials.Material_129}
          />
          <mesh
            geometry={nodes["3_Kitchen_Material_#129_0_4"].geometry}
            material={materials.Material_129}
          />
          <mesh
            geometry={nodes["3_Kitchen_Material_#129_0_5"].geometry}
            material={materials.Material_129}
          />
        </group>
      </group>
    </group>
  );
}