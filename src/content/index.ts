/**
 * FocusFox — Content Script (Phase 5.5)
 *
 * Injected into all pages by manifest. The message listener is registered
 * unconditionally so the popup can always reach it and receive a structured
 * response (including "not an LMS page") rather than a hard connection error.
 *
 * Feature initialisation (dark mode, focus mode, highlights) still only runs
 * on verified LMS platforms.
 */

import { logger } from '../utils/logger';
import { getSettings } from '../storage';
import { STORAGE_KEYS } from '../utils/constants';
import { applyDarkMode } from './darkMode';
import { applyFocusMode } from './focusMode';
import { applySmartHighlights } from './highlightEngine';
import { toggleExamRadar } from './examRadar';

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

    // 2. Meta tags check (Moodle self-hosted instances)
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

// ── Message listener — registered ALWAYS, before the LMS guard ───────────────
//
// Why: the popup sends chrome.tabs.sendMessage and awaits a reply.
// If no listener exists in this context, Chrome throws
// "Could not establish connection. Receiving end does not exist."
// By registering unconditionally we can return a typed error response instead.
//
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'TOGGLE_EXAM_RADAR') return false;

  if (!isLMSPage()) {
    // Let the popup know this tab isn't an LMS page so it can show guidance
    sendResponse({ success: false, reason: 'not_lms_page' });
    return true;
  }

  try {
    toggleExamRadar();
    sendResponse({ success: true });
  } catch (err) {
    logger.error(CONTEXT, 'Failed to toggle Exam Radar', err);
    sendResponse({ success: false, reason: 'toggle_failed' });
  }

  return true; // keep the message channel open for the async sendResponse
});

// ── LMS-only initialisation ───────────────────────────────────────────────────

async function initialize() {
  if (!isLMSPage()) {
    logger.debug(CONTEXT, 'Not an LMS platform — feature init skipped.');
    return;
  }

  logger.info(CONTEXT, 'FocusFox active on LMS platform');

  // Apply saved feature states on page load
  const settings = await getSettings();
  if (settings && settings.features) {
    applyDarkMode(settings.features.darkMode);
    applyFocusMode(settings.features.focusMode);
    applySmartHighlights(settings.features.smartHighlights);
    // Exam Radar is toggle-on-demand — not auto-opened on load
  }

  // Real-time storage listener (toggles from popup switches)
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync' && changes[STORAGE_KEYS.SETTINGS]) {
      const updated = changes[STORAGE_KEYS.SETTINGS].newValue;
      if (updated && updated.features) {
        logger.info(
          CONTEXT,
          `Settings updated — DarkMode:${updated.features.darkMode} ` +
          `FocusMode:${updated.features.focusMode} ` +
          `Highlights:${updated.features.smartHighlights}`,
        );
        applyDarkMode(updated.features.darkMode);
        applyFocusMode(updated.features.focusMode);
        applySmartHighlights(updated.features.smartHighlights);
      }
    }
  });
}

initialize();
