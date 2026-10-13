import { buildFlow, inspectPrototypeApi } from './builders';
import { inspectSources, sourceReport } from './source-inspector';
import { validatePrototype } from './validator';

type Message = { type: 'inspect-sources' | 'inspect-api' | 'validate' | 'copy-report' } | { type: 'build-flow'; id: number };
let lastReport = 'No validation report yet. Run Validate Prototype first.';
let busy = false;

figma.showUI(__html__, { width: 560, height: 740, themeColors: true });
figma.ui.onmessage = async (message: Message) => {
  if (busy) return;
  busy = true;
  figma.ui.postMessage({ type: 'busy', value: true });
  try {
    if (message.type === 'inspect-sources') {
      figma.ui.postMessage({ type: 'report', text: sourceReport(await inspectSources()) });
    } else if (message.type === 'inspect-api') {
      figma.ui.postMessage({ type: 'report', text: await inspectPrototypeApi() });
    } else if (message.type === 'build-flow') {
      figma.ui.postMessage({ type: 'report', text: await buildFlow(message.id) });
    } else if (message.type === 'validate') {
      const result = await validatePrototype();
      lastReport = result.report;
      figma.ui.postMessage({ type: 'report', text: result.report });
    } else if (message.type === 'copy-report') {
      figma.ui.postMessage({ type: 'copy', text: lastReport });
    }
  } catch (error) {
    figma.ui.postMessage({ type: 'report', text: `BLOCKED: ${error instanceof Error ? error.message : String(error)}\nNo protected page was written.` });
  } finally {
    busy = false;
    figma.ui.postMessage({ type: 'busy', value: false });
  }
};
