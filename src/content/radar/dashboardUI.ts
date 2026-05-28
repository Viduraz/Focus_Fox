/**
 * FocusFox — Smart Academic Dashboard UI (Phase 6)
 *
 * Renders the full 400-px side panel with:
 *  • Poppins & Inter premium typography
 *  • Interactive Settings panel inside the dashboard
 *  • Theme color customization (Fox Orange, Ocean Blue, Royal Purple, Forest Green)
 *  • Real-time synchronization with popup storage
 *  • High-fidelity skeleton loader with shimmers
 *  • Beautiful empty states for all views and alerts
 *  • Mini analytics banner summarizing counts
 *  • Smooth slide, scale, rotation, and fade-in animations
 */

import { logger } from '../../utils/logger';
import { collectTextBlocks } from './detector';
import { parseFindings } from './parser';
import { applyScores, getTopTask, getAlerts } from './priorityEngine';
import { TABS, filterFindings, tabCount } from './filters';
import { getIconHTML } from './icons';
import type {
  DashboardState,
  RadarCategory,
  RadarFinding,
  CategoryMeta,
  FilterTab,
  RadarSettings,
} from './types';
import { getSettings, saveSettings } from '../../storage';
import { STORAGE_KEYS } from '../../utils/constants';

const CONTEXT = 'DashboardUI';
const PANEL_ID = 'focusfox-dashboard';
const OVERLAY_ID = 'focusfox-dashboard-overlay';
const STYLE_ID = 'focusfox-dashboard-styles';

// ─── Theme color constants ────────────────────────────────────────────────────

const COLOR_THEMES = {
  fox: { primary: '#f97316', rgb: '249, 115, 22' },
  blue: { primary: '#3b82f6', rgb: '59, 130, 246' },
  purple: { primary: '#8b5cf6', rgb: '139, 92, 246' },
  green: { primary: '#10b981', rgb: '16, 185, 129' },
} as const;

// ─── Category metadata ────────────────────────────────────────────────────────

const CAT_META: Record<RadarCategory, CategoryMeta> = {
  exam:       { icon: 'exam',       label: 'Exam',       color: '#f87171', bgColor: 'rgba(239,68,68,0.12)' },
  quiz:       { icon: 'quiz',       label: 'Quiz',       color: '#fb923c', bgColor: 'rgba(249,115,22,0.12)' },
  assignment: { icon: 'assignment', label: 'Assignment', color: '#60a5fa', bgColor: 'rgba(59,130,246,0.12)' },
  deadline:   { icon: 'deadline',   label: 'Deadline',   color: '#f43f5e', bgColor: 'rgba(244,63,94,0.12)' },
  submission: { icon: 'submission', label: 'Submission', color: '#c084fc', bgColor: 'rgba(139,92,246,0.12)' },
  marks:      { icon: 'marks',      label: 'Marks',      color: '#34d399', bgColor: 'rgba(52,211,153,0.12)' },
  important:  { icon: 'important',  label: 'Important',  color: '#fbbf24', bgColor: 'rgba(251,191,36,0.12)' },
};

/** Preferred render order for collapsible sections in the "All" view. */
const CAT_ORDER: RadarCategory[] = [
  'exam', 'deadline', 'quiz', 'assignment', 'submission', 'important', 'marks',
];

// ─── CSS ──────────────────────────────────────────────────────────────────────

const PANEL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700;800&display=swap');

/* ═══════════════════════════════════════════════════════════════════
   FocusFox Smart Academic Dashboard — Scoped Styles (Phase 6)
   ═══════════════════════════════════════════════════════════════════ */

#focusfox-dashboard,
#focusfox-dashboard * {
  box-sizing: border-box !important;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
  line-height: normal !important;
}

#focusfox-dashboard h1,
#focusfox-dashboard h2,
#focusfox-dashboard h3,
#focusfox-dashboard button,
.ff-font-poppins {
  font-family: 'Poppins', -apple-system, sans-serif !important;
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
  background: linear-gradient(180deg, #16131c 0%, #110e14 55%, #0c0a0e 100%) !important;
  border-left: 1px solid rgba(255,255,255,0.06) !important;
  box-shadow: -20px 0 80px rgba(0,0,0,0.8), -4px 0 24px rgba(0,0,0,0.5) !important;
  transform: translateX(100%) !important;
  transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease !important;
  overflow: hidden !important;
}
#focusfox-dashboard.ff-open {
  transform: translateX(0) !important;
}

/* ── Custom Theme Support ────────────────────────────────────────── */
#focusfox-dashboard {
  --ff-accent: #f97316;
  --ff-accent-rgb: 249, 115, 22;
}

/* ── SVG Sizing and Consistency ──────────────────────────────────── */
.ff-icon {
  width: 15px !important;
  height: 15px !important;
  stroke-width: 2 !important;
  flex-shrink: 0 !important;
  display: inline-block !important;
  vertical-align: middle !important;
}

