import { FLOW1_BOARD, cloneName, flowSectionName, type FlowSpec } from './constants';
import { checkFlowOne } from './flow1-validation';
import { annotation, assertTarget, navigateReaction, visualSignature } from './prototype-utils';

const CANONICAL = flowSectionName(1);
const STAGING = `${CANONICAL} / staging`;
const PREVIOUS = `${CANONICAL} / previous`;
const ARCHIVE = 'ARCHIVE — Flow 1 — previous prototype with manual content';

function prototypeControl(page: PageNode, section: SectionNode, font: FontName, x: number, y: number): FrameNode {
  assertTarget(page);
  const control = figma.createFrame();
  control.name = FLOW1_BOARD.continue.name;
  section.appendChild(control);
  control.resize(330, 104);
  control.x = x; control.y = y;
  control.cornerRadius = 8;
  control.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.95 } }];
  control.strokes = [{ type: 'SOLID', color: { r: 0.52, g: 0.52, b: 0.52 } }];
  control.strokeWeight = 1;
  const addLabel = (name: string, value: string, top: number, size: number): void => {
    assertTarget(page);
    const label = figma.createText();
    label.name = name;
    control.appendChild(label);
    label.fontName = font;
    label.fontSize = size;
    label.textAutoResize = 'HEIGHT';
    label.resize(302, 24);
    label.characters = value;
    label.fills = [{ type: 'SOLID', color: { r: 0.24, g: 0.24, b: 0.24 } }];
    label.x = 14; label.y = top;
  };
  addLabel('Prototype-only marker', FLOW1_BOARD.continue.marker, 11, 11);
  addLabel('Continue scenario label', FLOW1_BOARD.continue.text, 38, 15);
  return control;
}

function matchingSourceReactions(source: FrameNode, old: FrameNode, oldSupportId: string): boolean {
  const sourceNodes = [source, ...source.findAll(n => 'reactions' in n)] as (SceneNode & ReactionMixin)[];
  const oldNodes = [old, ...old.findAll(n => 'reactions' in n)] as (SceneNode & ReactionMixin)[];
  if (sourceNodes.length !== oldNodes.length) return false;
  const idMap = new Map(sourceNodes.map((node, index) => [node.id, oldNodes[index].id]));
  for (let i = 0; i < sourceNodes.length; i++) {
    const expected = JSON.parse(JSON.stringify(sourceNodes[i].reactions)) as { actions?: { type: string; destinationId?: string }[]; action?: { type: string; destinationId?: string } }[];
    for (const reaction of expected) {
      for (const action of reaction.actions ?? []) if (action.type === 'NODE' && action.destinationId && idMap.has(action.destinationId)) action.destinationId = idMap.get(action.destinationId)!;
      if (reaction.action?.type === 'NODE' && reaction.action.destinationId && idMap.has(reaction.action.destinationId)) reaction.action.destinationId = idMap.get(reaction.action.destinationId)!;
    }
    if (JSON.stringify(expected) === JSON.stringify(oldNodes[i].reactions)) continue;
    const reactions = oldNodes[i].reactions;
    const isOwnedLegacy = oldNodes[i].name === 'Conversation row / 1' && sourceNodes[i].reactions.length === 0 && reactions.length === 1 &&
      reactions[0].trigger?.type === 'ON_CLICK' && reactions[0].actions?.length === 1 && !reactions[0].action &&
      reactions[0].actions[0].type === 'NODE' && reactions[0].actions[0].navigation === 'NAVIGATE' && reactions[0].actions[0].destinationId === oldSupportId;
    if (!isOwnedLegacy) return false; // Mixed/unrelated actions are archived, never edited individually.
  }
  return true;
}

function hasManualContent(section: SectionNode, sources: Map<string, FrameNode>): boolean {
  const names = new Set([
    cloneName(1, 'default'), cloneName(1, 'support'), FLOW1_BOARD.start.name, FLOW1_BOARD.step1.name,
    FLOW1_BOARD.step1Note.name, FLOW1_BOARD.continue.name, FLOW1_BOARD.step2.name,
    FLOW1_BOARD.productBoundary.name, FLOW1_BOARD.inventoryBoundary.name, FLOW1_BOARD.end.name, FLOW1_BOARD.legacyNote,
  ]);
  if (section.children.some(node => !names.has(node.name))) return true;
  for (const key of ['default', 'support']) {
    const matches = section.children.filter(n => n.name === cloneName(1, key));
    const source = sources.get(key);
    if (matches.length !== 1 || matches[0].type !== 'FRAME' || !source || visualSignature(matches[0] as FrameNode) !== visualSignature(source)) return true;
    const support = section.children.find(n => n.name === cloneName(1, 'support'));
    if (!support || !matchingSourceReactions(source, matches[0] as FrameNode, support.id)) return true;
  }
  for (const item of [FLOW1_BOARD.start, FLOW1_BOARD.step1, FLOW1_BOARD.step1Note, FLOW1_BOARD.step2,
    FLOW1_BOARD.productBoundary, FLOW1_BOARD.inventoryBoundary, FLOW1_BOARD.end]) {
    const matches = section.children.filter(n => n.name === item.name);
    if (matches.length > 1 || (matches.length === 1 && (matches[0].type !== 'TEXT' || matches[0].characters.trim() !== item.text.trim()))) return true;
  }
  const controls = section.children.filter(n => n.name === FLOW1_BOARD.continue.name);
  if (controls.length > 1 || (controls.length === 1 && (controls[0].type !== 'FRAME' ||
    controls[0].children.some(n => !['Prototype-only marker', 'Continue scenario label'].includes(n.name))))) return true;
  return false;
}

