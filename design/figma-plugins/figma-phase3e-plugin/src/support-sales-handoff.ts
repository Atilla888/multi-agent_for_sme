import { FLOW4_BOARD, cloneName, flowSectionName } from './constants';
import { approvedHandoffControl, checkFlowFour, type FlowFourStrategy } from './flow4-validation';
import { annotation, assertTarget, navigateReaction, visualSignature } from './prototype-utils';

const CANONICAL = flowSectionName(4);
const STAGING = `${CANONICAL} / staging`;
const PREVIOUS = `${CANONICAL} / previous`;
const ARCHIVE = 'ARCHIVE — Flow 4 — previous prototype with manual or ambiguous content';
const KEYS = ['Support Active', 'Handoff', 'Sales Active'] as const;

function prototypeControl(page: PageNode, section: SectionNode, font: FontName,
  item: { name: string; marker: string; text: string }, x: number, y: number): FrameNode {
  assertTarget(page);
  const control = figma.createFrame();
  control.name = item.name;
  section.appendChild(control);
  control.resize(330, 104);
  control.x = x; control.y = y;
  control.cornerRadius = 8;
  control.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.95 } }];
  control.strokes = [{ type: 'SOLID', color: { r: 0.52, g: 0.52, b: 0.52 } }];
  control.strokeWeight = 1;
  const label = (name: string, value: string, top: number, size: number): void => {
    assertTarget(page);
    const text = figma.createText();
    text.name = name;
    control.appendChild(text);
    text.fontName = font;
    text.fontSize = size;
    text.textAutoResize = 'HEIGHT';
    text.resize(302, 24);
    text.characters = value;
    text.fills = [{ type: 'SOLID', color: { r: 0.24, g: 0.24, b: 0.24 } }];
    text.x = 14; text.y = top;
  };
  label('Prototype-only marker', item.marker, 11, 11);
  label('Continue scenario label', item.text, 38, 15);
  return control;
}

