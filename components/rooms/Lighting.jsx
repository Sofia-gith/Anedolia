"use client";
import React from "react";

export function Lighting({ nodes, materials }) {
  // Configurações das luminárias HQI
  const lights = [
    { position: [88.295, 265, -2.142], index: 0 },
    { position: [-251.492, 265, -329.326], index: 1 },
    { position: [-251.492, 265, -468.16], index: 2 },
    { position: [-251.492, 265, -527.331], index: 3 },
    { position: [-251.492, 265, -587.331], index: 4 },
    { position: [391.714, 265, -545.162], index: 5 },
    { position: [391.714, 265, -463.241], index: 6 },
    { position: [285.496, 265, -212.653], index: 7 },
  ];

  return (
    <group name="lighting">
      {lights.map((light, idx) => {
        const suffix = light.index > 0 ? `_${light.index}` : "";
        return (
          <group
            key={idx}
            position={light.position}
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.5}
          >
            <mesh
              geometry={nodes[`6_HQI_Pictures_4_Metal_Stainless_0${suffix}`].geometry}
              material={materials["4_Metal_Stainless"]}
            />
            <mesh
              geometry={nodes[`6_HQI_Pictures_4_Light_Material_0${suffix}`].geometry}
              material={materials["4_Light_Material"]}
            />
          </group>
        );
      })}
    </group>
  );
}