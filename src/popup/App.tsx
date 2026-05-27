import { Header } from './components/Header';
import { FeatureCard } from './components/FeatureCard';
import { StatusSection } from './components/StatusSection';
import type { FeatureCardConfig } from '../utils/types';

/**
 * Feature card configurations for the popup grid.
 *
 * Phase 1: All features are disabled (placeholder UI only).
 * Each card shows a "Soon" badge and logs a click to console.
 */
const features: FeatureCardConfig[] = [
  {
    id: 'focus-mode',
    icon: '🎯',
    title: 'Focus Mode',
    description: 'Block distractions & stay on task',
    color: 'fox',
    enabled: false,
  },
  {
    id: 'dark-mode',
    icon: '🌙',
    title: 'Dark Mode',
    description: 'Easy on your eyes',
    color: 'purple',
    enabled: false,
  },
  {
    id: 'smart-highlights',
    icon: '✨',
    title: 'Highlights',
    description: 'Smart content markers',
    color: 'blue',
    enabled: false,
  },
  {
    id: 'ai-summary',
    icon: '🤖',
    title: 'AI Summary',
    description: 'Instant course insights',
    color: 'green',
    enabled: false,
  },
];

/**
 * Root popup application shell.
 *
 * Layout:
 * ┌──────────────────┐
 * │  Header / Brand  │
 * ├──────────────────┤
 * │  Feature Grid    │
 * │  (2×2 cards)     │
 * ├──────────────────┤
 * │  Status Section  │
 * └──────────────────┘
 */
function App() {
  const handleFeatureClick = (id: string) => {
    console.log(`[FocusFox] Feature "${id}" clicked — coming soon!`);
  };

  return (
    <div className="w-[380px] min-h-[520px] bg-dark-950 text-white font-sans relative overflow-hidden">
      {/* Ambient background gradient — subtle fox-orange glow from top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-fox-500/[0.04] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <Header />

        <main className="px-4 pb-5">
          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {features.map((feature) => (
              <FeatureCard
                key={feature.id}
                {...feature}
                onClick={() => handleFeatureClick(feature.id)}
              />
            ))}
          </div>

          <StatusSection />
        </main>
      </div>
    </div>
  );
}

export default App;
