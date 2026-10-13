import { SECTIONS as DESIGN_SECTIONS } from '../../figma-phase3c-plugin/src/constants';

export { DESIGN_SECTIONS };
export function designSectionFor(name: string): string {
  const short = name.startsWith('Component / ') ? name.slice('Component / '.length) : name;
  if (short.startsWith('Navigation / ')) return DESIGN_SECTIONS.navigation;
  if (short.startsWith('Conversation / ')) return DESIGN_SECTIONS.conversation;
  if (short.startsWith('Business / ') || short.startsWith('Communication / ')) return DESIGN_SECTIONS.business;
  if (short.startsWith('Escalation / ')) return DESIGN_SECTIONS.escalation;
  if (short.startsWith('Analytics / ')) return DESIGN_SECTIONS.analytics;
  if (short.startsWith('Forecast / ')) return DESIGN_SECTIONS.forecast;
  if (short.startsWith('Web Chat / ')) return DESIGN_SECTIONS.webchat;
  return DESIGN_SECTIONS.core;
}

export const FILE_NAME = 'Diplom — Multi-Agent Platform UX/UI';
export const FILE_KEY = 'OFXTN83nFl3RqukrEYQrFy';
export const TARGET_PAGE = '03D — High-Fidelity Screens';
export const DESIGN_PAGE = '03C — Design System';
export const COLLECTION_NAME = 'Phase 3C / Light';
export const TYPE_STYLE_PREFIX = 'Phase 3C / Type /';
export const SECTIONS = {
  principles: '00 — High-Fi Principles',
  shell: '01 — Shared Staff Shell',
  conversations: '02 — Conversations',
  escalations: '03 — Escalations',
  orders: '04 — Orders',
  webChat: '05 — Customer Web Chat',
  analytics: '06 — Analytics',
  forecasts: '07 — Forecasts',
} as const;
export const SHELL_NAME = '3D / Shell / Staff Desktop';
export const NAV_PRIMARY = ['Overview', 'Conversations', 'Business', 'Knowledge', 'Analytics', 'Administration'] as const;
export const NAV_NESTED = [
  ['Conversations', 'Escalations'], ['Business', 'Customers'], ['Business', 'Orders'],
  ['Business', 'Products'], ['Business', 'Inventory'], ['Knowledge', 'Documents'],
  ['Analytics', 'Forecasts'], ['Administration', 'Integrations'],
  ['Administration', 'Settings'], ['Administration', 'Audit'], ['Administration', 'Agent Runs'],
] as const;
export const PROHIBITED_NAV = ['Orchestrator', 'Business Brain', 'LangGraph', 'Tools', 'Database', 'Customer Web Chat'] as const;
export const VARIANTS = [
  { key: 'Default', title: 'Default / Active', status: 'Active', handler: 'Support Agent', kind: 'default' },
  { key: 'Support Active', title: 'Support Active', status: 'Support active', handler: 'Support Agent', kind: 'support' },
  { key: 'Sales Active', title: 'Sales Active', status: 'Sales active', handler: 'Sales Agent', kind: 'sales' },
  { key: 'Support to Sales Handoff', title: 'Support → Sales Handoff', status: 'Handoff', handler: 'Sales Agent', kind: 'handoff' },
  { key: 'Human Takeover', title: 'Human Takeover', status: 'Human active', handler: 'Human Operator', kind: 'human' },
  { key: 'Waiting Human', title: 'Waiting Human / Escalation', status: 'Waiting Human', handler: 'Human Operator', kind: 'waiting' },
  { key: 'Awaiting Confirmation', title: 'Awaiting Customer Confirmation', status: 'Awaiting confirmation', handler: 'Sales Agent', kind: 'proposal' },
  { key: 'Processing', title: 'Processing / Executing', status: 'Processing', handler: 'Sales Agent', kind: 'processing' },
  { key: 'Confirmed Result', title: 'Confirmed Business Result', status: 'Confirmed', handler: 'Sales Agent', kind: 'confirmed' },
  { key: 'Known Failure', title: 'Known Failure', status: 'Known Failure', handler: 'Sales Agent', kind: 'failure' },
  { key: 'OUTCOME_UNKNOWN', title: 'OUTCOME_UNKNOWN', status: 'OUTCOME_UNKNOWN', handler: 'Sales Agent', kind: 'unknown' },
  { key: 'Dependency Unavailable', title: 'Dependency Unavailable', status: 'Dependency unavailable', handler: 'Support Agent', kind: 'dependency' },
  { key: 'Delivery Failure', title: 'Message Delivery Failure After Confirmed Effect', status: 'Message delivery failed', handler: 'Sales Agent', kind: 'delivery' },
] as const;
export type Variant = typeof VARIANTS[number];
export const conversationName = (key: Variant['key']): string => `3D / Conversations / ${key}`;

