import { BASELINE_PAGE, TARGET_FILE_KEY, TARGET_FILE_NAME, TARGET_PAGE } from './constants';
import type { PanelSpec, ScreenSpec, SectionSpec } from './types';

const gray = (level: number): RGB => ({ r: level / 255, g: level / 255, b: level / 255 });
const fill = (level: number): SolidPaint => ({ type: 'SOLID', color: gray(level) });

export function findPageByName(name: string): PageNode | undefined {
  return figma.root.children.find(page => page.name === name);
}

export async function getTargetPage(): Promise<PageNode> {
  if (figma.root.name !== TARGET_FILE_NAME) {
    throw new Error(`Wrong Figma document (${figma.root.name}). Open ${TARGET_FILE_NAME}.`);
  }
  const fileKey = figma.fileKey;
  if (fileKey && fileKey !== TARGET_FILE_KEY) {
    throw new Error(`Wrong Figma file (${fileKey}). Open the specified diploma file.`);
  }
  const page = findPageByName(TARGET_PAGE);
  if (!page) throw new Error(`${TARGET_PAGE} page not found. Nothing was changed.`);
  if (!findPageByName(BASELINE_PAGE)) {
    throw new Error(`${BASELINE_PAGE} baseline page not found. Verify the Figma file first.`);
  }
  await page.loadAsync();
  return page;
}

export function findNodesByName(page: PageNode, exactName: string): SceneNode[] {
  return page.findAll(node => node.name === exactName);
}

export function positionBelowExistingContent(page: PageNode): { x: number; y: number } {
  const bottoms = page.children
    .map(node => node.absoluteBoundingBox)
    .filter((box): box is Rect => box !== null)
    .map(box => box.y + box.height);
  return { x: 0, y: Math.max(0, ...bottoms) + 240 };
}

export async function loadSimpleFonts(): Promise<void> {
  try {
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
  } catch (error) {
    throw new Error(`Inter font could not be loaded: ${String(error)}`);
  }
}

function autoFrame(name: string, width: number, horizontal = false): FrameNode {
  const node = figma.createFrame();
  node.name = name;
  node.layoutMode = horizontal ? 'HORIZONTAL' : 'VERTICAL';
  node.primaryAxisSizingMode = horizontal ? 'FIXED' : 'AUTO';
  node.counterAxisSizingMode = horizontal ? 'AUTO' : 'FIXED';
  node.resize(width, 100);
  node.paddingTop = 16;
  node.paddingBottom = 16;
  node.paddingLeft = 16;
  node.paddingRight = 16;
  node.itemSpacing = 10;
  node.fills = [fill(255)];
  node.strokes = [fill(180)];
  node.strokeWeight = 1;
  return node;
}

function addText(parent: FrameNode, value: string, size = 15, bold = false, width?: number): TextNode {
  const node = figma.createText();
  parent.appendChild(node);
  node.fontName = { family: 'Inter', style: bold ? 'Bold' : 'Regular' };
  node.characters = value;
  node.fontSize = size;
  node.fills = [fill(35)];
  node.resize(width ?? Math.max(160, parent.width - parent.paddingLeft - parent.paddingRight), 24);
  node.textAutoResize = 'HEIGHT';
  return node;
}

function addDivider(parent: FrameNode): RectangleNode {
  const line = figma.createRectangle();
  parent.appendChild(line);
  line.name = 'Low-fi divider';
  line.resize(Math.max(160, parent.width - parent.paddingLeft - parent.paddingRight), 1);
  line.fills = [fill(190)];
  return line;
}

function addChip(parent: FrameNode, label: string): FrameNode {
  const chip = autoFrame(`Action / ${label}`, Math.max(160, Math.min(500, label.length * 9 + 32)));
  parent.appendChild(chip);
  chip.paddingTop = 8;
  chip.paddingBottom = 8;
  chip.fills = [fill(238)];
  addText(chip, label, 13, true, chip.width - 32);
  return chip;
}

