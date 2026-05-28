/**
 * FocusFox — Smart Academic Dashboard UI (Phase 5.5)
 *
 * Renders the full 400-px side panel with:
 *  • Sticky header + close / rescan controls
 *  • Stats bar (total / urgent / types)
 *  • Filter tabs (All / Exams / Assignments / Deadlines / Important)
 *  • 🎯 "Next Important Task" premium card
 *  • 🚨 "Latest Alerts" compact strip
 *  • Collapsible category sections with smart content cards
 *  • Urgency badges, date chips, "NEW" labels
 *
 * All CSS is injected as a scoped <style> tag; class names are prefixed
 * with `ff-` to minimise collision risk with LMS stylesheets.
 */

import { logger } from '../../utils/logger';
import { collectTextBlocks } from './detector';
import { parseFindings } from './parser';
import { applyScores, getTopTask, getAlerts } from './priorityEngine';
import { TABS, filterFindings, tabCount } from './filters';
import type {
  DashboardState,
  RadarCategory,
  RadarFinding,
  CategoryMeta,
  FilterTab,
} from './types';

const CONTEXT = 'DashboardUI';
const PANEL_ID = 'focusfox-dashboard';
const OVERLAY_ID = 'focusfox-dashboard-overlay';
const STYLE_ID = 'focusfox-dashboard-styles';

// ─── Category metadata ────────────────────────────────────────────────────────

const CAT_META: Record<RadarCategory, CategoryMeta> = {
  exam:       { icon: '📝', label: 'Exam',       color: '#ef4444', bgColor: 'rgba(239,68,68,0.13)' },
  quiz:       { icon: '✏️', label: 'Quiz',       color: '#f97316', bgColor: 'rgba(249,115,22,0.13)' },
  assignment: { icon: '📋', label: 'Assignment', color: '#3b82f6', bgColor: 'rgba(59,130,246,0.13)' },
  deadline:   { icon: '⏰', label: 'Deadline',   color: '#ef4444', bgColor: 'rgba(239,68,68,0.13)' },
  submission: { icon: '📤', label: 'Submission', color: '#8b5cf6', bgColor: 'rgba(139,92,246,0.13)' },
  marks:      { icon: '🏆', label: 'Marks',      color: '#22c55e', bgColor: 'rgba(34,197,94,0.13)' },
  important:  { icon: '🔔', label: 'Important',  color: '#eab308', bgColor: 'rgba(234,179,8,0.13)' },
};

/** Preferred render order for collapsible sections in the "All" view. */
const CAT_ORDER: RadarCategory[] = [
  'exam', 'deadline', 'quiz', 'assignment', 'submission', 'important', 'marks',
];

// ─── CSS ──────────────────────────────────────────────────────────────────────

