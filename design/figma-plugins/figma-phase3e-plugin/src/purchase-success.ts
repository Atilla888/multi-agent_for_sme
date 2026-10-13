import { FLOW2_BOARD, cloneName, flowSectionName } from './constants';
import { checkFlowTwo, visibleOrderLink } from './flow2-validation';
import { annotation, assertTarget, navigateReaction } from './prototype-utils';

const CANONICAL = flowSectionName(2);
const STAGING = `${CANONICAL} / staging`;
const PREVIOUS = `${CANONICAL} / previous`;
const ARCHIVE = 'ARCHIVE — Flow 2 — previous prototype with manual or ambiguous content';
const KEYS = ['Awaiting Confirmation', 'Processing', 'Confirmed Result', 'Reservation Confirmed'] as const;

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
  addLabel('Prototype-only marker', item.marker, 11, 11);
  addLabel('Continue scenario label', item.text, 38, 15);
  return control;
}

export async function buildPurchaseSuccess(page: PageNode, sources: Map<string, FrameNode>, font: FontName): Promise<string> {
  assertTarget(page);
  const oldMatches = page.children.filter(n => n.name === CANONICAL);
  if (oldMatches.length > 1 || (oldMatches.length === 1 && oldMatches[0].type !== 'SECTION')) throw new Error('Flow 2 canonical section is duplicate or wrong type. Nothing was changed.');
  if (page.children.some(n => n.name === STAGING || n.name === PREVIOUS)) throw new Error('Existing Flow 2 staging/previous section requires manual review. Nothing was changed.');
  const old = oldMatches[0] as SectionNode | undefined;
  const oldY = old?.y;
  const initialY = old?.y ?? Math.max(4800, ...page.children
    .filter(n => n.type === 'SECTION' && n.name !== '09 — Prototype Validation')
    .map(n => n.y + n.height + 180));
  const oldCheck = old ? await checkFlowTwo(old, sources) : null;
  const archive = Boolean(old && oldCheck?.issues.length);
  if (archive && page.children.some(n => n.name === ARCHIVE)) throw new Error('Flow 2 archive name already exists. Nothing was changed.');

  let staging: SectionNode | undefined;
  let committed = false;
  try {
    assertTarget(page);
    staging = figma.createSection();
    staging.name = STAGING;
    staging.x = old?.x ?? 0; staging.y = initialY;
    staging.resize(8200, 1900);
    const clones = new Map<string, FrameNode>();
    for (const key of KEYS) {
      assertTarget(page);
      const clone = sources.get(key)!.clone();
      clone.name = cloneName(2, key);
      staging.appendChild(clone);
      clones.set(key, clone);
    }
    let cursor = 50;
    for (const key of KEYS) {
      const clone = clones.get(key)!;
      clone.x = cursor; clone.y = 150;
      cursor += clone.width + 440;
    }
    const awaiting = clones.get('Awaiting Confirmation')!;
    const processing = clones.get('Processing')!;
    const confirmed = clones.get('Confirmed Result')!;
    const order = clones.get('Reservation Confirmed')!;
    const add = (item: { name: string; text: string }, x: number, y: number, width = 1500): void => {
      annotation(page, staging!, item.name, item.text, x, y, width, font);
    };
    add(FLOW2_BOARD.start, awaiting.x, 5);
    add(FLOW2_BOARD.step1, awaiting.x, 40);
    add(FLOW2_BOARD.proposalBoundary, awaiting.x, 75);
    add(FLOW2_BOARD.step2, processing.x, 40);
    add(FLOW2_BOARD.processingNote, processing.x, 75);
    add(FLOW2_BOARD.step3, confirmed.x, 40);
    add(FLOW2_BOARD.confirmedNote, confirmed.x, 75);
    add(FLOW2_BOARD.step4, order.x, 40);
    add(FLOW2_BOARD.orderBoundary, order.x, order.y + order.height + 30);
    add(FLOW2_BOARD.deliveryBoundary, order.x, order.y + order.height + 65);
    add(FLOW2_BOARD.backendBoundary, awaiting.x, Math.max(...Array.from(clones.values(), n => n.y + n.height)) + 100, 3000);
    add(FLOW2_BOARD.end, order.x, order.y + order.height + 115);

    const confirmation = prototypeControl(page, staging, font, FLOW2_BOARD.confirmation,
      awaiting.x + awaiting.width + 55, awaiting.y + 280);
    const completed = prototypeControl(page, staging, font, FLOW2_BOARD.processingComplete,
      processing.x + processing.width + 55, processing.y + 280);
    await confirmation.setReactionsAsync([navigateReaction(processing.id)]);
    await completed.setReactionsAsync([navigateReaction(confirmed.id)]);
    const approvedOrderLink = visibleOrderLink(sources.get('Confirmed Result')!);
    const clonedOrderLink = visibleOrderLink(confirmed);
    const productLink = approvedOrderLink && approvedOrderLink.reactions.length === 0 && clonedOrderLink && clonedOrderLink.reactions.length === 0;
    if (productLink && clonedOrderLink) {
      add(FLOW2_BOARD.orderSource, confirmed.x, confirmed.y + confirmed.height + 30);
      await clonedOrderLink.setReactionsAsync([navigateReaction(order.id)]);
    } else {
      const control = prototypeControl(page, staging, font, FLOW2_BOARD.orderControl,
        confirmed.x + confirmed.width + 55, confirmed.y + 280);
      await control.setReactionsAsync([navigateReaction(order.id)]);
    }
    const maxX = Math.max(...staging.children.map(n => 'width' in n ? n.x + n.width : 0));
    const maxY = Math.max(...staging.children.map(n => 'height' in n ? n.y + n.height : 0));
    staging.resize(Math.max(8200, maxX + 70), Math.max(1900, maxY + 70));

    const preflight = await checkFlowTwo(staging, sources);
    if (preflight.issues.length) throw new Error(`Flow 2 staging validation failed: ${preflight.issues.join('; ')}`);
    if (old) { assertTarget(page); old.name = PREVIOUS; }
    assertTarget(page); staging.name = CANONICAL;
    const finalCheck = await checkFlowTwo(staging, sources);
    if (finalCheck.issues.length || page.children.filter(n => n.name === CANONICAL).length !== 1) throw new Error(`Flow 2 canonical validation failed: ${finalCheck.issues.join('; ')}`);
    if (old) {
      assertTarget(page);
      if (archive) { old.name = ARCHIVE; old.y = staging.y + staging.height + 220; }
      else old.remove();
    }
    committed = true;
    return `Built ${CANONICAL}: four fresh 03D clones; Customer confirmation → Processing: PROTOTYPE CONTROL; Processing → Confirmed Result: PROTOTYPE CONTROL; Open Order → Reservation Confirmed: ${preflight.strategy}; old section ${archive ? 'archived' : old ? 'removed after validation' : 'not present'}.`;
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
