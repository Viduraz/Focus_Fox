/**
 * FocusFox — Exam Radar public entry point (Phase 5.5)
 *
 * Thin re-export that keeps `content/index.ts` import paths stable
 * while the real implementation lives in the modular `radar/` directory.
 *
 * Architecture:
 *  radar/
 *  ├── types.ts          — shared TypeScript interfaces
 *  ├── detector.ts       — DOM text-block collector
 *  ├── parser.ts         — keyword matching + context extraction
 *  ├── priorityEngine.ts — urgency scoring + sorting
 *  ├── filters.ts        — filter-tab → category mapping
 *  └── dashboardUI.ts    — full side-panel UI renderer
 */
export { toggleExamRadar, destroyExamRadar } from './radar/dashboardUI';