const PANEL_CSS = `
/* ═══════════════════════════════════════════════════════════════════
   FocusFox Smart Academic Dashboard — Scoped Styles (Phase 5.5)
   All selectors are prefixed with #focusfox-dashboard or .ff- to
   prevent conflicts with the host LMS stylesheet.
   ═══════════════════════════════════════════════════════════════════ */

#focusfox-dashboard,
#focusfox-dashboard * {
  box-sizing: border-box !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif !important;
  line-height: normal !important;
}

/* ── Panel shell ──────────────────────────────────────────────────── */
#focusfox-dashboard {
  position: fixed !important;
  top: 0 !important;
  right: 0 !important;
  width: 400px !important;
  max-width: 100vw !important;
  height: 100vh !important;
  z-index: 2147483640 !important;
  display: flex !important;
  flex-direction: column !important;
  background: linear-gradient(180deg,#17141f 0%,#131118 55%,#100f17 100%) !important;
  border-left: 1px solid rgba(255,255,255,0.08) !important;
  box-shadow: -20px 0 80px rgba(0,0,0,0.75), -4px 0 24px rgba(0,0,0,0.45) !important;
  transform: translateX(100%) !important;
  transition: transform 0.42s cubic-bezier(0.22,1,0.36,1) !important;
  overflow: hidden !important;
}
#focusfox-dashboard.ff-open {
  transform: translateX(0) !important;
}

/* ── Header ───────────────────────────────────────────────────────── */
.ff-header {
  flex-shrink: 0 !important;
  padding: 15px 16px 13px !important;
  background: linear-gradient(135deg,rgba(249,115,22,0.13) 0%,rgba(249,115,22,0.03) 55%,transparent 100%) !important;
  border-bottom: 1px solid rgba(255,255,255,0.07) !important;
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
}
.ff-logo {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  flex: 1 !important;
  min-width: 0 !important;
}
.ff-logo-icon {
  width: 36px !important;
  height: 36px !important;
  flex-shrink: 0 !important;
  border-radius: 10px !important;
  background: linear-gradient(135deg,rgba(249,115,22,0.3),rgba(249,115,22,0.1)) !important;
  border: 1px solid rgba(249,115,22,0.3) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 18px !important;
}
.ff-logo-text { min-width: 0 !important; }
.ff-logo-title {
  display: block !important;
  font-size: 13px !important;
  font-weight: 800 !important;
  color: rgba(255,255,255,0.95) !important;
  letter-spacing: -0.3px !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
.ff-logo-sub {
  display: block !important;
  font-size: 10px !important;
  color: rgba(255,255,255,0.28) !important;
}
.ff-header-btns {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  flex-shrink: 0 !important;
}
.ff-icon-btn {
  width: 28px !important;
  height: 28px !important;
  border-radius: 8px !important;
  background: rgba(255,255,255,0.05) !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  color: rgba(255,255,255,0.38) !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 12px !important;
  transition: background 0.2s, color 0.2s, border-color 0.2s !important;
  font-family: inherit !important;
  line-height: 1 !important;
}
.ff-icon-btn:hover {
  background: rgba(249,115,22,0.15) !important;
  color: #f97316 !important;
  border-color: rgba(249,115,22,0.28) !important;
}

/* ── Stats row ────────────────────────────────────────────────────── */
.ff-stats {
  flex-shrink: 0 !important;
  display: flex !important;
  border-bottom: 1px solid rgba(255,255,255,0.05) !important;
}
.ff-stat {
  flex: 1 !important;
  padding: 9px 6px !important;
  text-align: center !important;
  border-right: 1px solid rgba(255,255,255,0.05) !important;
}
.ff-stat:last-child { border-right: none !important; }
.ff-stat-n {
  display: block !important;
  font-size: 21px !important;
  font-weight: 800 !important;
  color: #f97316 !important;
  letter-spacing: -0.8px !important;
  line-height: 1.1 !important;
}
.ff-stat-l {
  display: block !important;
  font-size: 9px !important;
  color: rgba(255,255,255,0.22) !important;
  text-transform: uppercase !important;
  letter-spacing: 0.7px !important;
  margin-top: 3px !important;
  font-weight: 600 !important;
}

/* ── Filter tabs ──────────────────────────────────────────────────── */
.ff-tabs {
  flex-shrink: 0 !important;
  display: flex !important;
  gap: 5px !important;
  padding: 9px 13px !important;
  background: rgba(0,0,0,0.18) !important;
  border-bottom: 1px solid rgba(255,255,255,0.05) !important;
  overflow-x: auto !important;
}
.ff-tabs::-webkit-scrollbar { display: none !important; }
.ff-tab {
  flex-shrink: 0 !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 5px !important;
  padding: 5px 12px !important;
  border-radius: 20px !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  background: rgba(255,255,255,0.04) !important;
  color: rgba(255,255,255,0.38) !important;
  transition: all 0.2s !important;
  white-space: nowrap !important;
  font-family: inherit !important;
}
.ff-tab:hover {
  background: rgba(249,115,22,0.1) !important;
  color: rgba(255,255,255,0.65) !important;
  border-color: rgba(249,115,22,0.22) !important;
}
.ff-tab.ff-active {
  background: rgba(249,115,22,0.18) !important;
  color: #f97316 !important;
  border-color: rgba(249,115,22,0.38) !important;
}
.ff-tab-cnt {
  font-size: 9.5px !important;
  background: rgba(255,255,255,0.08) !important;
  border-radius: 10px !important;
  padding: 1px 6px !important;
  color: rgba(255,255,255,0.28) !important;
}
.ff-tab.ff-active .ff-tab-cnt {
  background: rgba(249,115,22,0.2) !important;
  color: rgba(249,115,22,0.9) !important;
}

/* ── Scrollable content area ──────────────────────────────────────── */
.ff-scroll {
  flex: 1 !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  padding: 14px 13px 26px !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 13px !important;
}
.ff-scroll::-webkit-scrollbar { width: 3px !important; }
.ff-scroll::-webkit-scrollbar-track { background: transparent !important; }
.ff-scroll::-webkit-scrollbar-thumb {
  background: rgba(249,115,22,0.28) !important;
  border-radius: 3px !important;
}

/* ── Section eyebrow labels ───────────────────────────────────────── */
.ff-eyebrow {
  font-size: 9.5px !important;
  font-weight: 700 !important;
  color: rgba(255,255,255,0.28) !important;
  text-transform: uppercase !important;
  letter-spacing: 1px !important;
  padding: 0 1px !important;
  display: block !important;
}

/* ── Next Important Task card ─────────────────────────────────────── */
.ff-next-wrap {
  display: flex !important;
  flex-direction: column !important;
  gap: 7px !important;
}
.ff-next-card {
  border-radius: 14px !important;
  padding: 15px 16px !important;
  background: linear-gradient(135deg,rgba(249,115,22,0.17) 0%,rgba(249,115,22,0.06) 65%,rgba(0,0,0,0.08) 100%) !important;
  border: 1px solid rgba(249,115,22,0.3) !important;
  position: relative !important;
  overflow: hidden !important;
  animation: ff-pulse 3.6s ease-in-out infinite !important;
}
@keyframes ff-pulse {
  0%,100% { border-color: rgba(249,115,22,0.3) !important; box-shadow: none !important; }
  50%      { border-color: rgba(249,115,22,0.58) !important; box-shadow: 0 0 22px rgba(249,115,22,0.09) !important; }
}
.ff-next-glow {
  position: absolute !important;
  top: -25px !important; right: -25px !important;
  width: 110px !important; height: 110px !important;
  background: radial-gradient(circle,rgba(249,115,22,0.2),transparent 70%) !important;
  pointer-events: none !important;
}
.ff-next-pin {
  display: inline-flex !important;
  align-items: center !important;
  gap: 5px !important;
  font-size: 9.5px !important;
  font-weight: 800 !important;
  color: #f97316 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.9px !important;
  margin-bottom: 8px !important;
}
.ff-next-title {
  font-size: 15px !important;
  font-weight: 700 !important;
  color: rgba(255,255,255,0.96) !important;
  line-height: 1.3 !important;
  margin-bottom: 5px !important;
}
.ff-next-desc {
  font-size: 12px !important;
  color: rgba(255,255,255,0.44) !important;
  line-height: 1.5 !important;
  margin-bottom: 11px !important;
}
.ff-next-meta {
  display: flex !important;
  align-items: center !important;
  gap: 7px !important;
  flex-wrap: wrap !important;
}

/* ── Alert strip ──────────────────────────────────────────────────── */
.ff-alerts-wrap {
  display: flex !important;
  flex-direction: column !important;
  gap: 5px !important;
}
.ff-alert-item {
  display: flex !important;
  align-items: flex-start !important;
  gap: 9px !important;
  padding: 9px 12px !important;
  border-radius: 10px !important;
  background: rgba(255,255,255,0.033) !important;
  border: 1px solid rgba(255,255,255,0.06) !important;
  transition: background 0.2s, border-color 0.2s, transform 0.18s !important;
  cursor: pointer !important;
}
.ff-alert-item:hover {
  background: rgba(255,255,255,0.065) !important;
  border-color: rgba(249,115,22,0.18) !important;
  transform: translateX(-2px) !important;
}
.ff-alert-dot {
  width: 7px !important;
  height: 7px !important;
  border-radius: 50% !important;
  flex-shrink: 0 !important;
  margin-top: 4px !important;
}
.ff-alert-body { flex: 1 !important; min-width: 0 !important; }
.ff-alert-text {
  display: block !important;
  font-size: 12.5px !important;
  color: rgba(255,255,255,0.72) !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
.ff-alert-sub {
  display: block !important;
  font-size: 10.5px !important;
  color: rgba(255,255,255,0.26) !important;
  margin-top: 1px !important;
}

/* ── Collapsible sections ─────────────────────────────────────────── */
.ff-section {
  border-radius: 12px !important;
  background: rgba(255,255,255,0.025) !important;
  border: 1px solid rgba(255,255,255,0.06) !important;
  overflow: hidden !important;
}
.ff-sec-header {
  display: flex !important;
  align-items: center !important;
  padding: 10px 13px !important;
  cursor: pointer !important;
  user-select: none !important;
  transition: background 0.2s !important;
  gap: 8px !important;
}
.ff-sec-header:hover { background: rgba(255,255,255,0.03) !important; }
.ff-sec-icon { font-size: 14px !important; flex-shrink: 0 !important; }
.ff-sec-name {
  font-size: 11.5px !important;
  font-weight: 700 !important;
  flex: 1 !important;
  letter-spacing: 0.1px !important;
}
.ff-sec-cnt {
  font-size: 10px !important;
  padding: 2px 8px !important;
  border-radius: 20px !important;
  background: rgba(255,255,255,0.06) !important;
  color: rgba(255,255,255,0.28) !important;
  font-weight: 600 !important;
}
.ff-sec-chevron {
  font-size: 10px !important;
  color: rgba(255,255,255,0.2) !important;
  transition: transform 0.25s ease !important;
  flex-shrink: 0 !important;
}
.ff-section.ff-collapsed .ff-sec-chevron {
  transform: rotate(-90deg) !important;
}
.ff-sec-body {
  padding: 0 10px 10px !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 6px !important;
}
.ff-section.ff-collapsed .ff-sec-body {
  display: none !important;
}

/* ── Finding cards ────────────────────────────────────────────────── */
.ff-card {
  border-radius: 11px !important;
  padding: 12px 13px 12px 16px !important;
  background: rgba(255,255,255,0.04) !important;
  border: 1px solid rgba(255,255,255,0.07) !important;
  position: relative !important;
  overflow: hidden !important;
  transition: background 0.2s, transform 0.18s, border-color 0.2s !important;
  cursor: pointer !important;
}
.ff-card:hover {
  background: rgba(255,255,255,0.075) !important;
  transform: translateX(-2px) !important;
}
.ff-card-bar {
  position: absolute !important;
  left: 0 !important; top: 0 !important; bottom: 0 !important;
  width: 3px !important;
  opacity: 0.65 !important;
}
.ff-card-top {
  display: flex !important;
  align-items: flex-start !important;
  gap: 10px !important;
}
.ff-card-icon {
  width: 32px !important;
  height: 32px !important;
  border-radius: 9px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 15px !important;
  flex-shrink: 0 !important;
}
.ff-card-main { flex: 1 !important; min-width: 0 !important; }
.ff-card-badges {
  display: flex !important;
  align-items: center !important;
  gap: 5px !important;
  margin-bottom: 5px !important;
  flex-wrap: wrap !important;
}
.ff-card-title {
  font-size: 13px !important;
  font-weight: 600 !important;
  color: rgba(255,255,255,0.88) !important;
  line-height: 1.35 !important;
  margin: 0 0 3px !important;
}
.ff-card-desc {
  font-size: 11.5px !important;
  color: rgba(255,255,255,0.37) !important;
  line-height: 1.45 !important;
}
.ff-card-foot {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  margin-top: 8px !important;
  padding-top: 7px !important;
  border-top: 1px solid rgba(255,255,255,0.05) !important;
}
.ff-date-chip {
  display: inline-flex !important;
  align-items: center !important;
  gap: 4px !important;
  font-size: 10.5px !important;
  color: rgba(255,255,255,0.36) !important;
  background: rgba(255,255,255,0.04) !important;
  border: 1px solid rgba(255,255,255,0.07) !important;
  padding: 2px 8px !important;
  border-radius: 20px !important;
}

/* ── Badge atoms ──────────────────────────────────────────────────── */
.ff-badge {
  display: inline-block !important;
  font-size: 9px !important;
  font-weight: 700 !important;
  padding: 2px 8px !important;
  border-radius: 20px !important;
  text-transform: uppercase !important;
  letter-spacing: 0.4px !important;
  white-space: nowrap !important;
}
.ff-urg-high   { background: rgba(239,68,68,0.14)  !important; color:#f87171 !important; border:1px solid rgba(239,68,68,0.24)  !important; }
.ff-urg-medium { background: rgba(249,115,22,0.12) !important; color:#fb923c !important; border:1px solid rgba(249,115,22,0.22) !important; }
.ff-urg-low    { background: rgba(99,102,241,0.12)  !important; color:#a5b4fc !important; border:1px solid rgba(99,102,241,0.2)  !important; }
.ff-badge-new  {
  background: rgba(249,115,22,0.18) !important;
  color: #f97316 !important;
  border: 1px solid rgba(249,115,22,0.28) !important;
  font-size: 8.5px !important;
}

/* ── Empty state ──────────────────────────────────────────────────── */
.ff-empty {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  padding: 55px 24px !important;
  text-align: center !important;
  gap: 10px !important;
}
.ff-empty-emoji { font-size: 44px !important; opacity: 0.25 !important; display: block !important; }
.ff-empty-title { font-size: 14px !important; font-weight: 700 !important; color: rgba(255,255,255,0.22) !important; }
.ff-empty-sub   { font-size: 12px !important; color: rgba(255,255,255,0.14) !important; line-height: 1.65 !important; }

/* ── Loading state ────────────────────────────────────────────────── */
.ff-loading {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  flex: 1 !important;
  gap: 14px !important;
  padding: 65px 24px !important;
}
.ff-spinner {
  width: 36px !important;
  height: 36px !important;
  border: 3px solid rgba(249,115,22,0.12) !important;
  border-top-color: #f97316 !important;
  border-radius: 50% !important;
  animation: ff-spin 0.72s linear infinite !important;
}
@keyframes ff-spin { to { transform: rotate(360deg) !important; } }
.ff-loading-t { font-size: 12.5px !important; color: rgba(255,255,255,0.2) !important; }

/* ── Footer bar ───────────────────────────────────────────────────── */
.ff-footer {
  flex-shrink: 0 !important;
  padding: 9px 13px !important;
  background: rgba(0,0,0,0.28) !important;
  border-top: 1px solid rgba(255,255,255,0.05) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
}
.ff-footer-info { font-size: 10px !important; color: rgba(255,255,255,0.17) !important; }
.ff-rescan-btn {
  font-size: 11px !important;
  font-weight: 600 !important;
  color: #f97316 !important;
  background: rgba(249,115,22,0.1) !important;
  border: 1px solid rgba(249,115,22,0.22) !important;
  border-radius: 8px !important;
  padding: 5px 11px !important;
  cursor: pointer !important;
  transition: all 0.2s !important;
  font-family: inherit !important;
}
.ff-rescan-btn:hover {
  background: rgba(249,115,22,0.2) !important;
  border-color: rgba(249,115,22,0.38) !important;
}

/* ── Overlay ──────────────────────────────────────────────────────── */
#focusfox-dashboard-overlay {
  position: fixed !important;
  inset: 0 !important;
  z-index: 2147483639 !important;
  background: transparent !important;
  pointer-events: none !important;
  transition: background 0.42s ease !important;
}
#focusfox-dashboard-overlay.ff-overlay-on {
  background: rgba(0,0,0,0.3) !important;
  pointer-events: auto !important;
}

/* ── Scroll-to-source flash on the LMS page element ──────────────── */
@keyframes ff-source-flash {
  0%   { outline: 3px solid rgba(249,115,22,0)   !important; outline-offset: 4px !important; }
  15%  { outline: 3px solid rgba(249,115,22,0.85) !important; outline-offset: 4px !important;
          background-color: rgba(249,115,22,0.12)  !important; }
  85%  { outline: 3px solid rgba(249,115,22,0.55) !important; outline-offset: 4px !important;
          background-color: rgba(249,115,22,0.05)  !important; }
  100% { outline: 3px solid rgba(249,115,22,0)   !important; outline-offset: 4px !important;
          background-color: transparent            !important; }
}
.ff-source-highlight {
  animation: ff-source-flash 1.8s ease-out forwards !important;
  border-radius: 6px !important;
  scroll-margin-top: 96px !important;
}

/* ── Scroll hint chip ─────────────────────────────────────────────── */
.ff-scroll-hint {
  display: inline-flex !important;
  align-items: center !important;
  gap: 4px !important;
  font-size: 10px !important;
  color: rgba(249,115,22,0.6) !important;
  margin-left: auto !important;
  opacity: 0.7 !important;
}
`.trim();

