/**
 * FocusFox — Dark Mode Injector
 *
 * Implements high-quality dark mode styles designed specifically for Moodle-style
 * and SLIIT CourseWeb layouts, ensuring text contrast, link visibility,
 * scrollbars, and inputs are readable and look professional.
 */

import { logger } from '../utils/logger';

const CONTEXT = 'DarkMode';
const STYLE_ELEMENT_ID = 'focusfox-dark-mode-styles';

// Scoped CSS styles matching LMS elements
const DARK_MODE_CSS = `
/* Scoped Dark Mode Styles for LMS (Moodle / CourseWeb) */
html[data-focusfox-dark="true"] {
  background-color: #0b0f19 !important;
  color-scheme: dark !important;
  
  /* CSS Custom Property overrides for modern LMS themes */
  --body-bg: #0b0f19 !important;
  --body-color: #e2e8f0 !important;
  --card-bg: #0f172a !important;
  --card-color: #e2e8f0 !important;
  --light: #1e293b !important;
  --white: #0f172a !important;
  --gray-100: #0f172a !important;
  --gray-200: #1e293b !important;
  --gray-300: #334155 !important;
  --gray-400: #475569 !important;
  --gray-800: #cbd5e1 !important;
  --gray-900: #f1f5f9 !important;
  
  --header-bg: #0f172a !important;
  --header-color: #e2e8f0 !important;
  --navbar-bg: #0f172a !important;
  --navbar-color: #e2e8f0 !important;
  --topbar-bg: #0f172a !important;
  --topbar-color: #e2e8f0 !important;
}

/* Explicit Header, Top Bar, and Navigation Selectors */
html[data-focusfox-dark="true"] header,
html[data-focusfox-dark="true"] #header,
html[data-focusfox-dark="true"] .header,
html[data-focusfox-dark="true"] #page-header,
html[data-focusfox-dark="true"] .fixed-top,
html[data-focusfox-dark="true"] nav,
html[data-focusfox-dark="true"] .navbar,
html[data-focusfox-dark="true"] .top-bar,
html[data-focusfox-dark="true"] [id*="header"],
html[data-focusfox-dark="true"] [class*="header"],
html[data-focusfox-dark="true"] [class*="topnav"],
html[data-focusfox-dark="true"] [id*="topnav"] {
  background-color: #0f172a !important;
  color: #e2e8f0 !important;
  border-color: #1e293b !important;
}

/* nested elements inside topnav / header */
html[data-focusfox-dark="true"] [class*="header"] *,
html[data-focusfox-dark="true"] [id*="header"] *,
html[data-focusfox-dark="true"] .navbar *,
html[data-focusfox-dark="true"] nav * {
  color: #e2e8f0;
}

html[data-focusfox-dark="true"] body,
html[data-focusfox-dark="true"] #page-wrapper,
html[data-focusfox-dark="true"] #page,
html[data-focusfox-dark="true"] #page-content,
html[data-focusfox-dark="true"] #maincontent,
html[data-focusfox-dark="true"] [role="main"],
html[data-focusfox-dark="true"] #region-main,
html[data-focusfox-dark="true"] #nav-drawer,
html[data-focusfox-dark="true"] .drawer,
html[data-focusfox-dark="true"] .card,
html[data-focusfox-dark="true"] .modal-content,
html[data-focusfox-dark="true"] .list-group-item,
html[data-focusfox-dark="true"] .dropdown-menu,
html[data-focusfox-dark="true"] .popover,
html[data-focusfox-dark="true"] blockquote,
html[data-focusfox-dark="true"] pre,
html[data-focusfox-dark="true"] code {
  background-color: #0f172a !important;
  color: #e2e8f0 !important;
  border-color: #1e293b !important;
}

/* Secondary surface containers */
html[data-focusfox-dark="true"] .bg-light,
html[data-focusfox-dark="true"] .bg-white,
html[data-focusfox-dark="true"] .card-body,
html[data-focusfox-dark="true"] .card-header,
html[data-focusfox-dark="true"] .card-footer,
html[data-focusfox-dark="true"] .navbar-light,
html[data-focusfox-dark="true"] .navbar-bootswatch,
html[data-focusfox-dark="true"] nav.fixed-top,
html[data-focusfox-dark="true"] #page-navbar,
html[data-focusfox-dark="true"] .breadcrumb,
html[data-focusfox-dark="true"] .unread,
html[data-focusfox-dark="true"] .table,
html[data-focusfox-dark="true"] .table th,
html[data-focusfox-dark="true"] .table td,
html[data-focusfox-dark="true"] .well,
html[data-focusfox-dark="true"] .jumbotron,
html[data-focusfox-dark="true"] .que .content,
html[data-focusfox-dark="true"] .que .info {
  background-color: #1e293b !important;
  color: #f1f5f9 !important;
  border-color: #334155 !important;
}

/* Specific sidebar and nav items */
html[data-focusfox-dark="true"] .list-group-item-action:hover,
html[data-focusfox-dark="true"] .list-group-item-action:focus,
html[data-focusfox-dark="true"] .dropdown-item:hover,
html[data-focusfox-dark="true"] .dropdown-item:focus,
html[data-focusfox-dark="true"] .nav-link:hover,
html[data-focusfox-dark="true"] .nav-link:focus,
html[data-focusfox-dark="true"] .active,
html[data-focusfox-dark="true"] .list-group-item.active {
  background-color: #334155 !important;
  color: #ffffff !important;
}

/* Text elements */
html[data-focusfox-dark="true"] h1,
html[data-focusfox-dark="true"] h2,
html[data-focusfox-dark="true"] h3,
html[data-focusfox-dark="true"] h4,
html[data-focusfox-dark="true"] h5,
html[data-focusfox-dark="true"] h6,
html[data-focusfox-dark="true"] .text-dark,
html[data-focusfox-dark="true"] .title {
  color: #f8fafc !important;
}

html[data-focusfox-dark="true"] .text-muted,
html[data-focusfox-dark="true"] .muted,
html[data-focusfox-dark="true"] .dimmed_text,
html[data-focusfox-dark="true"] .text-secondary {
  color: #94a3b8 !important;
}

/* Anchors / Links with brand color */
html[data-focusfox-dark="true"] a,
html[data-focusfox-dark="true"] .btn-link {
  color: #fb923c !important;
  text-decoration-color: rgba(251, 146, 60, 0.4) !important;
}

html[data-focusfox-dark="true"] a:hover,
html[data-focusfox-dark="true"] .btn-link:hover {
  color: #f97316 !important;
  text-decoration: underline !important;
}

/* Standard Buttons and Badges */
html[data-focusfox-dark="true"] .btn-primary {
  background-color: #ea580c !important;
  border-color: #c2410c !important;
  color: #ffffff !important;
}
html[data-focusfox-dark="true"] .btn-primary:hover {
  background-color: #d97706 !important;
  border-color: #ea580c !important;
}
html[data-focusfox-dark="true"] .btn-secondary,
html[data-focusfox-dark="true"] .btn-default,
html[data-focusfox-dark="true"] .btn-light {
  background-color: #334155 !important;
  border-color: #475569 !important;
  color: #f1f5f9 !important;
}
html[data-focusfox-dark="true"] .btn-secondary:hover,
html[data-focusfox-dark="true"] .btn-default:hover,
html[data-focusfox-dark="true"] .btn-light:hover {
  background-color: #475569 !important;
  border-color: #64748b !important;
}

/* Input Fields and Forms */
html[data-focusfox-dark="true"] input[type="text"],
html[data-focusfox-dark="true"] input[type="search"],
html[data-focusfox-dark="true"] input[type="password"],
html[data-focusfox-dark="true"] input[type="email"],
html[data-focusfox-dark="true"] select,
html[data-focusfox-dark="true"] textarea,
html[data-focusfox-dark="true"] .form-control {
  background-color: #1e293b !important;
  color: #f8fafc !important;
  border-color: #475569 !important;
}
html[data-focusfox-dark="true"] input:focus,
html[data-focusfox-dark="true"] select:focus,
html[data-focusfox-dark="true"] textarea:focus,
html[data-focusfox-dark="true"] .form-control:focus {
  background-color: #1e293b !important;
  color: #f8fafc !important;
  border-color: #fb923c !important;
  box-shadow: 0 0 0 0.2rem rgba(251, 146, 60, 0.25) !important;
}

/* Alerts, notices, activity items, and custom teacher-created container blocks */
html[data-focusfox-dark="true"] .alert,
html[data-focusfox-dark="true"] [class*="alert-"],
html[data-focusfox-dark="true"] .activity-item,
html[data-focusfox-dark="true"] .activityinstance,
html[data-focusfox-dark="true"] .modtype_label,
html[data-focusfox-dark="true"] .label,
html[data-focusfox-dark="true"] .well,
html[data-focusfox-dark="true"] .info-box,
html[data-focusfox-dark="true"] .notice,
html[data-focusfox-dark="true"] .feedback,
html[data-focusfox-dark="true"] [style*="background-color"],
html[data-focusfox-dark="true"] [style*="background"] {
  background-color: #1e293b !important;
  color: #f1f5f9 !important;
  border-color: #334155 !important;
}

/* Force custom-styled label/notice link colors to stand out */
html[data-focusfox-dark="true"] .alert a,
html[data-focusfox-dark="true"] [class*="alert-"] a,
html[data-focusfox-dark="true"] .modtype_label a,
html[data-focusfox-dark="true"] .label a,
html[data-focusfox-dark="true"] [style*="background-color"] a,
html[data-focusfox-dark="true"] [style*="background"] a {
  color: #fb923c !important;
}

/* Override inline dark text colors (like color: black or #000) so they stand out in dark containers */
html[data-focusfox-dark="true"] [style*="color: #0"],
html[data-focusfox-dark="true"] [style*="color:#0"],
html[data-focusfox-dark="true"] [style*="color: black"],
html[data-focusfox-dark="true"] [style*="color:rgb(0"],
html[data-focusfox-dark="true"] [style*="color: rgb(0"],
html[data-focusfox-dark="true"] [style*="color:rgb(3"],
html[data-focusfox-dark="true"] [style*="color: rgb(3"],
html[data-focusfox-dark="true"] [style*="color:#33"] {
  color: #f1f5f9 !important;
}

/* Invert dark logos on white background */
html[data-focusfox-dark="true"] img[src*="logo"]:not([src*="white"]):not([src*="dark"]),
html[data-focusfox-dark="true"] .navbar-brand img {
  filter: invert(1) hue-rotate(180deg) brightness(0.95) contrast(1.1) !important;
}

/* Images & videos — prevent blinding white backgrounds by adding a subtle dim */
html[data-focusfox-dark="true"] img,
html[data-focusfox-dark="true"] video {
  opacity: 0.85;
  transition: opacity 0.2s ease-in-out;
}
html[data-focusfox-dark="true"] img:hover,
html[data-focusfox-dark="true"] video:hover {
  opacity: 1;
}

/* Moodle Popover Region, Bootstrap Popovers, and Notifications Panel drawers */
html[data-focusfox-dark="true"] .popover,
html[data-focusfox-dark="true"] .popover-body,
html[data-focusfox-dark="true"] .dropdown-menu,
html[data-focusfox-dark="true"] .popover-region,
html[data-focusfox-dark="true"] .popover-region-container,
html[data-focusfox-dark="true"] [data-region="popover-region-container"],
html[data-focusfox-dark="true"] .popover-region-header-container,
html[data-focusfox-dark="true"] .popover-region-footer-container,
html[data-focusfox-dark="true"] .popover-region-content,
html[data-focusfox-dark="true"] .content-item-container {
  background-color: #0f172a !important; /* Solid dark blue background */
  background: #0f172a !important;
  color: #e2e8f0 !important;
  border-color: #1e293b !important;
  opacity: 1 !important; /* Force 100% opacity */
}

/* Ensure children inside notifications popovers and dropdown menus do not have transparent backgrounds */
html[data-focusfox-dark="true"] .popover *,
html[data-focusfox-dark="true"] .popover-body *,
html[data-focusfox-dark="true"] .dropdown-menu *,
html[data-focusfox-dark="true"] .popover-region-container *,
html[data-focusfox-dark="true"] [data-region="popover-region-container"] * {
  background-color: #0f172a !important;
  opacity: 1 !important; /* Force 100% opacity on scroll */
}

/* Hover state and unread notifications in popover drawer and dropdown items */
html[data-focusfox-dark="true"] .content-item-container:hover,
html[data-focusfox-dark="true"] .content-item-container:hover *,
html[data-focusfox-dark="true"] .content-item-container.unread,
html[data-focusfox-dark="true"] .content-item-container.unread *,
html[data-focusfox-dark="true"] .content-item-container.selected,
html[data-focusfox-dark="true"] .content-item-container.selected *,
html[data-focusfox-dark="true"] .dropdown-item:hover,
html[data-focusfox-dark="true"] .dropdown-item:hover * {
  background-color: #1e293b !important;
  color: #f1f5f9 !important;
}

/* Subtext/timestamps inside notification list items */
html[data-focusfox-dark="true"] .content-item-container .timestamp,
html[data-focusfox-dark="true"] .content-item-container .time,
html[data-focusfox-dark="true"] .content-item-container p,
html[data-focusfox-dark="true"] .popover-region-header-container h3,
html[data-focusfox-dark="true"] .popover-region-header-container .title {
  color: #94a3b8 !important;
}

/* Ensure gear/check/close icons in notification panel header are light */
html[data-focusfox-dark="true"] .popover-region-header-container a,
html[data-focusfox-dark="true"] .popover-region-header-container button,
html[data-focusfox-dark="true"] .popover-region-header-container i {
  color: #e2e8f0 !important;
}

/* Custom scrollbars globally and inside popover containers */
html[data-focusfox-dark="true"] ::-webkit-scrollbar,
html[data-focusfox-dark="true"] [class*="popover"] ::-webkit-scrollbar,
html[data-focusfox-dark="true"] [data-region*="popover"] ::-webkit-scrollbar {
  width: 10px !important;
  height: 10px !important;
}
html[data-focusfox-dark="true"] ::-webkit-scrollbar-track,
html[data-focusfox-dark="true"] [class*="popover"] ::-webkit-scrollbar-track,
html[data-focusfox-dark="true"] [data-region*="popover"] ::-webkit-scrollbar-track {
  background: #0f172a !important;
}
html[data-focusfox-dark="true"] ::-webkit-scrollbar-thumb,
html[data-focusfox-dark="true"] [class*="popover"] ::-webkit-scrollbar-thumb,
html[data-focusfox-dark="true"] [data-region*="popover"] ::-webkit-scrollbar-thumb {
  background-color: #334155 !important;
  border-radius: 5px !important;
  border: 2px solid #0f172a !important;
}

/* Force absolute topmost z-index stacking layers on header wrappers and notification dropdowns */
html[data-focusfox-dark="true"] nav.navbar,
html[data-focusfox-dark="true"] .fixed-top,
html[data-focusfox-dark="true"] #header,
html[data-focusfox-dark="true"] header,
html[data-focusfox-dark="true"] .navbar-collapse,
html[data-focusfox-dark="true"] .navbar-nav,
html[data-focusfox-dark="true"] .usermenu,
html[data-focusfox-dark="true"] .nav-item,
html[data-focusfox-dark="true"] .popover-region,
html[data-focusfox-dark="true"] .popover-region-container,
html[data-focusfox-dark="true"] [data-region="popover-region-container"],
html[data-focusfox-dark="true"] .popover,
html[data-focusfox-dark="true"] .dropdown-menu {
  z-index: 99999 !important; /* Force to the absolute front layer */
  position: relative !important; /* Ensure stacking is respected */
  overflow: visible !important; /* Allow popover menu to overflow container */
}

/* Position overrides for popovers and navbar */
html[data-focusfox-dark="true"] .popover-region-container,
html[data-focusfox-dark="true"] [data-region="popover-region-container"],
html[data-focusfox-dark="true"] .popover,
html[data-focusfox-dark="true"] .dropdown-menu {
  position: absolute !important;
}
html[data-focusfox-dark="true"] nav.navbar.fixed-top {
  position: fixed !important;
}

/* Lower the priority of all sub-navigation menus, grey navbars, page content, and quick-links bars */
html[data-focusfox-dark="true"] .primary-navigation,
html[data-focusfox-dark="true"] .moremenu,
html[data-focusfox-dark="true"] .mainnav,
html[data-focusfox-dark="true"] .navigation,
html[data-focusfox-dark="true"] [class*="primary-nav"],
html[data-focusfox-dark="true"] [class*="moremenu"],
html[data-focusfox-dark="true"] [id*="primary-nav"],
html[data-focusfox-dark="true"] [class*="secondary-nav"],
html[data-focusfox-dark="true"] [class*="sub-nav"],
html[data-focusfox-dark="true"] [id*="secondary-nav"],
html[data-focusfox-dark="true"] [id*="sub-nav"],
html[data-focusfox-dark="true"] #page-navbar,
html[data-focusfox-dark="true"] nav:not(.fixed-top):not(#header),
html[data-focusfox-dark="true"] .navbar:not(.fixed-top):not(#header) {
  z-index: 10 !important; /* Keep under top-bar child dropdowns */
  position: relative !important;
}
`.trim();

