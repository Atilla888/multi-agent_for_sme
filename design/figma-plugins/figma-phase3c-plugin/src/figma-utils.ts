import { COLLECTION_NAME, TARGET_PAGE, TYPE_STYLE_PREFIX, type BuildAction } from './constants';
import { assertFile, assertTargetPage, ownedNames, planReplacement } from './ownership';
import { primitive, rgb, semantic, typeScale } from './tokens';

export type SemanticName = keyof typeof semantic;
const semanticVars = new Map<SemanticName, Variable>();

export async function findPage(): Promise<PageNode | undefined> {
  assertFile(figma.root.name, figma.fileKey ?? undefined);
  const matches = figma.root.children.filter(p => p.name === TARGET_PAGE);
  if (matches.length > 1) throw new Error(`Duplicate ${TARGET_PAGE} pages; resolve manually.`);
  const page = matches[0];
  if (page) await page.loadAsync();
  return page;
}

export async function writablePage(): Promise<PageNode> {
  let page = await findPage();
  if (!page) {
    page = figma.createPage();
    page.name = TARGET_PAGE;
    await page.loadAsync();
  }
  assertTargetPage(page.name);
  await figma.setCurrentPageAsync(page);
  if (figma.currentPage.id !== page.id) throw new Error('Figma did not switch to the exact 03C page.');
  return page;
}

export async function loadFonts(): Promise<void> {
  await Promise.all([
    figma.loadFontAsync({ family: 'Inter', style: 'Regular' }),
    figma.loadFontAsync({ family: 'Inter', style: 'Medium' }),
    figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' }),
    figma.loadFontAsync({ family: 'Inter', style: 'Bold' }),
  ]);
}

export function solid(hex: string): SolidPaint { return { type: 'SOLID', color: rgb(hex) }; }
export function fill(node: GeometryMixin, token: SemanticName | keyof typeof primitive): void {
  const primitiveName = token in semantic ? semantic[token as SemanticName] : token as keyof typeof primitive;
  const paint = solid(primitive[primitiveName]);
  const variable = semanticVars.get(token as SemanticName);
  node.fills = [variable ? figma.variables.setBoundVariableForPaint(paint, 'color', variable) : paint];
}
export function stroke(node: GeometryMixin, token: SemanticName | keyof typeof primitive): void {
  const primitiveName = token in semantic ? semantic[token as SemanticName] : token as keyof typeof primitive;
  const paint = solid(primitive[primitiveName]);
  const variable = semanticVars.get(token as SemanticName);
  node.strokes = [variable ? figma.variables.setBoundVariableForPaint(paint, 'color', variable) : paint];
}

export function frame(parent: BaseNode & ChildrenMixin, name: string, x: number, y: number, w: number, h: number, bg: SemanticName | keyof typeof primitive = 'surface/default'): FrameNode {
  const n = figma.createFrame();
  n.name = name; n.x = x; n.y = y; n.resize(w, h); n.clipsContent = false;
  fill(n, bg); parent.appendChild(n); return n;
}

export function box(parent: BaseNode & ChildrenMixin, name: string, x: number, y: number, w: number, h: number, bg: SemanticName | keyof typeof primitive = 'surface/default', border: SemanticName = 'border/default', r = 8): FrameNode {
  const n = frame(parent, name, x, y, w, h, bg);
  stroke(n, border); n.strokeWeight = 1; n.cornerRadius = r;
  return n;
}

export function txt(parent: BaseNode & ChildrenMixin, name: string, value: string, x: number, y: number, w: number, size = 14, color: SemanticName = 'text/primary', weight: 'Regular' | 'Medium' | 'Semi Bold' | 'Bold' = 'Regular'): TextNode {
  const n = figma.createText(); n.name = name; parent.appendChild(n);
  n.fontName = { family: 'Inter', style: weight }; n.fontSize = size; n.characters = value;
  n.textAutoResize = 'HEIGHT'; n.resize(w, n.height); n.x = x; n.y = y;
  fill(n, color); return n;
}

export function note(parent: BaseNode & ChildrenMixin, text: string, y: number, w = 970): TextNode {
  return txt(parent, 'Usage / ' + text.slice(0, 36), text, 28, y, w, 13, 'text/secondary');
}

export function section(page: PageNode, name: string, x: number, y: number, h: number, subtitle: string): FrameNode {
  assertTargetPage(page.name);
  const n = frame(page, name + ' / staging', x, y, 1080, h, 'surface/subtle');
  stroke(n, 'border/default'); n.strokeWeight = 1; n.cornerRadius = 8;
  txt(n, 'Section heading', name, 28, 24, 1010, 22, 'text/primary', 'Bold');
  txt(n, 'Section purpose', subtitle, 28, 60, 1010, 13, 'text/secondary');
  return n;
}

export function component(parent: BaseNode & ChildrenMixin, name: string, x: number, y: number, w: number, h: number, bg: SemanticName = 'surface/default'): ComponentNode {
  const n = figma.createComponent(); parent.appendChild(n); n.name = name;
  n.x = x; n.y = y; n.resize(w, h); n.clipsContent = false;
  fill(n, bg); stroke(n, 'border/default'); n.strokeWeight = 1; n.cornerRadius = 8;
  return n;
}

