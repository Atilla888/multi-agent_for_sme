import { COLLECTION_NAME, DESIGN_PAGE, REQUIRED_COMPONENTS, designSectionFor } from './constants';
import { primitive, rgb, semantic, typeScale } from '../../figma-phase3c-plugin/src/tokens';

export type SemanticName = keyof typeof semantic;
export type TypeName = keyof typeof typeScale;
export const palette = { primitive, semantic, typeScale };

export interface AssetReport {
  pageExists: boolean;
  components: AssetDiagnostic[];
  treatments: { name: string; found: boolean }[];
  variables: number;
  gaps: string[];
}

export type AssetStatus = 'FOUND' | 'MISSING' | 'DUPLICATE' | 'WRONG_TYPE' | 'MISSING_SECTION' | 'DUPLICATE_SECTION';
export interface AssetMatch { name: string; type: string; id: string; path: string }
export interface AssetDiagnostic {
  name: string;
  canonicalName: string;
  section: string;
  status: AssetStatus;
  found: boolean;
  type?: string;
  count: number;
  matches: AssetMatch[];
  archivedMatches: AssetMatch[];
  sectionMatches: AssetMatch[];
}

function canonicalName(name: string): string {
  return name.startsWith('Component / ') ? name : `Component / ${name}`;
}

function nodePath(node: SceneNode, page: PageNode): string {
  const parts = [node.name];
  for (let parent: BaseNode | null = node.parent; parent && parent !== page; parent = parent.parent) parts.unshift(parent.name);
  return [page.name, ...parts].join(' / ');
}

function matchDetails(node: SceneNode, page: PageNode): AssetMatch {
  return { name: node.name, type: node.type, id: node.id || 'unavailable', path: nodePath(node, page) };
}

function isArchived(node: SceneNode, page: PageNode): boolean {
  for (let parent: BaseNode | null = node.parent; parent && parent !== page; parent = parent.parent) {
    if (/^ARCHIVE\s*[—-]\s*/i.test(parent.name)) return true;
  }
  return false;
}

export function resolveDesignSection(page: PageNode | undefined, name: string): { status: 'FOUND' | 'MISSING_SECTION' | 'DUPLICATE_SECTION' | 'WRONG_TYPE'; frame?: FrameNode; matches: AssetMatch[] } {
  const exact = page ? page.findAll(n => n.name === name && !isArchived(n, page)) : [];
  const frames = exact.filter(n => n.type === 'FRAME') as FrameNode[];
  const status = frames.length > 1 ? 'DUPLICATE_SECTION' : frames.length === 1 ? 'FOUND'
    : exact.length ? 'WRONG_TYPE' : 'MISSING_SECTION';
  return { status, frame: status === 'FOUND' ? frames[0] : undefined, matches: page ? exact.map(n => matchDetails(n, page)) : [] };
}

export function resolveDesignAsset(page: PageNode | undefined, name: string, section = designSectionFor(name)): { diagnostic: AssetDiagnostic; node?: ComponentNode | ComponentSetNode } {
  const exact = canonicalName(name);
  const source = resolveDesignSection(page, section);
  const matches = source.frame ? source.frame.findAll(n => n.name === exact) : [];
  const archived = page ? page.findAll(n => n.name === exact && isArchived(n, page)) : [];
  const valid = matches.length === 1 && (matches[0].type === 'COMPONENT' || matches[0].type === 'COMPONENT_SET');
  const status: AssetStatus = source.status !== 'FOUND' ? source.status
    : matches.length === 0 ? 'MISSING' : matches.length > 1 ? 'DUPLICATE' : valid ? 'FOUND' : 'WRONG_TYPE';
  return {
    diagnostic: {
      name: exact, canonicalName: exact, section, status, found: status === 'FOUND', type: matches.length === 1 ? matches[0].type : undefined,
      count: matches.length, matches: page ? matches.map(n => matchDetails(n, page)) : [],
      archivedMatches: page ? archived.map(n => matchDetails(n, page)) : [], sectionMatches: source.matches,
    },
    node: status === 'FOUND' && valid ? matches[0] as ComponentNode | ComponentSetNode : undefined,
  };
}

const components = new Map<string, ComponentNode | ComponentSetNode>();
const variables = new Map<SemanticName, Variable>();

export async function findDesignPage(): Promise<PageNode | undefined> {
  const found = figma.root.children.filter(p => p.name === DESIGN_PAGE);
  if (found.length > 1) throw new Error(`Duplicate ${DESIGN_PAGE} pages; inspect manually.`);
  if (found[0]) await found[0].loadAsync();
  return found[0];
}

export async function inspectDesignSystem(): Promise<AssetReport> {
  const page = await findDesignPage();
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const matchingCollections = collections.filter(c => c.name === COLLECTION_NAME);
  const collection = matchingCollections.length === 1 ? matchingCollections[0] : undefined;
  const colorVars = collection ? (await figma.variables.getLocalVariablesAsync('COLOR')).filter(v => v.variableCollectionId === collection.id) : [];
  const semanticVars = colorVars.filter(v => v.name.startsWith('semantic/'));
  const entries = REQUIRED_COMPONENTS.map(name => ({ ...resolveDesignAsset(page, name).diagnostic, name }));
  const treatmentTexts = page ? page.findAll(n => n.type === 'TEXT').map(n => (n as TextNode).characters).join(' ') : '';
  const treatments = [
    { name: 'OUTCOME_UNKNOWN', found: treatmentTexts.includes('OUTCOME_UNKNOWN') && semanticVars.some(v => v.name === 'semantic/status/unknown') },
    { name: 'Waiting Human', found: /Waiting for Human|Waiting Human/.test(treatmentTexts) && semanticVars.some(v => v.name === 'semantic/status/waiting-human') },
    { name: 'Known Failure', found: treatmentTexts.includes('Known Failure') && semanticVars.some(v => v.name === 'semantic/status/error') },
    { name: 'Confirmed', found: treatmentTexts.includes('Confirmed') && semanticVars.some(v => v.name === 'semantic/status/success') },
  ];
  return { pageExists: Boolean(page), components: entries, treatments, variables: semanticVars.length,
    gaps: [...(matchingCollections.length > 1 ? [`Duplicate ${COLLECTION_NAME} collections`] : []),
      ...entries.filter(e => !e.found).map(e => `${e.status === 'DUPLICATE' ? 'Duplicate' : e.status === 'WRONG_TYPE' ? 'Wrong type' : e.status} ${e.canonicalName} in ${e.section}`),
      ...treatments.filter(t => !t.found).map(t => `${t.name} treatment`)] };
}

