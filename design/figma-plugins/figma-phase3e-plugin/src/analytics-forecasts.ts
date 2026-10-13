import { FLOW7_BOARD, cloneName, flowSectionName } from './constants';
import { approvedForecastControl, checkFlowSeven } from './flow7-validation';
import { annotation, assertTarget, navigateReaction, visualSignature } from './prototype-utils';

const CANONICAL = flowSectionName(7);
const STAGING = `${CANONICAL} / staging`;
const PREVIOUS = `${CANONICAL} / previous`;
const ARCHIVE = 'ARCHIVE — Flow 7 — previous prototype with manual or ambiguous content';

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

function banner(page: PageNode, section: SectionNode, font: FontName,
  item: { name: string; text: string }, x: number, y: number, width: number): FrameNode {
  assertTarget(page);
  const node = figma.createFrame();
  node.name = item.name;
  section.appendChild(node);
  node.resize(width, 82);
  node.x = x; node.y = y;
  node.cornerRadius = 8;
  node.fills = [{ type: 'SOLID', color: { r: 0.86, g: 0.86, b: 0.86 } }];
  node.strokes = [{ type: 'SOLID', color: { r: 0.3, g: 0.3, b: 0.3 } }];
  node.strokeWeight = 2;
  label(page, node, 'Prototype state label', item.text, 20, 20, width - 40, 26, font);
  return node;
}

function externalControl(page: PageNode, section: SectionNode, font: FontName,
  item: { name: string; marker: string; text: string }, x: number, y: number): FrameNode {
  assertTarget(page);
  const node = figma.createFrame();
  node.name = item.name;
  section.appendChild(node);
  node.resize(410, 104);
  node.x = x; node.y = y;
  node.cornerRadius = 8;
  node.fills = [{ type: 'SOLID', color: { r: 0.94, g: 0.94, b: 0.94 } }];
  node.strokes = [{ type: 'SOLID', color: { r: 0.44, g: 0.44, b: 0.44 } }];
  node.strokeWeight = 1;
  label(page, node, 'Prototype-only marker', item.marker, 14, 12, 380, 11, font);
  label(page, node, 'Continue scenario label', item.text, 14, 40, 380, 15, font);
  return node;
}

