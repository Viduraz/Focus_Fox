/**
 * FocusFox — Radar Priority Engine (Phase 5.5)
 *
 * Assigns a numeric score to each RadarFinding based on:
 *  - Category weight (deadline & exam highest)
 *  - Urgency tier (+8 / +4 / +0)
 *  - Detected date proximity (+15 today, +12 tomorrow, +8 day-of-week, +5 next week)
 *
 * Exposes helpers used by the dashboard to select the "Next Important Task"
 * and the "Latest Alerts" strip.
 */

import type { RadarFinding, RadarCategory, UrgencyLevel, RadarSettings } from './types';

// ─── Scoring tables ───────────────────────────────────────────────────────────

/** Base priority by academic category (higher = shown first). */
const CAT_BASE: Record<RadarCategory, number> = {
  deadline:   12,
  exam:        10,
  quiz:         8,
  assignment:   6,
  submission:   5,
  important:    4,
  marks:        2,
};

const URG_BONUS: Record<UrgencyLevel, number> = {
  high:   8,
  medium: 4,
  low:    0,
};

// ─── Date proximity bonus ─────────────────────────────────────────────────────

const EXACT_DATE_WORDS: Record<string, number> = {
  today:     15,
  tonight:   15,
  tomorrow:  12,
  monday:     8, tuesday: 8, wednesday: 8,
  thursday:   8, friday:   8, saturday:  8, sunday: 8,
};

function dateProximityBonus(detectedDate?: string): number {
  if (!detectedDate) return 0;

  const d = detectedDate.toLowerCase();

  for (const [word, bonus] of Object.entries(EXACT_DATE_WORDS)) {
    if (d.includes(word)) return bonus;
  }

  if (d.includes('next week')) return 5;
  if (/week\s+\d/.test(d)) return 3;

  // Any other recognisable date → small boost for having a date
  return 2;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Computes and attaches a priority score to each finding, then sorts
 * the array descending (highest score first).
 * Respects user settings for disabled categories and urgency sensitivity.
 */
export function applyScores(
  findings: RadarFinding[],
  settings?: RadarSettings,
): RadarFinding[] {
  // Filter by enabled categories
  let filtered = findings;
  if (settings?.enabledCategories) {
    filtered = findings.filter((f) => settings.enabledCategories[f.category] !== false);
  }

  return filtered
    .map((f) => {
      let urgency = f.urgency;
      let sensitivityBonus = 0;

      if (settings?.urgencySensitivity === 'high') {
        sensitivityBonus = 5;
        if (urgency === 'low') {
          urgency = 'medium';
        } else if (urgency === 'medium') {
          urgency = 'high';
        }
      } else if (settings?.urgencySensitivity === 'relaxed') {
        sensitivityBonus = -3;
        // Don't downgrade exams or deadlines, only other categories
        if (f.category !== 'exam' && f.category !== 'deadline') {
          if (urgency === 'high') {
            urgency = 'medium';
          } else if (urgency === 'medium') {
            urgency = 'low';
          }
        }
      }

      return {
        ...f,
        urgency,
        score:
          CAT_BASE[f.category] +
          URG_BONUS[urgency] +
          dateProximityBonus(f.detectedDate) +
          sensitivityBonus,
      };
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * Returns the single highest-priority finding to pin as "Next Important Task".
 * Returns null if the list is empty.
 */
export function getTopTask(findings: RadarFinding[]): RadarFinding | null {
  return findings.length > 0 ? findings[0] : null;
}

/**
 * Returns the most important alerts (high + medium urgency only)
 * for the compact alert strip, capped at `max` items.
 */
export function getAlerts(findings: RadarFinding[], max = 5): RadarFinding[] {
  return findings
    .filter((f) => f.urgency === 'high' || f.urgency === 'medium')
    .slice(0, max);
}
