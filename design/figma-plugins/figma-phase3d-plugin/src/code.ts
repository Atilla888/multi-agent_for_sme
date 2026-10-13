import { SECTIONS, SHELL_NAME, VARIANTS, ESCALATION_VARIANTS, ORDER_VARIANTS, WEB_CHAT_VARIANTS, ANALYTICS_VARIANTS, conversationName, escalationName, orderName, webChatName, analyticsName } from './constants';
import { loadDesignAssets, inspectDesignSystem } from './design-system';
import { writablePage, readPage, loadFonts, exactFrame, assertFile } from './figma-utils';
import { buildSharedShell } from './builders/shared-shell';
import { buildConversations } from './builders/conversations';
import { buildEscalations } from './builders/escalations';
import { buildOrders } from './builders/orders';
import { buildWebChat } from './builders/web-chat';
import { buildAnalytics } from './builders/analytics';
import { buildForecasts } from './builders/forecasts';
import { inspectPhase3D, formatInspection, formatAssets } from './inspectors/phase3d';
import { validateConversations, validateSharedShell } from './validators/phase3d';
import { formatEscalationValidation, validateEscalations } from './validators/escalations';
import { formatOrdersValidation, validateOrders } from './validators/orders';
import { formatWebChatValidation, validateWebChat } from './validators/web-chat';
import { formatAnalyticsValidation, validateAnalytics } from './validators/analytics';
import { formatForecastValidation, validateForecasts } from './validators/forecasts';
import { formatAggregateValidation, validatePhase3DAggregate } from './validators/aggregate';

type Action = 'inspect-3d' | 'inspect-3c' | 'build-shell' | 'build-conversations' | 'build-escalations' | 'build-orders' | 'build-web-chat' | 'build-analytics' | 'build-forecasts' | 'validate-shell' | 'validate-conversations' | 'validate-escalations' | 'validate-orders' | 'validate-web-chat' | 'validate-analytics' | 'validate-forecasts' | 'validate-3d' | 'copy-report';
type Message = { type: 'action'; action: Action };

figma.showUI(__html__, { width: 386, height: 890, themeColors: true });

function output(report: string, copy = false): void {
  figma.ui.postMessage({ type: 'report', report, copy });
}

