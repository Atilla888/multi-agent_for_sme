import { COLLECTION_NAME, SECTIONS, TARGET_PAGE, TYPE_STYLE_PREFIX } from './constants';
import { findPage } from './figma-utils';

type Check = [string, boolean];
type SectionStatus = 'PASS' | 'MISSING' | 'DUPLICATE' | 'WRONG_TYPE';
type SectionDiagnostic = {
  name: string;
  status: SectionStatus;
  frames: SceneNode[];
  otherTypes: SceneNode[];
  nearNames: SceneNode[];
};
const requiredComponents = [
  'Component / Button', 'Component / Input', 'Component / Badge / Status / OUTCOME_UNKNOWN',
  'Component / Alert / State Banner', 'Component / Navigation / Primary Item',
  'Component / Conversation / List Item', 'Component / Conversation / Active Handler',
  'Component / Conversation / Handoff Event', 'Component / Business / Order State',
  'Component / Business / Reservation State', 'Component / Escalation / Human Decision Panel',
  'Component / Escalation / Decision Block',
  'Component / Analytics / KPI', 'Component / Analytics / Freshness',
  'Component / Forecast / Actual Series', 'Component / Forecast / Predicted Series',
  'Component / Forecast / MODEL_NOT_READY', 'Component / Web Chat / Confirmation Request',
  'Component / Web Chat / Delivery Failure',
] as const;

function comparableName(name: string): string {
  // Diagnostic hint only. Matching and PASS always use the exact canonical name.
  return name.replace(/\s*\/\s*staging$/i, '').replace(/[‐‑‒–—−]/g, '-').replace(/\s+/g, ' ').trim().toLowerCase();
}

function sectionDiagnostics(nodes: readonly SceneNode[]): SectionDiagnostic[] {
  return Object.values(SECTIONS).map(name => {
    const exact = nodes.filter(node => node.name === name);
    const frames = exact.filter(node => node.type === 'FRAME');
    const otherTypes = exact.filter(node => node.type !== 'FRAME');
    const nearNames = nodes.filter(node => node.name !== name && comparableName(node.name) === comparableName(name));
    const status: SectionStatus = frames.length > 1 ? 'DUPLICATE' : frames.length === 1 ? 'PASS'
      : otherTypes.length ? 'WRONG_TYPE' : 'MISSING';
    return { name, status, frames, otherTypes, nearNames };
  });
}

function nodePath(node: SceneNode, page: PageNode): string {
  const parts = [node.name];
  let parent: BaseNode | null = node.parent;
  for (let depth = 0; parent && parent !== page && depth < 32; depth++) {
    parts.unshift(parent.name);
    parent = parent.parent;
  }
  parts.unshift(page.name);
  return parts.join(' / ');
}

function nodeDetails(node: SceneNode, page: PageNode): string {
  return `- name=${JSON.stringify(node.name)}; type=${node.type}; id=${node.id || 'unavailable'}; path=${nodePath(node, page)}`;
}

function describeSection(diagnostic: SectionDiagnostic, page: PageNode): string[] {
  const { name, status, frames, otherTypes, nearNames } = diagnostic;
  return [
    `${name}: ${status}`,
    `Exact FRAME matches: ${frames.length}`,
    ...frames.map(node => nodeDetails(node, page)),
    `Exact-name OTHER node types: ${otherTypes.length}${otherTypes.length ? ` (${otherTypes.map(node => node.type).join(', ')})` : ''}`,
    ...otherTypes.map(node => nodeDetails(node, page)),
    `Near/legacy name matches: ${nearNames.length}`,
    ...nearNames.map(node => nodeDetails(node, page)),
  ];
}

export async function inspect(): Promise<string> {
  const page = await findPage();
  if (!page) return `${TARGET_PAGE} is absent. Inspect did not create it.`;
  const sections = sectionDiagnostics(page.findAll());
  return [`Page: ${TARGET_PAGE}`, `Top-level nodes: ${page.children.length}`,
    ...sections.flatMap(section => describeSection(section, page)), 'Inspect is read-only.'].join('\n');
}

export async function validate(): Promise<string> {
  const page = await findPage();
  const checks: Check[] = [];
  if (!page) return `PHASE 3C FIGMA VALIDATION\nPage: ${TARGET_PAGE}\nMissing page. 0 structural checks passed.\nScope: structural only; visual approval required.`;
  const nodes = page.findAll();
  const names = new Set(nodes.map(n => n.name));
  const sections = sectionDiagnostics(nodes);
  for (const section of sections) checks.push([section.name, section.status === 'PASS']);
  for (const c of requiredComponents) checks.push([c, names.has(c)]);
  const variableCollections = await figma.variables.getLocalVariableCollectionsAsync();
  const collection = variableCollections.find(c => c.name === COLLECTION_NAME);
  const vars = collection ? (await figma.variables.getLocalVariablesAsync('COLOR')).filter(v => v.variableCollectionId === collection.id) : [];
  const varNames = new Set(vars.map(v => v.name));
  checks.push(['Color Variables', !!collection && varNames.has('primitive/color/white') && varNames.has('semantic/status/unknown')]);
  checks.push(['Typography Styles', (await figma.getLocalTextStylesAsync()).some(s => s.name === TYPE_STYLE_PREFIX + 'Body')]);
  const allText = nodes.filter((n): n is TextNode => n.type === 'TEXT').map(n => n.characters).join('\n');
  for (const [label, needle] of [
    ['Spacing', '4-point base'], ['Radius', '4 small'], ['Borders', 'Subtle dividers'],
    ['Known Failure distinction', 'known not to have completed'],
    ['OUTCOME_UNKNOWN reconciliation', 'Reconcile authoritative state'],
    ['Order vs Reservation', 'RESERVATION STATE'],
    ['Actual vs Predicted', 'dashed line'],
    ['MODEL_NOT_READY current', 'CURRENT: no validated model'],
    ['Delivery vs Business Effect', 'confirmed business effect is unchanged'],
    ['Accessibility notes', 'WCAG 2.2 AA-level'],
    ['Localization notes', 'English, Russian, Kazakh'],
  ] as const) checks.push([label, allText.toLowerCase().includes(needle.toLowerCase())]);
  const passed = checks.filter(([, ok]) => ok).length;
  return [
    'PHASE 3C FIGMA VALIDATION', `Page: ${TARGET_PAGE}`,
    ...checks.map(([label, ok]) => `${label}: ${sections.find(section => section.name === label)?.status ?? (ok ? 'PASS' : 'FAIL')}`),
    `Structural checks: ${passed}/${checks.length} PASS`,
    ...sections.filter(section => section.status !== 'PASS').flatMap(section => ['', ...describeSection(section, page)]),
    'Scope: structural validation only; visual, interaction, localization and accessibility approval required separately.',
  ].join('\n');
}
