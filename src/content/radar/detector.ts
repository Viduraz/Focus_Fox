/**
 * FocusFox — Radar Detector (Phase 5.5)
 *
 * Collects raw visible text blocks from the LMS page together with a
 * reference to the best scrollable DOM ancestor. The element reference is
 * threaded through into each RadarFinding so the dashboard can scroll-to-source
 * when a card is clicked.
 *
 * Design decisions:
 *  - Scope scanning to LMS content roots to avoid nav / sidebar noise.
 *  - Skip elements not visible to the user (display:none, visibility:hidden).
 *  - Exclude our own injected DOM elements to prevent self-detection loops.
 *  - Return the closest block-level ancestor as the scroll target so the
 *    viewport lands on a visually meaningful chunk of content.
 */

import { logger } from '../../utils/logger';

const CONTEXT = 'RadarDetector';

/** HTML tags whose text content is never meaningful for academic detection. */
const SKIP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME',
  'TEXTAREA', 'INPUT', 'SELECT', 'OPTION',
  'CODE', 'PRE',
]);

/** Preferred LMS content-root selectors, checked in order (most specific first). */
const CONTENT_SELECTORS = [
  '#region-main',        // Moodle standard
  '#page-content',
  '#maincontent',
  '.main-content',
  '[role="main"]',
  'main',
  'article',
];

/** CSS selectors for DOM regions we always want to skip. */
const CLUTTER_SELECTOR =
  'nav, aside, footer, header, ' +
  '[role="navigation"], [role="complementary"], [role="banner"], [role="contentinfo"], ' +
  '.breadcrumb, .navbar, .sidebar, .menu, .block_navigation, .block_settings';

/** Block-level tags that make good scroll targets. */
const BLOCK_TAGS = new Set([
  'DIV', 'P', 'LI', 'TR', 'TD', 'TH',
  'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'ARTICLE', 'SECTION', 'BLOCKQUOTE',
  'DETAILS', 'SUMMARY', 'FIGURE',
]);

function getContentRoot(): Element {
  for (const sel of CONTENT_SELECTORS) {
    const el = document.querySelector(sel);
    if (el) {
      logger.debug(CONTEXT, `Using content root: ${sel}`);
      return el;
    }
  }
  logger.debug(CONTEXT, 'Falling back to document.body');
  return document.body;
}

/**
 * Walks up the DOM from `el` to find the nearest block-level ancestor.
 * Falls back to `el` itself if none is found within 8 levels.
 */
function getBlockAncestor(el: Element): Element {
  let cur: Element | null = el;
  let depth = 0;
  while (cur && depth < 8) {
    if (BLOCK_TAGS.has(cur.tagName)) return cur;
    cur = cur.parentElement;
    depth++;
  }
  return el;
}

// ─── Public types ─────────────────────────────────────────────────────────────

/** A raw text block together with a live reference to its DOM source element. */
export interface TextBlock {
  text: string;
  /** Nearest block-level ancestor of the text node — used as the scroll target. */
  element: Element;
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Walks the LMS content root and returns all visible, meaningful text blocks.
 * Each block carries the text string AND the DOM element it came from so
 * callers can scroll the page to the source location.
 *
 * Text nodes shorter than 10 characters are skipped to reduce noise.
 */
export function collectTextBlocks(): TextBlock[] {
  const root = getContentRoot();
  const blocks: TextBlock[] = [];

  try {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;

        // Skip invisible elements
        try {
          const cs = getComputedStyle(parent);
          if (
            cs.display === 'none' ||
            cs.visibility === 'hidden' ||
            cs.opacity === '0'
          ) return NodeFilter.FILTER_REJECT;
        } catch {
          return NodeFilter.FILTER_REJECT;
        }

        // Skip non-content HTML tags
        if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;

        // Skip our own panel / injected nodes
        if (
          parent.id?.startsWith('focusfox-') ||
          parent.id?.startsWith('ff-') ||
          parent.className?.toString().includes('focusfox-') ||
          parent.className?.toString().includes('ff-')
        ) return NodeFilter.FILTER_REJECT;

        // Skip navigational chrome
        if (parent.closest(CLUTTER_SELECTOR)) return NodeFilter.FILTER_REJECT;

        return NodeFilter.FILTER_ACCEPT;
      },
    });

    let node = walker.nextNode();
    while (node) {
      const text = (node.nodeValue ?? '').trim();
      if (text.length >= 10 && node.parentElement) {
        blocks.push({
          text,
          element: getBlockAncestor(node.parentElement),
        });
      }
      node = walker.nextNode();
    }
  } catch (err) {
    logger.error(CONTEXT, 'TreeWalker failed', err);
  }

  logger.debug(CONTEXT, `Collected ${blocks.length} text blocks`);
  return blocks;
}
