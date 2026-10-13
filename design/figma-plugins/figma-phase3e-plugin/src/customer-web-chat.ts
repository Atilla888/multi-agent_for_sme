import { FLOW8_BOARD, cloneName, flowSectionName } from './constants';
import { approvedCustomerControl, checkFlowEight } from './flow8-validation';
import { annotation, assertTarget, navigateReaction, visualSignature } from './prototype-utils';

const CANONICAL = flowSectionName(8);
const STAGING = `${CANONICAL} / staging`;
const PREVIOUS = `${CANONICAL} / previous`;
const ARCHIVE = 'ARCHIVE — Flow 8 — previous prototype with manual or ambiguous content';

function label(page: PageNode, parent: FrameNode, name: string, value: string,
  x: number, y: number, width: number, size: number, font: FontName): TextNode {
  assertTarget(page);
  const text = figma.createText();
  text.name = name;
  parent.appendChild(text);
  text.fontName = font;
  text.fontSize = size;
  text.textAutoResize = 'HEIGHT';
  text.resize(width, 24);
  text.characters = value;
  text.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } }];
  text.x = x; text.y = y;
  return text;
}

function control(page: PageNode, section: SectionNode, font: FontName,
  item: { name: string; marker: string; text: string }, x: number, y: number, width = 410): FrameNode {
  assertTarget(page);
  const node = figma.createFrame();
  node.name = item.name;
  section.appendChild(node);
  node.resize(width, 104);
  node.x = x; node.y = y;
  node.cornerRadius = 8;
  node.fills = [{ type: 'SOLID', color: { r: 0.94, g: 0.94, b: 0.94 } }];
  node.strokes = [{ type: 'SOLID', color: { r: 0.44, g: 0.44, b: 0.44 } }];
  node.strokeWeight = 1;
  label(page, node, 'Prototype-only marker', item.marker, 14, 12, width - 28, 11, font);
  label(page, node, 'Continue scenario label', item.text, 14, 40, width - 28, 15, font);
  return node;
}