export const ESCALATION_VARIANTS = [
  { key: 'Waiting Assignment', title: 'Queue / Waiting Assignment', kind: 'waiting' },
  { key: 'Awaiting Decision', title: 'Assigned / Awaiting Decision', kind: 'assigned' },
  { key: 'OUTCOME_UNKNOWN', title: 'OUTCOME_UNKNOWN / Reconciliation Required', kind: 'unknown' },
  { key: 'Stale', title: 'Stale Context', kind: 'stale' },
  { key: 'Authorization Changed', title: 'Authorization Changed', kind: 'authorization' },
  { key: 'E02 Restricted', title: 'E02 Update Restricted', kind: 'e02' },
  { key: 'Resume Pending', title: 'Resume Pending — TARGET M12', kind: 'resume' },
  { key: 'Resolved Closed', title: 'Resolved / Closed', kind: 'resolved' },
] as const;
export type EscalationVariant = typeof ESCALATION_VARIANTS[number];
export const escalationName = (key: EscalationVariant['key']): string => `3D / Escalations / ${key}`;

export const ORDER_VARIANTS = [
  { key: 'List', title: 'Orders List / Mixed States', kind: 'list' },
  { key: 'Reservation Confirmed', title: 'Order Created + Reservation Confirmed', kind: 'confirmed' },
  { key: 'Reservation Failed', title: 'Order Created + Reservation Failed', kind: 'failed' },
  { key: 'OUTCOME_UNKNOWN', title: 'Order Created + Reservation OUTCOME_UNKNOWN', kind: 'unknown' },
  { key: 'Needs Attention', title: 'Needs Human Attention', kind: 'attention' },
  { key: 'Stale Conflict', title: 'Stale / Conflicting', kind: 'stale' },
  { key: 'E02 Restricted', title: 'E02 Update Restricted', kind: 'e02' },
] as const;
export type OrderVariant = typeof ORDER_VARIANTS[number];
export const orderName = (key: OrderVariant['key']): string => `3D / Orders / ${key}`;

export const WEB_CHAT_VARIANTS = [
  { key: 'Initial', title: 'Initial', component: undefined },
  { key: 'Active', title: 'Active Conversation', component: undefined },
  { key: 'Clarification', title: 'Clarification Requested', component: 'Clarification Request' },
  { key: 'Confirmation Required', title: 'Confirmation Required', component: 'Confirmation Request' },
  { key: 'Processing', title: 'Processing', component: 'Processing' },
  { key: 'Confirmed Result', title: 'Confirmed Result', component: 'Confirmed Result' },
  { key: 'Known Failure', title: 'Known Failure', component: 'Known Failure' },
  { key: 'Waiting Human', title: 'Waiting for Human', component: 'Waiting Human' },
  { key: 'Confirmation Pending', title: 'Confirmation Pending', component: 'Confirmation Pending' },
  { key: 'Message Delivery Failure', title: 'Message Delivery / Connection Failure', component: 'Delivery Failure' },
] as const;
export type WebChatVariant = typeof WEB_CHAT_VARIANTS[number];
export const webChatName = (key: WebChatVariant['key']): string => `3D / Web Chat / ${key}`;

