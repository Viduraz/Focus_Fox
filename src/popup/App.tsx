import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FeatureCard } from './components/FeatureCard';
import { ExamRadarButton } from './components/ExamRadarButton';
import { StatusSection } from './components/StatusSection';
import type { FeatureCardConfig, ExtensionSettings } from '../utils/types';
import { getSettings, saveSettings } from '../storage';
import { FEATURES } from '../utils/constants';

/**
 * Root popup application shell — Phase 5.5
 *
 * Layout:
 * ┌──────────────────┐
 * │  Header / Brand  │
 * ├──────────────────┤
 * │  Feature Grid    │
 * │  (3 cards + CTA) │
 * ├──────────────────┤
 * │  Error notice?   │ ← shown only when Exam Radar can't reach the page
 * ├──────────────────┤
 * │  Status Section  │
 * └──────────────────┘
 */
function App() {
  const [settings, setSettings] = useState<ExtensionSettings | null>(null);
  const [radarLoading, setRadarLoading] = useState(false);
  const [radarError, setRadarError] = useState<string | null>(null);

  // Load settings from sync storage on mount
  useEffect(() => {
    async function loadSettings() {
      const loaded = await getSettings();
      setSettings(loaded);
    }
    loadSettings();
  }, []);

  // Handle toggling of toggle-style features
  const handleFeatureToggle = async (id: string) => {
    if (!settings) return;

    const updatedFeatures = { ...settings.features };

    if (id === 'dark-mode') {
      updatedFeatures.darkMode = !updatedFeatures.darkMode;
    } else if (id === 'focus-mode') {
      updatedFeatures.focusMode = !updatedFeatures.focusMode;
    } else if (id === 'smart-highlights') {
      updatedFeatures.smartHighlights = !updatedFeatures.smartHighlights;
    }

    const updatedSettings = { ...settings, features: updatedFeatures };
    setSettings(updatedSettings);
    await saveSettings({ features: updatedFeatures });
  };

  /**
   * Sends TOGGLE_EXAM_RADAR to the active tab's content script.
   *
   * Three outcomes:
   *  1. success: true  → panel toggled, close popup so it's visible
   *  2. success: false, reason: 'not_lms_page' → show inline guidance
   *  3. sendMessage throws (script not injected at all) → show inline guidance
   *
   * We never rely on window.close() on failure so the user can read the error.
   */
  const handleExamRadar = async () => {
    setRadarLoading(true);
    setRadarError(null);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (tab?.id == null) {
        setRadarError('No active tab found.');
        setRadarLoading(false);
        return;
      }

      let response: { success: boolean; reason?: string } | undefined;

      try {
        response = await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_EXAM_RADAR' });
      } catch {
        // Content script not reachable — most likely a chrome:// page or the
        // extension was reloaded without refreshing the tab.
        setRadarError('Open a Moodle / LMS page, then try again. (If you just installed FocusFox, refresh the LMS tab first.)');
        setRadarLoading(false);
        return;
      }

      if (response?.success === false && response?.reason === 'not_lms_page') {
        setRadarError('Navigate to your Moodle or LMS page first, then click Exam Radar.');
        setRadarLoading(false);
        return;
      }

      // ✅ Success — close popup so the user sees the slide-in panel
      window.close();
    } catch (err) {
      console.error('[FocusFox] Unexpected error in handleExamRadar', err);
      setRadarError('Something went wrong. Please try again.');
      setRadarLoading(false);
    }
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
  ];

  return (
    <div className="w-[380px] min-h-[520px] bg-dark-950 text-white font-sans relative overflow-hidden">
      {/* Ambient background gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-fox-500/[0.04] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <Header />

        <main className="px-4 pb-5">
          {/* Feature Grid — 3 toggle cards + full-width Exam Radar CTA */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {featureConfigs.map((feature) => {
              const isChecked = settings
                ? (feature.id === 'dark-mode' ? settings.features.darkMode
                  : feature.id === 'focus-mode' ? settings.features.focusMode
                  : feature.id === 'smart-highlights' ? settings.features.smartHighlights
                  : false)
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

            <div className="col-span-2">
              <ExamRadarButton onClick={handleExamRadar} loading={radarLoading} />
            </div>
          </div>

          {/* Inline error / guidance banner */}
          {radarError && (
            <div className="
              mb-3 px-3.5 py-2.5 rounded-xl
              bg-fox-500/[0.08] border border-fox-500/[0.18]
              flex items-start gap-2.5
            ">
              <span className="text-base leading-none mt-0.5 flex-shrink-0">⚠️</span>
              <p className="text-[11.5px] text-white/55 leading-relaxed">
                {radarError}
              </p>
              <button
                onClick={() => setRadarError(null)}
                className="ml-auto flex-shrink-0 text-white/25 hover:text-white/50 text-sm leading-none transition-colors"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          )}

          <StatusSection />
        </main>
      </div>
    </div>
  );
}

export default App;