export async function buildSupportSalesHandoff(page: PageNode, sources: Map<string, FrameNode>, font: FontName): Promise<string> {
  assertTarget(page);
  const oldMatches = page.children.filter(n => n.name === CANONICAL);
  if (oldMatches.length > 1 || (oldMatches.length === 1 && oldMatches[0].type !== 'SECTION'))
    throw new Error('Flow 4 canonical section is duplicate or wrong type. Nothing was changed.');
  if (page.children.some(n => n.name === STAGING || n.name === PREVIOUS))
    throw new Error('Existing Flow 4 staging/previous section requires manual review. Nothing was changed.');
  const old = oldMatches[0] as SectionNode | undefined;
  const oldY = old?.y;
  const initialY = old?.y ?? Math.max(9200, ...page.children
    .filter(n => n.type === 'SECTION' && n.name !== '09 — Prototype Validation')
    .map(n => n.y + n.height + 180));
  const prior = old ? await checkFlowFour(old, sources) : null;
  const archive = Boolean(old && prior?.issues.length);
  if (archive && page.children.some(n => n.name === ARCHIVE)) throw new Error('Flow 4 archive name already exists. Nothing was changed.');

  let staging: SectionNode | undefined;
  let committed = false;
  try {
    assertTarget(page);
    staging = figma.createSection();
    staging.name = STAGING;
    staging.x = old?.x ?? 0; staging.y = initialY;
    staging.resize(6400, 1900);
    const clones = new Map<string, FrameNode>();
    for (const key of KEYS) {
      assertTarget(page);
      const clone = sources.get(key)!.clone();
      clone.name = cloneName(4, key);
      staging.appendChild(clone);
      clones.set(key, clone);
      if (visualSignature(clone) !== visualSignature(sources.get(key)!)) throw new Error(`Fresh 03D clone visual mismatch: ${key}.`);
    }
    let cursor = 50;
    for (const key of KEYS) {
      const clone = clones.get(key)!;
      clone.x = cursor; clone.y = 200;
      cursor += clone.width + 450;
    }
    const support = clones.get('Support Active')!;
    const handoff = clones.get('Handoff')!;
    const sales = clones.get('Sales Active')!;
    const add = (item: { name: string; text: string }, x: number, y: number, width = 1600): void => {
      annotation(page, staging!, item.name, item.text, x, y, width, font);
    };
    add(FLOW4_BOARD.start, support.x, 5);
    add(FLOW4_BOARD.step1, support.x, 40);
    add(FLOW4_BOARD.supportNote, support.x, 75);
    add(FLOW4_BOARD.step2, handoff.x, 40);
    add(FLOW4_BOARD.handlerBoundary, handoff.x, 75);
    add(FLOW4_BOARD.contextNote, handoff.x, 110);
    add(FLOW4_BOARD.permissionBoundary, handoff.x, 145);
    add(FLOW4_BOARD.step3, sales.x, 40);
    add(FLOW4_BOARD.salesNote, sales.x, 75);
    add(FLOW4_BOARD.authorizationNote, sales.x, 110);
    const below = Math.max(...Array.from(clones.values(), n => n.y + n.height)) + 40;
    add(FLOW4_BOARD.end, sales.x, below);

    const attach = async (from: FrameNode, source: FrameNode, to: FrameNode, step: 'request' | 'accept',
      sourceNote: typeof FLOW4_BOARD.requestSource | typeof FLOW4_BOARD.acceptSource,
      controlItem: typeof FLOW4_BOARD.requestControl | typeof FLOW4_BOARD.acceptControl): Promise<FlowFourStrategy> => {
      const approved = approvedHandoffControl(source, step);
      const copy = approvedHandoffControl(from, step);
      if (approved && approved.reactions.length === 0 && copy && copy.reactions.length === 0) {
        add(sourceNote, from.x, below);
        await copy.setReactionsAsync([navigateReaction(to.id)]);
        return 'PRODUCT CONTROL';
      }
      const control = prototypeControl(page, staging!, font, controlItem,
        from.x + from.width + 55, from.y + 280);
      await control.setReactionsAsync([navigateReaction(to.id)]);
      return 'PROTOTYPE CONTROL';
    };
    const request = await attach(support, sources.get('Support Active')!, handoff, 'request',
      FLOW4_BOARD.requestSource, FLOW4_BOARD.requestControl);
    const accept = await attach(handoff, sources.get('Handoff')!, sales, 'accept',
      FLOW4_BOARD.acceptSource, FLOW4_BOARD.acceptControl);
    const maxX = Math.max(...staging.children.map(n => 'width' in n ? n.x + n.width : 0));
    const maxY = Math.max(...staging.children.map(n => 'height' in n ? n.y + n.height : 0));
    staging.resize(Math.max(6400, maxX + 80), Math.max(1900, maxY + 80));

    const preflight = await checkFlowFour(staging, sources);
    if (preflight.issues.length) throw new Error(`Flow 4 staging validation failed: ${preflight.issues.join('; ')}`);
    if (old) { assertTarget(page); old.name = PREVIOUS; }
    assertTarget(page); staging.name = CANONICAL;
    const finalCheck = await checkFlowFour(staging, sources);
    if (finalCheck.issues.length || page.children.filter(n => n.name === CANONICAL).length !== 1)
      throw new Error(`Flow 4 canonical validation failed: ${finalCheck.issues.join('; ')}`);
    if (old) {
      assertTarget(page);
      if (archive) { old.name = ARCHIVE; old.y = staging.y + staging.height + 220; }
      else old.remove();
    }
    committed = true;
    return `Built ${CANONICAL}: three fresh 03D clones; Support → Handoff: ${request}; Handoff → Sales: ${accept}; old section ${archive ? 'archived' : old ? 'removed after validation' : 'not present'}.`;
  } catch (error) {
    if (!committed) {
      if (old && !old.removed && (old.name === PREVIOUS || old.name === ARCHIVE)) {
        assertTarget(page); old.name = CANONICAL;
        if (oldY !== undefined) old.y = oldY;
      }
      if (staging && !staging.removed) { assertTarget(page); staging.remove(); }
    }
    throw error;
  }
}
