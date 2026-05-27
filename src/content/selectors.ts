/**
 * FocusFox — LMS Selectors Engine
 *
 * Centralizes DOM selectors for LMS platforms (Moodle, SLIIT CourseWeb, etc.)
 * to identify distractions (sidebars, blocks, headers, footers) and the main content area.
 */

export interface LMSSelectors {
  // Elements that represent distractions to hide in Focus Mode
  distractions: string[];
  // Elements representing main study content to expand
  mainContent: string[];
  // Specific headers/navbars targeted for the hover-reveal effect
  navbars: string[];
}

export const LMS_SELECTORS: LMSSelectors = {
  distractions: [
    // Left/Right side panels & drawers
    '#nav-drawer',
    '.drawer',
    '[data-region="drawer"]',
    '#block-region-side-pre',
    '#block-region-side-post',
    '.block-region',
    'aside[id*="block-region"]',
    '.columnleft',
    '.columnright',
    '.nav-drawer',
    
    // Sidebar blocks & widgets
    '.block',
    '.card.block',
    '[data-block]',
    '.block-cards',
    '.block-timeline',
    '.block-myoverview',
    
    // Page footers
    'footer',
    '#page-footer',
    '.footer',
    
    // Breadcrumb buttons and secondary sub-nav headers (safe hide)
    '.breadcrumb-button',
    '.page-header-headings',
    '#page-navbar',
  ],
  
  mainContent: [
    '#region-main',
    '#page-content',
    '#maincontent',
    '.main-content',
    '.col-md-9',
    '.col-lg-9',
    '#region-main-box',
  ],
  
  navbars: [
    'nav.navbar',
    '.fixed-top',
    '#header',
    'header',
    '.top-bar',
    '#page-header',
  ],
};
