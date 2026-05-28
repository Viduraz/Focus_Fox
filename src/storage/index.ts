/**
 * Chrome Storage API wrapper for FocusFox.
 *
 * Architecture Decision:
 * Using chrome.storage.sync for persistence across browser sessions and devices.
 * All reads/writes are wrapped with error handling and logging to
 * prevent silent storage failures.
 */

import type { ExtensionSettings } from '../utils/types';
import { STORAGE_KEYS, APP_VERSION } from '../utils/constants';
import { logger } from '../utils/logger';

const CONTEXT = 'Storage';

/** Default settings applied on fresh installations */
const DEFAULT_SETTINGS: ExtensionSettings = {
  features: {
    focusMode: false,
    darkMode: false,
    smartHighlights: false,
    examRadar: false,
  },
  radarSettings: {
    enabledCategories: {
      exam: true,
      quiz: true,
      assignment: true,
      deadline: true,
      submission: true,
      marks: true,
      important: true,
    },
    compactMode: false,
    colorTheme: 'fox',
    urgencySensitivity: 'standard',
  },
  version: APP_VERSION,
  installedAt: Date.now(),
  lastActiveAt: Date.now(),
};

/**
 * Retrieves current extension settings from chrome.storage.sync.
 * Returns default settings if none are persisted yet.
 */
export async function getSettings(): Promise<ExtensionSettings> {
  try {
    const result = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
    const retrieved = result[STORAGE_KEYS.SETTINGS] as ExtensionSettings | undefined;
    if (!retrieved) return DEFAULT_SETTINGS;

    return {
      ...DEFAULT_SETTINGS,
      ...retrieved,
      features: {
        ...DEFAULT_SETTINGS.features,
        ...(retrieved.features ?? {}),
      },
      radarSettings: {
        ...DEFAULT_SETTINGS.radarSettings,
        ...(retrieved.radarSettings ?? {}),
        enabledCategories: {
          ...DEFAULT_SETTINGS.radarSettings.enabledCategories,
          ...(retrieved.radarSettings?.enabledCategories ?? {}),
        }
      }
    };
  } catch (error) {
    logger.error(CONTEXT, 'Failed to retrieve settings', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Merges partial updates into persisted settings.
 * Automatically updates the `lastActiveAt` timestamp.
 */
export async function saveSettings(
  settings: Partial<ExtensionSettings>,
): Promise<void> {
  try {
    const current = await getSettings();
    const updated: ExtensionSettings = {
      ...current,
      ...settings,
      lastActiveAt: Date.now(),
    };
    await chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: updated });
    logger.info(CONTEXT, 'Settings saved successfully');
  } catch (error) {
    logger.error(CONTEXT, 'Failed to save settings', error);
  }
}
