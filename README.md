# 🎮 Anedolia

> A narrative web game about rediscovering color in life through memories.

## 📖 About

**Anedolia** is a first-person narrative experience where players explore a grayscale house, interacting with objects that trigger memories. As the story progresses, color gradually returns to the world, culminating in a hopeful ending.

Built for the **Gemini 3 Hackathon** using Google's Gemini API to dynamically generate narrative content.

---

## 🚀 Tech Stack

- **Next.js 14** - React framework
- **React Three Fiber** - Three.js for React
- **@react-three/drei** - Useful helpers for R3F
- **Google Gemini API** - Dynamic narrative generation
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

---

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google AI Studio API Key ([Get it here](https://aistudio.google.com/app/apikey))

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/Sofia-gith/Anedolia
cd anedolia
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_api_key_here
```

4. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎯 Project Structure

```
anedolia/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main game page
│   │   ├── layout.tsx            # Root layout
│   │   └── api/
│   │       └── gemini/
│   │           └── route.ts      # Gemini API endpoint
│   ├── components/
│   │   ├── Scene.tsx             # Main 3D scene
│   │   ├── Player.tsx            # Player controller
│   │   ├── rooms/
│   │   │   ├── Bedroom.tsx       # Bedroom environment
│   │   │   ├── LivingRoom.tsx    # Living room environment
│   │   │   └── Bathroom.tsx      # Bathroom environment
│   │   ├── ui/
│   │   │   ├── DialogBox.tsx     # Text display UI
│   │   │   └── Controls.tsx      # Control instructions
│   │   └── effects/
│   │       └── ColorShader.tsx   # Desaturation shader
│   ├── lib/
│   │   └── gemini.ts             # Gemini API utilities
│   └── types/
│       └── game.ts               # TypeScript types
├── public/
│   └── models/                   # 3D models (.glb files)
├── .env.local                    # Environment variables
├── package.json
└── README.md
```

---

## 🎮 Game Design

### Core Concept
Players wake up in a grayscale world and must explore their house, interacting with objects that trigger memories. Each memory restores more color to the world.

### Three Acts

1. **Act 1: Awakening (Bedroom)**
   - World is grayscale
   - 3 interactive objects
   - Introduction to controls

2. **Act 2: Memories (Living Room)**
   - 10-20% color restoration
   - 2 major flashback sequences
   - Gemini-generated dialogue

3. **Act 3: Revelation (Bathroom)**
   - Mirror interaction
   - Full color restoration
   - Emotional conclusion

### Controls
- **WASD** - Movement
- **Mouse** - Look around
- **Click** - Interact with objects

---

## 🤖 Gemini Integration

The game uses Google's Gemini API to generate:
- Character's internal thoughts
- Flashback dialogue
- Memory descriptions
- Final message

### Example Usage
```typescript
const response = await fetch('/api/gemini', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Generate a melancholic memory about childhood...',
    context: 'bedroom_photo'
  })
});
```

---

## 🎨 Visual Style

- **Character**: Simple silhouette (LIMBO/INSIDE inspired)
- **Environments**: Low-poly, clean geometry
- **Color Transition**: Grayscale → Pastel → Vibrant
- **Lighting**: Soft, atmospheric

### Color Palette
- **Initial**: `#3a3a3a`, `#5c5c5c`, `#808080`
- **Mid**: `#8b9a9f`, `#b5c4c9`, `#d4a574`
- **Final**: `#f4a261`, `#e76f51`, `#2a9d8f`, `#e9c46a`

---

## 📝 Development Roadmap

### Week 1 (Jan 17-23)
- [x] Project setup
- [ ] Basic prototype with geometric shapes
- [ ] Player movement system
- [ ] Interaction system (raycasting)
- [ ] Gemini API integration

### Week 2 (Jan 24-30)
- [ ] 3D model creation in Blender
- [ ] Replace primitives with models
- [ ] Color progression shader
- [ ] Implement flashback system
- [ ] UI polish

### Week 3 (Jan 31 - Feb 9)
- [ ] Sound design
- [ ] Final visual polish
- [ ] Bug fixes
- [ ] Demo video (3 min max)
- [ ] Documentation
- [ ] Submission to Devpost

---

## 🏆 Hackathon Submission

### Requirements Checklist
- [ ] Uses Gemini 3 API
- [ ] Original work created during hackathon
- [ ] Public GitHub repository
- [ ] ~200 word description
- [ ] 3-minute demo video (YouTube/Vimeo)
- [ ] English documentation/subtitles
- [ ] Functional demo link or AI Studio app

### Judging Criteria
- **Technical Execution (40%)** - Code quality, Gemini usage
- **Potential Impact (20%)** - Real-world usefulness
- **Innovation/Wow Factor (30%)** - Originality
- **Presentation/Demo (10%)** - Clarity and documentation

---

## 📄 License

MIT License - Feel free to use this project as reference.

---

##  Author

**Sofia Floriano**
- GitHub: [@Sofia-gith](https://github.com/Sofia-gith)
- Devpost: Sofia-gith

---

## Acknowledgments

- Google DeepMind for the Gemini 3 Hackathon
- Inspiration from games like INSIDE, LIMBO, and Journey
- Three.js and React Three Fiber communities

---

##  Support

For questions or issues:
- Open an issue on GitHub
- Contact via Devpost discussion forum

---

## Credits

Home component:

/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.3 public/home/apartamento.glb --typescript
Author: SrMonteiro (https://sketchfab.com/crispimrafael)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/apartamento-77e965e2d3244bd58c476ca96baf387e
Title: Apartamento
*/

**Built with ❤️ for the Gemini 3 Hackathon**