// ─── Tiny DOM helpers ─────────────────────────────────────────────────────────

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls?: string,
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  return e;
}

// ─── Scroll-to-source ────────────────────────────────────────────────────────

const SOURCE_FLASH_CLASS = 'ff-source-highlight';

/**
 * Scrolls the LMS page to `target` and applies a brief orange-flash
 * animation to make the source location obvious.
 *
 * The panel stays open so the user can see both the card and the source.
 * We shift the panel to semi-transparent for 1 s to reduce occlusion.
 */
function scrollToSource(target: Element): void {
  try {
    // Remove any leftover flash from a previous click
    document.querySelectorAll('.' + SOURCE_FLASH_CLASS).forEach((el) => {
      el.classList.remove(SOURCE_FLASH_CLASS);
    });

    // Briefly dim the panel so the source element is visible
    const panel = document.getElementById(PANEL_ID);
    if (panel) {
      panel.style.opacity = '0.35';
      panel.style.pointerEvents = 'none';
      setTimeout(() => {
        panel.style.opacity = '';
        panel.style.pointerEvents = '';
      }, 1400);
    }

    // Scroll to the element
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Apply the flash class (removed by animationend to keep DOM clean)
    target.classList.add(SOURCE_FLASH_CLASS);
    target.addEventListener(
      'animationend',
      () => target.classList.remove(SOURCE_FLASH_CLASS),
      { once: true },
    );
  } catch (err) {
    logger.error(CONTEXT, 'scrollToSource failed', err);
  }
}

