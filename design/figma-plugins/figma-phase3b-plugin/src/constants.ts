export const PLUGIN_NAME = 'Diploma UX — Phase 3B';
export const TARGET_PAGE = '03B — UX Review & Revisions';
export const BASELINE_PAGE = '03A — Low-Fi Wireframes';
export const TARGET_FILE_NAME = 'Diplom — Multi-Agent Platform UX/UI';
export const TARGET_FILE_KEY = 'OFXTN83nFl3RqukrEYQrFy';

export const SECTION_LABELS = {
  escalations: '03 — Escalations Revised',
  orders: '04 — Orders Revised',
  webChat: '05 — Customer Web Chat Revised',
  analytics: '06 — Analytics Revised',
  forecasts: '07 — Forecasts Revised',
  walkthroughs: '08 — Scenario Walkthroughs',
} as const;

export type BuilderKey = keyof typeof SECTION_LABELS;