export async function buildCustomerWebChat(page: PageNode, sources: Map<string, FrameNode>, font: FontName): Promise<string> {
  assertTarget(page);
  const sourceConfirm = approvedCustomerControl(sources.get('Confirmation Required')!, 'Confirm order / focus', 'Confirm order');
  if (!sourceConfirm || sourceConfirm.reactions.length !== 0)
    throw new Error('Approved visible Confirm order PRODUCT CONTROL is missing, ambiguous or already reactive. Nothing was changed.');
  const oldMatches = page.children.filter(n => n.name === CANONICAL);
  if (oldMatches.length > 1 || (oldMatches.length === 1 && oldMatches[0].type !== 'SECTION'))
    throw new Error('Flow 8 canonical section is duplicate or wrong type. Nothing was changed.');
  if (page.children.some(n => n.name === STAGING || n.name === PREVIOUS))
    throw new Error('Existing Flow 8 staging/previous section requires manual review. Nothing was changed.');
  const old = oldMatches[0] as SectionNode | undefined;
  const oldY = old?.y;
  const initialY = old?.y ?? Math.max(30000, ...page.children
    .filter(n => n.type === 'SECTION' && n.name !== '09 — Prototype Validation')
    .map(n => n.y + n.height + 180));
  const prior = old ? await checkFlowEight(old, sources) : null;
  const archive = Boolean(old && prior?.issues.length);
  if (archive && page.children.some(n => n.name === ARCHIVE)) throw new Error('Flow 8 archive name already exists. Nothing was changed.');

  let staging: SectionNode | undefined;
  let committed = false;
  try {
    assertTarget(page);
    staging = figma.createSection();
    staging.name = STAGING;
    staging.x = old?.x ?? 0; staging.y = initialY;
    staging.resize(3600, 2600);
    const keys = ['Confirmation Required', 'Processing', 'Confirmed Result', 'Message Delivery Failure'] as const;
    const clones = new Map<string, FrameNode>();
    for (const key of keys) {
      const clone = sources.get(key)!.clone();
      clone.name = cloneName(8, key);
      staging.appendChild(clone);
      clones.set(key, clone);
      if (visualSignature(clone) !== visualSignature(sources.get(key)!))
        throw new Error(`Fresh 03D Web Chat ${key} clone visual mismatch.`);
    }
    const confirmation = clones.get('Confirmation Required')!;
    const processing = clones.get('Processing')!;
    const confirmed = clones.get('Confirmed Result')!;
    const delivery = clones.get('Message Delivery Failure')!;
    confirmation.x = 50; confirmation.y = 330;
    processing.x = 950; processing.y = 330;
    confirmed.x = 1850; confirmed.y = 330;
    const currentBottom = Math.max(confirmation.y + confirmation.height, processing.y + processing.height,
      confirmed.y + confirmed.height);
    delivery.x = 1850; delivery.y = currentBottom + 620;
    const add = (item: { name: string; text: string }, x: number, y: number, width = 820): void => {
      annotation(page, staging!, item.name, item.text, x, y, width, font);
    };
    add(FLOW8_BOARD.start, confirmation.x, 10);
    add(FLOW8_BOARD.step1, confirmation.x, 110);
    add(FLOW8_BOARD.proposalBoundary, confirmation.x, 165);
    add(FLOW8_BOARD.customerAuthorization, confirmation.x, 240);
    add(FLOW8_BOARD.confirmSource, confirmation.x, 290);
    add(FLOW8_BOARD.step2, processing.x, 110);
    add(FLOW8_BOARD.processingBoundary, processing.x, 165);
    add(FLOW8_BOARD.step3, confirmed.x, 110);
    add(FLOW8_BOARD.confirmedBoundary, confirmed.x, 165);
    add(FLOW8_BOARD.primaryEnd, confirmed.x, currentBottom + 60);
    add(FLOW8_BOARD.branch, confirmed.x, currentBottom + 280, 1300);
    add(FLOW8_BOARD.step4, delivery.x, delivery.y - 85);
    add(FLOW8_BOARD.deliveryBoundary, delivery.x + delivery.width + 110, delivery.y + 55, 1080);
    add(FLOW8_BOARD.businessBoundary, delivery.x + delivery.width + 110, delivery.y + 160, 1080);
    add(FLOW8_BOARD.noReplay, delivery.x + delivery.width + 110, delivery.y + 295, 1080);
    add(FLOW8_BOARD.recoveryNote, delivery.x, delivery.y + delivery.height + 65, 1270);
    add(FLOW8_BOARD.recoveryEnd, delivery.x, delivery.y + delivery.height + 155, 1270);

    const confirm = approvedCustomerControl(confirmation, 'Confirm order / focus', 'Confirm order');
    if (!confirm || confirm.reactions.length) throw new Error('Fresh clone lacks the approved Confirm order action.');
    await confirm.setReactionsAsync([navigateReaction(processing.id)]);
    const resultControl = control(page, staging, font, FLOW8_BOARD.resultControl,
      processing.x + processing.width + 32, processing.y + 300);
    await resultControl.setReactionsAsync([navigateReaction(confirmed.id)]);
    const branchControl = control(page, staging, font, FLOW8_BOARD.branchControl,
      confirmed.x, currentBottom + 385, 570);
    await branchControl.setReactionsAsync([navigateReaction(delivery.id)]);
    const sourceRetry = approvedCustomerControl(sources.get('Message Delivery Failure')!, 'Retry message action / focus', 'Retry message');
    const clonedRetry = approvedCustomerControl(delivery, 'Retry message action / focus', 'Retry message');
    if (sourceRetry && sourceRetry.reactions.length === 0 && clonedRetry && clonedRetry.reactions.length === 0) {
      add(FLOW8_BOARD.retrySource, delivery.x, delivery.y - 35);
      await clonedRetry.setReactionsAsync([navigateReaction(confirmed.id)]);
    } else {
      const retryControl = control(page, staging, font, FLOW8_BOARD.retryControl,
        delivery.x + delivery.width + 110, delivery.y + 440, 520);
      await retryControl.setReactionsAsync([navigateReaction(confirmed.id)]);
    }
    const maxX = Math.max(...staging.children.map(n => 'width' in n ? n.x + n.width : 0));
    const maxY = Math.max(...staging.children.map(n => 'height' in n ? n.y + n.height : 0));
    staging.resize(Math.max(3600, maxX + 80), Math.max(2600, maxY + 80));
    const preflight = await checkFlowEight(staging, sources);
    if (preflight.issues.length) throw new Error(`Flow 8 staging validation failed: ${preflight.issues.join('; ')}`);
    if (old) { assertTarget(page); old.name = PREVIOUS; }
    assertTarget(page); staging.name = CANONICAL;
    const finalCheck = await checkFlowEight(staging, sources);
    if (finalCheck.issues.length || page.children.filter(n => n.name === CANONICAL).length !== 1)
      throw new Error(`Flow 8 canonical validation failed: ${finalCheck.issues.join('; ')}`);
    if (old) {
      assertTarget(page);
      if (archive) { old.name = ARCHIVE; old.y = staging.y + staging.height + 220; }
      else old.remove();
    }
    committed = true;
    return `Built ${CANONICAL}: four fresh 03D clones; Confirm order: PRODUCT CONTROL; Processing result: PROTOTYPE CONTROL; delivery branch: PROTOTYPE CONTROL; Retry message: ${preflight.retryStrategy}; old section ${archive ? 'archived' : old ? 'removed after validation' : 'not present'}.`;
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