export async function buildProductAvailability(page: PageNode, _flow: FlowSpec, sources: Map<string, FrameNode>, font: FontName): Promise<string> {
  assertTarget(page);
  const oldMatches = page.children.filter(n => n.name === CANONICAL);
  if (oldMatches.length > 1 || (oldMatches.length === 1 && oldMatches[0].type !== 'SECTION')) throw new Error('Flow 1 canonical section is duplicate or wrong type. Nothing was changed.');
  if (page.children.some(n => n.name === STAGING || n.name === PREVIOUS)) throw new Error('Existing Flow 1 staging/previous section requires manual review. Nothing was changed.');
  const old = oldMatches[0] as SectionNode | undefined;
  const oldY = old?.y;
  const archive = Boolean(old && hasManualContent(old, sources));
  if (archive && page.children.some(n => n.name === ARCHIVE)) throw new Error('Flow 1 archive name already exists. Nothing was changed.');

  let staging: SectionNode | undefined;
  let committed = false;
  try {
    assertTarget(page);
    staging = figma.createSection();
    staging.name = STAGING;
    staging.x = 0; staging.y = 2600;
    staging.resize(3800, 1500);
    const first = sources.get('default')!.clone();
    first.name = cloneName(1, 'default');
    staging.appendChild(first);
    const second = sources.get('support')!.clone();
    second.name = cloneName(1, 'support');
    staging.appendChild(second);
    first.x = 50; first.y = 115;
    second.x = first.x + first.width + 440; second.y = first.y;
    const top = 5;
    const add = (item: { name: string; text: string }, x: number, y: number, width = 1500): void => {
      annotation(page, staging!, item.name, item.text, x, y, width, font);
    };
    add(FLOW1_BOARD.start, first.x, top);
    add(FLOW1_BOARD.step1, first.x, top + 34);
    add(FLOW1_BOARD.step1Note, first.x, top + 68);
    const control = prototypeControl(page, staging, font, first.x + first.width + 55, first.y + 280);
    add(FLOW1_BOARD.step2, second.x, top);
    add(FLOW1_BOARD.productBoundary, second.x, second.y + second.height + 28);
    add(FLOW1_BOARD.inventoryBoundary, second.x, second.y + second.height + 63);
    add(FLOW1_BOARD.end, second.x, second.y + second.height + 106);
    await control.setReactionsAsync([navigateReaction(second.id)]);
    const maxX = Math.max(...staging.children.map(n => 'width' in n ? n.x + n.width : 0));
    const maxY = Math.max(...staging.children.map(n => 'height' in n ? n.y + n.height : 0));
    staging.resize(Math.max(3800, maxX + 55), Math.max(1300, maxY + 55));

    const preflight = await checkFlowOne(staging, sources);
    if (preflight.issues.length) throw new Error(`Flow 1 staging validation failed: ${preflight.issues.join('; ')}`);
    if (old) { assertTarget(page); old.name = PREVIOUS; }
    assertTarget(page); staging.name = CANONICAL;
    const finalCheck = await checkFlowOne(staging, sources);
    if (finalCheck.issues.length || page.children.filter(n => n.name === CANONICAL).length !== 1) throw new Error(`Flow 1 canonical validation failed: ${finalCheck.issues.join('; ')}`);
    if (old) {
      assertTarget(page);
      if (archive) { old.name = ARCHIVE; old.y = staging.y + staging.height + 220; }
      else old.remove();
    }
    committed = true;
    return `Built ${CANONICAL}: fresh 03D product clones; validated external Continue control → Support Active; old section ${archive ? 'archived with manual/ambiguous content' : old ? 'removed after validation' : 'not present'}.\n${preflight.reactionReport ?? ''}`;
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