async function run(action: Action): Promise<void> {
  assertFile();
  if (action === 'inspect-3d') { output(formatInspection(await inspectPhase3D())); return; }
  if (action === 'inspect-3c') { output(formatAssets(await inspectDesignSystem())); return; }
  if (action === 'validate-shell') {
    const result = validateSharedShell(await readPage());
    output(`PHASE 3D SHARED SHELL VALIDATION\n${result.checks.map(c => `${c.label}: ${c.pass ? 'PASS' : 'FAIL'}`).join('\n')}\n\n${result.pass ? 'PASS' : 'FAIL'} · structural only; manual review required.`);
    return;
  }
  if (action === 'validate-conversations') {
    const result = validateConversations(await readPage());
    output(`PHASE 3D CONVERSATIONS VALIDATION\n${result.checks.map(c => `${c.label}: ${c.pass ? 'PASS' : 'FAIL'}`).join('\n')}\n\n${result.pass ? 'PASS' : 'FAIL'} · structural only; manual review required.`);
    return;
  }
  if (action === 'validate-escalations') { output(formatEscalationValidation(validateEscalations(await readPage()))); return; }
  if (action === 'validate-orders') { output(formatOrdersValidation(validateOrders(await readPage()))); return; }
  if (action === 'validate-web-chat') { output(formatWebChatValidation(validateWebChat(await readPage()))); return; }
  if (action === 'validate-analytics') { output(formatAnalyticsValidation(validateAnalytics(await readPage()))); return; }
  if (action === 'validate-forecasts') { output(formatForecastValidation(validateForecasts(await readPage()))); return; }
  if (action === 'validate-3d' || action === 'copy-report') {
    const page = await readPage();
    const assets = await inspectDesignSystem();
    output(formatAggregateValidation(validatePhase3DAggregate(page, assets)), action === 'copy-report');
    return;
  }
  if (action === 'build-shell' || action === 'build-conversations' || action === 'build-escalations' || action === 'build-orders' || action === 'build-web-chat' || action === 'build-analytics' || action === 'build-forecasts') {
    if (action !== 'build-shell') {
      const page = await readPage();
      const section = page ? exactFrame(page, SECTIONS.shell) : undefined;
      if (!section || !exactFrame(section, SHELL_NAME)) throw new Error('Build and manually review Shared Staff Shell before building another high-fi section.');
      if (action === 'build-escalations' || action === 'build-orders' || action === 'build-web-chat' || action === 'build-analytics' || action === 'build-forecasts') {
        const conversations = page ? exactFrame(page, SECTIONS.conversations) : undefined;
        if (!conversations || VARIANTS.some(v => !exactFrame(conversations, conversationName(v.key)))) throw new Error('Build and manually review all 13 Conversations variants before building the next section.');
      }
      if (action === 'build-orders' || action === 'build-web-chat' || action === 'build-analytics' || action === 'build-forecasts') {
        const escalations = page ? exactFrame(page, SECTIONS.escalations) : undefined;
        if (!escalations || ESCALATION_VARIANTS.some(v => !exactFrame(escalations, escalationName(v.key)))) throw new Error('Build and manually review all 8 Escalations variants before building Orders.');
      }
      if (action === 'build-web-chat' || action === 'build-analytics' || action === 'build-forecasts') {
        const orders = page ? exactFrame(page, SECTIONS.orders) : undefined;
        if (!orders || ORDER_VARIANTS.some(v => !exactFrame(orders, orderName(v.key)))) throw new Error('Build and manually review all 7 Orders variants before building Customer Web Chat.');
      }
      if (action === 'build-forecasts') {
        const analytics = page ? exactFrame(page, SECTIONS.analytics) : undefined;
        if (!analytics || ANALYTICS_VARIANTS.some(v => !exactFrame(analytics, analyticsName(v.key)))) throw new Error('Build and manually review all 6 Analytics variants before building Forecasts.');
      }
      if (action === 'build-analytics' || action === 'build-forecasts') {
        const webChat = page ? exactFrame(page, SECTIONS.webChat) : undefined;
        if (!webChat || WEB_CHAT_VARIANTS.some(v => !exactFrame(webChat, webChatName(v.key)))) throw new Error('Build and manually review all 10 Customer Web Chat variants before building Analytics.');
      }
    }
    const assets = await loadDesignAssets();
    await loadFonts();
    const page = await writablePage();
    const names = action === 'build-shell' ? buildSharedShell(page) : action === 'build-conversations' ? buildConversations(page) : action === 'build-escalations' ? buildEscalations(page) : action === 'build-orders' ? buildOrders(page) : action === 'build-web-chat' ? buildWebChat(page) : action === 'build-analytics' ? buildAnalytics(page) : buildForecasts(page);
    output([`${action === 'build-shell' ? 'Shared Staff Shell' : action === 'build-conversations' ? 'Conversations High-Fi' : action === 'build-escalations' ? 'Escalations High-Fi' : action === 'build-orders' ? 'Orders High-Fi' : action === 'build-web-chat' ? 'Customer Web Chat High-Fi' : action === 'build-analytics' ? 'Analytics High-Fi' : 'Forecasts High-Fi'} built on 03D only.`,
      `Generated frames: ${names.length}.`,
      `Phase 3C assets found: ${assets.components.filter(c => c.found).length}/${assets.components.length}.`,
      `Asset gaps: ${assets.gaps.join(', ') || 'none'}.`,
      'Native instances are used where they fit; narrow screen regions use Phase 3C semantic-token compositions.',
      'Manual visual review is required.'].join('\n'));
  }
}

figma.ui.onmessage = async (message: Message) => {
  if (message?.type !== 'action') return;
  try {
    figma.ui.postMessage({ type: 'busy', action: message.action });
    await run(message.action);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    output(`ERROR · ${detail}\nNo historical page or Phase 3C source asset was modified.`);
  } finally {
    figma.ui.postMessage({ type: 'ready' });
  }
};
