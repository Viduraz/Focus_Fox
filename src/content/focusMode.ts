/**
 * FocusFox — Focus Mode Injector
 *
 * Transforms complex LMS page layouts into a clean, distraction-free study interface.
 * Hides sidebars, blocks, widgets, and footers, expands the main content area,
 * and converts navigation headers into a smooth hover-to-reveal top bar.
 */

import { logger } from '../utils/logger';
import { LMS_SELECTORS } from './selectors';

const CONTEXT = 'FocusMode';
const STYLE_ELEMENT_ID = 'focusfox-focus-mode-styles';

// CSS styling definitions for Focus Mode
const FOCUS_MODE_CSS = `
/* Scoped Focus Mode Layout overrides */
html[data-focusfox-focus="true"] {
  --focusfox-transition-duration: 0.35s;
}

/* Class applied to manually hidden distraction elements */
.focusfox-focus-hidden {
  display: none !important;
}

/* Adjust page wrapper, page shell and LMS content areas to full width */
html[data-focusfox-focus="true"] #page-content,
html[data-focusfox-focus="true"] #page,
html[data-focusfox-focus="true"] #page-wrapper,
html[data-focusfox-focus="true"] #page-wrapper #page {
  margin-left: 0 !important;
  margin-right: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  width: 100% !important;
  max-width: 100% !important;
  left: 0 !important;
  right: 0 !important;
  transition: all var(--focusfox-transition-duration) cubic-bezier(0.16, 1, 0.3, 1) !important;
}

/* Expand and center primary course study container for ultimate readability */
html[data-focusfox-focus="true"] #region-main,
html[data-focusfox-focus="true"] [role="main"],
html[data-focusfox-focus="true"] #maincontent,
html[data-focusfox-focus="true"] .main-content {
  width: 100% !important;
  max-width: 1050px !important; /* Optimal line length/container width for focus */
  margin: 2rem auto !important;
  padding: 2.5rem !important;
  float: none !important;
  border-radius: 16px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
  transition: all var(--focusfox-transition-duration) cubic-bezier(0.16, 1, 0.3, 1) !important;
}

/* Adjust layout when Dark Mode is also active */
html[data-focusfox-focus="true"][data-focusfox-dark="true"] #region-main,
html[data-focusfox-focus="true"][data-focusfox-dark="true"] [role="main"],
html[data-focusfox-focus="true"][data-focusfox-dark="true"] #maincontent,
html[data-focusfox-focus="true"][data-focusfox-dark="true"] .main-content {
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4) !important;
  background-color: #0f172a !important; /* Premium dark background */
}

/* Prevent horizontal viewport scrollbars */
html[data-focusfox-focus="true"] body {
  overflow-x: hidden !important;
  padding-top: 1.5rem !important;
}

/* Force grids / side-by-side columns to span full width in Focus Mode */
html[data-focusfox-focus="true"] .col-md-9,
html[data-focusfox-focus="true"] .col-lg-9,
html[data-focusfox-focus="true"] .col-md-8,
html[data-focusfox-focus="true"] .col-lg-8 {
  width: 100% !important;
  max-width: 100% !important;
  flex: 0 0 100% !important;
}

html[data-focusfox-focus="true"] .row {
  display: block !important;
}

html[data-focusfox-focus="true"] #region-main-box {
  width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* 🦊 Slide-out Header & Hover-Reveal Effect */
html[data-focusfox-focus="true"] nav.navbar,
html[data-focusfox-focus="true"] .fixed-top,
html[data-focusfox-focus="true"] #header,
html[data-focusfox-focus="true"] header,
html[data-focusfox-focus="true"] .top-bar,
html[data-focusfox-focus="true"] #page-header {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  transform: translateY(-90%) !important; /* Hide 90% of header */
  opacity: 0.15 !important; /* Leave a thin, transparent line at the top */
  z-index: 99999 !important;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease !important;
  pointer-events: auto !important; /* Allow hover triggers */
}

/* Slide header down when hovered or activated by mouse tracker */
html[data-focusfox-focus="true"] nav.navbar:hover,
html[data-focusfox-focus="true"] .fixed-top:hover,
html[data-focusfox-focus="true"] #header:hover,
html[data-focusfox-focus="true"] header:hover,
html[data-focusfox-focus="true"] .top-bar:hover,
html[data-focusfox-focus="true"] #page-header:hover,
html[data-focusfox-focus="true"] .focusfox-header-reveal {
  transform: translateY(0) !important;
  opacity: 1 !important;
}
`.trim();

