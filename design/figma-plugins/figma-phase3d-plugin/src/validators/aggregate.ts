import { ANALYTICS_VARIANTS, ESCALATION_VARIANTS, FORECAST_VARIANTS, NAV_PRIMARY, ORDER_VARIANTS, SECTIONS, SHELL_NAME, TARGET_PAGE, VARIANTS, WEB_CHAT_VARIANTS, conversationName } from '../constants';
import type { AssetReport } from '../design-system';
import { allText } from '../figma-utils';
import { validateSharedShell, validateConversations, type Check, type Validation } from './phase3d';
import { validateEscalations } from './escalations';
import { validateOrders } from './orders';
import { validateWebChat } from './web-chat';
import { validateAnalytics } from './analytics';
import { validateForecasts } from './forecasts';

const SECTION_ORDER = [
  ['Shared Staff Shell', SECTIONS.shell, validateSharedShell],
  ['Conversations', SECTIONS.conversations, validateConversations],
  ['Escalations', SECTIONS.escalations, validateEscalations],
  ['Orders', SECTIONS.orders, validateOrders],
  ['Customer Web Chat', SECTIONS.webChat, validateWebChat],
  ['Analytics', SECTIONS.analytics, validateAnalytics],
  ['Forecasts', SECTIONS.forecasts, validateForecasts],
] as const;
type SectionName = typeof SECTION_ORDER[number][0];
type SectionResult = { name: SectionName; canonical: string; exactFrames: number; exactOtherTypes: string[]; validation: Validation; pass: boolean };

export interface AggregateValidation {
  pass: boolean;
  sections: SectionResult[];
  semantic: boolean;
  geometry: boolean;
  assetUsage: boolean;
  sourceProtection: boolean;
  assetChecks: Check[];
  sourceChecks: Check[];
  semanticChecks: Check[];
  geometryChecks: Check[];
}

const check = (label: string, pass: boolean, detail?: string): Check => ({ label, pass, detail });
const byLabel = (result: Validation, label: string): boolean => result.checks.find(c => c.label === label)?.pass === true;
const hasInstance = (section: FrameNode | undefined, name: string): boolean => Boolean(section?.findAll(n => n.type === 'INSTANCE' && n.name === name).length);
const hasBoundColor = (section: FrameNode | undefined): boolean => Boolean(section && [section, ...section.findAll(() => true)].some(node => {
  if (!('fills' in node) || !Array.isArray(node.fills)) return false;
  return [...node.fills, ...('strokes' in node && Array.isArray(node.strokes) ? node.strokes : [])]
    .some(paint => 'boundVariables' in paint && Boolean(paint.boundVariables?.color));
}));

function safeChild(name: SectionName, page: PageNode | undefined, validate: (page: PageNode | undefined) => Validation): Validation {
  try { return validate(page); }
  catch (error) {
    return { section: name, pass: false, checks: [check('Validator could not inspect canonical section', false, error instanceof Error ? error.message : String(error))] };
  }
}

export function validatePhase3DAggregate(page: PageNode | undefined, assets: AssetReport): AggregateValidation {
  const children = Object.fromEntries(SECTION_ORDER.map(([name, , validate]) => [name, safeChild(name, page, validate)])) as Record<SectionName, Validation>;
  return aggregatePhase3DResults(page, assets, children);
}

