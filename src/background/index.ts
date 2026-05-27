/**
 * FocusFox — Background Service Worker
 *
 * Runs as a Manifest V3 service worker. Handles extension lifecycle
 * events and will route inter-context messages in future phases.
 *
 * Phase 1 Scope:
 * - Log extension install/update events
 * - Confirm service worker activation
 *
 * Future Phases:
 * - chrome.runtime.onMessage handler for popup ↔ content communication
 * - Alarm scheduling for focus mode timers
 * - Context menu registration
 */

import { logger } from '../utils/logger';
import { APP_NAME, APP_VERSION } from '../utils/constants';

const CONTEXT = 'Background';

// ─── Lifecycle Events ────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener((details) => {
  logger.info(
    CONTEXT,
    `${APP_NAME} v${APP_VERSION} — ${details.reason}`,
  );

  if (details.reason === 'install') {
    logger.info(CONTEXT, 'Fresh installation detected. Welcome to FocusFox! 🦊');
  } else if (details.reason === 'update') {
    logger.info(
      CONTEXT,
      `Updated from v${details.previousVersion ?? 'unknown'}`,
    );
  }
});

// ─── Service Worker Activation ───────────────────────────────────────────────

logger.info(CONTEXT, 'Service worker activated');
