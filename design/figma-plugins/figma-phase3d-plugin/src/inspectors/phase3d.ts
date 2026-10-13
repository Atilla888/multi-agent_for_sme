import { ANALYTICS_VARIANTS, ESCALATION_VARIANTS, FORECAST_VARIANTS, ORDER_VARIANTS, SECTIONS, SHELL_NAME, VARIANTS, WEB_CHAT_VARIANTS, analyticsName, conversationName, escalationName, forecastName, orderName, webChatName } from '../constants';
import { inspectDesignSystem, type AssetReport } from '../design-system';
import { exactFrame, readPage } from '../figma-utils';

export interface Phase3DInspection {
  pageExists: boolean;
  shellExists: boolean;
  conversationCount: number;
  missingVariants: string[];
  escalationCount: number;
  missingEscalations: string[];
  orderCount: number;
  missingOrders: string[];
  webChatCount: number;
  missingWebChat: string[];
  analyticsCount: number;
  missingAnalytics: string[];
  forecastCount: number;
  missingForecasts: string[];
  designSystem: AssetReport;
}

export async function inspectPhase3D(): Promise<Phase3DInspection> {
  const page = await readPage();
  const designSystem = await inspectDesignSystem();
  const shell = page ? exactFrame(page, SECTIONS.shell) : undefined;
  const conversations = page ? exactFrame(page, SECTIONS.conversations) : undefined;
  const escalations = page ? exactFrame(page, SECTIONS.escalations) : undefined;
  const orders = page ? exactFrame(page, SECTIONS.orders) : undefined;
  const webChat = page ? exactFrame(page, SECTIONS.webChat) : undefined;
  const analytics = page ? exactFrame(page, SECTIONS.analytics) : undefined;
  const forecasts = page ? exactFrame(page, SECTIONS.forecasts) : undefined;
  const names = conversations ? conversations.children.filter(n => n.type === 'FRAME').map(n => n.name) : [];
  const escalationNames = escalations ? escalations.children.filter(n => n.type === 'FRAME').map(n => n.name) : [];
  const orderNames = orders ? orders.children.filter(n => n.type === 'FRAME').map(n => n.name) : [];
  const webChatNames = webChat ? webChat.children.filter(n => n.type === 'FRAME').map(n => n.name) : [];
  const analyticsNames = analytics ? analytics.children.filter(n => n.type === 'FRAME').map(n => n.name) : [];
  const forecastNames = forecasts ? forecasts.children.filter(n => n.type === 'FRAME').map(n => n.name) : [];
  return {
    pageExists: Boolean(page),
    shellExists: Boolean(shell?.children.some(n => n.type === 'FRAME' && n.name === SHELL_NAME)),
    conversationCount: VARIANTS.filter(v => names.includes(conversationName(v.key))).length,
    missingVariants: VARIANTS.filter(v => !names.includes(conversationName(v.key))).map(v => v.key),
    escalationCount: ESCALATION_VARIANTS.filter(v => escalationNames.includes(escalationName(v.key))).length,
    missingEscalations: ESCALATION_VARIANTS.filter(v => !escalationNames.includes(escalationName(v.key))).map(v => v.key),
    orderCount: ORDER_VARIANTS.filter(v => orderNames.includes(orderName(v.key))).length,
    missingOrders: ORDER_VARIANTS.filter(v => !orderNames.includes(orderName(v.key))).map(v => v.key),
    webChatCount: WEB_CHAT_VARIANTS.filter(v => webChatNames.includes(webChatName(v.key))).length,
    missingWebChat: WEB_CHAT_VARIANTS.filter(v => !webChatNames.includes(webChatName(v.key))).map(v => v.key),
    analyticsCount: ANALYTICS_VARIANTS.filter(v => analyticsNames.includes(analyticsName(v.key))).length,
    missingAnalytics: ANALYTICS_VARIANTS.filter(v => !analyticsNames.includes(analyticsName(v.key))).map(v => v.key),
    forecastCount: FORECAST_VARIANTS.filter(v => forecastNames.includes(forecastName(v.key))).length,
    missingForecasts: FORECAST_VARIANTS.filter(v => !forecastNames.includes(forecastName(v.key))).map(v => v.key),
    designSystem,
  };
}

