/**
 * FocusFox — Radar Parser (Phase 5.5)
 *
 * Converts raw TextBlock objects into structured RadarFinding objects.
 *
 * Steps per block:
 *  1. Search for category keywords (longest-match-first to prevent false sub-matches).
 *  2. Extract the surrounding sentence as the context window.
 *  3. Split context into a short title + supporting description.
 *  4. Detect an optional date string within the context.
 *  5. Deduplicate via a fingerprint key so re-scans don't duplicate.
 *  6. Attach the source Element so the dashboard can scroll-to-source.
 */

import type { RadarCategory, RadarFinding, UrgencyLevel } from './types';
import type { TextBlock } from './detector';

// ─── Keyword config ───────────────────────────────────────────────────────────

/**
 * Keywords are sorted longest-first per category so multi-word phrases
 * ("final examination") beat shorter partial matches ("exam").
 */
const PATTERNS: Record<
  RadarCategory,
  { keywords: string[]; urgency: UrgencyLevel }
> = {
  exam: {
    keywords: [
      'final examination', 'end-semester examination', 'midterm examination',
      'end semester exam', 'final exam', 'mid exam', 'midterm exam',
      'midterm', 'examination', 'exam',
    ],
    urgency: 'high',
  },
  quiz: {
    keywords: [
      'online quiz', 'quiz attempt', 'multiple choice question',
      'multiple choice', 'viva voce', 'quiz', 'mcq', 'viva',
    ],
    urgency: 'high',
  },
  assignment: {
    keywords: [
      'group coursework', 'individual coursework', 'lab report',
      'group project', 'individual project', 'coursework',
      'assignment', 'report', 'project',
    ],
    urgency: 'medium',
  },
  deadline: {
    keywords: [
      'closing date', 'submission deadline', 'final date',
      'due date', 'submit by', 'due on', 'deadline', 'due:',
    ],
    urgency: 'high',
  },
  submission: {
    keywords: [
      'submission portal', 'turnitin submission', 'turnitin',
      'hand in', 'upload your', 'submit your', 'submission',
    ],
    urgency: 'medium',
  },
  marks: {
    keywords: [
      'marks released', 'grade released', 'marks available',
      'out of 100', 'marks', 'percentage', 'grade', 'credit hours',
    ],
    urgency: 'low',
  },
  important: {
    keywords: [
      'important notice', 'please note that', 'mandatory attendance',
      'compulsory attendance', 'attention required',
      'mandatory', 'compulsory', 'important', 'urgent', 'notice',
    ],
    urgency: 'medium',
  },
};

// ─── Date detection ───────────────────────────────────────────────────────────

/**
 * Ordered list of date patterns. Longer/more-specific patterns come first
 * so "14th June 2026" matches before a bare "June".
 */