// ─── Badge builders ───────────────────────────────────────────────────────────

function catBadge(cat: RadarCategory): HTMLElement {
  const m = CAT_META[cat];
  const s = el('span', 'ff-badge');
  s.style.background = m.bgColor;
  s.style.color = m.color;
  s.style.border = `1px solid ${m.color}33`;
  s.textContent = m.label;
  return s;
}

function urgBadge(urgency: 'high' | 'medium' | 'low'): HTMLElement {
  const labels = { high: '🔴 Urgent', medium: '🟡 Soon', low: '🔵 Info' };
  const s = el('span', `ff-badge ff-urg-${urgency}`);
  s.textContent = labels[urgency];
  return s;
}

function newBadge(): HTMLElement {
  const s = el('span', 'ff-badge ff-badge-new');
  s.textContent = 'New';
  return s;
}

function datechip(date: string): HTMLElement {
  const d = el('div', 'ff-date-chip');
  d.textContent = `📅 ${date}`;
  return d;
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function buildCard(f: RadarFinding): HTMLElement {
  const meta = CAT_META[f.category];
  const card = el('div', 'ff-card');

  // Coloured left accent bar
  const bar = el('div', 'ff-card-bar');
  bar.style.background = meta.color;
  card.appendChild(bar);

  const top = el('div', 'ff-card-top');

  // Icon
  const icon = el('div', 'ff-card-icon');
  icon.style.background = meta.bgColor;
  icon.textContent = meta.icon;
  top.appendChild(icon);

  // Text content
  const main = el('div', 'ff-card-main');

  const badges = el('div', 'ff-card-badges');
  badges.appendChild(catBadge(f.category));
  badges.appendChild(urgBadge(f.urgency));
  if (f.isNew) badges.appendChild(newBadge());
  main.appendChild(badges);

  const title = el('div', 'ff-card-title');
  title.textContent = f.title;
  main.appendChild(title);

  if (f.description) {
    const desc = el('div', 'ff-card-desc');
    desc.textContent = f.description;
    main.appendChild(desc);
  }

  top.appendChild(main);
  card.appendChild(top);

  // Footer: date chip + scroll hint
  const foot = el('div', 'ff-card-foot');
  if (f.detectedDate) foot.appendChild(datechip(f.detectedDate));
  if (f.sourceElement) {
    const hint = el('span', 'ff-scroll-hint');
    hint.textContent = '↗ View on page';
    foot.appendChild(hint);
  }
  if (foot.childNodes.length > 0) card.appendChild(foot);

  // Scroll-to-source on click
  if (f.sourceElement) {
    const target = f.sourceElement;
    card.addEventListener('click', () => scrollToSource(target));
  }

  return card;
}

// ─── Next Important Task ──────────────────────────────────────────────────────

function buildNextTask(f: RadarFinding): HTMLElement {
  const meta = CAT_META[f.category];
  const wrap = el('div', 'ff-next-wrap');

  const eyebrow = el('span', 'ff-eyebrow');
  eyebrow.textContent = '🎯 Next Important Task';
  wrap.appendChild(eyebrow);

  const card = el('div', 'ff-next-card');
  if (f.sourceElement) card.style.cursor = 'pointer';

  const glow = el('div', 'ff-next-glow');
  card.appendChild(glow);

  const pin = el('div', 'ff-next-pin');
  pin.textContent = `${meta.icon}  ${meta.label}`;
  card.appendChild(pin);

  const title = el('div', 'ff-next-title');
  title.textContent = f.title;
  card.appendChild(title);

  if (f.description) {
    const desc = el('div', 'ff-next-desc');
    desc.textContent = f.description;
    card.appendChild(desc);
  }

  const metaRow = el('div', 'ff-next-meta');
  metaRow.appendChild(urgBadge(f.urgency));
  if (f.detectedDate) metaRow.appendChild(datechip(f.detectedDate));
  if (f.sourceElement) {
    const hint = el('span', 'ff-scroll-hint');
    hint.textContent = '↗ View on page';
    metaRow.appendChild(hint);
  }
  card.appendChild(metaRow);

  // Scroll-to-source on click
  if (f.sourceElement) {
    const target = f.sourceElement;
    card.addEventListener('click', () => scrollToSource(target));
  }

  wrap.appendChild(card);
  return wrap;
}

// ─── Latest Alerts strip ──────────────────────────────────────────────────────

function buildAlerts(state: DashboardState): HTMLElement | null {
  const alerts = getAlerts(state.findings);
  if (alerts.length === 0) return null;

  const wrap = el('div', 'ff-alerts-wrap');

  const eyebrow = el('span', 'ff-eyebrow');
  eyebrow.textContent = '🚨 Latest Alerts';
  wrap.appendChild(eyebrow);

  for (const f of alerts) {
    const meta = CAT_META[f.category];
    const item = el('div', 'ff-alert-item');

    const dot = el('div', 'ff-alert-dot');
    dot.style.background = f.urgency === 'high' ? '#ef4444' : '#f97316';
    item.appendChild(dot);

    const body = el('div', 'ff-alert-body');
    const txt = el('span', 'ff-alert-text');
    txt.textContent = f.title;
    body.appendChild(txt);

    if (f.detectedDate) {
      const sub = el('span', 'ff-alert-sub');
      sub.textContent = `${meta.icon} ${f.detectedDate}`;
      body.appendChild(sub);
    }
    item.appendChild(body);
    item.appendChild(catBadge(f.category));

    // Scroll-to-source on click
    if (f.sourceElement) {
      const target = f.sourceElement;
      item.addEventListener('click', () => scrollToSource(target));
    }

    wrap.appendChild(item);
  }

  return wrap;
}

// ─── Collapsible section ──────────────────────────────────────────────────────

function buildSection(
  cat: RadarCategory,
  catFindings: RadarFinding[],
  state: DashboardState,
): HTMLElement {
  const meta = CAT_META[cat];
  const isCollapsed = state.collapsedSections.has(cat);

  const section = el('div', 'ff-section' + (isCollapsed ? ' ff-collapsed' : ''));
  section.dataset['cat'] = cat;

  // Clickable header
  const header = el('div', 'ff-sec-header');

  const icon = el('span', 'ff-sec-icon');
  icon.textContent = meta.icon;
  header.appendChild(icon);

  const name = el('span', 'ff-sec-name');
  name.style.color = meta.color;
  name.textContent = meta.label;
  header.appendChild(name);

  const cnt = el('span', 'ff-sec-cnt');
  cnt.textContent = String(catFindings.length);
  header.appendChild(cnt);

  const chevron = el('span', 'ff-sec-chevron');
  chevron.textContent = '▼';
  header.appendChild(chevron);

  header.addEventListener('click', () => {
    section.classList.toggle('ff-collapsed');
    if (state.collapsedSections.has(cat)) {
      state.collapsedSections.delete(cat);
    } else {
      state.collapsedSections.add(cat);
    }
  });

  section.appendChild(header);

  // Cards body
  const body = el('div', 'ff-sec-body');
  for (const f of catFindings) {
    body.appendChild(buildCard(f));
  }
  section.appendChild(body);

  return section;
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

function buildStats(findings: RadarFinding[]): HTMLElement {
  const bar = el('div', 'ff-stats');
  const high = findings.filter((f) => f.urgency === 'high').length;
  const cats = new Set(findings.map((f) => f.category)).size;

  const stat = (n: number, label: string) => {
    const d = el('div', 'ff-stat');
    const num = el('span', 'ff-stat-n');
    num.textContent = String(n);
    const lbl = el('span', 'ff-stat-l');
    lbl.textContent = label;
    d.appendChild(num);
    d.appendChild(lbl);
    return d;
  };

  bar.appendChild(stat(findings.length, 'Detected'));
  bar.appendChild(stat(high, 'Urgent'));
  bar.appendChild(stat(cats, 'Types'));
  return bar;
}

// ─── Filter tab bar ───────────────────────────────────────────────────────────

function buildTabBar(state: DashboardState, panel: HTMLElement): HTMLElement {
  const bar = el('div', 'ff-tabs');

  for (const tab of TABS) {
    const btn = el('button', 'ff-tab' + (state.activeFilter === tab.id ? ' ff-active' : ''));
    btn.textContent = `${tab.icon}  ${tab.label}`;

    const cnt = el('span', 'ff-tab-cnt');
    cnt.textContent = String(tabCount(state.findings, tab.id));
    btn.appendChild(cnt);

    btn.addEventListener('click', () => {
      if (state.activeFilter === tab.id) return;
      state.activeFilter = tab.id as FilterTab;
      // Update active state on all tabs
      bar.querySelectorAll('.ff-tab').forEach((t) => t.classList.remove('ff-active'));
      btn.classList.add('ff-active');
      // Re-render only the scroll area (cheap)
      swapScrollContent(panel, state);
    });

    bar.appendChild(btn);
  }

  return bar;
}

// ─── Scroll content builder ───────────────────────────────────────────────────

function buildScrollContent(state: DashboardState): HTMLElement {
  const scroll = el('div', 'ff-scroll');
  scroll.id = 'ff-scroll';

  const filtered = filterFindings(state.findings, state.activeFilter);

  if (filtered.length === 0) {
    const empty = el('div', 'ff-empty');
    const emoji = el('span', 'ff-empty-emoji');
    emoji.textContent = '🔍';
    const title = el('span', 'ff-empty-title');
    title.textContent = 'Nothing detected here';
    const sub = el('span', 'ff-empty-sub');
    sub.textContent = state.activeFilter === 'all'
      ? 'No academic content found on this page.\nTry navigating to a course or module page.'
      : `No ${state.activeFilter} found on this page.`;
    empty.appendChild(emoji);
    empty.appendChild(title);
    empty.appendChild(sub);
    scroll.appendChild(empty);
    return scroll;
  }

  // ── "All" view: Next Task + Alerts + collapsible sections ──────────────
  if (state.activeFilter === 'all') {
    const top = getTopTask(state.findings);
    if (top) scroll.appendChild(buildNextTask(top));

    const alertsEl = buildAlerts(state);
    if (alertsEl) scroll.appendChild(alertsEl);

    for (const cat of CAT_ORDER) {
      const catItems = filtered.filter((f) => f.category === cat);
      if (catItems.length === 0) continue;
      scroll.appendChild(buildSection(cat, catItems, state));
    }
    return scroll;
  }

  // ── Filtered view: flat card list ──────────────────────────────────────
  const eyebrow = el('span', 'ff-eyebrow');
  const tab = TABS.find((t) => t.id === state.activeFilter);
  eyebrow.textContent = `${tab?.icon ?? ''} ${tab?.label ?? ''} — ${filtered.length} found`;
  scroll.appendChild(eyebrow);

  for (const f of filtered) {
    scroll.appendChild(buildCard(f));
  }

  return scroll;
}

/** Swaps only the scroll content area (keeps header/stats/tabs intact). */
function swapScrollContent(panel: HTMLElement, state: DashboardState): void {
  const old = panel.querySelector('#ff-scroll');
  const next = buildScrollContent(state);
  if (old) {
    panel.replaceChild(next, old);
  } else {
    const footer = panel.querySelector('.ff-footer');
    if (footer) panel.insertBefore(next, footer);
    else panel.appendChild(next);
  }
}

// ─── Full panel builder ───────────────────────────────────────────────────────

function buildPanel(state: DashboardState): HTMLElement {
  const panel = el('div');
  panel.id = PANEL_ID;

  // Header
  const header = el('div', 'ff-header');
  const logo = el('div', 'ff-logo');
  const logoIcon = el('div', 'ff-logo-icon');
  logoIcon.textContent = '🧠';
  const logoText = el('div', 'ff-logo-text');
  const logoTitle = el('span', 'ff-logo-title');
  logoTitle.textContent = 'Smart Academic Dashboard';
  const logoSub = el('span', 'ff-logo-sub');
  logoSub.textContent = 'FocusFox · DOM analysis engine';
  logoText.appendChild(logoTitle);
  logoText.appendChild(logoSub);
  logo.appendChild(logoIcon);
  logo.appendChild(logoText);

  const btns = el('div', 'ff-header-btns');
  const closeBtn = el('button', 'ff-icon-btn');
  closeBtn.title = 'Close';
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', closeDashboard);
  btns.appendChild(closeBtn);

  header.appendChild(logo);
  header.appendChild(btns);
  panel.appendChild(header);

  // Stats
  panel.appendChild(buildStats(state.findings));

  // Filter tabs
  panel.appendChild(buildTabBar(state, panel));

  // Scroll content
  panel.appendChild(buildScrollContent(state));

  // Footer with rescan
  const footer = el('div', 'ff-footer');
  const info = el('span', 'ff-footer-info');
  info.id = 'ff-footer-info';
  info.textContent = `Scanned at ${new Date(state.lastScanAt).toLocaleTimeString()}`;
  footer.appendChild(info);

  const rescanBtn = el('button', 'ff-rescan-btn');
  rescanBtn.textContent = '🔄 Re-scan';
  rescanBtn.addEventListener('click', () => {
    // Show loading in scroll area
    const scrollEl = panel.querySelector('#ff-scroll');
    if (scrollEl) {
      scrollEl.innerHTML = '';
      const loading = el('div', 'ff-loading');
      const spinner = el('div', 'ff-spinner');
      const loadTxt = el('span', 'ff-loading-t');
      loadTxt.textContent = 'Scanning page…';
      loading.appendChild(spinner);
      loading.appendChild(loadTxt);
      scrollEl.appendChild(loading);
    }

    setTimeout(() => {
      const blocks = collectTextBlocks();
      state.findings = applyScores(parseFindings(blocks));
      state.lastScanAt = Date.now();
      state.activeFilter = 'all';

      // Rebuild stats
      const oldStats = panel.querySelector('.ff-stats');
      const newStats = buildStats(state.findings);
      if (oldStats) panel.replaceChild(newStats, oldStats);

      // Rebuild tabs (counts changed)
      const oldTabs = panel.querySelector('.ff-tabs');
      const newTabs = buildTabBar(state, panel);
      if (oldTabs) panel.replaceChild(newTabs, oldTabs);

      // Rebuild scroll content
      swapScrollContent(panel, state);

      // Update footer timestamp
      const infoEl = panel.querySelector('#ff-footer-info');
      if (infoEl) infoEl.textContent = `Scanned at ${new Date().toLocaleTimeString()}`;
    }, 180);
  });

  footer.appendChild(rescanBtn);
  panel.appendChild(footer);

  return panel;
}

// ─── Style injection ──────────────────────────────────────────────────────────

function injectStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = PANEL_CSS;
  (document.head ?? document.documentElement).appendChild(s);
}

// ─── Overlay ─────────────────────────────────────────────────────────────────

function getOrCreateOverlay(): HTMLElement {
  let ov = document.getElementById(OVERLAY_ID) as HTMLElement | null;
  if (!ov) {
    ov = document.createElement('div');
    ov.id = OVERLAY_ID;
    ov.addEventListener('click', closeDashboard);
    document.body.appendChild(ov);
  }
  return ov;
}

// ─── Module-level state ───────────────────────────────────────────────────────

let _panel: HTMLElement | null = null;
let _state: DashboardState | null = null;

function scan(): DashboardState {
  const blocks = collectTextBlocks();
  const findings = applyScores(parseFindings(blocks));
  return {
    findings,
    activeFilter: 'all',
    collapsedSections: new Set(),
    lastScanAt: Date.now(),
  };
}

// ─── Panel lifecycle ──────────────────────────────────────────────────────────

function openDashboard(): void {
  injectStyles();
  const overlay = getOrCreateOverlay();

  // Build a loading-state panel first for instant response
  if (!_panel) {
    // Insert a loading shell
    const shell = document.createElement('div');
    shell.id = PANEL_ID;
    shell.innerHTML = `
      <div class="ff-header">
        <div class="ff-logo">
          <div class="ff-logo-icon">🧠</div>
          <div class="ff-logo-text">
            <span class="ff-logo-title">Smart Academic Dashboard</span>
            <span class="ff-logo-sub">FocusFox · DOM analysis engine</span>
          </div>
        </div>
        <div class="ff-header-btns">
          <button class="ff-icon-btn" id="ff-close-tmp">✕</button>
        </div>
      </div>
      <div class="ff-loading" style="flex:1">
        <div class="ff-spinner"></div>
        <span class="ff-loading-t">Scanning page…</span>
      </div>
    `;
    shell.querySelector('#ff-close-tmp')?.addEventListener('click', closeDashboard);
    document.body.appendChild(shell);
    _panel = shell;

    // Animate in
    requestAnimationFrame(() => {
      _panel!.classList.add('ff-open');
      overlay.classList.add('ff-overlay-on');
    });

    // Run actual scan asynchronously
    setTimeout(() => {
      _state = scan();

      // Remove shell, build real panel
      _panel!.remove();
      _panel = buildPanel(_state);
      document.body.appendChild(_panel);

      requestAnimationFrame(() => {
        _panel!.classList.add('ff-open');
      });

      logger.info(CONTEXT, `Dashboard opened — ${_state.findings.length} findings`);
    }, 150);
  } else {
    // Panel exists but is closed — re-scan and reopen
    requestAnimationFrame(() => {
      _panel!.classList.add('ff-open');
      overlay.classList.add('ff-overlay-on');
    });
  }
}

function closeDashboard(): void {
  _panel?.classList.remove('ff-open');
  document.getElementById(OVERLAY_ID)?.classList.remove('ff-overlay-on');
}

function isOpen(): boolean {
  return _panel ? _panel.classList.contains('ff-open') : false;
}

// ─── Public API (imported by examRadar.ts) ────────────────────────────────────

/** Called by the content script message listener to toggle the dashboard. */
export function toggleExamRadar(): void {
  if (isOpen()) {
    closeDashboard();
  } else {
    openDashboard();
  }
}

/** Completely removes all injected DOM and state (e.g. on extension unload). */
export function destroyExamRadar(): void {
  _panel?.remove();
  document.getElementById(OVERLAY_ID)?.remove();
  document.getElementById(STYLE_ID)?.remove();
  _panel = null;
  _state = null;
  logger.info(CONTEXT, 'Dashboard destroyed');
}
