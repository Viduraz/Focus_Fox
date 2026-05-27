/**
 * Application-wide constants for FocusFox.
 *
 * Centralizes magic strings and configuration values to prevent
 * duplication and enable easy refactoring across extension contexts.
 */

/** Extension metadata */
export const APP_NAME = 'FocusFox' as const;
export const APP_VERSION = '0.1.0' as const;
export const APP_TAGLINE = 'Smart Study Companion' as const;

/**
 * Chrome storage keys — prefixed to avoid collisions with
 * other extensions or page-level storage.
 */
export const STORAGE_KEYS = {
  SETTINGS: 'focusfox_settings',
  FOCUS_MODE: 'focusfox_focus_mode',
  DARK_MODE: 'focusfox_dark_mode',
  HIGHLIGHTS: 'focusfox_highlights',
} as const;

/**
 * LMS platform URL patterns for content script targeting.
 * These will be used in later phases to scope content script injection
 * to specific LMS platforms instead of <all_urls>.
 */
export const LMS_PATTERNS = {
  MOODLE: '*://*.moodle.org/*',
  SLIIT_COURSEWEB: '*://courseware.sliit.lk/*',
} as const;

/**
 * Feature flags for phased rollout.
 * Phase 1: All features are disabled (UI placeholders only).
 * Subsequent phases will enable features incrementally.
 */
export const FEATURES = {
  FOCUS_MODE: true,
  DARK_MODE: true,
  SMART_HIGHLIGHTS: false,
  AI_SUMMARY: false,
} as const;