export async function buildAnalyticsForecasts(page: PageNode, sources: Map<string, FrameNode>, font: FontName): Promise<string> {
  assertTarget(page);
  const oldMatches = page.children.filter(n => n.name === CANONICAL);
  if (oldMatches.length > 1 || (oldMatches.length === 1 && oldMatches[0].type !== 'SECTION'))
    throw new Error('Flow 7 canonical section is duplicate or wrong type. Nothing was changed.');
  if (page.children.some(n => n.name === STAGING || n.name === PREVIOUS))
    throw new Error('Existing Flow 7 staging/previous section requires manual review. Nothing was changed.');
  const old = oldMatches[0] as SectionNode | undefined;
  const oldY = old?.y;
  const initialY = old?.y ?? Math.max(22500, ...page.children
    .filter(n => n.type === 'SECTION' && n.name !== '09 — Prototype Validation')
    .map(n => n.y + n.height + 180));
  const prior = old ? await checkFlowSeven(old, sources) : null;
  const archive = Boolean(old && prior?.issues.length);
  if (archive && page.children.some(n => n.name === ARCHIVE)) throw new Error('Flow 7 archive name already exists. Nothing was changed.');

  let staging: SectionNode | undefined;
  let committed = false;
  try {
    assertTarget(page);
    staging = figma.createSection();
    staging.name = STAGING;
    staging.x = old?.x ?? 0; staging.y = initialY;
    staging.resize(4800, 2500);
    const analytics = sources.get('Analytics Valid')!.clone();
    analytics.name = cloneName(7, 'Analytics Valid');
    staging.appendChild(analytics);
    analytics.x = 50; analytics.y = 420;
    const notReady = sources.get('MODEL_NOT_READY')!.clone();
    notReady.name = cloneName(7, 'MODEL_NOT_READY');
    staging.appendChild(notReady);
    notReady.x = analytics.x + analytics.width + 520; notReady.y = 420;
    const target = sources.get('TARGET Ready')!.clone();
    target.name = cloneName(7, 'TARGET Ready');
    staging.appendChild(target);
    const currentBottom = Math.max(analytics.y + analytics.height, notReady.y + notReady.height);
    target.x = 50; target.y = currentBottom + 490;
    for (const [key, clone] of [['Analytics Valid', analytics], ['MODEL_NOT_READY', notReady], ['TARGET Ready', target]] as const) {
      if (visualSignature(clone) !== visualSignature(sources.get(key)!))
        throw new Error(`Fresh 03D ${key} clone visual mismatch.`);
    }
    const add = (item: { name: string; text: string }, x: number, y: number, width = 1700): void => {
      annotation(page, staging!, item.name, item.text, x, y, width, font);
    };
    add(FLOW7_BOARD.start, analytics.x, 10);
    add(FLOW7_BOARD.step1, analytics.x, 120);
    add(FLOW7_BOARD.analyticsBoundary, analytics.x, 175);
    add(FLOW7_BOARD.step2, notReady.x, 120);
    banner(page, staging, font, FLOW7_BOARD.currentBanner, notReady.x, 235, 1700);
    add(FLOW7_BOARD.notReadyBoundary, notReady.x, 335);
    add(FLOW7_BOARD.currentEnd, notReady.x, currentBottom + 60);
    banner(page, staging, font, FLOW7_BOARD.targetBanner, 50, currentBottom + 280, 2300);
    add(FLOW7_BOARD.targetNote, target.x + target.width + 100, target.y + 55);
    add(FLOW7_BOARD.seriesBoundary, target.x + target.width + 100, target.y + 155);
    add(FLOW7_BOARD.currentTarget, target.x + target.width + 100, target.y + 285);
    add(FLOW7_BOARD.m13Boundary, target.x + target.width + 100, target.y + 410);
    add(FLOW7_BOARD.targetEnd, target.x, target.y + target.height + 55);

    const openSource = approvedForecastControl(sources.get('Analytics Valid')!, 'Open Forecasts');
    const openClone = approvedForecastControl(analytics, 'Open Forecasts');
    if (openSource && openSource.reactions.length === 0 && openClone && openClone.reactions.length === 0) {
      add(FLOW7_BOARD.openSource, analytics.x, 355);
      await openClone.setReactionsAsync([navigateReaction(notReady.id)]);
    } else {
      const control = externalControl(page, staging, font, FLOW7_BOARD.openControl,
        analytics.x + analytics.width + 55, analytics.y + 330);
      await control.setReactionsAsync([navigateReaction(notReady.id)]);
    }
    const returnSource = approvedForecastControl(sources.get('MODEL_NOT_READY')!, 'Open Historical Analytics');
    const returnClone = approvedForecastControl(notReady, 'Open Historical Analytics');
    if (returnSource && returnSource.reactions.length === 0 && returnClone && returnClone.reactions.length === 0) {
      add(FLOW7_BOARD.returnSource, notReady.x, 355);
      await returnClone.setReactionsAsync([navigateReaction(analytics.id)]);
    } else {
      const control = externalControl(page, staging, font, FLOW7_BOARD.returnControl,
        analytics.x + analytics.width + 55, analytics.y + 490);
      await control.setReactionsAsync([navigateReaction(analytics.id)]);
    }
    const maxX = Math.max(...staging.children.map(n => 'width' in n ? n.x + n.width : 0));
    const maxY = Math.max(...staging.children.map(n => 'height' in n ? n.y + n.height : 0));
    staging.resize(Math.max(4800, maxX + 80), Math.max(2500, maxY + 80));
    const preflight = await checkFlowSeven(staging, sources);
    if (preflight.issues.length) throw new Error(`Flow 7 staging validation failed: ${preflight.issues.join('; ')}`);
    if (old) { assertTarget(page); old.name = PREVIOUS; }
    assertTarget(page); staging.name = CANONICAL;
    const finalCheck = await checkFlowSeven(staging, sources);
    if (finalCheck.issues.length || page.children.filter(n => n.name === CANONICAL).length !== 1)
      throw new Error(`Flow 7 canonical validation failed: ${finalCheck.issues.join('; ')}`);
    if (old) {
      assertTarget(page);
      if (archive) { old.name = ARCHIVE; old.y = staging.y + staging.height + 220; }
      else old.remove();
    }
    committed = true;
    return `Built ${CANONICAL}: three fresh 03D clones; Analytics → Forecasts: ${preflight.strategies.open}; Forecasts → Analytics: ${preflight.strategies.back}; TARGET entry: NON-INTERACTIVE SPECIMEN; old section ${archive ? 'archived' : old ? 'removed after validation' : 'not present'}.`;
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
