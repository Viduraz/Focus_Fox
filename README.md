# 🦊 FocusFox

> **AI-powered & DOM-intelligent student productivity Chrome Extension for LMS platforms like Moodle & SLIIT CourseWeb.**

FocusFox helps students focus smarter — blocking distractions, applying comfortable dark themes, highlighting important content, and parsing course pages to extract upcoming exams, quizzes, assignments, and grades into a beautiful productivity dashboard.

---

## 📋 Project Status

| Phase | Status | Scope |
|-------|--------|-------|
| **Phase 1** | ✅ Complete | MV3 Extension bootstrapping, popup UI grid, branding |
| **Phase 2** | ✅ Complete | Injected **Dark Mode** engine scoping Moodle and LMS elements |
| **Phase 3** | ✅ Complete | **Focus Mode** blocking distractions and injecting alert widgets |
| **Phase 4** | ✅ Complete | **Smart Highlight Engine** highlighting key text with color categories |
| **Phase 5** | ✅ Complete | **Exam Radar Detection** parsing LMS DOM text nodes using keywords |
| **Phase 5.5**| ✅ Complete | **Dashboard Redesign** introducing "Next Important Task" and "Alerts" |
| **Phase 6** | ✅ Complete | **Product Polish + Branding** with staggered shimmers, typography, custom accent themes, urgency sensitivity, and real-time syncing settings |

---

## 🏗 Architecture

```
focusfox/
├── public/
│   ├── manifest.json          # Chrome MV3 manifest
│   └── icons/                 # Extension icons (16/48/128px)
├── src/
│   ├── popup/                 # React popup UI (Tailwind CSS)
│   │   ├── main.tsx           # Entry point
│   │   ├── App.tsx            # Root dashboard controller & router
│   │   └── components/        # React UI components
│   │       ├── FoxLogo.tsx    # SVG brand fox logo
│   │       ├── Header.tsx     # Branding header with settings toggle
│   │       ├── FeatureCard.tsx # Grid toggler for main modules
│   │       ├── SettingsView.tsx # Popup settings view (categories, theme, sensitivity)
│   │       ├── ExamRadarButton.tsx # Call-to-action button for Radar
│   │       └── StatusSection.tsx # Extension health indicator
│   ├── background/            # MV3 service worker
│   │   └── index.ts           # Service worker entry
│   ├── content/               # Content script injected into LMS pages
│   │   ├── index.ts           # LMS detection & feature loaders
│   │   ├── darkMode.ts        # Dark Mode injection logic
│   │   ├── focusMode.ts       # Pomodoro & blocker injection
│   │   ├── highlightEngine.ts # Keyword-driven highlight markers
│   │   ├── examRadar.ts       # Re-exports dashboardUI entry point
│   │   └── radar/             # Exam Radar System (Pure TypeScript DOM)
│   │       ├── types.ts       # Shared TypeScript types & state
│   │       ├── detector.ts    # TreeWalker parser extracting DOM TextBlocks
│   │       ├── parser.ts      # Context extractors, regex dates & keywords
│   │       ├── priorityEngine.ts # Urgency scoring & sensitivity offsets
│   │       ├── filters.ts     # Dashboard filtering & category tab mappings
│   │       ├── icons.ts       # Inline SVG templates for Lucide icons
│   │       └── dashboardUI.ts # Side-panel view manager & dynamic styles
│   ├── storage/               # Chrome Storage API wrapper
│   │   └── index.ts           # Type-safe sync storage utils
│   └── utils/                 # Shared utilities
│       ├── constants.ts       # App constants, LMS patterns & feature flags
│       ├── logger.ts          # Prefix-scoped console logger
│       └── types.ts           # Extension configuration interfaces
├── index.html                 # Popup HTML entry (Vite convention)
├── vite.config.ts             # Vite + custom esbuild compiler config
├── tailwind.config.ts         # Popup design system palette & utilities
└── package.json               # Package dependencies & scripts
```

### Build Pipeline

Vite compiles the popup React application, while custom bundler pipelines compile the background service worker and content scripts into standalone IIFE assets:

```
Source File               Compiler          Output Asset
─────────────────────     ──────────        ──────────────────────
src/popup/*               → Vite/React   →  dist/index.html + dist/assets/
src/background/index.ts   → esbuild      →  dist/background.js
src/content/index.ts      → esbuild      →  dist/content.js
public/*                  → static copy  →  dist/manifest.json + dist/icons/
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **Google Chrome**

### Installation & Build

```bash
# Clone the repository and navigate inside
cd focusfox

# Install dependencies
npm install

# Run production build
npm run build
```

### Load Into Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **"Load unpacked"** in the top-left
4. Select the build output directory `dist/` from this project
5. FocusFox is now installed and active! Navigate to a Moodle page or test course page to try it out.

---

## 🎨 Design System & Styling

FocusFox sports a custom dark theme design built with Poppins and Inter typography.

### Accent Customization Themes
The dashboard can be styled in real-time using four accent themes that update CSS custom properties dynamically:
* 🦊 **Fox Orange**: `#f97316` (rgb: `249, 115, 22`)
* 🌊 **Ocean Blue**: `#3b82f6` (rgb: `59, 130, 246`)
* 👑 **Royal Purple**: `#8b5cf6` (rgb: `139, 92, 246`)
* 🌲 **Forest Green**: `#10b981` (rgb: `16, 185, 129`)

### Layout Modes
* **Standard Mode**: Detailed card blocks containing parsed description excerpts and action icons.
* **Compact Mode**: Collapsed layout hiding detail blocks to present a quick list view of deadlines and notices.

### Typography
* **Headers & Brand Elements**: Poppins (Google Fonts)
* **Secondary & Body Details**: Inter (Google Fonts)

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Chrome Extensions MV3 | - | Native Extension Platform |
| React | 18.x | Popup UI View Layer |
| TypeScript | 5.x | Source Type Safety |
| Vite | 5.x | Bundler & Development Server |
| Tailwind CSS | 3.x | Popup Layout & Styling |
| lucide-react | latest | Vector icon components for popup settings |
| esbuild | (via Vite) | High-speed content & background script compiler |

---

## 📄 License

MIT © FocusFox Team
