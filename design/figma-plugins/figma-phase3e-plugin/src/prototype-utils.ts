import { FLOW1_BOARD, FLOW2_BOARD, FLOW3_BOARD, FLOW4_BOARD, FLOW5_BOARD, FLOW6_BOARD, FLOW7_BOARD, FLOW8_BOARD, TARGET_PAGE, assertWritablePageName, cloneName, type FlowSpec } from './constants';

export function assertTarget(page: PageNode): void {
  assertWritablePageName(page.name);
  if (figma.currentPage.id !== page.id || figma.currentPage.name !== TARGET_PAGE) throw new Error('Current page is not the exact 03E target.');
}

export function findUniqueControl(frame: FrameNode, name: string): SceneNode & ReactionMixin {
  const matches = frame.findAll(n => n.name === name && 'setReactionsAsync' in n) as (SceneNode & ReactionMixin)[];
  if (matches.length !== 1) throw new Error(`${frame.name}: expected one reaction-capable existing control named ${name}; found ${matches.length}.`);
  return matches[0];
}

export function navigateReaction(destinationId: string): Reaction {
  return { trigger: { type: 'ON_CLICK' }, actions: [{ type: 'NODE', destinationId, navigation: 'NAVIGATE', transition: null }] };
}

export function ownedNames(flow: FlowSpec): string[] {
  const prefix = `3E / Flow ${String(flow.id).padStart(2, '0')}`;
  if (flow.id === 1) return [
    ...flow.frames.map(f => cloneName(flow.id, f.key)),
    FLOW1_BOARD.start.name, FLOW1_BOARD.step1.name, FLOW1_BOARD.step1Note.name,
    FLOW1_BOARD.continue.name, FLOW1_BOARD.step2.name, FLOW1_BOARD.productBoundary.name,
    FLOW1_BOARD.inventoryBoundary.name, FLOW1_BOARD.end.name, FLOW1_BOARD.legacyNote,
  ];
  if (flow.id === 2) return [
    ...flow.frames.map(f => cloneName(flow.id, f.key)),
    ...[FLOW2_BOARD.start, FLOW2_BOARD.step1, FLOW2_BOARD.proposalBoundary, FLOW2_BOARD.confirmation,
      FLOW2_BOARD.step2, FLOW2_BOARD.processingNote, FLOW2_BOARD.processingComplete, FLOW2_BOARD.step3,
      FLOW2_BOARD.confirmedNote, FLOW2_BOARD.orderSource, FLOW2_BOARD.orderControl, FLOW2_BOARD.step4,
      FLOW2_BOARD.orderBoundary, FLOW2_BOARD.deliveryBoundary, FLOW2_BOARD.backendBoundary, FLOW2_BOARD.end].map(item => item.name),
  ];
  if (flow.id === 3) return [
    ...flow.frames.map(f => cloneName(flow.id, f.key)),
    ...Object.values(FLOW3_BOARD).map(item => item.name),
  ];
  if (flow.id === 4) return [
    ...flow.frames.map(f => cloneName(flow.id, f.key)),
    ...Object.values(FLOW4_BOARD).map(item => item.name),
  ];
  if (flow.id === 5) return [
    ...flow.frames.map(f => cloneName(flow.id, f.key)),
    ...Object.values(FLOW5_BOARD).map(item => item.name),
  ];
  if (flow.id === 6) return [
    ...flow.frames.map(f => cloneName(flow.id, f.key)),
    ...Object.values(FLOW6_BOARD).map(item => item.name),
  ];
  if (flow.id === 7) return [
    ...flow.frames.map(f => cloneName(flow.id, f.key)),
    ...Object.values(FLOW7_BOARD).map(item => item.name),
  ];
  if (flow.id === 8) return [
    ...flow.frames.map(f => cloneName(flow.id, f.key)),
    ...Object.values(FLOW8_BOARD).map(item => item.name),
  ];
  return [
    ...flow.frames.map(f => cloneName(flow.id, f.key)),
    `${prefix} / START`, `${prefix} / END`,
    ...flow.notes.map((_, i) => `${prefix} / Note ${i + 1}`),
    ...flow.edges.filter(e => e.note).map((_, i) => `${prefix} / Edge Note ${i + 1}`),
  ];
}

export function visualSignature(frame: FrameNode): string {
  const lines: string[] = [];
  const visit = (node: SceneNode): void => {
    lines.push(`${node.type}|${node.name}|${'width' in node ? node.width : ''}|${'height' in node ? node.height : ''}`);
    if (node.type === 'TEXT') lines.push(`TEXT:${node.characters}`);
    if (node.type === 'INSTANCE') lines.push('INSTANCE');
    if ('fills' in node) lines.push(`FILLS:${JSON.stringify(node.fills)}`);
    if ('children' in node) for (const child of node.children) visit(child);
  };
  for (const child of frame.children) visit(child);
  return `${frame.width}x${frame.height}|${lines.join(';')}`;
}

export async function loadAnnotationFont(): Promise<FontName> {
  const font = { family: 'Inter', style: 'Regular' };
  await figma.loadFontAsync(font);
  return font;
}

export function annotation(page: PageNode, parent: SectionNode, name: string, value: string, x: number, y: number, width: number, font: FontName): TextNode {
  assertTarget(page);
  const node = figma.createText();
  node.name = name;
  parent.appendChild(node);
  node.fontName = font;
  node.fontSize = 16;
  node.characters = value;
  node.textAutoResize = 'HEIGHT';
  node.resize(width, node.height);
  node.x = x;
  node.y = y;
  return node;
}

export function pageSection(page: PageNode, name: string, x: number, y: number, width: number, height: number): SectionNode {
  assertTarget(page);
  const matches = page.children.filter(n => n.name === name);
  if (matches.length > 1 || (matches.length === 1 && matches[0].type !== 'SECTION')) throw new Error(`Ambiguous or wrong-type 03E section: ${name}.`);
  if (matches.length === 1) return matches[0] as SectionNode;
  const section = figma.createSection();
  section.name = name;
  section.x = x;
  section.y = y;
  section.resize(width, height);
  return section;
}

export function inspectOwned(section: SectionNode, flow: FlowSpec): SceneNode[] {
  const expected = new Set(ownedNames(flow));
  const old: SceneNode[] = [];
  for (const name of expected) {
    const matches = section.children.filter(n => n.name === name);
    if (matches.length > 1) throw new Error(`Duplicate plugin-owned 03E node: ${name}. No existing flow was changed.`);
    if (matches.length === 1) old.push(matches[0]);
  }
  return old;
}
