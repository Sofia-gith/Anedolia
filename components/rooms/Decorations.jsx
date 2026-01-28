"use client";
import React from "react";

export function Decorations({ nodes, materials }) {
  return (
    <group name="decorations">
      {/* Planta de Palma */}
      <group position={[29.964, 82.508, -637.316]} scale={0.8}>
        <mesh
          geometry={nodes["5_Vegetation_Plant_5_Vegetation_Palm_0"].geometry}
          material={materials["5_Vegetation_Palm"]}
          position={[-14.46, -5.251, -1.805]}
        />
      </group>

      {/* Planta Verde */}
      <group position={[-44.867, 72.087, -631.761]} rotation={[-Math.PI / 2, 0, 0]} scale={0.6}>
        <mesh
          geometry={nodes["7_Vegetation_Green_Plant_4_Ceramic_0"].geometry}
          material={materials["4_Ceramic"]}
        />
        <mesh
          geometry={nodes["7_Vegetation_Green_Plant_4_Metal_Black_Rough_0"].geometry}
          material={materials["4_Metal_Black_Rough"]}
        />
        <mesh
          geometry={nodes["7_Vegetation_Green_Plant_7_Vegetation_Green_Plant_0"].geometry}
          material={materials["7_Vegetation_Green_Plant"]}
        />
      </group>

      {/* Planta Vermelha */}
      <group position={[-79.867, 72.087, -174.415]} rotation={[-Math.PI / 2, 0, 0]} scale={0.6}>
        <mesh
          geometry={nodes["7_Vegetation_Red_Plant_4_Ceramic_0"].geometry}
          material={materials["4_Ceramic"]}
        />
        <mesh
          geometry={nodes["7_Vegetation_Red_Plant_4_Metal_Black_Rough_0"].geometry}
          material={materials["4_Metal_Black_Rough"]}
        />
        <mesh
          geometry={nodes["7_Vegetation_Red_Plant_7_Vegetation_Red_Plant_0"].geometry}
          material={materials["7_Vegetation_Red_Plant"]}
        />
      </group>

      {/* Livro 21 */}
      <group position={[90.163, 168.75, -472.914]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} scale={0.25}>
        <mesh
          geometry={nodes["7_Books_21_Material_#136_0"].geometry}
          material={materials.Material_136}
          position={[-226.119, -2.092, 0]}
        />
      </group>

      {/* Vaso 01 */}
      <group position={[82.564, 117.5, -649.772]} rotation={[0, -Math.PI / 2, 0]} scale={0.5}>
        <mesh
          geometry={nodes["7_Vase_01_Material_#138_0"].geometry}
          material={materials.Material_138}
          position={[40.921, 30.281, 0]}
        />
      </group>

      {/* Vaso 00 */}
      <group position={[85.966, 117.5, -633.302]} rotation={[0, -Math.PI / 2, 0]} scale={0.5}>
        <mesh
          geometry={nodes["7_Vase_00_Material_#138_0"].geometry}
          material={materials.Material_138}
          position={[-5.333, 30.12, 0]}
        />
      </group>

      {/* Revistas */}
      <group position={[-105.685, 35.5, -521.803]} rotation={[0, -0.984, 0]} scale={0.8}>
        <mesh
          geometry={nodes["7_Magazines_7_Magazines_0"].geometry}
          material={materials["7_Magazines"]}
          position={[0, 0.173, 0]}
        />
      </group>

      {/* Estatueta */}
      <group position={[93.839, 168.75, -539.957]} rotation={[0, 1.341, 0]} scale={0.018}>
        <mesh
          geometry={nodes["7_Statuette_4_Metal_Black_Glossy_0"].geometry}
          material={materials["4_Metal_Black_Glossy"]}
          position={[42.159, 52.276, 99.324]}
        />
      </group>

      {/* Bule de Chá */}
      <group position={[-258.186, 92, -69.27]} rotation={[0, Math.PI / 2, 0]} scale={0.1}>
        <mesh
          geometry={nodes["7_Teapot_4_Metal_Chrome_0"].geometry}
          material={materials["4_Metal_Chrome"]}
        />
        <mesh
          geometry={nodes["7_Teapot_4_Metal_Black_Rough_0"].geometry}
          material={materials["4_Metal_Black_Rough"]}
        />
      </group>

      {/* Facas */}
      <group position={[-275.179, 92, -191.684]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} scale={1.2}>
        <mesh geometry={nodes["7_Knifes_7_Knifes_0"].geometry} material={materials["7_Knifes"]} />
        <mesh
          geometry={nodes["7_Knifes_4_Metal_Chrome_0"].geometry}
          material={materials["4_Metal_Chrome"]}
        />
        <mesh
          geometry={nodes["7_Knifes_4_Metal_Black_Rough_0"].geometry}
          material={materials["4_Metal_Black_Rough"]}
        />
      </group>

      {/* Jantares - 4 configurações */}
      <DinnerSet nodes={nodes} materials={materials} position={[-116.062, 72, -139.543]} rotation={[Math.PI, Math.PI / 4, -Math.PI]} variant={0} />
      <DinnerSet nodes={nodes} materials={materials} position={[-44.992, 72, -139.543]} rotation={[Math.PI, -Math.PI / 4, Math.PI]} variant={1} />
      <DinnerSet nodes={nodes} materials={materials} position={[-44.992, 72, -210.613]} rotation={[0, -Math.PI / 4, 0]} variant={2} />
      <DinnerSet nodes={nodes} materials={materials} position={[-116.062, 72, -210.613]} rotation={[0, Math.PI / 4, 0]} variant={3} />

      {/* Livros - Múltiplas instâncias (simplificado) */}
      <BookShelf nodes={nodes} materials={materials} />
    </group>
  );
}

