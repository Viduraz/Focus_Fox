import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FeatureCard } from './components/FeatureCard';
import { StatusSection } from './components/StatusSection';
import type { FeatureCardConfig, ExtensionSettings } from '../utils/types';
import { getSettings, saveSettings } from '../storage';
import { FEATURES } from '../utils/constants';

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
  const [settings, setSettings] = useState<ExtensionSettings | null>(null);

  // Load settings from sync storage on mount
  useEffect(() => {
    async function loadSettings() {
      const loaded = await getSettings();
      setSettings(loaded);
    }
    loadSettings();
  }, []);

  // Handle toggling of features
  const handleFeatureToggle = async (id: string) => {
    if (!settings) return;

    const updatedFeatures = { ...settings.features };

    if (id === 'dark-mode') {
      updatedFeatures.darkMode = !updatedFeatures.darkMode;
    } else if (id === 'focus-mode') {
      updatedFeatures.focusMode = !updatedFeatures.focusMode;
    } else if (id === 'smart-highlights') {
      updatedFeatures.smartHighlights = !updatedFeatures.smartHighlights;
    } else if (id === 'ai-summary') {
      updatedFeatures.aiSummary = !updatedFeatures.aiSummary;
    }

    // React state update
    const updatedSettings = {
      ...settings,
      features: updatedFeatures,
    };
    setSettings(updatedSettings);

    // Save to chrome.storage.sync
    await saveSettings({ features: updatedFeatures });
  };

  const featureConfigs: FeatureCardConfig[] = [
    {
      id: 'focus-mode',
      icon: '🎯',
      title: 'Focus Mode',
      description: 'Block distractions & stay on task',
      color: 'fox',
      enabled: FEATURES.FOCUS_MODE,
    },
    {
      id: 'dark-mode',
      icon: '🌙',
      title: 'Dark Mode',
      description: 'Easy on your eyes',
      color: 'purple',
      enabled: FEATURES.DARK_MODE,
    },
    {
      id: 'smart-highlights',
      icon: '✨',
      title: 'Highlights',
      description: 'Smart content markers',
      color: 'blue',
      enabled: FEATURES.SMART_HIGHLIGHTS,
    },
    {
      id: 'ai-summary',
      icon: '🤖',
      title: 'AI Summary',
      description: 'Instant course insights',
      color: 'green',
      enabled: FEATURES.AI_SUMMARY,
    },
  ];

  return (
    <div className="w-[380px] min-h-[520px] bg-dark-950 text-white font-sans relative overflow-hidden">
      {/* Ambient background gradient — subtle fox-orange glow from top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-fox-500/[0.04] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <Header />

        <main className="px-4 pb-5">
          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {featureConfigs.map((feature) => {
              // Determine if feature is checked based on storage settings state
              const isChecked = settings
                ? (feature.id === 'dark-mode' ? settings.features.darkMode :
                  feature.id === 'focus-mode' ? settings.features.focusMode :
                    feature.id === 'smart-highlights' ? settings.features.smartHighlights :
                      feature.id === 'ai-summary' ? settings.features.aiSummary : false)
                : false;

              return (
                <FeatureCard
                  key={feature.id}
                  {...feature}
                  checked={isChecked}
                  onClick={() => handleFeatureToggle(feature.id)}
                />
              );
            })}
          </div>

          <StatusSection />
        </main>
      </div>
    </div>
  );
}

export default App;