/* ── Header ───────────────────────────────────────────────────────── */
.ff-header {
  flex-shrink: 0 !important;
  padding: 16px 18px 14px !important;
  background: linear-gradient(135deg, rgba(var(--ff-accent-rgb), 0.1) 0%, rgba(var(--ff-accent-rgb), 0.02) 55%, transparent 100%) !important;
  border-bottom: 1px solid rgba(255,255,255,0.06) !important;
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
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
  border-radius: 12px !important;
  background: linear-gradient(135deg, rgba(var(--ff-accent-rgb), 0.25), rgba(var(--ff-accent-rgb), 0.08)) !important;
  border: 1px solid rgba(var(--ff-accent-rgb), 0.25) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: var(--ff-accent) !important;
}
.ff-logo-icon .ff-icon {
  width: 18px !important;
  height: 18px !important;
}
.ff-logo-text { min-width: 0 !important; }
.ff-logo-title {
  display: block !important;
  font-size: 13.5px !important;
  font-weight: 700 !important;
  color: rgba(255,255,255,0.95) !important;
  letter-spacing: -0.2px !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
.ff-logo-sub {
  display: block !important;
  font-size: 10px !important;
  color: rgba(255,255,255,0.3) !important;
}
.ff-header-btns {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  flex-shrink: 0 !important;
}
.ff-icon-btn {
  width: 30px !important;
  height: 30px !important;
  border-radius: 9px !important;
  background: rgba(255,255,255,0.04) !important;
  border: 1px solid rgba(255,255,255,0.07) !important;
  color: rgba(255,255,255,0.4) !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
}
.ff-icon-btn:hover {
  background: rgba(var(--ff-accent-rgb), 0.12) !important;
  color: var(--ff-accent) !important;
  border-color: rgba(var(--ff-accent-rgb), 0.25) !important;
  transform: translateY(-1px) !important;
}
.ff-icon-btn .ff-icon {
  width: 14px !important;
  height: 14px !important;
}

/* ── Stats row ────────────────────────────────────────────────────── */
.ff-stats {
  flex-shrink: 0 !important;
  display: flex !important;
  border-bottom: 1px solid rgba(255,255,255,0.04) !important;
  background: rgba(0,0,0,0.08) !important;
}
.ff-stat {
  flex: 1 !important;
  padding: 10px 6px !important;
  text-align: center !important;
  border-right: 1px solid rgba(255,255,255,0.04) !important;
}
.ff-stat:last-child { border-right: none !important; }
.ff-stat-n {
  display: block !important;
  font-size: 20px !important;
  font-weight: 700 !important;
  color: var(--ff-accent) !important;
  letter-spacing: -0.5px !important;
  line-height: 1.1 !important;
}
.ff-stat-l {
  display: block !important;
  font-size: 9px !important;
  color: rgba(255,255,255,0.25) !important;
  text-transform: uppercase !important;
  letter-spacing: 0.6px !important;
  margin-top: 3px !important;
  font-weight: 600 !important;
}

/* ── Mini Analytics Row ───────────────────────────────────────────── */
.ff-mini-analytics {
  display: flex !important;
  gap: 6px !important;
  padding: 10px 14px 2px !important;
  flex-shrink: 0 !important;
}
.ff-mini-chip {
  display: inline-flex !important;
  align-items: center !important;
  gap: 5px !important;
  padding: 4px 9px !important;
  border-radius: 20px !important;
  font-size: 10px !important;
  font-weight: 600 !important;
  background: rgba(255,255,255,0.03) !important;
  border: 1px solid rgba(255,255,255,0.05) !important;
}
.ff-mini-chip.ff-mini-deadline { color: #f43f5e !important; border-color: rgba(244,63,94,0.15) !important; background: rgba(244,63,94,0.06) !important; }
.ff-mini-chip.ff-mini-exam { color: #fb923c !important; border-color: rgba(251,146,60,0.15) !important; background: rgba(251,146,60,0.06) !important; }
.ff-mini-chip.ff-mini-notice { color: #fbbf24 !important; border-color: rgba(251,191,36,0.15) !important; background: rgba(251,191,36,0.06) !important; }

/* ── Filter tabs ──────────────────────────────────────────────────── */
.ff-tabs {
  flex-shrink: 0 !important;
  display: flex !important;
  gap: 5px !important;
  padding: 10px 14px !important;
  background: rgba(0,0,0,0.12) !important;
  border-bottom: 1px solid rgba(255,255,255,0.04) !important;
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
  border: 1px solid rgba(255,255,255,0.06) !important;
  background: rgba(255,255,255,0.03) !important;
  color: rgba(255,255,255,0.4) !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
  white-space: nowrap !important;
}
.ff-tab:hover {
  background: rgba(var(--ff-accent-rgb), 0.08) !important;
  color: rgba(255,255,255,0.7) !important;
  border-color: rgba(var(--ff-accent-rgb), 0.2) !important;
}
.ff-tab.ff-active {
  background: rgba(var(--ff-accent-rgb), 0.15) !important;
  color: var(--ff-accent) !important;
  border-color: rgba(var(--ff-accent-rgb), 0.35) !important;
}
.ff-tab-cnt {
  font-size: 9.5px !important;
  background: rgba(255,255,255,0.06) !important;
  border-radius: 10px !important;
  padding: 1px 6px !important;
  color: rgba(255,255,255,0.3) !important;
}
.ff-tab.ff-active .ff-tab-cnt {
  background: rgba(var(--ff-accent-rgb), 0.18) !important;
  color: var(--ff-accent) !important;
}

/* ── Scrollable content area ──────────────────────────────────────── */
.ff-scroll {
  flex: 1 !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  padding: 14px 14px 26px !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 14px !important;
}
.ff-scroll::-webkit-scrollbar { width: 3px !important; }
.ff-scroll::-webkit-scrollbar-track { background: transparent !important; }
.ff-scroll::-webkit-scrollbar-thumb {
  background: rgba(var(--ff-accent-rgb), 0.25) !important;
  border-radius: 3px !important;
}

/* ── Section eyebrow labels ───────────────────────────────────────── */
.ff-eyebrow {
  font-size: 9.5px !important;
  font-weight: 700 !important;
  color: rgba(255,255,255,0.3) !important;
  text-transform: uppercase !important;
  letter-spacing: 0.8px !important;
  padding: 0 2px !important;
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
  padding: 16px !important;
  background: linear-gradient(135deg, rgba(var(--ff-accent-rgb), 0.15) 0%, rgba(var(--ff-accent-rgb), 0.04) 65%, rgba(0,0,0,0.1) 100%) !important;
  border: 1px solid rgba(var(--ff-accent-rgb), 0.28) !important;
  position: relative !important;
  overflow: hidden !important;
  animation: ff-pulse 4s ease-in-out infinite !important;
}
@keyframes ff-pulse {
  0%,100% { border-color: rgba(var(--ff-accent-rgb), 0.25) !important; box-shadow: none !important; }
  50%      { border-color: rgba(var(--ff-accent-rgb), 0.5) !important; box-shadow: 0 0 20px rgba(var(--ff-accent-rgb), 0.06) !important; }
}
.ff-next-glow {
  position: absolute !important;
  top: -30px !important; right: -30px !important;
  width: 120px !important; height: 120px !important;
  background: radial-gradient(circle, rgba(var(--ff-accent-rgb), 0.2), transparent 70%) !important;
  pointer-events: none !important;
}
.ff-next-pin {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  font-size: 9.5px !important;
  font-weight: 700 !important;
  color: var(--ff-accent) !important;
  text-transform: uppercase !important;
  letter-spacing: 0.8px !important;
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
  color: rgba(255,255,255,0.45) !important;
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
  gap: 6px !important;
}
.ff-alert-item {
  display: flex !important;
  align-items: flex-start !important;
  gap: 10px !important;
  padding: 10px 13px !important;
  border-radius: 10px !important;
  background: rgba(255,255,255,0.03) !important;
  border: 1px solid rgba(255,255,255,0.05) !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
  cursor: pointer !important;
}
.ff-alert-item:hover {
  background: rgba(255,255,255,0.06) !important;
  border-color: rgba(var(--ff-accent-rgb), 0.18) !important;
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
  font-size: 12px !important;
  color: rgba(255,255,255,0.75) !important;
  font-weight: 500 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
.ff-alert-sub {
  display: block !important;
  font-size: 10.5px !important;
  color: rgba(255,255,255,0.3) !important;
  margin-top: 1px !important;
}

/* ── Collapsible sections ─────────────────────────────────────────── */
.ff-section {
  border-radius: 12px !important;
  background: rgba(255,255,255,0.02) !important;
  border: 1px solid rgba(255,255,255,0.05) !important;
  overflow: hidden !important;
}
.ff-sec-header {
  display: flex !important;
  align-items: center !important;
  padding: 11px 14px !important;
  cursor: pointer !important;
  user-select: none !important;
  transition: background 0.2s !important;
  gap: 8px !important;
}
.ff-sec-header:hover { background: rgba(255,255,255,0.03) !important; }
.ff-sec-icon { font-size: 14px !important; flex-shrink: 0 !important; display: flex !important; align-items: center; justify-content: center; }
.ff-sec-icon .ff-icon { width: 14px !important; height: 14px !important; }
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
  background: rgba(255,255,255,0.05) !important;
  color: rgba(255,255,255,0.3) !important;
  font-weight: 600 !important;
}
.ff-sec-chevron {
  font-size: 10px !important;
  color: rgba(255,255,255,0.2) !important;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
  flex-shrink: 0 !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
}
.ff-sec-chevron .ff-icon { width: 11px !important; height: 11px !important; }
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
  padding: 12px 14px 12px 16px !important;
  background: rgba(255,255,255,0.035) !important;
  border: 1px solid rgba(255,255,255,0.06) !important;
  position: relative !important;
  overflow: hidden !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
  cursor: pointer !important;
}
.ff-card:hover {
  background: rgba(255,255,255,0.065) !important;
  border-color: rgba(var(--ff-accent-rgb), 0.15) !important;
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
  flex-shrink: 0 !important;
}
.ff-card-icon .ff-icon { width: 15px !important; height: 15px !important; }
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
  color: rgba(255,255,255,0.38) !important;
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
  font-size: 10px !important;
  color: rgba(255,255,255,0.35) !important;
  background: rgba(255,255,255,0.03) !important;
  border: 1px solid rgba(255,255,255,0.06) !important;
  padding: 2px 8px !important;
  border-radius: 20px !important;
}
.ff-date-chip .ff-icon { width: 10px !important; height: 10px !important; opacity: 0.6; }

/* ── Badge atoms ──────────────────────────────────────────────────── */
.ff-badge {
  display: inline-flex !important;
  align-items: center !important;
  gap: 4px !important;
  font-size: 9px !important;
  font-weight: 700 !important;
  padding: 2px 8px !important;
  border-radius: 20px !important;
  text-transform: uppercase !important;
  letter-spacing: 0.4px !important;
  white-space: nowrap !important;
}
.ff-urg-high   { background: rgba(239,68,68,0.12)  !important; color:#f87171 !important; border:1px solid rgba(239,68,68,0.2)  !important; }
.ff-urg-medium { background: rgba(249,115,22,0.1) !important; color:#fb923c !important; border:1px solid rgba(249,115,22,0.18) !important; }
.ff-urg-low    { background: rgba(99,102,241,0.1)  !important; color:#a5b4fc !important; border:1px solid rgba(99,102,241,0.16)  !important; }
.ff-badge-new  {
  background: rgba(var(--ff-accent-rgb), 0.15) !important;
  color: var(--ff-accent) !important;
  border: 1px solid rgba(var(--ff-accent-rgb), 0.25) !important;
  font-size: 8.5px !important;
}

/* ── Compact UI Customizations ────────────────────────────────────── */
.ff-compact .ff-card-desc,
.ff-compact .ff-next-desc {
  display: none !important;
}
.ff-compact .ff-card {
  padding: 8px 10px 8px 12px !important;
}
.ff-compact .ff-sec-body {
  gap: 4px !important;
}
.ff-compact .ff-scroll {
  gap: 8px !important;
}
.ff-compact .ff-next-card {
  padding: 10px 12px !important;
}

/* ── Animation Entrances ──────────────────────────────────────────── */
@keyframes ff-fade-in-up {
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.ff-animate-card {
  animation: ff-fade-in-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
}

/* ── Empty state ──────────────────────────────────────────────────── */
.ff-empty {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 55px 24px !important;
  text-align: center !important;
  gap: 12px !important;
  animation: ff-fade-in-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
}
.ff-empty-graphic {
  color: var(--ff-accent) !important;
  opacity: 0.25 !important;
  width: 44px !important;
  height: 44px !important;
}
.ff-empty-title { font-size: 14.5px !important; font-weight: 700 !important; color: rgba(255,255,255,0.7) !important; }
.ff-empty-sub   { font-size: 12px !important; color: rgba(255,255,255,0.3) !important; line-height: 1.65 !important; }

/* ── Loading Skeleton loader ──────────────────────────────────────── */
.ff-skeleton-wrap {
  display: flex !important;
  flex-direction: column !important;
  gap: 14px !important;
  padding: 4px 0 !important;
}
.ff-skeleton-card {
  background: rgba(255,255,255,0.02) !important;
  border: 1px solid rgba(255,255,255,0.05) !important;
  border-radius: 12px !important;
  padding: 16px !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 10px !important;
  position: relative !important;
  overflow: hidden !important;
}
.ff-skeleton-strip {
  height: 10px !important;
  background: rgba(255,255,255,0.05) !important;
  border-radius: 4px !important;
}
.ff-pulse {
  animation: ff-pulse-anim 1.5s ease-in-out infinite !important;
}
@keyframes ff-pulse-anim {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
}

/* ── Settings Screen UI ───────────────────────────────────────────── */
.ff-settings-wrap {
  display: flex !important;
  flex-direction: column !important;
  gap: 18px !important;
  animation: ff-fade-in-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
}
.ff-settings-title {
  font-size: 14px !important;
  font-weight: 700 !important;
  color: rgba(255,255,255,0.95) !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}
.ff-settings-title .ff-icon {
  color: var(--ff-accent) !important;
  width: 16px !important;
  height: 16px !important;
}
.ff-settings-sec {
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
}
.ff-settings-label {
  font-size: 9.5px !important;
  font-weight: 700 !important;
  color: rgba(255,255,255,0.3) !important;
  text-transform: uppercase !important;
  letter-spacing: 0.8px !important;
}
.ff-settings-grid {
  display: grid !important;
  grid-template-cols: 1fr !important;
  gap: 6px !important;
}
.ff-setting-toggle-row {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 9px 12px !important;
  background: rgba(255,255,255,0.02) !important;
  border: 1px solid rgba(255,255,255,0.05) !important;
  border-radius: 10px !important;
  cursor: pointer !important;
  transition: all 0.2s !important;
}
.ff-setting-toggle-row:hover {
  background: rgba(255,255,255,0.04) !important;
  border-color: rgba(255,255,255,0.08) !important;
}
.ff-toggle-outer {
  width: 32px !important;
  height: 18px !important;
  border-radius: 20px !important;
  background: rgba(255,255,255,0.12) !important;
  padding: 2px !important;
  transition: background-color 0.2s !important;
}
.ff-toggle-outer.ff-active {
  background-color: var(--ff-accent) !important;
}
.ff-toggle-inner {
  width: 14px !important;
  height: 14px !important;
  border-radius: 50% !important;
  background: white !important;
  transition: transform 0.2s !important;
}
.ff-toggle-outer.ff-active .ff-toggle-inner {
  transform: translateX(14px) !important;
}
.ff-setting-info {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}
.ff-setting-info .ff-icon {
  width: 15px !important;
  height: 15px !important;
}

/* Color theme selector bubbles */
.ff-theme-row {
  display: flex !important;
  gap: 10px !important;
  padding: 2px 0 !important;
}
.ff-theme-bubble {
  width: 26px !important;
  height: 26px !important;
  border-radius: 50% !important;
  cursor: pointer !important;
  border: 2px solid transparent !important;
  transition: transform 0.15s, border-color 0.15s !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
  color: white !important;
}
.ff-theme-bubble:hover { transform: scale(1.08) !important; }
.ff-theme-bubble.ff-active {
  border-color: white !important;
  transform: scale(1.1) !important;
}
.ff-theme-bubble.ff-theme-fox { background-color: #f97316 !important; }
.ff-theme-bubble.ff-theme-blue { background-color: #3b82f6 !important; }
.ff-theme-bubble.ff-theme-purple { background-color: #8b5cf6 !important; }
.ff-theme-bubble.ff-theme-green { background-color: #10b981 !important; }

/* Urgency sensitivities button group */
.ff-sens-group {
  display: grid !important;
  grid-template-cols: 1fr 1fr 1fr !important;
  gap: 6px !important;
}
.ff-sens-btn {
  background: rgba(255,255,255,0.02) !important;
  border: 1px solid rgba(255,255,255,0.05) !important;
  padding: 8px 4px !important;
  border-radius: 10px !important;
  color: rgba(255,255,255,0.5) !important;
  cursor: pointer !important;
  text-align: center !important;
  transition: all 0.2s !important;
}
.ff-sens-btn:hover {
  background: rgba(255,255,255,0.04) !important;
  color: rgba(255,255,255,0.8) !important;
}
.ff-sens-btn.ff-active {
  background: rgba(var(--ff-accent-rgb), 0.1) !important;
  border-color: var(--ff-accent) !important;
  color: var(--ff-accent) !important;
  font-weight: 700 !important;
}
.ff-sens-btn-sub {
  display: block !important;
  font-size: 8.5px !important;
  opacity: 0.6 !important;
  margin-top: 2px !important;
  font-weight: normal !important;
}

/* ── Footer bar ───────────────────────────────────────────────────── */
.ff-footer {
  flex-shrink: 0 !important;
  padding: 10px 14px !important;
  background: rgba(0,0,0,0.2) !important;
  border-top: 1px solid rgba(255,255,255,0.04) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
}
.ff-footer-info { font-size: 10px !important; color: rgba(255,255,255,0.2) !important; }
.ff-rescan-btn {
  font-size: 11px !important;
  font-weight: 600 !important;
  color: var(--ff-accent) !important;
  background: rgba(var(--ff-accent-rgb), 0.12) !important;
  border: 1px solid rgba(var(--ff-accent-rgb), 0.25) !important;
  border-radius: 8px !important;
  padding: 5px 12px !important;
  cursor: pointer !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
  display: flex !important;
  align-items: center !important;
  gap: 5px !important;
}
.ff-rescan-btn:hover {
  background: rgba(var(--ff-accent-rgb), 0.22) !important;
  border-color: rgba(var(--ff-accent-rgb), 0.45) !important;
}
.ff-rescan-btn .ff-icon { width: 10px !important; height: 10px !important; }

/* ── Overlay ──────────────────────────────────────────────────────── */
#focusfox-dashboard-overlay {
  position: fixed !important;
  inset: 0 !important;
  z-index: 2147483639 !important;
  background: transparent !important;
  pointer-events: none !important;
  transition: background 0.45s ease !important;
}
#focusfox-dashboard-overlay.ff-overlay-on {
  background: rgba(0,0,0,0.3) !important;
  pointer-events: auto !important;
}

/* ── Scroll-to-source flash on the LMS page element ──────────────── */
@keyframes ff-source-flash {
  0%   { outline: 3px solid rgba(var(--ff-accent-rgb), 0)   !important; outline-offset: 4px !important; }
  15%  { outline: 3px solid rgba(var(--ff-accent-rgb), 0.85) !important; outline-offset: 4px !important;
          background-color: rgba(var(--ff-accent-rgb), 0.12)  !important; }
  85%  { outline: 3px solid rgba(var(--ff-accent-rgb), 0.55) !important; outline-offset: 4px !important;
          background-color: rgba(var(--ff-accent-rgb), 0.05)  !important; }
  100% { outline: 3px solid rgba(var(--ff-accent-rgb), 0)   !important; outline-offset: 4px !important;
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
  color: rgba(var(--ff-accent-rgb), 0.6) !important;
  margin-left: auto !important;
  opacity: 0.7 !important;
}
.ff-scroll-hint .ff-icon { width: 9px !important; height: 9px !important; }
`;

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
 */
function scrollToSource(target: Element): void {
  try {
    document.querySelectorAll('.' + SOURCE_FLASH_CLASS).forEach((el) => {
      el.classList.remove(SOURCE_FLASH_CLASS);
    });

    const panel = document.getElementById(PANEL_ID);
    if (panel) {
      panel.style.opacity = '0.25';
      panel.style.pointerEvents = 'none';
      setTimeout(() => {
        panel.style.opacity = '';
        panel.style.pointerEvents = '';
      }, 1400);
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

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
  s.style.border = `1px solid ${m.color}25`;
  
  const iconSpan = el('span', 'ff-badge-icon');
  iconSpan.innerHTML = getIconHTML(m.icon as any);
  s.appendChild(iconSpan);

  const textSpan = el('span');
  textSpan.textContent = m.label;
  s.appendChild(textSpan);
  
  return s;
}

function urgBadge(urgency: 'high' | 'medium' | 'low'): HTMLElement {
  const labels = { high: 'Urgent', medium: 'Soon', low: 'Info' };
  const s = el('span', `ff-badge ff-urg-${urgency}`);
  
  const dot = el('span');
  dot.style.width = '5px';
  dot.style.height = '5px';
  dot.style.borderRadius = '50%';
  dot.style.background = urgency === 'high' ? '#f87171' : urgency === 'medium' ? '#fb923c' : '#a5b4fc';
  
  s.appendChild(dot);
  const txt = el('span');
  txt.textContent = labels[urgency];
  s.appendChild(txt);
  
  return s;
}

function newBadge(): HTMLElement {
  const s = el('span', 'ff-badge ff-badge-new');
  s.textContent = 'New';
  return s;
}

function datechip(date: string): HTMLElement {
  const d = el('div', 'ff-date-chip');
  d.innerHTML = `${getIconHTML('deadline')} <span>${date}</span>`;
  return d;
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function buildCard(f: RadarFinding, index: number): HTMLElement {
  const meta = CAT_META[f.category];
  const card = el('div', 'ff-card ff-animate-card');
  card.style.animationDelay = `${index * 50}ms`;

  const bar = el('div', 'ff-card-bar');
  bar.style.background = meta.color;
  card.appendChild(bar);

  const top = el('div', 'ff-card-top');

  const icon = el('div', 'ff-card-icon');
  icon.style.background = meta.bgColor;
  icon.style.color = meta.color;
  icon.innerHTML = getIconHTML(meta.icon as any);
  top.appendChild(icon);

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

  const foot = el('div', 'ff-card-foot');
  if (f.detectedDate) foot.appendChild(datechip(f.detectedDate));
  if (f.sourceElement) {
    const hint = el('span', 'ff-scroll-hint');
    hint.innerHTML = `${getIconHTML('sparkles')} View on page`;
    foot.appendChild(hint);
  }
  if (foot.childNodes.length > 0) card.appendChild(foot);

  if (f.sourceElement) {
    const target = f.sourceElement;
    card.addEventListener('click', () => scrollToSource(target));
  }

  return card;
}

// ─── Next Important Task ──────────────────────────────────────────────────────

function buildNextTask(f: RadarFinding): HTMLElement {
  const meta = CAT_META[f.category];
  const wrap = el('div', 'ff-next-wrap ff-animate-card');
  
  const eyebrow = el('span', 'ff-eyebrow');
  eyebrow.textContent = '🎯 Next Important Task';
  wrap.appendChild(eyebrow);

  const card = el('div', 'ff-next-card');
  if (f.sourceElement) card.style.cursor = 'pointer';

  const glow = el('div', 'ff-next-glow');
  card.appendChild(glow);

  const pin = el('div', 'ff-next-pin');
  pin.innerHTML = `${getIconHTML(meta.icon as any)} <span>${meta.label}</span>`;
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
    hint.innerHTML = `${getIconHTML('sparkles')} View on page`;
    metaRow.appendChild(hint);
  }
  card.appendChild(metaRow);

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
  
  const wrap = el('div', 'ff-alerts-wrap ff-animate-card');
  wrap.style.animationDelay = '100ms';

  const eyebrow = el('span', 'ff-eyebrow');
  eyebrow.textContent = '🚨 Latest Alerts';
  wrap.appendChild(eyebrow);

  if (alerts.length === 0) {
    // Beautiful empty state for alerts
    const emptyAlertBox = el('div', 'ff-alert-item');
    emptyAlertBox.style.cursor = 'default';
    emptyAlertBox.style.background = 'rgba(255,255,255,0.01)';
    emptyAlertBox.style.justifyContent = 'center';
    emptyAlertBox.style.padding = '12px 14px';

    const body = el('div', 'ff-alert-body');
    body.style.textAlign = 'center';

    const text = el('span', 'ff-alert-text');
    text.style.color = 'rgba(255,255,255,0.4)';
    text.style.fontSize = '11px';
    text.textContent = '🎉 No urgent academic alerts detected.';
    
    const sub = el('span', 'ff-alert-sub');
    sub.textContent = "You're all caught up!";
    sub.style.marginTop = '2px';
    sub.style.fontSize = '9.5px';

    body.appendChild(text);
    body.appendChild(sub);
    emptyAlertBox.appendChild(body);
    wrap.appendChild(emptyAlertBox);
    return wrap;
  }

  for (const f of alerts) {
    const meta = CAT_META[f.category];
    const item = el('div', 'ff-alert-item');

    const dot = el('div', 'ff-alert-dot');
    dot.style.background = f.urgency === 'high' ? '#f87171' : '#fb923c';
    item.appendChild(dot);

    const body = el('div', 'ff-alert-body');
    const txt = el('span', 'ff-alert-text');
    txt.textContent = f.title;
    body.appendChild(txt);

    if (f.detectedDate) {
      const sub = el('span', 'ff-alert-sub');
      sub.innerHTML = `${getIconHTML(meta.icon as any)} ${f.detectedDate}`;
      body.appendChild(sub);
    }
    item.appendChild(body);
    item.appendChild(catBadge(f.category));

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
  secIndex: number,
): HTMLElement {
  const meta = CAT_META[cat];
  const isCollapsed = state.collapsedSections.has(cat);

  const section = el('div', 'ff-section' + (isCollapsed ? ' ff-collapsed' : '') + ' ff-animate-card');
  section.style.animationDelay = `${secIndex * 80 + 100}ms`;
  section.dataset['cat'] = cat;

  // Clickable header
  const header = el('div', 'ff-sec-header');

  const icon = el('span', 'ff-sec-icon');
  icon.style.color = meta.color;
  icon.innerHTML = getIconHTML(meta.icon as any);
  header.appendChild(icon);

  const name = el('span', 'ff-sec-name');
  name.style.color = meta.color;
  name.textContent = meta.label;
  header.appendChild(name);

  const cnt = el('span', 'ff-sec-cnt');
  cnt.textContent = String(catFindings.length);
  header.appendChild(cnt);

  const chevron = el('span', 'ff-sec-chevron');
  chevron.innerHTML = getIconHTML('chevronDown');
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
  catFindings.forEach((f, idx) => {
    body.appendChild(buildCard(f, idx));
  });
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

// ─── Mini Analytics chips ─────────────────────────────────────────────────────

function buildMiniAnalytics(findings: RadarFinding[]): HTMLElement {
  const row = el('div', 'ff-mini-analytics');
  
  const deadlines = findings.filter((f) => f.category === 'deadline').length;
  const exams = findings.filter((f) => f.category === 'exam' || f.category === 'quiz').length;
  const notices = findings.filter((f) => f.category === 'important').length;

  const createChip = (count: number, label: string, type: 'deadline' | 'exam' | 'notice', iconName: any) => {
    const chip = el('div', `ff-mini-chip ff-mini-${type}`);
    chip.innerHTML = `${getIconHTML(iconName)} <span>${count} ${label}</span>`;
    return chip;
  };

  row.appendChild(createChip(deadlines, deadlines === 1 ? 'Deadline' : 'Deadlines', 'deadline', 'deadline'));
  row.appendChild(createChip(exams, exams === 1 ? 'Exam' : 'Exams', 'exam', 'exam'));
  row.appendChild(createChip(notices, notices === 1 ? 'Notice' : 'Notices', 'notice', 'important'));

  return row;
}

// ─── Filter tab bar ───────────────────────────────────────────────────────────

function buildTabBar(state: DashboardState, panel: HTMLElement): HTMLElement {
  const bar = el('div', 'ff-tabs');

  for (const tab of TABS) {
    const btn = el('button', 'ff-tab' + (state.activeFilter === tab.id ? ' ff-active' : ''));
    btn.innerHTML = `${getIconHTML(tab.icon as any)}  <span>${tab.label}</span>`;

    const cnt = el('span', 'ff-tab-cnt');
    cnt.textContent = String(tabCount(state.findings, tab.id));
    btn.appendChild(cnt);

    btn.addEventListener('click', () => {
      if (state.activeFilter === tab.id) return;
      state.activeFilter = tab.id as FilterTab;
      bar.querySelectorAll('.ff-tab').forEach((t) => t.classList.remove('ff-active'));
      btn.classList.add('ff-active');
      swapScrollContent(panel, state);
    });

    bar.appendChild(btn);
  }

  return bar;
}

// ─── Settings Screen Builder ──────────────────────────────────────────────────

function buildSettingsScreen(state: DashboardState, panel: HTMLElement): HTMLElement {
  const wrap = el('div', 'ff-settings-wrap');

  // Title
  const title = el('div', 'ff-settings-title');
  title.innerHTML = `${getIconHTML('settings')} <span>Exam Radar Settings</span>`;
  wrap.appendChild(title);

  const saveAndRefresh = async () => {
    // Save to chrome storage
    await saveSettings({
      radarSettings: state.radarSettings,
    });
    
    // Update local variables on container
    updateThemeStyle(panel, state.radarSettings.colorTheme);
    updateCompactMode(panel, state.radarSettings.compactMode);

    // Apply scores
    const blocks = collectTextBlocks();
    state.findings = applyScores(parseFindings(blocks), state.radarSettings);

    // Update statistics
    const statsEl = panel.querySelector('.ff-stats');
    if (statsEl) {
      const newStats = buildStats(state.findings);
      panel.replaceChild(newStats, statsEl);
    }
  };

  // Section 1: Categories
  const catSec = el('div', 'ff-settings-sec');
  const catLabel = el('span', 'ff-settings-label');
  catLabel.textContent = 'PARSE CATEGORIES';
  catSec.appendChild(catLabel);

  const grid = el('div', 'ff-settings-grid');
  const categories: { key: RadarCategory; label: string; icon: any }[] = [
    { key: 'exam', label: 'Exams', icon: 'exam' },
    { key: 'quiz', label: 'Quizzes', icon: 'quiz' },
    { key: 'assignment', label: 'Assignments', icon: 'assignment' },
    { key: 'deadline', label: 'Deadlines', icon: 'deadline' },
    { key: 'submission', label: 'Submissions', icon: 'submission' },
    { key: 'marks', label: 'Grades & Marks', icon: 'marks' },
    { key: 'important', label: 'Notices', icon: 'important' },
  ];

  for (const { key, label, icon } of categories) {
    const row = el('div', 'ff-setting-toggle-row');
    const isEnabled = state.radarSettings.enabledCategories[key] !== false;

    const info = el('div', 'ff-setting-info');
    info.innerHTML = `${getIconHTML(icon)} <span style="font-size:11.5px; font-weight:500;">${label}</span>`;
    row.appendChild(info);

    const toggle = el('div', 'ff-toggle-outer' + (isEnabled ? ' ff-active' : ''));
    const toggleInner = el('div', 'ff-toggle-inner');
    toggle.appendChild(toggleInner);
    row.appendChild(toggle);

    row.addEventListener('click', async () => {
      state.radarSettings.enabledCategories[key] = !isEnabled;
      toggle.classList.toggle('ff-active');
      await saveAndRefresh();
    });

    grid.appendChild(row);
  }
  catSec.appendChild(grid);
  wrap.appendChild(catSec);

  // Section 2: Color Theme
  const themeSec = el('div', 'ff-settings-sec');
  const themeLabel = el('span', 'ff-settings-label');
  themeLabel.textContent = 'THEME ACCENT';
  themeSec.appendChild(themeLabel);

  const themeRow = el('div', 'ff-theme-row');
  const themes: ('fox' | 'blue' | 'purple' | 'green')[] = ['fox', 'blue', 'purple', 'green'];
  for (const t of themes) {
    const bubble = el('div', 'ff-theme-bubble ff-theme-' + t + (state.radarSettings.colorTheme === t ? ' ff-active' : ''));
    if (state.radarSettings.colorTheme === t) {
      bubble.innerHTML = getIconHTML('checkCircle');
    }
    
    bubble.addEventListener('click', async () => {
      themeRow.querySelectorAll('.ff-theme-bubble').forEach(b => {
        b.classList.remove('ff-active');
        b.innerHTML = '';
      });
      bubble.classList.add('ff-active');
      bubble.innerHTML = getIconHTML('checkCircle');
      state.radarSettings.colorTheme = t;
      await saveAndRefresh();
    });
    themeRow.appendChild(bubble);
  }
  themeSec.appendChild(themeRow);
  wrap.appendChild(themeSec);

  // Section 3: Urgency Sensitivity
  const sensSec = el('div', 'ff-settings-sec');
  const sensLabel = el('span', 'ff-settings-label');
  sensLabel.textContent = 'URGENCY SENSITIVITY';
  sensSec.appendChild(sensLabel);

  const btnGroup = el('div', 'ff-sens-group');
  const levels: { id: 'relaxed' | 'standard' | 'high'; title: string; desc: string }[] = [
    { id: 'relaxed', title: 'Relaxed', desc: 'Fewer' },
    { id: 'standard', title: 'Standard', desc: 'Normal' },
    { id: 'high', title: 'Aggressive', desc: 'All alerts' },
  ];

  for (const lvl of levels) {
    const btn = el('button', 'ff-sens-btn' + (state.radarSettings.urgencySensitivity === lvl.id ? ' ff-active' : ''));
    btn.innerHTML = `<span style="font-size:11px; font-weight:700;">${lvl.title}</span><span class="ff-sens-btn-sub">${lvl.desc}</span>`;
    
    btn.addEventListener('click', async () => {
      btnGroup.querySelectorAll('.ff-sens-btn').forEach(b => b.classList.remove('ff-active'));
      btn.classList.add('ff-active');
      state.radarSettings.urgencySensitivity = lvl.id;
      await saveAndRefresh();
    });
    btnGroup.appendChild(btn);
  }
  sensSec.appendChild(btnGroup);
  wrap.appendChild(sensSec);

  // Section 4: Compact Mode
  const layoutSec = el('div', 'ff-settings-sec');
  const layoutLabel = el('span', 'ff-settings-label');
  layoutLabel.textContent = 'UI LAYOUT';
  layoutSec.appendChild(layoutLabel);

  const compRow = el('div', 'ff-setting-toggle-row');
  const compInfo = el('div', 'ff-setting-info');
  compInfo.innerHTML = `${getIconHTML('sparkles')} <span style="font-size:11.5px; font-weight:500;">Compact Cards (Hide Details)</span>`;
  compRow.appendChild(compInfo);

  const isComp = state.radarSettings.compactMode === true;
  const compToggle = el('div', 'ff-toggle-outer' + (isComp ? ' ff-active' : ''));
  const compToggleInner = el('div', 'ff-toggle-inner');
  compToggle.appendChild(compToggleInner);
  compRow.appendChild(compToggle);

  compRow.addEventListener('click', async () => {
    state.radarSettings.compactMode = !state.radarSettings.compactMode;
    compToggle.classList.toggle('ff-active');
    await saveAndRefresh();
  });
  layoutSec.appendChild(compRow);
  wrap.appendChild(layoutSec);

  return wrap;
}

// ─── Scroll content builder ───────────────────────────────────────────────────

function buildScrollContent(state: DashboardState, panel: HTMLElement): HTMLElement {
  const scroll = el('div', 'ff-scroll');
  scroll.id = 'ff-scroll';

  // 1. If in Settings View, return settings panel
  if (state.view === 'settings') {
    scroll.appendChild(buildSettingsScreen(state, panel));
    return scroll;
  }

  // 2. Filter findings
  const filtered = filterFindings(state.findings, state.activeFilter);

  if (filtered.length === 0) {
    const empty = el('div', 'ff-empty');
    
    const graphic = el('div', 'ff-empty-graphic');
    graphic.innerHTML = getIconHTML('checkCircle');
    empty.appendChild(graphic);

    const title = el('span', 'ff-empty-title');
    title.textContent = 'Nothing detected here';

    const sub = el('span', 'ff-empty-sub');
    sub.textContent = state.activeFilter === 'all'
      ? 'No academic content found on this page.\nTry navigating to a course or module page.'
      : `No ${state.activeFilter} found on this page.`;

    empty.appendChild(title);
    empty.appendChild(sub);
    scroll.appendChild(empty);
    return scroll;
  }

  // 3. "All" view: Next Task + Alerts + collapsible sections
  if (state.activeFilter === 'all') {
    const top = getTopTask(state.findings);
    if (top) scroll.appendChild(buildNextTask(top));

    const alertsEl = buildAlerts(state);
    if (alertsEl) scroll.appendChild(alertsEl);

    CAT_ORDER.forEach((cat, secIdx) => {
      const catItems = filtered.filter((f) => f.category === cat);
      if (catItems.length === 0) return;
      scroll.appendChild(buildSection(cat, catItems, state, secIdx));
    });
    return scroll;
  }

  // 4. Filtered view: flat card list
  const eyebrow = el('span', 'ff-eyebrow');
  const tab = TABS.find((t) => t.id === state.activeFilter);
  eyebrow.textContent = `${tab?.label ?? ''} — ${filtered.length} found`;
  scroll.appendChild(eyebrow);

  filtered.forEach((f, idx) => {
    scroll.appendChild(buildCard(f, idx));
  });

  return scroll;
}

/** Swaps only the scroll content area (keeps header/stats/tabs intact). */
function swapScrollContent(panel: HTMLElement, state: DashboardState): void {
  const old = panel.querySelector('#ff-scroll');
  const next = buildScrollContent(state, panel);
  if (old) {
    panel.replaceChild(next, old);
  } else {
    const footer = panel.querySelector('.ff-footer');
    if (footer) panel.insertBefore(next, footer);
    else panel.appendChild(next);
  }
}

// ─── High-Fidelity Skeleton Loader ──────────────────────────────────────────

function buildSkeletonContent(): HTMLElement {
  const wrap = el('div', 'ff-skeleton-wrap');

  // Next Important Task skeleton
  const nextSk = el('div', 'ff-skeleton-card');
  
  const line1 = el('div', 'ff-skeleton-strip ff-pulse');
  line1.style.width = '30%';
  line1.style.height = '7px';
  line1.style.background = 'rgba(255,255,255,0.06)';
  
  const line2 = el('div', 'ff-skeleton-strip ff-pulse');
  line2.style.width = '75%';
  line2.style.height = '14px';
  
  const line3 = el('div', 'ff-skeleton-strip ff-pulse');
  line3.style.width = '50%';
  line3.style.height = '9px';

  nextSk.appendChild(line1);
  nextSk.appendChild(line2);
  nextSk.appendChild(line3);
  wrap.appendChild(nextSk);

  // Content card skeletons
  for (let i = 0; i < 2; i++) {
    const cardSk = el('div', 'ff-skeleton-card');
    cardSk.style.background = 'rgba(255,255,255,0.015)';

    const row = el('div');
    row.style.display = 'flex';
    row.style.gap = '10px';
    row.style.alignItems = 'center';

    const circle = el('div', 'ff-pulse');
    circle.style.width = '28px';
    circle.style.height = '28px';
    circle.style.borderRadius = '8px';
    circle.style.background = 'rgba(255,255,255,0.04)';
    circle.style.flexShrink = '0';
    row.appendChild(circle);

    const body = el('div');
    body.style.flex = '1';
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '6px';

    const badgeStrip = el('div', 'ff-skeleton-strip ff-pulse');
    badgeStrip.style.width = '20%';
    badgeStrip.style.height = '6px';
    
    const titleStrip = el('div', 'ff-skeleton-strip ff-pulse');
    titleStrip.style.width = '80%';
    titleStrip.style.height = '10px';

    body.appendChild(badgeStrip);
    body.appendChild(titleStrip);
    row.appendChild(body);
    cardSk.appendChild(row);
    wrap.appendChild(cardSk);
  }

  return wrap;
}

// ─── Dynamic Layout Modification Helpers ─────────────────────────────────────

function updateThemeStyle(panel: HTMLElement, theme: 'fox' | 'blue' | 'purple' | 'green') {
  const active = COLOR_THEMES[theme] || COLOR_THEMES.fox;
  panel.style.setProperty('--ff-accent', active.primary);
  panel.style.setProperty('--ff-accent-rgb', active.rgb);
}

function updateCompactMode(panel: HTMLElement, isCompact: boolean) {
  if (isCompact) {
    panel.classList.add('ff-compact');
  } else {
    panel.classList.remove('ff-compact');
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
  logoIcon.innerHTML = getIconHTML('sparkles');
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

  // Settings Gear button
  const settingsBtn = el('button', 'ff-icon-btn');
  settingsBtn.title = 'Settings';
  settingsBtn.innerHTML = getIconHTML('settings');
  settingsBtn.addEventListener('click', () => {
    const isSettings = state.view === 'settings';
    state.view = isSettings ? 'dashboard' : 'settings';
    settingsBtn.innerHTML = getIconHTML(isSettings ? 'settings' : 'arrowLeft');
    settingsBtn.title = isSettings ? 'Settings' : 'Back';
    
    // Hide/show stats row, mini-analytics, and tabs depending on settings view
    const statsRow = panel.querySelector('.ff-stats') as HTMLElement;
    const miniRow = panel.querySelector('.ff-mini-analytics') as HTMLElement;
    const tabsRow = panel.querySelector('.ff-tabs') as HTMLElement;

    if (state.view === 'settings') {
      if (statsRow) statsRow.style.display = 'none';
      if (miniRow) miniRow.style.display = 'none';
      if (tabsRow) tabsRow.style.display = 'none';
    } else {
      if (statsRow) statsRow.style.display = '';
      if (miniRow) miniRow.style.display = '';
      if (tabsRow) tabsRow.style.display = '';

      // Redraw stats & tabs as settings changes might have changed finding counts
      const oldStats = panel.querySelector('.ff-stats');
      const newStats = buildStats(state.findings);
      if (oldStats && statsRow) panel.replaceChild(newStats, oldStats);

      const oldMini = panel.querySelector('.ff-mini-analytics');
      const newMini = buildMiniAnalytics(state.findings);
      if (oldMini && miniRow) panel.replaceChild(newMini, oldMini);

      const oldTabs = panel.querySelector('.ff-tabs');
      const newTabs = buildTabBar(state, panel);
      if (oldTabs && tabsRow) panel.replaceChild(newTabs, oldTabs);
    }

    swapScrollContent(panel, state);
  });
  btns.appendChild(settingsBtn);

  // Close button
  const closeBtn = el('button', 'ff-icon-btn');
  closeBtn.title = 'Close';
  closeBtn.innerHTML = getIconHTML('close');
  closeBtn.addEventListener('click', closeDashboard);
  btns.appendChild(closeBtn);

  header.appendChild(logo);
  header.appendChild(btns);
  panel.appendChild(header);

  // Stats
  panel.appendChild(buildStats(state.findings));

  // Mini Analytics row
  panel.appendChild(buildMiniAnalytics(state.findings));

  // Filter tabs
  panel.appendChild(buildTabBar(state, panel));

  // Scroll content
  panel.appendChild(buildScrollContent(state, panel));

  // Footer with rescan
  const footer = el('div', 'ff-footer');
  const info = el('span', 'ff-footer-info');
  info.id = 'ff-footer-info';
  info.textContent = `Scanned at ${new Date(state.lastScanAt).toLocaleTimeString()}`;
  footer.appendChild(info);

  const rescanBtn = el('button', 'ff-rescan-btn');
  rescanBtn.innerHTML = `${getIconHTML('refresh')} <span>Re-scan</span>`;
  rescanBtn.addEventListener('click', () => {
    // Show skeleton loaders in scroll area
    const scrollEl = panel.querySelector('#ff-scroll');
    if (scrollEl) {
      scrollEl.innerHTML = '';
      scrollEl.appendChild(buildSkeletonContent());
    }

    setTimeout(() => {
      const blocks = collectTextBlocks();
      state.findings = applyScores(parseFindings(blocks), state.radarSettings);
      state.lastScanAt = Date.now();
      state.activeFilter = 'all';

      // Rebuild stats
      const oldStats = panel.querySelector('.ff-stats');
      const newStats = buildStats(state.findings);
      if (oldStats) panel.replaceChild(newStats, oldStats);

      // Rebuild mini analytics
      const oldMini = panel.querySelector('.ff-mini-analytics');
      const newMini = buildMiniAnalytics(state.findings);
      if (oldMini) panel.replaceChild(newMini, oldMini);

      // Rebuild tabs (counts changed)
      const oldTabs = panel.querySelector('.ff-tabs');
      const newTabs = buildTabBar(state, panel);
      if (oldTabs) panel.replaceChild(newTabs, oldTabs);

      // Rebuild scroll content
      swapScrollContent(panel, state);

      // Update footer timestamp
      const infoEl = panel.querySelector('#ff-footer-info');
      if (infoEl) infoEl.textContent = `Scanned at ${new Date().toLocaleTimeString()}`;
    }, 280);
  });

  footer.appendChild(rescanBtn);
  panel.appendChild(footer);

  // Set the theme and compact mode initial styles
  updateThemeStyle(panel, state.radarSettings.colorTheme);
  updateCompactMode(panel, state.radarSettings.compactMode);

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

async function scan(settings: RadarSettings): Promise<DashboardState> {
  const blocks = collectTextBlocks();
  const findings = applyScores(parseFindings(blocks), settings);
  return {
    findings,
    activeFilter: 'all',
    collapsedSections: new Set(),
    lastScanAt: Date.now(),
    view: 'dashboard',
    radarSettings: settings,
  };
}

// ─── Sync Storage Change Propagator ──────────────────────────────────────────

chrome.storage.onChanged.addListener(async (changes, areaName) => {
  if (areaName === 'sync' && changes[STORAGE_KEYS.SETTINGS]) {
    const updated = changes[STORAGE_KEYS.SETTINGS].newValue;
    if (updated && updated.radarSettings && _state && _panel) {
      logger.info(CONTEXT, 'Syncing radar settings changes in real-time from popup');
      _state.radarSettings = updated.radarSettings;
      
      // Update UI components
      updateThemeStyle(_panel, _state.radarSettings.colorTheme);
      updateCompactMode(_panel, _state.radarSettings.compactMode);

      // Re-apply scores and filters
      const blocks = collectTextBlocks();
      _state.findings = applyScores(parseFindings(blocks), _state.radarSettings);

      // Rebuild stats, tabs, and scroll content if dashboard is open and in dashboard view
      if (_state.view === 'dashboard') {
        const oldStats = _panel.querySelector('.ff-stats');
        const newStats = buildStats(_state.findings);
        if (oldStats) _panel.replaceChild(newStats, oldStats);

        const oldMini = _panel.querySelector('.ff-mini-analytics');
        const newMini = buildMiniAnalytics(_state.findings);
        if (oldMini) _panel.replaceChild(newMini, oldMini);

        const oldTabs = _panel.querySelector('.ff-tabs');
        const newTabs = buildTabBar(_state, _panel);
        if (oldTabs) _panel.replaceChild(newTabs, oldTabs);

        swapScrollContent(_panel, _state);
      } else {
        // Redraw settings screen to reflect toggle changes
        swapScrollContent(_panel, _state);
      }
    }
  }
});

// ─── Panel lifecycle ──────────────────────────────────────────────────────────

async function openDashboard(): Promise<void> {
  const settings = await getSettings();
  injectStyles();
  const overlay = getOrCreateOverlay();

  // Build a loading-state panel first for instant response
  if (!_panel) {
    const shell = document.createElement('div');
    shell.id = PANEL_ID;
    
    // Set initial accent coloring on shell
    updateThemeStyle(shell, settings.radarSettings.colorTheme);

    shell.innerHTML = `
      <div class="ff-header">
        <div class="ff-logo">
          <div class="ff-logo-icon">${getIconHTML('sparkles')}</div>
          <div class="ff-logo-text">
            <span class="ff-logo-title">Smart Academic Dashboard</span>
            <span class="ff-logo-sub">FocusFox · DOM analysis engine</span>
          </div>
        </div>
        <div class="ff-header-btns">
          <button class="ff-icon-btn" id="ff-close-tmp">${getIconHTML('close')}</button>
        </div>
      </div>
      <div class="ff-scroll" style="flex:1" id="ff-scroll-tmp"></div>
    `;
    shell.querySelector('#ff-close-tmp')?.addEventListener('click', closeDashboard);
    
    const scrollTmp = shell.querySelector('#ff-scroll-tmp');
    if (scrollTmp) scrollTmp.appendChild(buildSkeletonContent());

    document.body.appendChild(shell);
    _panel = shell;

    // Animate in
    requestAnimationFrame(() => {
      _panel!.classList.add('ff-open');
      overlay.classList.add('ff-overlay-on');
    });

    // Run actual scan asynchronously
    setTimeout(async () => {
      _state = await scan(settings.radarSettings);

      // Remove shell, build real panel
      _panel!.remove();
      _panel = buildPanel(_state);
      document.body.appendChild(_panel);

      requestAnimationFrame(() => {
        _panel!.classList.add('ff-open');
      });

      logger.info(CONTEXT, `Dashboard opened — ${_state.findings.length} findings`);
    }, 280);
  } else {
    // Panel exists but is closed — re-scan and reopen
    _state = await scan(settings.radarSettings);
    
    // Remove old, build fresh
    _panel.remove();
    _panel = buildPanel(_state);
    document.body.appendChild(_panel);

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