/**
 * Creates and injects the dark mode stylesheet if not already present.
 * Sets the html dataset attribute to activate scoped CSS styles.
 */
export function enableDarkMode(): void {
  try {
    let styleEl = document.getElementById(STYLE_ELEMENT_ID) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = STYLE_ELEMENT_ID;
      styleEl.textContent = DARK_MODE_CSS;
      (document.head || document.documentElement).appendChild(styleEl);
      logger.info(CONTEXT, 'Dark mode stylesheet injected');
    }
    document.documentElement.setAttribute('data-focusfox-dark', 'true');
    logger.info(CONTEXT, 'Dark mode enabled');
  } catch (error) {
    logger.error(CONTEXT, 'Failed to enable dark mode', error);
  }
}

/**
 * Deactivates the dark mode styles by flipping the dataset attribute.
 */
export function disableDarkMode(): void {
  try {
    document.documentElement.setAttribute('data-focusfox-dark', 'false');
    logger.info(CONTEXT, 'Dark mode disabled');
  } catch (error) {
    logger.error(CONTEXT, 'Failed to disable dark mode', error);
  }
}

/**
 * Applies dark mode based on state.
 */
export function applyDarkMode(state: boolean): void {
  if (state) {
    enableDarkMode();
  } else {
    disableDarkMode();
  }
}
