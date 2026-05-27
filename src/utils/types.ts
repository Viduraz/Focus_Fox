/**
 * Shared TypeScript type definitions for FocusFox.
 *
 * These types are used across all extension contexts (popup, background,
 * content script) to ensure type-safe communication and storage.
 */

// ─── Feature State ───────────────────────────────────────────────────────────

/** Toggle states for each feature module */
export interface FeatureState {
  focusMode: boolean;
  darkMode: boolean;
  smartHighlights: boolean;
  aiSummary: boolean;
}

// ─── Extension Settings ──────────────────────────────────────────────────────

/** Persisted extension settings stored in chrome.storage.sync */
export interface ExtensionSettings {
  features: FeatureState;
  version: string;
  installedAt: number;
  lastActiveAt: number;
}

// ─── Popup UI Types ──────────────────────────────────────────────────────────

/** Configuration for a feature card in the popup grid */
export interface FeatureCardConfig {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: FeatureColor;
  enabled: boolean;
}

/** Available accent colors for feature cards */
export type FeatureColor = 'fox' | 'purple' | 'blue' | 'green';

// ─── Messaging ───────────────────────────────────────────────────────────────

/**
 * Message protocol for communication between extension contexts.
 * Uses discriminated unions for exhaustive type checking in handlers.
 */
export interface ExtensionMessage {
  type: MessageType;
  payload?: unknown;
}

export type MessageType =
  | 'TOGGLE_FOCUS_MODE'
  | 'TOGGLE_DARK_MODE'
  | 'GET_SETTINGS'
  | 'UPDATE_SETTINGS';