export function labelCard(parent: BaseNode & ChildrenMixin, name: string, body: string, x: number, y: number, w = 318, h = 112, accent: SemanticName = 'text/secondary', bg: SemanticName = 'surface/default'): ComponentNode {
  const n = component(parent, name, x, y, w, h, bg);
  txt(n, 'Title', name.replace(/^Component \/ /, ''), 16, 14, w - 32, 14, accent, 'Semi Bold');
  txt(n, 'Example', body, 16, 42, w - 32, 13, 'text/primary');
  return n;
}

export async function loadSemanticVariables(): Promise<void> {
  semanticVars.clear();
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const collection = collections.find(c => c.name === COLLECTION_NAME);
  if (!collection) return;
  for (const v of await figma.variables.getLocalVariablesAsync('COLOR')) {
    if (v.variableCollectionId === collection.id && v.name.startsWith('semantic/')) {
      semanticVars.set(v.name.slice(9) as SemanticName, v);
    }
  }
}

export async function upsertVariablesAndStyles(): Promise<void> {
  const collections = (await figma.variables.getLocalVariableCollectionsAsync()).filter(c => c.name === COLLECTION_NAME);
  if (collections.length > 1) throw new Error('Duplicate Phase 3C variable collections; resolve manually.');
  const collection = collections[0] ?? figma.variables.createVariableCollection(COLLECTION_NAME);
  const mode = collection.modes[0].modeId;
  if (collection.modes.length !== 1) throw new Error('Phase 3C collection has unexpected modes; refusing to overwrite.');
  if (collection.modes[0].name !== 'Light') collection.renameMode(mode, 'Light');
  const existing = (await figma.variables.getLocalVariablesAsync('COLOR')).filter(v => v.variableCollectionId === collection.id);
  const byName = new Map(existing.map(v => [v.name, v]));
  const primitives = new Map<string, Variable>();
  for (const [name, hex] of Object.entries(primitive)) {
    const key = `primitive/color/${name}`;
    const v = byName.get(key) ?? figma.variables.createVariable(key, collection, 'COLOR');
    v.setValueForMode(mode, rgb(hex)); primitives.set(name, v);
  }
  for (const [name, primitiveName] of Object.entries(semantic)) {
    const key = `semantic/${name}`;
    const v = byName.get(key) ?? figma.variables.createVariable(key, collection, 'COLOR');
    v.setValueForMode(mode, figma.variables.createVariableAlias(primitives.get(primitiveName)!));
    semanticVars.set(name as SemanticName, v);
  }
  const styles = await figma.getLocalTextStylesAsync();
  for (const [name, [size, lineHeight, weight]] of Object.entries(typeScale)) {
    const full = TYPE_STYLE_PREFIX + name;
    const found = styles.filter(s => s.name === full);
    if (found.length > 1) throw new Error(`Duplicate text style ${full}; resolve manually.`);
    const style = found[0] ?? figma.createTextStyle();
    style.name = full; style.fontName = { family: 'Inter', style: weight };
    style.fontSize = size; style.lineHeight = { unit: 'PIXELS', value: lineHeight };
  }
}

export async function replaceSections(action: BuildAction, make: (page: PageNode) => Promise<FrameNode[]>, preserveExisting: readonly string[] = []): Promise<string[]> {
  const page = await writablePage();
  const oldNames = planReplacement(action, page.children.map(n => n.name));
  const allowed = new Set<string>(ownedNames(action));
  if (preserveExisting.some(name => !allowed.has(name))) throw new Error(`Cannot preserve an unowned section for ${action}.`);
  const preserved = new Set(preserveExisting.filter(name => oldNames.includes(name)));
  for (const node of page.children) {
    if (allowed.has(node.name) && node.type !== 'FRAME') {
      throw new Error(`Owned section name is used by a non-frame node: ${node.name}. Resolve manually.`);
    }
  }
  await loadSemanticVariables();
  await loadFonts();
  const before = new Set(page.children.map(n => n.id));
  try {
    const next = await make(page);
    const names = next.map(n => n.name.replace(' / staging', ''));
    if (names.length !== allowed.size || names.some(name => !allowed.has(name)) || new Set(names).size !== names.length) {
      throw new Error(`Builder ${action} did not return exactly its documented section names.`);
    }
    const owned = new Set<string>([...oldNames, ...names]);
    for (const child of [...page.children]) {
      if (before.has(child.id) && owned.has(child.name) && !preserved.has(child.name)) child.remove();
    }
    for (const n of next) {
      const name = n.name.replace(' / staging', '');
      if (preserved.has(name)) n.remove();
      else n.name = name;
    }
    return names.filter(name => !preserved.has(name));
  } catch (error) {
    for (const child of [...page.children]) if (!before.has(child.id)) child.remove();
    throw error;
  }
}