// Separating collection from summarization lets tests exercise the complete
// aggregate gate without writing screens or replacing the approved validators.
export function aggregatePhase3DResults(page: PageNode | undefined, assets: AssetReport, children: Record<SectionName, Validation>): AggregateValidation {
  const sections: SectionResult[] = SECTION_ORDER.map(([name, canonical]) => {
    const matches = page?.children.filter(n => n.name === canonical) ?? [];
    const exactFrames = matches.filter(n => n.type === 'FRAME').length;
    const exactOtherTypes = matches.filter(n => n.type !== 'FRAME').map(n => n.type);
    const validation = children[name];
    return { name, canonical, exactFrames, exactOtherTypes, validation,
      pass: exactFrames === 1 && exactOtherTypes.length === 0 && validation.pass };
  });
  const section = (name: SectionName): FrameNode | undefined => {
    const entry = sections.find(s => s.name === name);
    return entry?.exactFrames === 1 && entry.exactOtherTypes.length === 0
      ? page?.children.find(n => n.type === 'FRAME' && n.name === entry.canonical) as FrameNode | undefined : undefined;
  };
  const result = (name: SectionName): Validation => sections.find(s => s.name === name)!.validation;
  const shell = section('Shared Staff Shell')?.children.find(n => n.type === 'FRAME' && n.name === SHELL_NAME) as FrameNode | undefined;
  const nav = shell?.findAll(n => n.type === 'FRAME' && n.name === 'Staff navigation')[0] as FrameNode | undefined;
  const primary = nav?.children.filter(n => n.type === 'FRAME' && n.name.startsWith('Primary /')).map(n => n.name) ?? [];
  const conversations = section('Conversations');
  const owner = (key: string, label: string): boolean => {
    const frame = conversations?.children.find(n => n.type === 'FRAME' && n.name === conversationName(key as typeof VARIANTS[number]['key'])) as FrameNode | undefined;
    return Boolean(frame && allText(frame).includes(label));
  };
  const semanticChecks: Check[] = [
    check('Shared Shell / exactly six approved top-level areas', primary.length === NAV_PRIMARY.length && NAV_PRIMARY.every(n => primary.includes(`Primary / ${n}`))),
    check('Conversations / Support, Sales and Human ownership', owner('Support Active', 'Support Agent') && owner('Sales Active', 'Sales Agent') && owner('Human Takeover', 'Human Operator')),
    check('Conversations / 13 variants', VARIANTS.every(v => byLabel(result('Conversations'), v.title))),
    check('Escalations / 8 variants', ESCALATION_VARIANTS.every(v => byLabel(result('Escalations'), v.title))),
    check('Orders / 7 variants', ORDER_VARIANTS.every(v => byLabel(result('Orders'), v.title))),
    check('Customer Web Chat / 10 variants', WEB_CHAT_VARIANTS.every(v => byLabel(result('Customer Web Chat'), `Variant / ${v.key}`))),
    check('Analytics / 6 variants', ANALYTICS_VARIANTS.every(v => byLabel(result('Analytics'), `Variant / ${v.key}`))),
    check('Forecasts / 8 variants', FORECAST_VARIANTS.every(v => byLabel(result('Forecasts'), `Variant / ${v.key}`))),
  ];
  const required: [SectionName, string[]][] = [
    ['Shared Staff Shell', ['Audit restricted/contextual navigation', 'Agent Runs restricted/contextual navigation', 'No prohibited architecture navigation']],
    ['Conversations', ['Handoff does not transfer permissions', 'Proposal is not executed', 'Known failure · no hold', 'OUTCOME_UNKNOWN · reconcile / no blind retry', 'Message delivery failure after confirmed effect']],
    ['Escalations', ['OUTCOME_UNKNOWN reconciliation / no blind retry', 'E02 update_order restricted, not unknown', 'TARGET M12 decision → revalidation → request, no replay', 'Resolved distinct from Closed']],
    ['Orders', ['Known Failure is known and has authorized recovery', 'OUTCOME_UNKNOWN reconciles before retry', 'Stale / Conflict requires refresh and revalidation', 'E02 update restricted and separate', 'Order Delivery remains separate from Message Delivery']],
    ['Customer Web Chat', ['Confirmation Request / explicit business authorization', 'Confirmation Pending / unknown result in customer language', 'Message Delivery Failure / transport and business effect separate']],
    ['Analytics', ['Valid Empty / successful no-record result', 'Incomplete / visible gap, not zero', 'Dependency Unavailable / no substitute zero', 'Permission Denied / no protected report values']],
    ['Forecasts', ['TARGET Ready / illustrative and separate from current', 'TARGET Ready / ACTUAL, cutoff and dashed PREDICTED', 'MODEL_NOT_READY / current and no result', 'Insufficient History / short but available', 'Incomplete History / missing coverage, not zero', 'Permission Denied / protected result withheld']],
  ];
  for (const [name, labels] of required) for (const label of labels) semanticChecks.push(check(`${name} / ${label}`, byLabel(result(name), label)));
  for (const name of ['Conversations', 'Escalations', 'Orders', 'Customer Web Chat', 'Analytics', 'Forecasts'] as const)
    semanticChecks.push(check(`${name} / all existing checks`, result(name).pass));
  semanticChecks.push(check('Shared Staff Shell / all existing checks', result('Shared Staff Shell').pass));

  const geometryChecks: Check[] = [];
  const geometryCounts: [SectionName, number][] = [
    ['Conversations', 8], ['Escalations', ESCALATION_VARIANTS.length], ['Orders', ORDER_VARIANTS.length],
    ['Customer Web Chat', WEB_CHAT_VARIANTS.length], ['Analytics', ANALYTICS_VARIANTS.length], ['Forecasts', FORECAST_VARIANTS.length],
  ];
  const geometryLabel = (name: SectionName, label: string): boolean => name === 'Conversations'
    ? /result region unique$|result layout fits$|delivery layout fits$/i.test(label)
    : /(?:^|\/ )geometry$|mobile geometry$|ACTUAL, cutoff and dashed PREDICTED$/.test(label);
  for (const [name, minimum] of geometryCounts) {
    const checks = result(name).checks.filter(c => geometryLabel(name, c.label));
    geometryChecks.push(check(`${name} / generated-node geometry`, sections.find(s => s.name === name)?.exactFrames === 1 && checks.length >= minimum && checks.every(c => c.pass),
      `${checks.filter(c => c.pass).length}/${checks.length} checks; minimum ${minimum}`));
  }

  const representativeSources = ['Navigation / Primary Item', 'Conversation / Message Row', 'Business / Order State',
    'Business / Reservation State', 'Web Chat / Confirmation Request', 'Analytics / Historical Chart', 'Forecast / Actual vs Predicted Chart'];
  const assetChecks: Check[] = [
    check('Phase 3C Design System page', assets.pageExists),
    check('Phase 3C semantic color variables', assets.variables > 0, `${assets.variables} found`),
    ...representativeSources.map(name => check(`Phase 3C source / ${name}`, assets.components.find(c => c.canonicalName === `Component / ${name}`)?.found === true)),
    check('Shared Shell / native Phase 3C navigation references', hasInstance(section('Shared Staff Shell'), 'Phase 3C / Active Primary Item') && hasInstance(section('Shared Staff Shell'), 'Phase 3C / Restricted Link reference')),
    check('Conversations / native Phase 3C message rows', hasInstance(conversations, 'Phase 3C / Customer message') && hasInstance(conversations, 'Phase 3C / Business reply')),
    check('Escalations / native Phase 3C decision assets', hasInstance(section('Escalations'), 'Selected Queue Item') && hasInstance(section('Escalations'), 'Human Decision') && hasInstance(section('Escalations'), 'Uncertain Effect')),
    check('Customer Web Chat / native Phase 3C confirmation', hasInstance(section('Customer Web Chat'), 'Confirmation Request component')),
    check('Analytics / native Phase 3C historical chart', hasInstance(section('Analytics'), 'Historical Chart component')),
    check('Forecasts / native Phase 3C target chart', hasInstance(section('Forecasts'), 'Actual vs Predicted Chart component')),
    ...sections.map(s => check(`${s.name} / semantic color binding`, hasBoundColor(section(s.name)))),
  ];
  const sourceChecks = [
    check('03A — Low-Fi Wireframes / protected', figma.root.children.filter(p => p.name === '03A — Low-Fi Wireframes').length === 1),
    check('03B — UX Review & Revisions / protected', figma.root.children.filter(p => p.name === '03B — UX Review & Revisions').length === 1),
    check('03C — Design System / protected', figma.root.children.filter(p => p.name === '03C — Design System').length === 1),
  ];
  const semantic = semanticChecks.every(c => c.pass);
  const geometry = geometryChecks.every(c => c.pass);
  const assetUsage = assetChecks.every(c => c.pass);
  const sourceProtection = sourceChecks.every(c => c.pass);
  return { pass: Boolean(page && page.name === TARGET_PAGE) && sections.every(s => s.pass) && semantic && geometry && assetUsage && sourceProtection,
    sections, semantic, geometry, assetUsage, sourceProtection, semanticChecks, geometryChecks, assetChecks, sourceChecks };
}