// Subcomponente para configuração de jantar
function DinnerSet({ nodes, materials, position, rotation, variant }) {
  return (
    <group position={position} rotation={rotation} scale={[0.027, 0.05, 0.027]}>
      <group position={[-1772.143, 20.085, 2268.883]}>
        <mesh
          geometry={nodes[`7_Dinner_4_Ceramic_0${variant > 0 ? `_${variant}` : ""}`].geometry}
          material={materials["4_Ceramic"]}
        />
        <mesh
          geometry={nodes[`7_Dinner_4_Metal_Gold_0${variant > 0 ? `_${variant}` : ""}`].geometry}
          material={materials["4_Metal_Gold"]}
        />
        <mesh
          geometry={nodes[`7_Dinner_4_Metal_Chrome_0${variant > 0 ? `_${variant}` : ""}`].geometry}
          material={materials["4_Metal_Chrome"]}
        />
        <mesh
          geometry={nodes[`7_Dinner_4_Glass_0${variant > 0 ? `_${variant}` : ""}`].geometry}
          material={materials["4_Glass"]}
        />
        <mesh
          geometry={nodes[`7_Dinner_7_Dinner_0${variant > 0 ? `_${variant}` : ""}`].geometry}
          material={materials["7_Dinner"]}
        />
      </group>
    </group>
  );
}

// Subcomponente simplificado para livros
function BookShelf({ nodes, materials }) {
  // Positions dos livros (simplificado - adicione mais se necessário)
  const books = [
    { name: "7_Books_01_Material_#137_0", pos: [94.738, 136.502, -595.764], rot: [0.176, 0, -Math.PI], scale: 22.789 },
    { name: "7_Books_02_Material_#137_0", pos: [95.338, 146.502, -653.764], rot: [0.088, 0, Math.PI], scale: 22.789 },
    { name: "7_Books_06_Material_#137_0", pos: [95.338, 146.502, -615.764], rot: [0.088, 0, Math.PI], scale: 22.789 },
  ];

  return (
    <>
      {books.map((book, index) => (
        <group key={index} position={book.pos} rotation={book.rot} scale={book.scale}>
          <mesh geometry={nodes[book.name].geometry} material={materials.Material_137} />
        </group>
      ))}
    </>
  );
}