export const FILE_NAME = 'Diplom — Multi-Agent Platform UX/UI';
export const FILE_KEY = 'OFXTN83nFl3RqukrEYQrFy';
export const TARGET_PAGE = '03C — Design System';
export const SELECTED_DIRECTION = 'calm-operational-saas' as const;
export const COLLECTION_NAME = 'Phase 3C / Light';
export const TYPE_STYLE_PREFIX = 'Phase 3C / Type /';

export const SECTIONS = {
  direction: '00 — Design Direction',
  foundations: '01 — Foundations',
  color: '02 — Color System',
  typography: '03 — Typography',
  spacing: '04 — Spacing / Sizing / Layout',
  states: '05 — Semantic States',
  core: '06 — Core Components',
  navigation: '07 — Navigation Components',
  conversation: '08 — Conversation / AI Components',
  business: '09 — Business Entity Components',
  escalation: '10 — Escalation Components',
  analytics: '11 — Analytics / Data Components',
  forecast: '12 — Forecast Components',
  webchat: '13 — Customer Web Chat Components',
  accessibility: '14 — Accessibility / Localization',
  usage: '15 — Usage Examples',
  validation: '16 — Validation',
} as const;

export const ACTION_SECTIONS = {
  'build-direction': [SECTIONS.direction],
  'build-foundations': [SECTIONS.foundations, SECTIONS.color, SECTIONS.typography, SECTIONS.spacing, SECTIONS.accessibility],
  'build-states': [SECTIONS.states],
  'build-core': [SECTIONS.core],
  'build-navigation': [SECTIONS.navigation],
  'build-conversation': [SECTIONS.conversation],
  'build-business': [SECTIONS.business],
  'build-escalation': [SECTIONS.escalation],
  'build-analytics-forecast': [SECTIONS.analytics, SECTIONS.forecast],
  'build-webchat': [SECTIONS.webchat, SECTIONS.usage, SECTIONS.validation],
  'build-usage': [SECTIONS.usage],
} as const;

export type BuildAction = keyof typeof ACTION_SECTIONS;
export const BUILD_ACTIONS = Object.keys(ACTION_SECTIONS) as BuildAction[];

export const DIRECTIONS = [
  {
    id: 'calm-operational-saas', name: 'A — Calm Operational SaaS',
    scores: [5, 5, 5, 3, 5, 5, 4, 5, 5],
    note: 'Selected. Restrained navy, clear surfaces and status language keep verified facts and safe action foremost.'
  },
  {
    id: 'modern-ai-workspace', name: 'B — Modern AI Workspace',
    scores: [3, 4, 3, 5, 3, 3, 3, 3, 4],
    note: 'Makes specialists visible, but stronger AI emphasis could obscure business outcomes and dense operator work.'
  },
  {
    id: 'data-forward-console', name: 'C — Data-Forward Business Console',
    scores: [4, 3, 4, 2, 5, 4, 3, 3, 3],
    note: 'Good for reports; console density is less suitable for conversations, escalation decisions and mobile chat.'
  },
] as const;
