/**
 * FocusFox — Radar Filters (Phase 5.5)
 *
 * Maps each dashboard filter tab to the set of RadarCategories it covers,
 * and exposes helpers for filtering and counting findings per tab.
 */

import type { FilterTab, RadarCategory, RadarFinding } from './types';

// ─── Tab configuration ────────────────────────────────────────────────────────

export interface TabConfig {
  id: FilterTab;
  label: string;
  icon: string;
}

export const TABS: TabConfig[] = [
  { id: 'all',         label: 'All',         icon: '🔍' },
  { id: 'exams',       label: 'Exams',       icon: '📝' },
  { id: 'assignments', label: 'Assignments', icon: '📋' },
  { id: 'deadlines',   label: 'Deadlines',   icon: '⏰' },
  { id: 'important',   label: 'Important',   icon: '🔔' },
];

// ─── Tab → category mapping ───────────────────────────────────────────────────

const TAB_CATS: Record<FilterTab, RadarCategory[]> = {
  all:         ['exam', 'quiz', 'assignment', 'deadline', 'submission', 'marks', 'important'],
  exams:       ['exam', 'quiz'],
  assignments: ['assignment', 'submission'],
  deadlines:   ['deadline'],
  important:   ['important', 'marks'],
};

// ─── Public helpers ───────────────────────────────────────────────────────────

/**
 * Returns findings that match the active filter tab.
 * "all" returns the full list (already sorted by priority engine).
 */
export function filterFindings(
  findings: RadarFinding[],
  tab: FilterTab,
): RadarFinding[] {
  if (tab === 'all') return findings;
  const allowed = TAB_CATS[tab];
  return findings.filter((f) => allowed.includes(f.category));
}

/** How many findings are visible under a given tab (for badge counts). */
export function tabCount(findings: RadarFinding[], tab: FilterTab): number {
  return filterFindings(findings, tab).length;
}