function addPanel(parent: FrameNode, spec: PanelSpec, width: number): FrameNode {
  const panel = autoFrame(`${spec.kind ?? 'panel'} / ${spec.heading}`, width);
  parent.appendChild(panel);
  panel.fills = [fill(spec.tone === 'attention' ? 231 : 247)];
  panel.strokes = [fill(spec.tone === 'attention' ? 100 : 205)];
  addText(panel, spec.heading, 16, true, width - 32);
  addDivider(panel);
  for (const line of spec.lines) addText(panel, line, 13, false, width - 32);
  return panel;
}

function addScreen(parent: FrameNode, spec: ScreenSpec): FrameNode {
  const screen = autoFrame(spec.name, 1200);
  parent.appendChild(screen);
  try {
  screen.paddingTop = 24;
  screen.paddingBottom = 24;
  screen.paddingLeft = 24;
  screen.paddingRight = 24;
  screen.itemSpacing = 14;

  const surface = spec.surface === 'customer' ? 'Customer Web Chat' : spec.surface === 'flow' ? 'Scenario map' : 'Staff workspace';
  addText(screen, `${surface}  /  ${spec.title}`, 24, true, 1152);
  addText(screen, spec.subtitle, 13, false, 1152);
  addDivider(screen);
  addPanel(screen, { heading: `STATE  —  ${spec.status}`, lines: [] }, 1152);

  const body = autoFrame('Screen content', 1152, true);
  screen.appendChild(body);
  body.paddingTop = 0;
  body.paddingBottom = 0;
  body.paddingLeft = 0;
  body.paddingRight = 0;
  body.itemSpacing = 16;
  body.strokes = [];
  body.fills = [];

  if (spec.surface === 'staff') {
    const nav = autoFrame('Staff navigation placeholder', 174);
    body.appendChild(nav);
    nav.fills = [fill(238)];
    for (const item of ['Conversations', 'Escalations', 'Orders', 'Analytics', 'Forecasts']) {
      addText(nav, item, 12, item.toLowerCase() === spec.title.toLowerCase(), 142);
    }
  }

  const contentWidth = spec.surface === 'staff' ? 946 : 1152;
  const content = autoFrame('Main content', contentWidth);
  body.appendChild(content);
  content.paddingTop = 0;
  content.paddingBottom = 0;
  content.paddingLeft = 0;
  content.paddingRight = 0;
  content.strokes = [];
  content.fills = [];

  const columns = spec.columns.length || 1;
  const columnWidth = Math.floor((contentWidth - (columns - 1) * 12) / columns);
  const columnRow = autoFrame('Content columns', contentWidth, true);
  content.appendChild(columnRow);
  columnRow.paddingTop = 0;
  columnRow.paddingBottom = 0;
  columnRow.paddingLeft = 0;
  columnRow.paddingRight = 0;
  columnRow.itemSpacing = 12;
  columnRow.strokes = [];
  columnRow.fills = [];
  for (let index = 0; index < columns; index++) {
    const column = autoFrame(`Column ${index + 1}`, columnWidth);
    columnRow.appendChild(column);
    column.paddingTop = 0;
    column.paddingBottom = 0;
    column.paddingLeft = 0;
    column.paddingRight = 0;
    column.strokes = [];
    column.fills = [];
    for (const panel of spec.columns[index]) addPanel(column, panel, columnWidth);
  }

  if (spec.actions?.length) {
    addText(content, 'NEXT SAFE ACTION', 12, true, contentWidth);
    for (const action of spec.actions) addChip(content, action);
  }
  if (spec.references?.length) addText(content, `References: ${spec.references.join('  ·  ')}`, 12, false, contentWidth);
  if (spec.annotation) addPanel(content, { heading: 'ANNOTATION', lines: [spec.annotation] }, contentWidth);
  return screen;
  } catch (error) {
    screen.remove();
    throw error;
  }
}

