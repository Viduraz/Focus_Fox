/**
 * FocusFox — Smart Highlight Engine
 *
 * Traverses text nodes in LMS main content views, matching educational keyword boundaries
 * and wrapping them in HSL-balanced, non-intrusive highlight marks.
 * Supports complete restoration/reversibility via DOM normalization.
 */

import { logger } from '../utils/logger';
import { getCombinedRegex, getCategoryForWord } from './keywords';

const CONTEXT = 'HighlightEngine';
const STYLE_ELEMENT_ID = 'focusfox-highlight-styles';

// CSS styling mapping for light and dark modes
const HIGHLIGHT_STYLES_CSS = `
/* Smart Highlight Custom Styles */
.focusfox-highlight {
  border-radius: 3px !important;
  padding: 1px 3px !important;
  margin: 0 1px !important;
  font-weight: 500 !important;
  color: inherit !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
  transition: background-color 0.2s ease, border-color 0.2s ease !important;
}

/* Color codes suited for light & dark themes using semi-transparency */
.focusfox-highlight-important {
  background-color: rgba(234, 179, 8, 0.25) !important;
  border-bottom: 2px solid rgba(234, 179, 8, 0.85) !important;
}

.focusfox-highlight-definition {
  background-color: rgba(34, 197, 94, 0.2) !important;
  border-bottom: 2px solid rgba(34, 197, 94, 0.85) !important;
}

.focusfox-highlight-exam {
  background-color: rgba(239, 68, 68, 0.2) !important;
  border-bottom: 2px solid rgba(239, 68, 68, 0.85) !important;
}

.focusfox-highlight-formula {
  background-color: rgba(59, 130, 246, 0.2) !important;
  border-bottom: 2px solid rgba(59, 130, 246, 0.85) !important;
}

.focusfox-highlight-note {
  background-color: rgba(168, 85, 247, 0.2) !important;
  border-bottom: 2px solid rgba(168, 85, 247, 0.85) !important;
}
`.trim();

/**
 * Injects custom highlight CSS styles into the document head.
 */
function injectStyles(): void {
  let styleEl = document.getElementById(STYLE_ELEMENT_ID) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = STYLE_ELEMENT_ID;
    styleEl.textContent = HIGHLIGHT_STYLES_CSS;
    (document.head || document.documentElement).appendChild(styleEl);
  }
}

/**
 * Traverses the DOM tree starting from root and collects safe text nodes.
 * Ignores scripts, styles, forms inputs, and already highlighted text nodes.
 */
export function scanPageText(root: Node = document.body): Text[] {
  const textNodes: Text[] = [];
  try {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentNode;
          if (!parent) return NodeFilter.FILTER_REJECT;

          const tagName = (parent as Element).tagName;
          if (
            tagName === 'SCRIPT' ||
            tagName === 'STYLE' ||
            tagName === 'TEXTAREA' ||
            tagName === 'INPUT' ||
            tagName === 'NOSCRIPT' ||
            tagName === 'SELECT' ||
            tagName === 'OPTION' ||
            tagName === 'IFRAME' ||
            (parent as Element).classList.contains('focusfox-highlight')
          ) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let currentNode = walker.nextNode();
    while (currentNode) {
      textNodes.push(currentNode as Text);
      currentNode = walker.nextNode();
    }
  } catch (error) {
    logger.error(CONTEXT, 'Failed to scan DOM text nodes', error);
  }
  return textNodes;
}

/**
 * Iterates through a text node, splits it at keyword indices, and replaces
 * it in the DOM with mark elements. Runs in O(N) to prevent double highlighting.
 */
export function wrapTextNodesSafely(node: Text, regex: RegExp): void {
  try {
    const text = node.nodeValue;
    if (!text || !text.trim()) return;

    // Reset RegExp tracking index
    regex.lastIndex = 0;

    const matches: { start: number; end: number; text: string; category: string }[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      const matchedText = match[0];
      const category = getCategoryForWord(matchedText);
      matches.push({
        start: match.index,
        end: match.index + matchedText.length,
        text: matchedText,
        category
      });

      // Avoid infinite loops
      if (match.index === regex.lastIndex) {
        regex.lastIndex++;
      }
    }

    if (matches.length === 0) return;

    const parent = node.parentNode;
    if (!parent) return;

    const newNodes: Node[] = [];
    let lastIndex = 0;

    for (const m of matches) {
      if (m.start > lastIndex) {
        newNodes.push(document.createTextNode(text.substring(lastIndex, m.start)));
      }

      const mark = document.createElement('mark');
      mark.className = `focusfox-highlight focusfox-highlight-${m.category}`;
      mark.textContent = m.text;

      newNodes.push(mark);
      lastIndex = m.end;
    }

    if (lastIndex < text.length) {
      newNodes.push(document.createTextNode(text.substring(lastIndex)));
    }

    newNodes.forEach((newNode) => {
      parent.insertBefore(newNode, node);
    });
    parent.removeChild(node);
  } catch (error) {
    logger.error(CONTEXT, 'Failed to wrap text nodes safely', error);
  }
}

/**
 * Reverts the DOM back to its original state by replacing marks with raw texts.
 * Uses node normalization to rebuild fragmented text nodes.
 */
export function removeHighlights(): void {
  try {
    const marks = document.querySelectorAll('.focusfox-highlight');
    const parents = new Set<Node>();

    marks.forEach((mark) => {
      const parent = mark.parentNode;
      if (parent) {
        const textNode = document.createTextNode(mark.textContent || '');
        parent.replaceChild(textNode, mark);
        parents.add(parent);
      }
    });

    parents.forEach((parent) => {
      parent.normalize();
    });

    const styleEl = document.getElementById(STYLE_ELEMENT_ID);
    if (styleEl) {
      styleEl.remove();
    }

    logger.info(CONTEXT, 'Removed all highlights and cleaned DOM');
  } catch (error) {
    logger.error(CONTEXT, 'Failed to revert highlights', error);
  }
}

/**
 * Scans page and highlights all identified educational keywords.
 */
export function highlightKeywords(): void {
  try {
    const regex = getCombinedRegex();
    injectStyles();

    // Check for Moodle/LMS main content area first to isolate scanning
    const contentSelectors = ['#region-main', '#page-content', '#maincontent', '.main-content'];
    let scanRoot: Node = document.body;
    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        scanRoot = element;
        break;
      }
    }

    const textNodes = scanPageText(scanRoot);
    textNodes.forEach((node) => {
      wrapTextNodesSafely(node, regex);
    });

    logger.info(CONTEXT, 'Smart Highlight Engine scan complete');
  } catch (error) {
    logger.error(CONTEXT, 'Highlight scan failed', error);
  }
}

/**
 * Main application hook to toggle Smart Highlights on/off.
 */
export function applySmartHighlights(state: boolean): void {
  if (state) {
    // Revert existing highlights first to prevent duplicate operations
    removeHighlights();
    highlightKeywords();
  } else {
    removeHighlights();
  }
}
