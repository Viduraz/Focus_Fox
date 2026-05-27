# 🦊 FocusFox

> **AI-powered student productivity Chrome Extension for LMS platforms like Moodle & SLIIT CourseWeb.**

FocusFox helps students focus smarter — blocking distractions, applying comfortable dark themes, highlighting important content, and summarizing course material with AI.

---

## 📋 Project Status

| Phase | Status | Scope |
|-------|--------|-------|
| **Phase 1** | ✅ Complete | Architecture, bootstrapping, popup UI foundation |
| Phase 2 | 🔲 Planned | Focus Mode, Dark Mode |
| Phase 3 | 🔲 Planned | Smart Highlights, AI Summary |
| Phase 4 | 🔲 Planned | LMS integration, polish, publishing |

---

## 🏗 Architecture

```
focusfox/
├── public/
│   ├── manifest.json          # Chrome MV3 manifest
│   └── icons/                 # Extension icons (16/48/128px)
├── src/
│   ├── popup/                 # React popup UI
│   │   ├── main.tsx           # Entry point
│   │   ├── App.tsx            # Root component
│   │   └── components/        # UI components
│   │       ├── FoxLogo.tsx    # SVG fox logo
│   │       ├── Header.tsx     # Branding header
│   │       ├── FeatureCard.tsx # Feature card grid item
│   │       └── StatusSection.tsx
│   ├── background/            # MV3 service worker
│   │   └── index.ts           # Lifecycle events & logging
│   ├── content/               # Content script (injected into pages)
│   │   └── index.ts           # DOM context entry
│   ├── storage/               # Chrome Storage API wrapper
│   │   └── index.ts           # Type-safe get/save settings
│   ├── utils/                 # Shared utilities
│   │   ├── constants.ts       # App-wide constants & feature flags
│   │   ├── logger.ts          # Color-coded logging utility
│   │   └── types.ts           # Shared TypeScript types
│   └── styles/
│       └── globals.css        # Tailwind directives & custom utilities
├── index.html                 # Popup HTML entry (Vite convention)
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts             # Vite + custom esbuild plugin
├── tailwind.config.ts         # Brand palette & animations
├── postcss.config.js
└── README.md
```

### Build Architecture

The project uses **Vite** for the popup React app and a **custom Vite plugin** that compiles the background service worker and content script as standalone IIFE bundles via esbuild (bundled with Vite).

```
Source                    Build Tool        Output
─────────────────────     ──────────        ──────────────
src/popup/* + index.html  → Vite/React   → dist/index.html + assets/
src/background/index.ts   → esbuild      → dist/background.js (IIFE)
src/content/index.ts      → esbuild      → dist/content.js (IIFE)
public/*                  → Vite copy    → dist/manifest.json + icons/
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **Google Chrome** (latest)

### Installation

```bash
# Clone or navigate to the project
cd focusfox

# Install dependencies
npm install

# Build the extension
npm run build
```

### Load into Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **"Load unpacked"**
4. Select the `dist/` folder from this project
5. The FocusFox icon will appear in your extensions toolbar

### Development

```bash
# Start Vite dev server (popup hot-reload)
npm run dev

# Production build
npm run build
```

> **Note:** `npm run dev` starts a Vite dev server for the popup UI only. To test the full extension (background + content scripts), run `npm run build` and reload the unpacked extension in Chrome.

---

## 🎨 Design System

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `fox-500` | `#f97316` | Primary brand accent |
| `fox-300` | `#fdba74` | Gradient highlights |
| `fox-600` | `#ea580c` | Hover / active states |
| `dark-950` | `#0a0f1e` | Popup background |
| `dark-900` | `#0f172a` | Card backgrounds |

### Typography

- **Font:** Inter (loaded from Google Fonts, system-ui fallback)
- **Weights:** 400 (body), 500 (labels), 600 (headings), 700-800 (brand)

### Components

- **Glass Card** (`.glass-card`) — semi-transparent card with backdrop blur
- **Gradient Text** (`.gradient-text-fox`) — fox-orange gradient text
- **Fox Glow** (`.glow-fox`) — ambient orange box shadow

---

## 🗺 Planned Features

### Phase 2 — Core Features
- **Focus Mode:** Pomodoro-style timer with distraction blocking
- **Dark Mode:** Custom dark theme injection for LMS pages

### Phase 3 — Intelligence
- **Smart Highlights:** AI-powered content highlighting on course pages
- **AI Summary:** One-click course material summarization

### Phase 4 — Polish
- LMS-specific integrations (Moodle, SLIIT CourseWeb)
- Cross-device settings sync
- Chrome Web Store publishing

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Chrome Extensions MV3 | - | Extension platform |
| React | 18.x | Popup UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool + dev server |
| Tailwind CSS | 3.4.x | Utility-first styling |
| esbuild | (via Vite) | Background/content script compilation |

---

## 📄 License

MIT © FocusFox Team