function isGeneratedDescendant(node: SceneNode): boolean {
  // Figma may rename text layers from their characters automatically.
  if (node.type === 'TEXT') return true;
  if (node.type === 'RECTANGLE') return node.name === 'Low-fi divider';
  if (node.type !== 'FRAME') return false;
  return node.name === 'Screen content' ||
    node.name === 'Staff navigation placeholder' ||
    node.name === 'Main content' ||
    node.name === 'Content columns' ||
    /^Column \d+$/.test(node.name) ||
    /^(panel|table|chart|flow) \/ /.test(node.name) ||
    node.name.startsWith('Action / ');
}

export async function renderSection(page: PageNode, spec: SectionSpec): Promise<number> {
  if (page.name !== TARGET_PAGE || page.parent !== figma.root) throw new Error('Unsafe target page. Builder stopped.');
  // The builder's ScreenSpec list is the exact allowlist of names it may replace.
  const ownedNames = spec.screens.map(screen => screen.name);
  const ownedSet = new Set(ownedNames);
  if (ownedSet.size !== ownedNames.length || ownedNames.some(name => !name.startsWith('3B / ') || name.includes('/ Conversations /'))) {
    throw new Error('Invalid or duplicate builder-owned screen names. Nothing was changed.');
  }
  const sectionName = `3B / Plugin / ${spec.label}`;
  const candidates = page.children.filter((node): node is FrameNode => node.type === 'FRAME' && node.name === sectionName);
  if (candidates.length > 1) throw new Error(`Multiple sections named ${sectionName}. Resolve the ambiguity manually; nothing was changed.`);
  const existing = candidates[0];
  const found = page.findAll(node => node.type === 'FRAME' && ownedSet.has(node.name));
  if (found.some(node => node.parent !== existing)) {
    throw new Error(`An expected generated screen name exists outside ${sectionName}. Resolve the collision manually; nothing was changed.`);
  }
  const oldScreens = existing?.children.filter((node): node is FrameNode => node.type === 'FRAME' && ownedSet.has(node.name)) ?? [];
  if (existing && oldScreens.length === 0) {
    throw new Error(`${sectionName} has no recognized builder screens. It may be manual work; nothing was changed.`);
  }
  if (new Set(oldScreens.map(node => node.name)).size !== oldScreens.length) {
    throw new Error(`Duplicate generated screen names inside ${sectionName}. Resolve manually; nothing was changed.`);
  }
  for (const old of oldScreens) {
    const unknown = old.findAll(node => !isGeneratedDescendant(node));
    if (unknown.length) {
      throw new Error(`${old.name} contains unrecognized nested layers (${unknown[0].name}). Preserve them manually before rerunning; nothing was changed.`);
    }
  }
  const position = existing ? undefined : positionBelowExistingContent(page);
  await figma.setCurrentPageAsync(page);
  let root = existing;
  const createdScreens: FrameNode[] = [];
  try {
    if (!root) {
      root = autoFrame(sectionName, 1240);
      root.x = position!.x;
      root.y = position!.y;
      root.paddingTop = 20;
      root.paddingBottom = 20;
      root.paddingLeft = 20;
      root.paddingRight = 20;
      root.itemSpacing = 24;
      root.fills = [fill(245)];
      addText(root, spec.label, 28, true, 1200);
      addText(root, spec.intro, 14, false, 1200);
    }
    for (const screen of spec.screens) createdScreens.push(addScreen(root, screen));
    // Commit only after all replacement screens rendered successfully.
    for (const old of oldScreens) old.remove();
    try { figma.viewport.scrollAndZoomIntoView([root]); } catch { /* viewport change is optional */ }
    return spec.screens.length;
  } catch (error) {
    if (!existing && root) root.remove();
    else for (const created of createdScreens) created.remove();
    throw new Error(`Builder failed; previous generated screens and unrelated layers were kept. ${String(error)}`);
  }
}