export async function loadDesignAssets(): Promise<AssetReport> {
  const report = await inspectDesignSystem();
  components.clear(); variables.clear();
  const page = await findDesignPage();
  if (page) {
    const names = new Set([...REQUIRED_COMPONENTS.map(canonicalName), ...page.findAll(n => n.name.startsWith('Component / ')).map(n => n.name)]);
    for (const name of names) {
      const resolved = resolveDesignAsset(page, name);
      if (resolved.node) components.set(name, resolved.node);
    }
  }
  const matches = (await figma.variables.getLocalVariableCollectionsAsync()).filter(c => c.name === COLLECTION_NAME);
  const collection = matches.length === 1 ? matches[0] : undefined;
  if (collection) for (const v of await figma.variables.getLocalVariablesAsync('COLOR')) {
    if (v.variableCollectionId === collection.id && v.name.startsWith('semantic/')) variables.set(v.name.slice(9) as SemanticName, v);
  }
  return report;
}

export function paint(token: SemanticName): SolidPaint {
  const base: SolidPaint = { type: 'SOLID', color: rgb(primitive[semantic[token]]) };
  const variable = variables.get(token);
  return variable ? figma.variables.setBoundVariableForPaint(base, 'color', variable) : base;
}

export function fill(node: GeometryMixin, token: SemanticName): void { node.fills = [paint(token)]; }
export function stroke(node: GeometryMixin, token: SemanticName): void { node.strokes = [paint(token)]; }

function matchesVariant(node: ComponentNode, variant: string | undefined): boolean {
  if (!variant) return true;
  if (node.name === variant) return true;
  const separator = variant.indexOf('=');
  if (separator < 1) return false;
  const key = variant.slice(0, separator).trim();
  const value = variant.slice(separator + 1).trim();
  return node.variantProperties?.[key] === value;
}

export function instantiate(parent: BaseNode & ChildrenMixin, component: string, variant: string | undefined, name: string, x: number, y: number, maxWidth?: number): InstanceNode | undefined {
  const base = components.get(canonicalName(component));
  if (!base) return undefined;
  const target = base.type === 'COMPONENT_SET'
    ? base.children.find(n => n.type === 'COMPONENT' && matchesVariant(n, variant)) as ComponentNode | undefined
    : base;
  if (!target || (maxWidth && target.width > maxWidth)) return undefined;
  const instance = target.createInstance();
  parent.appendChild(instance);
  instance.name = name;
  instance.x = x; instance.y = y;
  return instance;
}

export function componentAvailable(name: string, variant?: string, maxWidth?: number): boolean {
  const base = components.get(canonicalName(name));
  if (!base) return false;
  if (base.type === 'COMPONENT') return !maxWidth || base.width <= maxWidth;
  return base.children.some(n => n.type === 'COMPONENT' && matchesVariant(n, variant) && (!maxWidth || n.width <= maxWidth));
}

export function requireDesignAssets(requirements: readonly { section: string; name: string; variant?: string; maxWidth?: number }[]): void {
  const page = figma.root.children.find(p => p.name === DESIGN_PAGE);
  for (const requirement of requirements) {
    const { diagnostic, node } = resolveDesignAsset(page, requirement.name, requirement.section);
    if (!node) throw new Error(`${diagnostic.status} approved Phase 3C asset: ${diagnostic.name} in ${diagnostic.section}. Exact active matches: ${diagnostic.count}. ${diagnostic.matches.map(m => `${m.type} ${m.id} at ${m.path}`).join('; ')}${diagnostic.sectionMatches.length ? ` Section matches: ${diagnostic.sectionMatches.map(m => `${m.type} ${m.id} at ${m.path}`).join('; ')}.` : ''} Nothing was replaced.`);
    const candidates = node.type === 'COMPONENT_SET'
      ? node.children.filter(n => n.type === 'COMPONENT' && matchesVariant(n, requirement.variant)) as ComponentNode[]
      : requirement.variant ? [] : [node];
    if (candidates.length !== 1) throw new Error(`${candidates.length ? 'DUPLICATE' : 'MISSING'} approved Phase 3C variant: ${diagnostic.name}${requirement.variant ? ` / ${requirement.variant}` : ''}. Available: ${node.type === 'COMPONENT_SET' ? node.children.map(n => n.name).join(', ') : 'none'}. Nothing was replaced.`);
    if (requirement.maxWidth && candidates[0].width > requirement.maxWidth) throw new Error(`Approved Phase 3C asset exceeds available width: ${diagnostic.name} (${candidates[0].width} > ${requirement.maxWidth}). Nothing was replaced.`);
    if (components.get(diagnostic.name) !== node) throw new Error(`Phase 3C asset cache is not loaded: ${diagnostic.name}. Nothing was replaced.`);
  }
}
