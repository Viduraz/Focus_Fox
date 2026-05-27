/**
 * FocusFox — Content Script
 *
 * Injected into web pages. Checks if the page is a supported LMS platform
 * (Moodle, SLIIT CourseWeb, or custom Moodle instances) and applies/toggles
 * the Phase 2 Dark Mode system.
 */

import { logger } from '../utils/logger';
import { getSettings } from '../storage';
import { STORAGE_KEYS } from '../utils/constants';
import { applyDarkMode } from './darkMode';

const CONTEXT = 'Content';

/**
 * Robust LMS platform detector.
 * Checks hostnames, meta generator tags, and specific body classes.
 */
function isLMSPage(): boolean {
  try {
    const hostname = window.location.hostname.toLowerCase();

    // 1. Hostname/Domain matching
    const isMatchedDomain =
      hostname.includes('moodle') ||
      hostname.includes('courseweb') ||
      hostname.includes('sliit.lk') ||
      hostname.includes('lms.');

    if (isMatchedDomain) return true;

    // 2. Meta tags check (Moodle self-hosted tags)
    const metaGenerator = document.querySelector('meta[name="generator"]');
    if (
      metaGenerator &&
      metaGenerator.getAttribute('content')?.toLowerCase().includes('moodle')
    ) {
      return true;
    }

    // 3. Body attributes/classes check
    if (
      document.body &&
      (document.body.id.startsWith('page-course') ||
        document.body.id.startsWith('page-site') ||
        document.body.classList.contains('moodle') ||
        document.body.className.includes('moodle-'))
    ) {
      return true;
    }
  } catch (error) {
    logger.error(CONTEXT, 'Error detecting LMS page', error);
  }

  return false;
}

/**
 * Initializes the content script.
 * Scopes execution only to verified LMS platforms.
 */
async function initialize() {
  if (!isLMSPage()) {
    logger.debug(CONTEXT, 'Not an LMS platform. Exiting content script.');
    return;
  }

  logger.info(CONTEXT, 'FocusFox active on LMS platform');

  // Load initial dark mode state
  const settings = await getSettings();
  if (settings && settings.features) {
    applyDarkMode(settings.features.darkMode);
  }

  // Listen for real-time toggles from chrome.storage.sync
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync' && changes[STORAGE_KEYS.SETTINGS]) {
      const updatedSettings = changes[STORAGE_KEYS.SETTINGS].newValue;
      if (updatedSettings && updatedSettings.features) {
        logger.info(
          CONTEXT,
          `Dark Mode settings changed to: ${updatedSettings.features.darkMode}`,
        );
        applyDarkMode(updatedSettings.features.darkMode);
      }
    }
  });
}

// Kick off initialization
initialize();