export const ANALYTICS_VARIANTS = [
  { key: 'Valid', title: 'Valid Historical Result', kind: 'valid' },
  { key: 'Valid Empty', title: 'Valid Empty', kind: 'empty' },
  { key: 'Incomplete', title: 'Incomplete Data', kind: 'incomplete' },
  { key: 'Stale', title: 'Stale Data', kind: 'stale' },
  { key: 'Dependency Unavailable', title: 'Dependency Unavailable', kind: 'unavailable' },
  { key: 'Permission Denied', title: 'Permission Denied', kind: 'denied' },
] as const;
export type AnalyticsVariant = typeof ANALYTICS_VARIANTS[number];
export const analyticsName = (key: AnalyticsVariant['key']): string => `3D / Analytics / ${key}`;

export const FORECAST_VARIANTS = [
  { key: 'TARGET Ready', kind: 'ready' },
  { key: 'MODEL_NOT_READY', kind: 'not-ready' },
  { key: 'Insufficient History', kind: 'insufficient' },
  { key: 'Incomplete History', kind: 'incomplete' },
  { key: 'Unsupported Horizon', kind: 'unsupported' },
  { key: 'Model Unavailable', kind: 'unavailable' },
  { key: 'Timeout', kind: 'timeout' },
  { key: 'Permission Denied', kind: 'denied' },
] as const;
export type ForecastVariant = typeof FORECAST_VARIANTS[number];
export const forecastName = (key: ForecastVariant['key']): string => `3D / Forecasts / ${key}`;

export const FORECAST_ASSETS = {
  request: 'Forecast / Request Summary', target: 'Forecast / Target', cutoff: 'Forecast / Cutoff',
  horizon: 'Forecast / Horizon', actual: 'Forecast / Actual Series', predicted: 'Forecast / Predicted Series',
  chart: 'Forecast / Actual vs Predicted Chart', provenance: 'Forecast / Provenance',
  limitations: 'Forecast / Limitations', result: 'Forecast / Result', notReady: 'Forecast / MODEL_NOT_READY',
  insufficient: 'Forecast / Insufficient History', unsupported: 'Forecast / Unsupported Horizon',
  unavailable: 'Forecast / Model Unavailable', timeout: 'Forecast / Timeout',
  incomplete: 'Forecast / Incomplete History', denied: 'Forecast / Permission Denied',
} as const;
export const FORECAST_ASSET_REQUIREMENTS = [
  ...[FORECAST_ASSETS.request, FORECAST_ASSETS.chart, FORECAST_ASSETS.result, FORECAST_ASSETS.notReady]
    .map(name => ({ section: DESIGN_SECTIONS.forecast, name, maxWidth: 970 })),
  ...[FORECAST_ASSETS.target, FORECAST_ASSETS.cutoff, FORECAST_ASSETS.horizon]
    .map(name => ({ section: DESIGN_SECTIONS.forecast, name, maxWidth: 310 })),
  ...[FORECAST_ASSETS.actual, FORECAST_ASSETS.predicted, FORECAST_ASSETS.provenance, FORECAST_ASSETS.limitations,
    FORECAST_ASSETS.insufficient, FORECAST_ASSETS.unsupported, FORECAST_ASSETS.unavailable,
    FORECAST_ASSETS.timeout, FORECAST_ASSETS.incomplete, FORECAST_ASSETS.denied]
    .map(name => ({ section: DESIGN_SECTIONS.forecast, name, maxWidth: 470 })),
] as const;

export const ANALYTICS_ASSETS = {
  kpi: 'Analytics / KPI', period: 'Analytics / Period Selector', freshness: 'Analytics / Freshness',
  completeness: 'Analytics / Completeness', chart: 'Analytics / Historical Chart', table: 'Analytics / Data Table',
  empty: 'Analytics / Valid Empty', incomplete: 'Analytics / Incomplete', stale: 'Analytics / Stale',
  unavailable: 'Analytics / Dependency Unavailable', denied: 'Analytics / Permission Denied',
} as const;