// Mouse tracking listener for navigation reveal
let mouseMoveListener: ((e: MouseEvent) => void) | null = null;

/**
 * Installs a mouse tracking listener to slide down the header menu
 * when the cursor is brought close to the top boundary of the viewport.
 */
function setupHeaderHoverReveal(): void {
  if (mouseMoveListener) return;

  const headerSelectors = LMS_SELECTORS.navbars.join(', ');
  
  mouseMoveListener = (e: MouseEvent) => {
    const headers = document.querySelectorAll(headerSelectors);
    
    // If cursor reaches top 25px, show header
    if (e.clientY <= 25) {
      headers.forEach((h) => {
        (h as HTMLElement).classList.add('focusfox-header-reveal');
      });
    }
    // If cursor moves below 100px, remove focus reveal if not directly hovering the element
    else if (e.clientY > 100) {
      headers.forEach((h) => {
        const htmlH = h as HTMLElement;
        const rect = htmlH.getBoundingClientRect();
        
        const isHovering =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;

        if (!isHovering) {
          htmlH.classList.remove('focusfox-header-reveal');
        }
      });
    }
  };

  window.addEventListener('mousemove', mouseMoveListener);
}

/**
 * Cleans up the mouse tracking listener and resets header state.
 */
function removeHeaderHoverReveal(): void {
  if (mouseMoveListener) {
    window.removeEventListener('mousemove', mouseMoveListener);
    mouseMoveListener = null;
  }
  
  const headerSelectors = LMS_SELECTORS.navbars.join(', ');
  const headers = document.querySelectorAll(headerSelectors);
  headers.forEach((h) => {
    (h as HTMLElement).classList.remove('focusfox-header-reveal');
  });
}

/**
 * Safely hides or restores elements matching a selector.
 * Protects extension from DOM selector failures using try-catch blocks.
 */
export function safeSelectorHide(selector: string, hide: boolean): void {
  try {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (hide) {
        htmlEl.classList.add('focusfox-focus-hidden');
      } else {
        htmlEl.classList.remove('focusfox-focus-hidden');
      }
    });
  } catch (error) {
    logger.error(CONTEXT, `Failed to safely toggle selector: ${selector}`, error);
  }
}

/**
 * Enables Focus Mode on the page.
 * Injects Focus Mode CSS rules, toggles distraction layout, and sets up hover reveal headers.
 */
export function enableFocusMode(): void {
  try {
    // 1. Inject Focus Mode styles if not already injected
    let styleEl = document.getElementById(STYLE_ELEMENT_ID) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = STYLE_ELEMENT_ID;
      styleEl.textContent = FOCUS_MODE_CSS;
      (document.head || document.documentElement).appendChild(styleEl);
      logger.info(CONTEXT, 'Focus Mode stylesheet injected');
    }

    // 2. Set document dataset to activate styles
    document.documentElement.setAttribute('data-focusfox-focus', 'true');

    // 3. Programmatically hide distraction elements
    LMS_SELECTORS.distractions.forEach((selector) => {
      safeSelectorHide(selector, true);
    });

    // 4. Setup hover reveal navigation bars
    setupHeaderHoverReveal();

    logger.info(CONTEXT, 'Focus Mode enabled successfully');
  } catch (error) {
    logger.error(CONTEXT, 'Failed to enable Focus Mode', error);
  }
}

/**
 * Disables Focus Mode on the page.
 * Restores original spacing, shows hidden sidebars, and removes header triggers.
 */
export function disableFocusMode(): void {
  try {
    // 1. Remove dataset attribute
    document.documentElement.removeAttribute('data-focusfox-focus');

    // 2. Programmatically restore elements
    LMS_SELECTORS.distractions.forEach((selector) => {
      safeSelectorHide(selector, false);
    });

    // 3. Remove hover reveal navigation triggers
    removeHeaderHoverReveal();

    logger.info(CONTEXT, 'Focus Mode disabled successfully');
  } catch (error) {
    logger.error(CONTEXT, 'Failed to disable Focus Mode', error);
  }
}

/**
 * Orchestrates Focus Mode activation based on toggled state.
 */
export function applyFocusMode(state: boolean): void {
  if (state) {
    enableFocusMode();
  } else {
    disableFocusMode();
  }
}
