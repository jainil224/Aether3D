# 🌌 Aether3D — Craft Immersive 3D Worlds on the Web

> **Aether3D** merges the elegance of Svelte 5 with the performance of Three.js.  
> Build responsive, declarative 3D apps and games for the web — with sub-millisecond frame rendering.

---

## ✨ Live Preview

Visit the live site at: [https://github.com/jainil224/Aether3D](https://github.com/jainil224/Aether3D)

---

## 📸 Features

- 🎬 **HLS Video Background** — Scroll-scrubbed cinematic video using HLS.js with native Safari fallback
- 🔤 **ScrollFloat Hero Text** — Large uppercase text that animates out as you scroll down, perfectly reversed when scrolling back up
- ✨ **Ambient Particle System** — Mouse-reactive floating particle canvas drawn with `requestAnimationFrame`
- 📜 **Character-by-Character Text Reveal** — Paragraphs blur and fade in/out per character in perfect sync with scroll progress
- 🃏 **3D Perspective Carousel** — Swipeable, keyboard-accessible fan-card carousel with GSAP-powered transitions and autoplay
- 🔄 **Bidirectional Scroll Animations** — Every scroll animation plays just as smoothly when scrolling back up as down
- 💊 **Capsule Navigation** — Minimal floating pill-shaped nav with glassmorphism border effect
- 📊 **Scroll Progress Bar** — A top-edge gradient bar that fills as you scroll through the page
- 📱 **Fully Responsive** — Adapts gracefully to all screen sizes

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **HTML5** | Semantic page structure |
| **Vanilla CSS** | Custom design system, animations, glassmorphism |
| **Vanilla JavaScript (ESM)** | All interactivity and scroll logic |
| **GSAP 3 + ScrollTrigger** | Scroll-driven animations and timeline control |
| **HLS.js** | Adaptive bitrate video streaming (m3u8) |
| **Vite 5** | Development server and production bundler |

---

## 📂 Project Structure

```
Aether3D/
├── index.html          # Main HTML page with all sections
├── app.js              # Core JavaScript — video, particles, scroll animations, carousel
├── style.css           # Full design system — variables, layout, components, responsive
├── ScrollFloat.css     # Styles for the large hero ScrollFloat text component
├── public/
│   └── Dirtyline-36daystyle-2022.woff2   # Custom display font for hero text
├── package.json        # Project metadata and Vite scripts
└── .gitignore          # Ignores node_modules, dist, logs
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/jainil224/Aether3D.git

# 2. Navigate into the project directory
cd Aether3D

# 3. Install dependencies
npm install
```

### Running Locally

```bash
npm run dev
```

This starts the Vite development server. Open your browser and go to:

```
http://localhost:5173/
```

The page hot-reloads automatically whenever you save changes to any file.

### Building for Production

```bash
npm run build
```

Output will be placed in the `dist/` folder.

### Preview the Production Build

```bash
npm run preview
```

---

## 🎨 Design System

The design is built using a centralized CSS custom properties system defined in `style.css`:

```css
--bg-primary:     #08080C   /* Near-black background          */
--accent-cyan:    #00F0FF   /* Primary glow / highlight       */
--accent-blue:    #0072FF   /* CTA buttons / gradients        */
--font-heading:   'Inter'   /* Main heading typeface          */
--font-editorial: 'serif'   /* Stylistic editorial headlines  */
```

Key UI patterns used:
- **Glassmorphism** — `backdrop-filter: blur()` with semi-transparent borders
- **Gradient text** — `-webkit-background-clip: text` for multicolored headings
- **Liquid glass borders** — CSS `mask-composite` trick for glowing borders
- **Micro-animations** — hover lifts, scale pulses, shimmer sweeps

---

## 📜 Scroll Animation Architecture

All scroll-driven animations are powered by **GSAP ScrollTrigger**:

| Animation | Direction | Mechanism |
|---|---|---|
| Video scrub (Hero) | ↕ Both | `onUpdate` → `video.currentTime` |
| ScrollFloat hero text | ↕ Both | `gsap.fromTo` with `scrub: 1.5` |
| Character text reveal | ↕ Both | Per-char opacity/blur via `self.progress` |
| Card stack entrance | ↕ Both | `onEnter` / `onLeaveBack` with GSAP |
| Video blur effect | ↕ Both | Progressive `blur(px)` on scroll |

> All animations are fully **reversible** — scrolling up plays every animation perfectly in reverse.

---

## 📦 Dependencies

### Runtime (CDN — no install required)
| Library | Version | CDN |
|---|---|---|
| GSAP | 3.12.2 | cdnjs.cloudflare.com |
| GSAP ScrollTrigger | 3.12.2 | cdnjs.cloudflare.com |
| HLS.js | 1.4.0 | cdn.jsdelivr.net |

### Dev Dependencies
| Package | Version |
|---|---|
| vite | ^5.0.0 |

---

## 🌐 Browser Support

| Browser | Support |
|---|---|
| Chrome / Edge | ✅ Full |
| Firefox | ✅ Full |
| Safari | ✅ Full (native HLS) |
| Mobile (iOS/Android) | ✅ Responsive |

---

## 📄 License

This project is private and proprietary.  
© 2024 Aether3D. All rights reserved.

---

<div align="center">
  <strong>Built with ❤️ using Vanilla JS, GSAP & Vite</strong>
</div>
