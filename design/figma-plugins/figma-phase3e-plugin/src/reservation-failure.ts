import { FLOW3_BOARD, cloneName, flowSectionName } from './constants';
import { checkFlowThree } from './flow3-validation';
import { visibleOrderLink } from './flow2-validation';
import { annotation, assertTarget, navigateReaction, visualSignature } from './prototype-utils';

const CANONICAL = flowSectionName(3);
const STAGING = `${CANONICAL} / staging`;
const PREVIOUS = `${CANONICAL} / previous`;
const ARCHIVE = 'ARCHIVE — Flow 3 — previous prototype with manual or ambiguous content';

function prototypeControl(page: PageNode, section: SectionNode, font: FontName, x: number, y: number): FrameNode {
  assertTarget(page);
  const control = figma.createFrame();
  control.name = FLOW3_BOARD.orderControl.name;
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
  label('Prototype-only marker', FLOW3_BOARD.orderControl.marker, 11, 11);
  label('Continue scenario label', FLOW3_BOARD.orderControl.text, 38, 15);
  return control;
}

export async function buildReservationFailure(page: PageNode, sources: Map<string, FrameNode>, font: FontName): Promise<string> {
  assertTarget(page);
  const oldMatches = page.children.filter(n => n.name === CANONICAL);
  if (oldMatches.length > 1 || (oldMatches.length === 1 && oldMatches[0].type !== 'SECTION'))
    throw new Error('Flow 3 canonical section is duplicate or wrong type. Nothing was changed.');
  if (page.children.some(n => n.name === STAGING || n.name === PREVIOUS))
    throw new Error('Existing Flow 3 staging/previous section requires manual review. Nothing was changed.');
  const old = oldMatches[0] as SectionNode | undefined;
  const oldY = old?.y;
  const initialY = old?.y ?? Math.max(7000, ...page.children
    .filter(n => n.type === 'SECTION' && n.name !== '09 — Prototype Validation')
    .map(n => n.y + n.height + 180));
  const prior = old ? await checkFlowThree(old, sources) : null;
  const archive = Boolean(old && prior?.issues.length);
  if (archive && page.children.some(n => n.name === ARCHIVE)) throw new Error('Flow 3 archive name already exists. Nothing was changed.');

  let staging: SectionNode | undefined;
  let committed = false;
  try {
    assertTarget(page);
    staging = figma.createSection();
    staging.name = STAGING;
    staging.x = old?.x ?? 0; staging.y = initialY;
    staging.resize(4200, 1900);
    const conversation = sources.get('Known Failure')!.clone();
    conversation.name = cloneName(3, 'Known Failure');
    staging.appendChild(conversation);
    conversation.x = 50; conversation.y = 190;
    const order = sources.get('Reservation Failed')!.clone();
    order.name = cloneName(3, 'Reservation Failed');
    staging.appendChild(order);
    order.x = conversation.x + conversation.width + 450; order.y = 190;
    if (visualSignature(conversation) !== visualSignature(sources.get('Known Failure')!) ||
      visualSignature(order) !== visualSignature(sources.get('Reservation Failed')!)) throw new Error('Fresh 03D clone visual mismatch.');
    const add = (item: { name: string; text: string }, x: number, y: number, width = 1600): void => {
      annotation(page, staging!, item.name, item.text, x, y, width, font);
    };
    add(FLOW3_BOARD.start, conversation.x, 5);
    add(FLOW3_BOARD.step1, conversation.x, 40);
    add(FLOW3_BOARD.confirmedFailure, conversation.x, 75);
    add(FLOW3_BOARD.knownBoundary, conversation.x, 110);
    add(FLOW3_BOARD.noReconciliation, conversation.x, 145);
    add(FLOW3_BOARD.step2, order.x, 40);
    add(FLOW3_BOARD.orderBoundary, order.x, 75, Math.max(1500, order.width));
    const below = Math.max(conversation.y + conversation.height, order.y + order.height) + 35;
    add(FLOW3_BOARD.inventoryBoundary, order.x, below, Math.max(1600, order.width));
    add(FLOW3_BOARD.recovery, order.x, below + 65, Math.max(1600, order.width));
    add(FLOW3_BOARD.end, order.x, below + 165, Math.max(1600, order.width));

    const sourceLink = visibleOrderLink(sources.get('Known Failure')!);
    const clonedLink = visibleOrderLink(conversation);
    const useProduct = Boolean(sourceLink && sourceLink.reactions.length === 0 && clonedLink && clonedLink.reactions.length === 0);
    if (useProduct && clonedLink) {
      add(FLOW3_BOARD.orderSource, conversation.x, below);
      await clonedLink.setReactionsAsync([navigateReaction(order.id)]);
    } else {
      const control = prototypeControl(page, staging, font,
        conversation.x + conversation.width + 55, conversation.y + 280);
      await control.setReactionsAsync([navigateReaction(order.id)]);
    }
    const maxX = Math.max(...staging.children.map(n => 'width' in n ? n.x + n.width : 0));
    const maxY = Math.max(...staging.children.map(n => 'height' in n ? n.y + n.height : 0));
    staging.resize(Math.max(4200, maxX + 80), Math.max(1900, maxY + 80));

    const preflight = await checkFlowThree(staging, sources);
    if (preflight.issues.length) throw new Error(`Flow 3 staging validation failed: ${preflight.issues.join('; ')}`);
    if (old) { assertTarget(page); old.name = PREVIOUS; }
    assertTarget(page); staging.name = CANONICAL;
    const finalCheck = await checkFlowThree(staging, sources);
    if (finalCheck.issues.length || page.children.filter(n => n.name === CANONICAL).length !== 1)
      throw new Error(`Flow 3 canonical validation failed: ${finalCheck.issues.join('; ')}`);
    if (old) {
      assertTarget(page);
      if (archive) { old.name = ARCHIVE; old.y = staging.y + staging.height + 220; }
      else old.remove();
    }
    committed = true;
    return `Built ${CANONICAL}: two fresh 03D clones; Open Order → Reservation Failed: ${preflight.strategy}; old section ${archive ? 'archived' : old ? 'removed after validation' : 'not present'}.`;
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
