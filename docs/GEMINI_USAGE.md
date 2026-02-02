# Como Usar o Sistema de Interação Gemini

## Setup Básico

### 1. Envolver a aplicação com o Provider

No arquivo principal do jogo (ex: `app/page.tsx` ou `app/jogo/page.tsx`):

```tsx
import GenGemini from "@/components/GenGemini";
import { Canvas } from "@react-three/fiber";
import { Model } from "@/components/Apartamento";

export default function Jogo() {
  return (
    <GenGemini>
      <Canvas>
        <Model />
        {/* outros componentes 3D */}
      </Canvas>
    </GenGemini>
  );
}
```

### 2. Usar com objetos 3D

#### Opção A: Component Wrapper (Recomendado)

```tsx
import { InteractiveObject } from "@/components/InteractiveObject";

<InteractiveObject objeto="café">
  <mesh geometry={nodes.CoffeeCup.geometry} material={materials.Ceramic} />
</InteractiveObject>

<InteractiveObject objeto="espelho">
  <mesh geometry={nodes.Mirror.geometry} material={materials.Mirror} />
</InteractiveObject>
```

#### Opção B: Hook Direto

```tsx
import { useGeminiText } from "@/components/GenGemini";

function Cafe() {
  const texto = useGeminiText("café");

  const handleClick = () => {
    console.log("Texto do café:", texto);
    // exibir UI, mudar cor, etc
  };

  return <mesh onClick={handleClick}>{/* geometria do café */}</mesh>;
}
```

### 3. Objetos Disponíveis

- `"café"` - Xícara de café
- `"planta"` - Planta na janela
- `"livros"` - Estante de livros
- `"espelho"` - Espelho (ápice emocional)
- `"quadro"` - Quadro na parede

## Exemplo Completo

```tsx
import GenGemini from "@/components/GenGemini";
import { InteractiveObject } from "@/components/InteractiveObject";
import { Canvas } from "@react-three/fiber";
import { Model } from "@/components/Apartamento";

export default function Jogo() {
  return (
    <GenGemini>
      <Canvas camera={{ position: [0, 2, 5] }}>
        <ambientLight intensity={0.5} />

        {/* Apartamento base */}
        <Model />

        {/* Objetos interativos */}
        <InteractiveObject objeto="café">
          <mesh position={[1, 1, 0]}>
            <boxGeometry args={[0.2, 0.3, 0.2]} />
            <meshStandardMaterial color="brown" />
          </mesh>
        </InteractiveObject>

        <InteractiveObject
          objeto="espelho"
          onInteract={(texto) => {
            console.log("Ápice emocional!", texto);
            // Trigger full color restoration
          }}
        >
          <mesh position={[0, 2, -2]}>
            <planeGeometry args={[1, 1.5]} />
            <meshStandardMaterial color="silver" metalness={1} />
          </mesh>
        </InteractiveObject>
      </Canvas>
    </GenGemini>
  );
}
```

## API

### `GenGemini` (Provider)

- **Props:** `{ children: ReactNode }`
- **Descrição:** Busca textos do Gemini ao montar e disponibiliza via Context

### `useGeminiText(key: string)` (Hook)

- **Retorna:** `string` - Texto gerado pelo Gemini (ou fallback)
- **Uso:** Dentro de qualquer componente filho de `<GenGemini>`

### `useGemini()` (Hook)

- **Retorna:** `{ texts, loading, error, getTexto }`
- **Uso:** Para acesso completo ao estado

### `InteractiveObject` (Component)

- **Props:**
  - `objeto: string` - Chave do objeto ("café", "espelho", etc)
  - `children: ReactNode` - Objeto 3D a ser envolvido
  - `onInteract?: (texto: string) => void` - Callback ao clicar
- **Descrição:** Wrapper que adiciona interação e UI de texto automaticamente
