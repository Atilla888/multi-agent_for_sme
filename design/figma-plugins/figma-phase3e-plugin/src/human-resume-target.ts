import { FLOW6_BOARD, cloneName, flowSectionName } from './constants';
import { approvedDecisionControl, checkFlowSix } from './flow6-validation';
import { annotation, assertTarget, navigateReaction, visualSignature } from './prototype-utils';

const CANONICAL = flowSectionName(6);
const STAGING = `${CANONICAL} / staging`;
const PREVIOUS = `${CANONICAL} / previous`;
const ARCHIVE = 'ARCHIVE — Flow 6 — previous prototype with manual or ambiguous content';

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

function control(page: PageNode, parent: SectionNode | FrameNode, font: FontName,
  item: { name: string; marker: string; text: string }, x: number, y: number, width = 330): FrameNode {
  assertTarget(page);
  const node = figma.createFrame();
  node.name = item.name;
  parent.appendChild(node);
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

function targetBanner(page: PageNode, section: SectionNode, font: FontName): FrameNode {
  assertTarget(page);
  const banner = figma.createFrame();
  banner.name = FLOW6_BOARD.targetBanner.name;
  section.appendChild(banner);
  banner.resize(1600, 72);
  banner.x = 50; banner.y = 40;
  banner.cornerRadius = 8;
  banner.fills = [{ type: 'SOLID', color: { r: 0.85, g: 0.85, b: 0.85 } }];
  banner.strokes = [{ type: 'SOLID', color: { r: 0.28, g: 0.28, b: 0.28 } }];
  banner.strokeWeight = 2;
  label(page, banner, 'TARGET M12 label', FLOW6_BOARD.targetBanner.text, 20, 19, 1550, 26, font);
  return banner;
}

function revalidationGate(page: PageNode, section: SectionNode, font: FontName, x: number, y: number): { gate: FrameNode; request: FrameNode } {
  assertTarget(page);
  const gate = figma.createFrame();
  gate.name = FLOW6_BOARD.gate.name;
  section.appendChild(gate);
  gate.resize(780, 790);
  gate.x = x; gate.y = y;
  gate.cornerRadius = 8;
  gate.fills = [{ type: 'SOLID', color: { r: 0.94, g: 0.94, b: 0.94 } }];
  gate.strokes = [{ type: 'SOLID', color: { r: 0.36, g: 0.36, b: 0.36 } }];
  gate.strokeWeight = 2;
  label(page, gate, 'Prototype-only marker', FLOW6_BOARD.gate.marker, 22, 17, 730, 16, font);
  const rows: { item: { name: string; text: string }; y: number; size: number }[] = [
    { item: FLOW6_BOARD.step2, y: 60, size: 19 },
    { item: FLOW6_BOARD.principal, y: 112, size: 15 },
    { item: FLOW6_BOARD.scope, y: 160, size: 15 },
    { item: FLOW6_BOARD.authorization, y: 208, size: 15 },
    { item: FLOW6_BOARD.state, y: 268, size: 15 },
    { item: FLOW6_BOARD.revision, y: 316, size: 15 },
    { item: FLOW6_BOARD.replayBoundary, y: 376, size: 15 },
    { item: FLOW6_BOARD.unknownBoundary, y: 448, size: 15 },
    { item: FLOW6_BOARD.e02Boundary, y: 520, size: 15 },
  ];
  for (const row of rows) label(page, gate, row.item.name, row.item.text, 22, row.y, 736, row.size, font);
  const request = control(page, gate, font, FLOW6_BOARD.resumeControl, 22, 650, 736);
  return { gate, request };
}

export async function buildHumanResumeTarget(page: PageNode, sources: Map<string, FrameNode>, font: FontName): Promise<string> {
  assertTarget(page);
  const oldMatches = page.children.filter(n => n.name === CANONICAL);
  if (oldMatches.length > 1 || (oldMatches.length === 1 && oldMatches[0].type !== 'SECTION'))
    throw new Error('Flow 6 canonical section is duplicate or wrong type. Nothing was changed.');
  if (page.children.some(n => n.name === STAGING || n.name === PREVIOUS))
    throw new Error('Existing Flow 6 staging/previous section requires manual review. Nothing was changed.');
  const old = oldMatches[0] as SectionNode | undefined;
  const oldY = old?.y;
  const initialY = old?.y ?? Math.max(13800, ...page.children
    .filter(n => n.type === 'SECTION' && n.name !== '09 — Prototype Validation')
    .map(n => n.y + n.height + 180));
  const prior = old ? await checkFlowSix(old, sources) : null;
  const archive = Boolean(old && prior?.issues.length);
  if (archive && page.children.some(n => n.name === ARCHIVE)) throw new Error('Flow 6 archive name already exists. Nothing was changed.');

  let staging: SectionNode | undefined;
  let committed = false;
  try {
    assertTarget(page);
    staging = figma.createSection();
    staging.name = STAGING;
    staging.x = old?.x ?? 0; staging.y = initialY;
    staging.resize(5800, 1900);
    const decision = sources.get('Awaiting Decision')!.clone();
    decision.name = cloneName(6, 'Awaiting Decision');
    staging.appendChild(decision);
    decision.x = 50; decision.y = 350;
    const target = sources.get('Resume Pending')!.clone();
    target.name = cloneName(6, 'Resume Pending');
    staging.appendChild(target);
    const gateX = decision.x + decision.width + 500;
    target.x = gateX + 780 + 500; target.y = 350;
    if (visualSignature(decision) !== visualSignature(sources.get('Awaiting Decision')!) ||
      visualSignature(target) !== visualSignature(sources.get('Resume Pending')!))
      throw new Error('Fresh 03D Human Decision / Resume Pending clone visual mismatch.');
    const add = (item: { name: string; text: string }, x: number, y: number, width = 1700): void => {
      annotation(page, staging!, item.name, item.text, x, y, width, font);
    };
    add(FLOW6_BOARD.start, decision.x, 5);
    targetBanner(page, staging, font);
    add(FLOW6_BOARD.step1, decision.x, 130);
    add(FLOW6_BOARD.hierarchyNote, decision.x, 168);
    add(FLOW6_BOARD.decisionBoundary, decision.x, 225);
    add(FLOW6_BOARD.step3, target.x, 130, target.width);
    add(FLOW6_BOARD.targetNote, target.x, 168, target.width);
    add(FLOW6_BOARD.currentTarget, target.x, 230, target.width);
    const { gate, request } = revalidationGate(page, staging, font, gateX, 350);
    const below = Math.max(decision.y + decision.height, target.y + target.height, gate.y + gate.height) + 40;
    add(FLOW6_BOARD.end, target.x, below, target.width);

    const sourceAction = approvedDecisionControl(sources.get('Awaiting Decision')!);
    const clonedAction = approvedDecisionControl(decision);
    if (sourceAction && sourceAction.reactions.length === 0 && clonedAction && clonedAction.reactions.length === 0) {
      add(FLOW6_BOARD.decisionSource, decision.x, below);
      await clonedAction.setReactionsAsync([navigateReaction(gate.id)]);
    } else {
      const decisionControl = control(page, staging, font, FLOW6_BOARD.decisionControl,
        decision.x + decision.width + 55, decision.y + 280);
      await decisionControl.setReactionsAsync([navigateReaction(gate.id)]);
    }
    await request.setReactionsAsync([navigateReaction(target.id)]);
    const maxX = Math.max(...staging.children.map(n => 'width' in n ? n.x + n.width : 0));
    const maxY = Math.max(...staging.children.map(n => 'height' in n ? n.y + n.height : 0));
    staging.resize(Math.max(5800, maxX + 80), Math.max(1900, maxY + 80));

    const preflight = await checkFlowSix(staging, sources);
    if (preflight.issues.length) throw new Error(`Flow 6 staging validation failed: ${preflight.issues.join('; ')}`);
    if (old) { assertTarget(page); old.name = PREVIOUS; }
    assertTarget(page); staging.name = CANONICAL;
    const finalCheck = await checkFlowSix(staging, sources);
    if (finalCheck.issues.length || page.children.filter(n => n.name === CANONICAL).length !== 1)
      throw new Error(`Flow 6 canonical validation failed: ${finalCheck.issues.join('; ')}`);
    if (old) {
      assertTarget(page);
      if (archive) { old.name = ARCHIVE; old.y = staging.y + staging.height + 220; }
      else old.remove();
    }
    committed = true;
    return `Built ${CANONICAL}: two fresh 03D clones; Decision → Revalidation Gate: ${preflight.strategy}; Controlled Resume request → Resume Pending: PROTOTYPE CONTROL; old section ${archive ? 'archived' : old ? 'removed after validation' : 'not present'}.`;
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