export function formatInspection(result: Phase3DInspection): string {
  const found = result.designSystem.components.filter(c => c.found).map(c => c.name);
  return [
    'PHASE 3D INSPECTION · READ ONLY',
    `03D page: ${result.pageExists ? 'EXISTS' : 'MISSING'}`,
    `Shared Shell: ${result.shellExists ? 'EXISTS' : 'MISSING'}`,
    `Conversations variants: ${result.conversationCount}/${VARIANTS.length}`,
    `Escalations variants: ${result.escalationCount}/${ESCALATION_VARIANTS.length}`,
    `Orders variants: ${result.orderCount}/${ORDER_VARIANTS.length}`,
    `Customer Web Chat variants: ${result.webChatCount}/${WEB_CHAT_VARIANTS.length}`,
    `Analytics variants: ${result.analyticsCount}/${ANALYTICS_VARIANTS.length}`,
    `Forecasts variants: ${result.forecastCount}/${FORECAST_VARIANTS.length}`,
    `Phase 3C Design System: ${result.designSystem.pageExists ? 'ACCESSIBLE' : 'MISSING'}`,
    `Phase 3C relevant components found (${found.length}): ${found.join(', ') || 'none'}`,
    `Missing variants: ${result.missingVariants.join(', ') || 'none'}`,
    `Missing Escalations: ${result.missingEscalations.join(', ') || 'none'}`,
    `Missing Orders: ${result.missingOrders.join(', ') || 'none'}`,
    `Missing Customer Web Chat: ${result.missingWebChat.join(', ') || 'none'}`,
    `Missing Analytics: ${result.missingAnalytics.join(', ') || 'none'}`,
    `Missing Forecasts: ${result.missingForecasts.join(', ') || 'none'}`,
    `Asset gaps: ${result.designSystem.gaps.join(', ') || 'none'}`,
  ].join('\n');
}

export function formatAssets(report: AssetReport): string {
  const analytics = report.components.filter(c => c.canonicalName.startsWith('Component / Analytics / '));
  const forecasts = report.components.filter(c => c.canonicalName.startsWith('Component / Forecast / '));
  return [
    'PHASE 3C ASSET INSPECTION · READ ONLY',
    `Design System page: ${report.pageExists ? 'ACCESSIBLE' : 'MISSING'}`,
    `Semantic color variables: ${report.variables}`,
    ...report.components.map(c => `${c.status} · ${c.canonicalName}${c.type ? ` (${c.type})` : ''} · active matches: ${c.count} · section: ${c.section}`),
    'ANALYTICS DESIGN SYSTEM ASSETS · canonical sections, read only',
    ...analytics.flatMap(c => [
      `${c.canonicalName}: ${c.status}; section=${c.section}; active matches=${c.count}`,
      ...c.sectionMatches.map(m => `- source section: type=${m.type}; id=${m.id}; path=${m.path}`),
      ...c.matches.map(m => `- active source: type=${m.type}; id=${m.id}; path=${m.path}`),
      `- archived matches: ${c.archivedMatches.length} (ignored for generation)`,
      ...c.archivedMatches.map(m => `  - archived: type=${m.type}; id=${m.id}; path=${m.path}`),
    ]),
    'FORECAST DESIGN SYSTEM ASSETS · canonical section, read only',
    ...forecasts.flatMap(c => [
      `${c.canonicalName}: ${c.status}; section=${c.section}; active matches=${c.count}`,
      ...c.matches.map(m => `- active source: type=${m.type}; id=${m.id}; path=${m.path}`),
      `- archived matches: ${c.archivedMatches.length} (ignored for generation)`,
      ...c.archivedMatches.map(m => `  - archived: type=${m.type}; id=${m.id}; path=${m.path}`),
    ]),
    ...report.treatments.map(t => `${t.found ? 'FOUND' : 'MISSING'} · ${t.name} treatment`),
    `Gaps: ${report.gaps.join(', ') || 'none'}`,
  ].join('\n');
}