export function formatAggregateValidation(result: AggregateValidation): string {
  const state = (pass: boolean): string => pass ? 'PASS' : 'FAIL';
  const p0 = result.sections.slice(1).filter(s => s.pass).length;
  const lines = [
    'PHASE 3D HIGH-FIDELITY VALIDATION',
    `Page: ${TARGET_PAGE}`,
    '',
    ...result.sections.map(s => `${s.name}: ${state(s.pass)}`),
    '',
    `P0 high-fi screens: ${p0}/6 ${state(p0 === 6)}`,
    `plus Shared Shell ${state(result.sections[0].pass)}`,
    `Semantic consistency: ${state(result.semantic)}`,
    `Geometry: ${state(result.geometry)}`,
    `Phase 3C asset usage: ${state(result.assetUsage)}`,
    `Source-page protection: ${state(result.sourceProtection)}`,
    `Overall: ${state(result.pass)}`,
    '', 'Canonical section containers:',
    ...result.sections.map(s => `- ${s.canonical}: ${s.exactFrames} exact FRAME; ${s.exactOtherTypes.length} exact-name other type(s)${s.exactOtherTypes.length ? ` (${s.exactOtherTypes.join(', ')})` : ''}`),
    '', 'Semantic consistency:', ...result.semanticChecks.map(c => `- ${c.label}: ${state(c.pass)}`),
    '', 'Geometry:', ...result.geometryChecks.map(c => `- ${c.label}: ${state(c.pass)}${c.detail ? ` (${c.detail})` : ''}`),
    '', 'Phase 3C asset usage:', ...result.assetChecks.map(c => `- ${c.label}: ${state(c.pass)}${c.detail ? ` (${c.detail})` : ''}`),
    '', 'Source-page protection (read-only inspection):', ...result.sourceChecks.map(c => `- ${c.label}: ${state(c.pass)}`),
    ...result.sections.flatMap(s => ['', `${s.name} existing validator:`, ...s.validation.checks.map(c => `- ${c.label}: ${state(c.pass)}${c.detail ? ` (${c.detail})` : ''}`)]),
    '', 'Scope:', 'structural, semantic and generated-node geometry validation;',
    'manual visual review remains separate and has been performed externally.',
  ];
  return lines.join('\n');
}
