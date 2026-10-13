import { BUILD_ACTIONS, SECTIONS, type BuildAction } from './constants';
import { buildAnalyticsForecast, buildBusiness, buildConversation, buildCore, buildDirection, buildEscalation, buildFoundations, buildNavigation, buildStates, buildUsage, buildWebChat } from './builders';
import { replaceSections } from './figma-utils';
import { inspect, validate } from './validator';
import { analyzeDuplicates, resolveDuplicates } from './duplicate-cleanup';

type Action = BuildAction | 'inspect' | 'validate' | 'analyze-duplicates' | 'resolve-duplicates';
const builders = {
  'build-direction': buildDirection,
  'build-foundations': buildFoundations,
  'build-states': buildStates,
  'build-core': buildCore,
  'build-navigation': buildNavigation,
  'build-conversation': buildConversation,
  'build-business': buildBusiness,
  'build-escalation': buildEscalation,
  'build-analytics-forecast': buildAnalyticsForecast,
  'build-webchat': buildWebChat,
  'build-usage': buildUsage,
} as const;

figma.showUI(__html__, { width: 420, height: 660, themeColors: true });
figma.ui.onmessage = async (message: { action?: Action }) => {
  try {
    const action = message.action;
    if (action === 'inspect') {
      figma.ui.postMessage({ kind: 'report', text: await inspect() });
    } else if (action === 'validate') {
      figma.ui.postMessage({ kind: 'report', text: await validate() });
    } else if (action === 'analyze-duplicates') {
      const result = await analyzeDuplicates();
      figma.ui.postMessage({ kind: 'report', ...result });
    } else if (action === 'resolve-duplicates') {
      figma.ui.postMessage({ kind: 'report', text: await resolveDuplicates() });
    } else if (action && BUILD_ACTIONS.includes(action as BuildAction)) {
      const names = await replaceSections(action as BuildAction, builders[action as BuildAction],
        action === 'build-webchat' ? [SECTIONS.usage, SECTIONS.validation] : []);
      figma.ui.postMessage({ kind: 'report', text: `Built on 03C:\n${names.join('\n')}\n\nReview manually before continuing.` });
    } else {
      throw new Error('Unknown action.');
    }
  } catch (error) {
    figma.ui.postMessage({ kind: 'error', text: error instanceof Error ? error.message : String(error) });
  }
};
