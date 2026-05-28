import type { RadarSettings } from '../../utils/types';

export type { RadarSettings };

// ─── Core domain types ────────────────────────────────────────────────────────

/** The seven academic content categories the detector recognises. */
export type RadarCategory =
  | 'exam'
  | 'quiz'
  | 'assignment'
  | 'deadline'
  | 'submission'
  | 'marks'
  | 'important';

/** Three-tier urgency system used for sorting and badge colouring. */
export type UrgencyLevel = 'high' | 'medium' | 'low';

/** Active filter tab in the dashboard. */
export type FilterTab = 'all' | 'exams' | 'assignments' | 'deadlines' | 'important';

// ─── Finding ─────────────────────────────────────────────────────────────────

/**
 * A single academic item detected on the page.
 * `title` is the short heading; `description` is the supporting detail.
 * `score` is computed by the priority engine for sorting.
 */
export interface RadarFinding {
  id: string;
  category: RadarCategory;
  title: string;
  description: string;
  urgency: UrgencyLevel;
  detectedDate?: string; // human-readable, e.g. "June 14" or "tomorrow"
  isNew: boolean;           // true on first scan; cleared on re-scan
  score: number;            // priority score, higher = more important
  sourceElement?: Element;  // live DOM node where the text was found (for scroll-to-source)
}

// ─── UI metadata ─────────────────────────────────────────────────────────────

/** Visual representation metadata for a category. */
export interface CategoryMeta {
  icon: string;
  label: string;
  color: string;   // CSS hex/rgb for text/accents
  bgColor: string; // CSS rgba for pill backgrounds
}

// ─── Dashboard state ─────────────────────────────────────────────────────────

/**
 * Mutable runtime state for the dashboard UI.
 * Managed entirely inside dashboardUI.ts; not persisted.
 */
export interface DashboardState {
  findings: RadarFinding[];
  activeFilter: FilterTab;
  collapsedSections: Set<RadarCategory>;
  lastScanAt: number; // Date.now() timestamp
  view: 'dashboard' | 'settings';
  radarSettings: RadarSettings;
}
