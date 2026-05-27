/**
 * Chrome Storage API wrapper for FocusFox.
 *
 * Architecture Decision:
 * Using chrome.storage.local for persistence across browser sessions.
 * This will migrate to chrome.storage.sync when cross-device syncing
 * is needed in later phases.
 *
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
    aiSummary: false,
  },
  version: APP_VERSION,
  installedAt: Date.now(),
  lastActiveAt: Date.now(),
};

/**
 * Retrieves current extension settings from chrome.storage.local.
 * Returns default settings if none are persisted yet.
 */
export async function getSettings(): Promise<ExtensionSettings> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
    return (result[STORAGE_KEYS.SETTINGS] as ExtensionSettings) ?? DEFAULT_SETTINGS;
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
    await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: updated });
    logger.info(CONTEXT, 'Settings saved successfully');
  } catch (error) {
    logger.error(CONTEXT, 'Failed to save settings', error);
  }
}
