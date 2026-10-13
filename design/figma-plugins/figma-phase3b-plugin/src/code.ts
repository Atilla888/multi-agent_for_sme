import { analytics } from './builders/analytics';
import { escalations } from './builders/escalations';
import { forecasts } from './builders/forecasts';
import { orders } from './builders/orders';
import { walkthroughs } from './builders/walkthroughs';
import { webChat } from './builders/web-chat';
import { PLUGIN_NAME } from './constants';
import { getTargetPage, loadSimpleFonts, renderSection } from './figma-utils';
import type { Command, PluginMessage, SectionSpec } from './types';
import { inspectPage, validatePage } from './validators/phase3b';

declare const __html__: string;

figma.showUI(__html__, { width: 500, height: 680, themeColors: true });

const builders: Partial<Record<Command, SectionSpec>> = {
  escalations, orders, webChat, analytics, forecasts, walkthroughs,
};

const send = (message: PluginMessage): void => figma.ui.postMessage(message);

figma.ui.onmessage = async (incoming: { action?: Command }) => {
  const action = incoming?.action;
  if (!action || !['inspect', 'escalations', 'orders', 'webChat', 'analytics', 'forecasts', 'walkthroughs', 'validate'].includes(action)) {
    send({ kind: 'result', action: 'inspect', ok: false, message: 'Unknown command. Nothing was changed.' });
    return;
  }
  try {
    const page = await getTargetPage();
    if (action === 'inspect') {
      send({ kind: 'result', action, ok: true, message: '03B inspected without changes.', report: inspectPage(page) });
      return;
    }
    if (action === 'validate') {
      send({ kind: 'result', action, ok: true, message: 'Structural validation finished.', report: validatePage(page) });
      return;
    }
    const spec = builders[action];
    if (!spec) throw new Error('Builder not found.');
    // Every write action reads live 03B structure before any node is created.
    const before = inspectPage(page);
    await loadSimpleFonts();
    const count = await renderSection(page, spec);
    send({ kind: 'result', action, ok: true, message: `${spec.label} completed: ${count} revised frames created/updated. Existing unowned work preserved.`, report: `BEFORE BUILDER\n${before}\n\nAFTER BUILDER\n${inspectPage(page)}` });
    figma.notify(`${PLUGIN_NAME}: ${spec.label} complete`);
  } catch (error) {
    send({ kind: 'result', action, ok: false, message: `${action} stopped: ${error instanceof Error ? error.message : String(error)}` });
  }
};
