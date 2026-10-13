import { FILE_KEY, FILE_NAME, TARGET_PAGE } from './constants';
import { assertCanonicalFile, assertWritablePage } from './ownership';
import { fill, stroke, type SemanticName, palette, type TypeName } from './design-system';

export function assertFile(): void { assertCanonicalFile(figma.root.name, figma.fileKey ?? undefined); }

export async function readPage(): Promise<PageNode | undefined> {
  assertFile();
  const matches = figma.root.children.filter(p => p.name === TARGET_PAGE);
  if (matches.length > 1) throw new Error(`Duplicate ${TARGET_PAGE} pages; resolve manually.`);
  if (matches[0]) await matches[0].loadAsync();
  return matches[0];
}

export async function writablePage(): Promise<PageNode> {
  assertFile();
  let page = await readPage();
  if (!page) {
    page = figma.createPage();
    page.name = TARGET_PAGE;
    await page.loadAsync();
  }
  assertWritablePage(page.name);
  await figma.setCurrentPageAsync(page);
  if (figma.currentPage.id !== page.id) throw new Error(`Could not activate ${TARGET_PAGE}; no frame was generated.`);
  return page;
}

export async function loadFonts(): Promise<void> {
  for (const style of ['Regular', 'Medium', 'Semi Bold', 'Bold']) await figma.loadFontAsync({ family: 'Inter', style });
}

export function frame(parent: BaseNode & ChildrenMixin, name: string, x: number, y: number, w: number, h: number, bg: SemanticName = 'surface/default'): FrameNode {
  const n = figma.createFrame(); parent.appendChild(n);
  n.name = name; n.x = x; n.y = y; n.resize(w, h); n.clipsContent = false; fill(n, bg);
  return n;
}

export function box(parent: BaseNode & ChildrenMixin, name: string, x: number, y: number, w: number, h: number, bg: SemanticName = 'surface/default', border: SemanticName = 'border/default', radius = 8): FrameNode {
  const n = frame(parent, name, x, y, w, h, bg); stroke(n, border); n.strokeWeight = 1; n.cornerRadius = radius; return n;
}

export function text(parent: BaseNode & ChildrenMixin, name: string, value: string, x: number, y: number, w: number, type: TypeName = 'Body', color: SemanticName = 'text/primary'): TextNode {
  const [size, line, weight] = palette.typeScale[type];
  const n = figma.createText(); parent.appendChild(n); n.name = name;
  n.fontName = { family: 'Inter', style: weight }; n.fontSize = size; n.lineHeight = { unit: 'PIXELS', value: line };
  n.characters = value; n.textAutoResize = 'HEIGHT'; n.resize(w, n.height); n.x = x; n.y = y; fill(n, color); return n;
}

export function chip(parent: BaseNode & ChildrenMixin, name: string, value: string, x: number, y: number, w: number, color: SemanticName, bg: SemanticName): FrameNode {
  const n = box(parent, name, x, y, w, 28, bg, color, 6);
  text(n, `${name} / label`, value, 9, 5, w - 18, 'Caption', color); return n;
}

export function line(parent: BaseNode & ChildrenMixin, name: string, x: number, y: number, w: number): FrameNode {
  const n = frame(parent, name, x, y, w, 1, 'border/default'); return n;
}

export function button(parent: BaseNode & ChildrenMixin, name: string, label: string, x: number, y: number, w: number, primary = false): FrameNode {
  const n = box(parent, name, x, y, w, 36, primary ? 'action/primary' : 'surface/default', primary ? 'action/primary' : 'border/default', 6);
  text(n, `${name} / label`, label, 12, 8, w - 24, 'Small', primary ? 'text/inverse' : 'text/primary'); return n;
}

export function descendants(node: BaseNode & ChildrenMixin): SceneNode[] { return node.findAll(() => true); }
export function allText(node: BaseNode & ChildrenMixin): string { return descendants(node).filter(n => n.type === 'TEXT').map(n => (n as TextNode).characters).join('\n'); }

export function exactFrame(parent: BaseNode & ChildrenMixin, name: string): FrameNode | undefined {
  const matches = parent.children.filter(n => n.name === name);
  if (matches.length > 1 || matches.some(n => n.type !== 'FRAME')) throw new Error(`Ambiguous section: ${name}. Resolve manually.`);
  return matches[0] as FrameNode | undefined;
}