export const ANALYTICS_ASSET_REQUIREMENTS = [
  { section: DESIGN_SECTIONS.core, name: 'Select', maxWidth: 238 },
  { section: DESIGN_SECTIONS.analytics, name: ANALYTICS_ASSETS.kpi, variant: 'Metric=Orders', maxWidth: 310 },
  { section: DESIGN_SECTIONS.analytics, name: ANALYTICS_ASSETS.period, variant: 'State=Focus', maxWidth: 470 },
  { section: DESIGN_SECTIONS.analytics, name: ANALYTICS_ASSETS.freshness, variant: 'State=Current', maxWidth: 470 },
  { section: DESIGN_SECTIONS.analytics, name: ANALYTICS_ASSETS.freshness, variant: 'State=Stale', maxWidth: 470 },
  { section: DESIGN_SECTIONS.analytics, name: ANALYTICS_ASSETS.freshness, variant: 'State=Requires Refresh', maxWidth: 470 },
  { section: DESIGN_SECTIONS.analytics, name: ANALYTICS_ASSETS.completeness, variant: 'State=Complete', maxWidth: 310 },
  { section: DESIGN_SECTIONS.analytics, name: ANALYTICS_ASSETS.completeness, variant: 'State=Incomplete', maxWidth: 310 },
  { section: DESIGN_SECTIONS.analytics, name: ANALYTICS_ASSETS.completeness, variant: 'State=Unavailable', maxWidth: 310 },
  { section: DESIGN_SECTIONS.analytics, name: ANALYTICS_ASSETS.chart, variant: 'State=Valid Historical Data', maxWidth: 470 },
  { section: DESIGN_SECTIONS.analytics, name: ANALYTICS_ASSETS.chart, variant: 'State=Missing-data Gap', maxWidth: 470 },
  { section: DESIGN_SECTIONS.analytics, name: ANALYTICS_ASSETS.chart, variant: 'State=Stale Data', maxWidth: 470 },
  { section: DESIGN_SECTIONS.analytics, name: ANALYTICS_ASSETS.table, maxWidth: 970 },
  { section: DESIGN_SECTIONS.analytics, name: ANALYTICS_ASSETS.empty, maxWidth: 470 },
  { section: DESIGN_SECTIONS.analytics, name: ANALYTICS_ASSETS.incomplete, maxWidth: 470 },
  { section: DESIGN_SECTIONS.analytics, name: ANALYTICS_ASSETS.stale, maxWidth: 470 },
  { section: DESIGN_SECTIONS.analytics, name: ANALYTICS_ASSETS.unavailable, maxWidth: 470 },
  { section: DESIGN_SECTIONS.analytics, name: ANALYTICS_ASSETS.denied, maxWidth: 470 },
] as const;

export const REQUIRED_COMPONENTS = [
  'Select',
  'Navigation / Primary Item', 'Navigation / Nested Item', 'Navigation / Business Context',
  'Navigation / Breadcrumb', 'Navigation / Account', 'Conversation / List Item',
  'Conversation / Message Row', 'Conversation / Composer', 'Conversation / Customer Context',
  'Conversation / Order Context', 'Conversation / Active Handler', 'Conversation / Agent Status',
  'Conversation / Human Status', 'Conversation / Handoff Event', 'Conversation / Action Proposal',
  'Conversation / Action Result', 'Conversation / Execution Summary', 'Conversation / Escalation State',
  'Conversation / Delivery State', 'Business / Customer Summary', 'Business / Order State',
  'Business / Reservation State', 'Business / Order Delivery Status',
  'Communication / Message Delivery Status', 'Business / Inventory Status',
  'Business / Freshness', 'Business / E02 Restricted',
  'Web Chat / Customer Message', 'Web Chat / Business Reply', 'Web Chat / Composer',
  'Web Chat / Clarification Request', 'Web Chat / Confirmation Request', 'Web Chat / Processing',
  'Web Chat / Confirmed Result', 'Web Chat / Known Failure', 'Web Chat / Waiting Human',
  'Web Chat / Confirmation Pending', 'Web Chat / Delivery Failure',
  ...Object.values(ANALYTICS_ASSETS),
  ...Object.values(FORECAST_ASSETS),
] as const;
