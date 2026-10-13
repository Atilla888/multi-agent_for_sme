import { FLOW5_BOARD, cloneName, flowSectionName } from './constants';
import { checkFlowFive, visibleEscalationLink } from './flow5-validation';
import { annotation, assertTarget, navigateReaction, visualSignature } from './prototype-utils';

const CANONICAL = flowSectionName(5);
const STAGING = `${CANONICAL} / staging`;
const PREVIOUS = `${CANONICAL} / previous`;
const ARCHIVE = 'ARCHIVE — Flow 5 — previous prototype with manual or ambiguous content';

function prototypeControl(page: PageNode, section: SectionNode, font: FontName, x: number, y: number): FrameNode {
  assertTarget(page);
  const control = figma.createFrame();
  control.name = FLOW5_BOARD.escalationControl.name;
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
  label('Prototype-only marker', FLOW5_BOARD.escalationControl.marker, 11, 11);
  label('Continue scenario label', FLOW5_BOARD.escalationControl.text, 38, 15);
  return control;
}

export async function buildUnknownEscalation(page: PageNode, sources: Map<string, FrameNode>, font: FontName): Promise<string> {
  assertTarget(page);
  const oldMatches = page.children.filter(n => n.name === CANONICAL);
  if (oldMatches.length > 1 || (oldMatches.length === 1 && oldMatches[0].type !== 'SECTION'))
    throw new Error('Flow 5 canonical section is duplicate or wrong type. Nothing was changed.');
  if (page.children.some(n => n.name === STAGING || n.name === PREVIOUS))
    throw new Error('Existing Flow 5 staging/previous section requires manual review. Nothing was changed.');
  const old = oldMatches[0] as SectionNode | undefined;
  const oldY = old?.y;
  const initialY = old?.y ?? Math.max(11600, ...page.children
    .filter(n => n.type === 'SECTION' && n.name !== '09 — Prototype Validation')
    .map(n => n.y + n.height + 180));
  const prior = old ? await checkFlowFive(old, sources) : null;
  const archive = Boolean(old && prior?.issues.length);
  if (archive && page.children.some(n => n.name === ARCHIVE)) throw new Error('Flow 5 archive name already exists. Nothing was changed.');

  let staging: SectionNode | undefined;
  let committed = false;
  try {
    assertTarget(page);
    staging = figma.createSection();
    staging.name = STAGING;
    staging.x = old?.x ?? 0; staging.y = initialY;
    staging.resize(4400, 2100);
    const conversation = sources.get('Conversation OUTCOME_UNKNOWN')!.clone();
    conversation.name = cloneName(5, 'Conversation OUTCOME_UNKNOWN');
    staging.appendChild(conversation);
    conversation.x = 50; conversation.y = 340;
    const escalation = sources.get('Escalation Reconciliation')!.clone();
    escalation.name = cloneName(5, 'Escalation Reconciliation');
    staging.appendChild(escalation);
    escalation.x = conversation.x + conversation.width + 450; escalation.y = 340;
    if (visualSignature(conversation) !== visualSignature(sources.get('Conversation OUTCOME_UNKNOWN')!) ||
      visualSignature(escalation) !== visualSignature(sources.get('Escalation Reconciliation')!))
      throw new Error('Fresh 03D OUTCOME_UNKNOWN clone visual mismatch.');
    const add = (item: { name: string; text: string }, x: number, y: number, width = 1600): void => {
      annotation(page, staging!, item.name, item.text, x, y, width, font);
    };
    add(FLOW5_BOARD.start, conversation.x, 5);
    add(FLOW5_BOARD.step1, conversation.x, 40);
    add(FLOW5_BOARD.uncertain, conversation.x, 75);
    add(FLOW5_BOARD.unknownBoundary, conversation.x, 130);
    add(FLOW5_BOARD.noBlindRetry, conversation.x, 185);
    add(FLOW5_BOARD.reconcileFirst, conversation.x, 220);
    add(FLOW5_BOARD.step2, escalation.x, 40, escalation.width);
    add(FLOW5_BOARD.reconciliation, escalation.x, 75, escalation.width);
    add(FLOW5_BOARD.knownBoundary, escalation.x, 150, escalation.width);
    add(FLOW5_BOARD.e02Boundary, escalation.x, 205, escalation.width);
    add(FLOW5_BOARD.m12Boundary, escalation.x, 260, escalation.width);
    const below = Math.max(conversation.y + conversation.height, escalation.y + escalation.height) + 40;
    add(FLOW5_BOARD.end, escalation.x, below, escalation.width);

    const sourceLink = visibleEscalationLink(sources.get('Conversation OUTCOME_UNKNOWN')!);
    const clonedLink = visibleEscalationLink(conversation);
    if (sourceLink && sourceLink.reactions.length === 0 && clonedLink && clonedLink.reactions.length === 0) {
      add(FLOW5_BOARD.escalationSource, conversation.x, below);
      await clonedLink.setReactionsAsync([navigateReaction(escalation.id)]);
    } else {
      const control = prototypeControl(page, staging, font,
        conversation.x + conversation.width + 55, conversation.y + 280);
      await control.setReactionsAsync([navigateReaction(escalation.id)]);
    }
    const maxX = Math.max(...staging.children.map(n => 'width' in n ? n.x + n.width : 0));
    const maxY = Math.max(...staging.children.map(n => 'height' in n ? n.y + n.height : 0));
    staging.resize(Math.max(4400, maxX + 80), Math.max(2100, maxY + 80));

    const preflight = await checkFlowFive(staging, sources);
    if (preflight.issues.length) throw new Error(`Flow 5 staging validation failed: ${preflight.issues.join('; ')}`);
    if (old) { assertTarget(page); old.name = PREVIOUS; }
    assertTarget(page); staging.name = CANONICAL;
    const finalCheck = await checkFlowFive(staging, sources);
    if (finalCheck.issues.length || page.children.filter(n => n.name === CANONICAL).length !== 1)
      throw new Error(`Flow 5 canonical validation failed: ${finalCheck.issues.join('; ')}`);
    if (old) {
      assertTarget(page);
      if (archive) { old.name = ARCHIVE; old.y = staging.y + staging.height + 220; }
      else old.remove();
    }
    committed = true;
    return `Built ${CANONICAL}: two fresh 03D clones; Open Escalation → Reconciliation: ${preflight.strategy}; old section ${archive ? 'archived' : old ? 'removed after validation' : 'not present'}.`;
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