const DATE_REGEXES: RegExp[] = [
  // "14th June 2026" / "14 June"
  /\b(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)(?:\s+\d{4})?)\b/i,
  // "June 14, 2026" / "June 14"
  /\b((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?)\b/i,
  // "14/06/2026" or "14-06-26"
  /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/,
  // Relative: "tomorrow", "tonight", "next Friday", "this Monday"
  /\b(today|tonight|tomorrow|next\s+(?:week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)|this\s+(?:friday|monday|tuesday|wednesday|thursday|saturday|sunday)|(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/i,
  // "Week 5", "Week 12"
  /\b(week\s+\d{1,2})\b/i,
];

function extractDate(text: string): string | undefined {
  for (const re of DATE_REGEXES) {
    const m = re.exec(text);
    if (m) return m[1].trim();
  }
  return undefined;
}

// ─── Sentence extraction ──────────────────────────────────────────────────────

/**
 * Returns the sentence that contains `keyIdx` within `text`.
 * Falls back to a ±80-char window if the sentence is too long or short.
 */
function extractSentence(text: string, keyIdx: number): string {
  const breakers = /[.!?\n\r;|]/g;
  let start = 0;
  let end = text.length;
  let m: RegExpExecArray | null;

  breakers.lastIndex = 0;
  while ((m = breakers.exec(text)) !== null) {
    if (m.index < keyIdx) {
      start = m.index + 1;
    } else {
      end = m.index;
      break;
    }
  }

  const sentence = text.slice(start, end).trim();
  if (sentence.length >= 10 && sentence.length <= 280) return sentence;

  // Fallback: windowed context
  const s = Math.max(0, keyIdx - 70);
  const e = Math.min(text.length, keyIdx + 160);
  return (s > 0 ? '…' : '') + text.slice(s, e).trim() + (e < text.length ? '…' : '');
}

// ─── Title / description split ────────────────────────────────────────────────

function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/**
 * Attempts to split a sentence into a concise title and a supporting description.
 * Uses colon, em-dash, or en-dash as natural split points.
 * Falls back to a word-boundary truncation if nothing suitable is found.
 */
function splitContent(text: string): { title: string; description: string } {
  // Colon split — "Assignment 2: Research Report Submission"
  const ci = text.indexOf(':');
  if (ci > 3 && ci < 70) {
    const t = text.slice(0, ci).trim();
    const d = text.slice(ci + 1).trim();
    if (t.length > 3 && d.length > 3) return { title: cap(t), description: cap(d) };
  }

  // Em/en-dash split — "Quiz 2 – closes tonight"
  const di = text.search(/\s[–—\-]{1,2}\s/);
  if (di > 3 && di < 70) {
    const t = text.slice(0, di).trim();
    const d = text.slice(di).replace(/^[\s–—\-]+/, '').trim();
    if (t.length > 3 && d.length > 3) return { title: cap(t), description: cap(d) };
  }

  // Word-boundary truncation for long sentences
  if (text.length > 75) {
    const brk = text.lastIndexOf(' ', 68);
    if (brk > 20) {
      return {
        title: cap(text.slice(0, brk).trim()),
        description: text.slice(brk).trim(),
      };
    }
  }

  return { title: cap(text), description: '' };
}

// ─── Parser public API ────────────────────────────────────────────────────────

let _idCounter = 0;

/**
 * Converts an array of TextBlock objects into deduplicated RadarFinding objects.
 * Each block is checked against all categories; at most one finding per
 * (block × category) pair is emitted.
 *
 * The `sourceElement` from the TextBlock is stored on the finding so the
 * dashboard can scroll to the DOM source when a card is clicked.
 */
export function parseFindings(blocks: TextBlock[]): RadarFinding[] {
  const findings: RadarFinding[] = [];
  const seen = new Set<string>();

  for (const { text: block, element: sourceElement } of blocks) {
    const lower = block.toLowerCase();

    for (const [cat, { keywords, urgency }] of Object.entries(PATTERNS) as [
      RadarCategory,
      { keywords: string[]; urgency: UrgencyLevel },
    ][]) {
      let matched = false;

      for (const kw of keywords) {
        const idx = lower.indexOf(kw);
        if (idx === -1) continue;

        const sentence = extractSentence(block, idx);

        // Deduplication fingerprint: category + first 55 chars of normalised sentence
        const key = `${cat}::${sentence.toLowerCase().replace(/\s+/g, ' ').slice(0, 55)}`;
        if (seen.has(key)) { matched = true; break; }
        seen.add(key);

        const date = extractDate(sentence) ?? extractDate(block);
        const { title, description } = splitContent(sentence);

        findings.push({
          id: `rf-${++_idCounter}`,
          category: cat,
          title,
          description,
          urgency,
          detectedDate: date,
          isNew: true,
          score: 0, // filled later by priorityEngine
          sourceElement,  // live DOM reference for scroll-to-source
        });

        matched = true;
        break; // one match per (block × category)
      }

      if (matched) continue;
    }
  }

  return findings;
}
