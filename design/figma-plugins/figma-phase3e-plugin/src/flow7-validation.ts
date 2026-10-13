import { FLOW7_BOARD, cloneName } from './constants';
import { visualSignature } from './prototype-utils';

export type FlowSevenStrategy = 'PRODUCT CONTROL' | 'PROTOTYPE CONTROL';
export type FlowSevenCheck = {
  issues: string[];
  broken: number;
  checks: { name: string; passed: boolean }[];
  strategies: { open: FlowSevenStrategy | null; back: FlowSevenStrategy | null; target: 'NON-INTERACTIVE SPECIMEN' };
};
type ReactionNode = SceneNode & ReactionMixin;
const KEYS = ['Analytics Valid', 'MODEL_NOT_READY', 'TARGET Ready'] as const;
const NOTES = [FLOW7_BOARD.start, FLOW7_BOARD.step1, FLOW7_BOARD.analyticsBoundary,
  FLOW7_BOARD.step2, FLOW7_BOARD.notReadyBoundary, FLOW7_BOARD.currentEnd,
  FLOW7_BOARD.targetNote, FLOW7_BOARD.seriesBoundary, FLOW7_BOARD.currentTarget,
  FLOW7_BOARD.m13Boundary, FLOW7_BOARD.targetEnd] as const;

function allText(node: SceneNode): string {
  return [node.type === 'TEXT' ? node.characters : '', ...('findAll' in node
    ? node.findAll(n => n.type === 'TEXT').map(n => (n as TextNode).characters) : [])].join(' ').toLowerCase();
}
function reactionNodes(frame: FrameNode): ReactionNode[] {
  return [frame, ...frame.findAll(n => 'reactions' in n)] as ReactionNode[];
}
function uniqueNamed(frame: FrameNode, name: string): SceneNode | null {
  const matches = frame.findAll(n => n.name === name);
  return matches.length === 1 ? matches[0] : null;
}
function hasNamed(frame: FrameNode, name: string): boolean {
  return frame.findAll(n => n.name === name).length > 0;
}

export function approvedForecastControl(frame: FrameNode, name: 'Open Forecasts' | 'Open Historical Analytics'): FrameNode & ReactionMixin | null {
  const candidates = frame.findAll(n => n.type === 'FRAME' && n.name === name &&
    n.findAll(child => child.type === 'TEXT').some(child =>
      (child as TextNode).characters.trim().toLowerCase().startsWith(name.toLowerCase())) &&
    typeof n.setReactionsAsync === 'function') as (FrameNode & ReactionMixin)[];
  const usable = candidates.filter(node => {
    let current: BaseNode | null = node;
    while (current) {
      if ('visible' in current && !current.visible) return false;
      if ('opacity' in current && current.opacity <= 0) return false;
      if (current !== node && current.type === 'INSTANCE') return false;
      if (current.id === frame.id) break;
      current = current.parent;
    }
    return true;
  });
  return usable.length === 1 ? usable[0] : null;
}

function sourceReactionsPreserved(source: FrameNode, clone: FrameNode, added?: string): boolean {
  const originals = reactionNodes(source);
  const copies = reactionNodes(clone);
  if (originals.length !== copies.length) return false;
  const idMap = new Map(originals.map((node, index) => [node.id, copies[index].id]));
  for (let i = 0; i < originals.length; i++) {
    const expected = JSON.parse(JSON.stringify(originals[i].reactions)) as { actions?: { type: string; destinationId?: string }[]; action?: { type: string; destinationId?: string } }[];
    for (const reaction of expected) {
      for (const action of reaction.actions ?? []) if (action.type === 'NODE' && action.destinationId && idMap.has(action.destinationId)) action.destinationId = idMap.get(action.destinationId)!;
      if (reaction.action?.type === 'NODE' && reaction.action.destinationId && idMap.has(reaction.action.destinationId)) reaction.action.destinationId = idMap.get(reaction.action.destinationId)!;
    }
    if (copies[i].id === added && expected.length === 0 && copies[i].reactions.length === 1) continue;
    if (JSON.stringify(expected) !== JSON.stringify(copies[i].reactions)) return false;
  }
  return true;
}

async function reactionError(node: ReactionNode, destinationId: string): Promise<string | null> {
  if (node.reactions.length !== 1) return `Expected one progression reaction, found ${node.reactions.length}`;
  const reaction = node.reactions[0];
  if (reaction.trigger?.type !== 'ON_CLICK') return 'Progression trigger must be ON_CLICK';
  if (reaction.actions !== undefined && reaction.actions.length !== 1) return 'Progression requires exactly one action';
  const actions = reaction.actions === undefined ? reaction.action ? [reaction.action] : [] : reaction.actions;
  if (actions.length !== 1) return 'Progression NODE action missing';
  for (const action of [...actions, ...(reaction.action && reaction.actions !== undefined ? [reaction.action] : [])]) {
    if (action.type !== 'NODE' || action.navigation !== 'NAVIGATE') return 'Progression must use NODE/NAVIGATE';
    if (action.destinationId !== destinationId) return `Progression destination must be ${destinationId}`;
    if (action.transition != null) return 'Animated progression is forbidden';
  }
  if (!await figma.getNodeByIdAsync(destinationId)) return 'Progression destination is broken';
  return null;
}

function externalControl(node: SceneNode | undefined, item: { name: string; marker: string; text: string }): node is FrameNode {
  return Boolean(node && node.type === 'FRAME' && node.name === item.name && node.visible && node.opacity > 0 &&
    node.width >= 250 && node.height >= 70 && node.children.length === 2 &&
    node.children.filter(n => n.name === 'Prototype-only marker' && n.type === 'TEXT' && n.characters === item.marker).length === 1 &&
    node.children.filter(n => n.name === 'Continue scenario label' && n.type === 'TEXT' && n.characters === item.text).length === 1 &&
    node.fills !== figma.mixed && node.fills.some(p => p.type === 'SOLID' && p.visible !== false && (p.opacity ?? 1) > 0));
}

export async function checkFlowSeven(section: SectionNode, sources: Map<string, FrameNode>): Promise<FlowSevenCheck> {
  const issues: string[] = [];
  const checks: FlowSevenCheck['checks'] = [];
  let broken = 0;
  const strategies: FlowSevenCheck['strategies'] = { open: null, back: null, target: 'NON-INTERACTIVE SPECIMEN' };
  const record = (name: string, passed: boolean, detail = name): void => {
    checks.push({ name, passed });
    if (!passed) issues.push(detail);
  };
  const allowed = new Set([...KEYS.map(key => cloneName(7, key)), ...Object.values(FLOW7_BOARD).map(item => item.name)]);
  record('Generated-node ownership', section.children.every(n => allowed.has(n.name)), 'Unexpected node inside generated Flow 7 section.');
  const clones = new Map<string, FrameNode>();
  for (const key of KEYS) {
    const exact = section.children.filter(n => n.name === cloneName(7, key));
    const source = sources.get(key);
    if (exact.length === 1 && exact[0].type === 'FRAME') clones.set(key, exact[0] as FrameNode);
    record(`${key} source`, exact.length === 1 && exact[0].type === 'FRAME' && Boolean(source) &&
      visualSignature(exact[0] as FrameNode) === visualSignature(source!),
      `${key}: fresh 03D clone missing, duplicate, wrong type, or visually changed.`);
  }
  for (const item of NOTES) {
    const exact = section.children.filter(n => n.name === item.name);
    record(item.name, exact.length === 1 && exact[0].type === 'TEXT' && exact[0].characters.trim() === item.text.trim(),
      `Missing/wrong external annotation: ${item.name}`);
  }
  for (const [item, label] of [[FLOW7_BOARD.currentBanner, 'CURRENT ENGINEERING STATE'],
    [FLOW7_BOARD.targetBanner, 'TARGET PRODUCT UX explicit']] as const) {
    const matches = section.children.filter(n => n.name === item.name);
    const banner = matches.length === 1 && matches[0].type === 'FRAME' ? matches[0] as FrameNode : null;
    record(label, Boolean(banner && banner.visible && banner.opacity > 0 && banner.width >= 1400 && banner.height >= 70 &&
      banner.fills !== figma.mixed && banner.fills.some(p => p.type === 'SOLID' && p.visible !== false) &&
      banner.children.filter(n => n.type === 'TEXT' && n.characters === item.text &&
        typeof n.fontSize === 'number' && n.fontSize >= 24).length === 1),
    `${label} must have a large visible external banner.`);
  }
  const analytics = clones.get('Analytics Valid');
  const notReady = clones.get('MODEL_NOT_READY');
  const target = clones.get('TARGET Ready');
  if (!analytics || !notReady || !target) return { issues, broken, checks, strategies };
  const analyticsText = allText(analytics);
  const currentText = allText(notReady);
  const targetText = allText(target);
  record('Analytics observed-only', analyticsText.includes('valid historical result') &&
    analyticsText.includes('actual only') && analyticsText.includes('observed') &&
    Boolean(uniqueNamed(analytics, 'Historical Chart')) && !hasNamed(analytics, 'Predicted Series component'),
    'Analytics must show historical ACTUAL observations, not a predicted series.');
  record('No predicted data in Analytics', !/predicted\s*(?:value|result|series)\s*[:=]\s*\d/i.test(analyticsText) &&
    !hasNamed(analytics, 'Actual vs Predicted Chart component'), 'Analytics contains a predicted/future result.');
  record('MODEL_NOT_READY ≠ zero forecast', currentText.includes('model_not_ready') &&
    currentText.includes('no validated forecast artifact exists') &&
    currentText.includes('not a zero or valid-empty forecast') &&
    !/model_not_ready\s*(?:=|is|means)\s*(?:a\s*)?zero(?:\s+forecast)?/i.test(currentText),
    'MODEL_NOT_READY must not be treated as zero or Valid Empty.');
  record('MODEL_NOT_READY ≠ Model Unavailable', section.children.some(n => n.name === FLOW7_BOARD.notReadyBoundary.name &&
    n.type === 'TEXT' && n.characters === FLOW7_BOARD.notReadyBoundary.text) &&
    !/model_not_ready\s*(?:=|is|means)\s*model unavailable|model unavailable\s*(?:=|is|means)\s*model_not_ready/i.test(currentText),
    'MODEL_NOT_READY must remain distinct from Model Unavailable.');
  record('No fake prediction', currentText.includes('no prediction produced') &&
    !hasNamed(notReady, 'Predicted Series component') &&
    !hasNamed(notReady, 'Actual vs Predicted Chart component') &&
    !/predicted\s*(?:value|result|series)\s*[:=]\s*\d/i.test(currentText),
    'Current MODEL_NOT_READY must not show invented predicted values.');
  const result = uniqueNamed(target, 'Forecast Result');
  const reading = result && 'findAll' in result ? result.findAll(n => n.name === 'Series reading') : [];
  const series = reading.length === 1 ? allText(reading[0]) : '';
  record('ACTUAL solid historical semantics', /actual\s*=\s*solid,\s*observed,\s*before cutoff/i.test(series),
    'TARGET ACTUAL must be solid historical data before cutoff.');
  record('CUTOFF boundary semantics', /cutoff\s*=\s*last observed point/i.test(series),
    'TARGET CUTOFF must mark the last observed point.');
  record('PREDICTED dashed future semantics', /predicted\s*=\s*dashed,\s*future-only/i.test(series) &&
    Boolean(uniqueNamed(target, 'Predicted Series component')),
    'TARGET PREDICTED must be dashed, future-only and illustrative.');
  record('TARGET Ready provenance placeholders', Boolean(uniqueNamed(target, 'Request Summary component')) &&
    Boolean(uniqueNamed(target, 'Provenance component')) && Boolean(uniqueNamed(target, 'Limitations component')) &&
    targetText.includes('forecast run: [real run only]') && targetText.includes('validated artifact: [real evidence only]'),
    'TARGET request/provenance/limitations placeholders must be preserved.');
  record('TARGET Ready illustrative only', targetText.includes('target product ux') &&
    targetText.includes('current engineering state: model_not_ready') &&
    targetText.includes('design example only') && !/forecast model (?:trained|validated|deployed)\s*[:=]\s*yes/i.test(targetText),
    'TARGET Ready must not claim a validated live M13 result.');

  const currentBanner = section.children.find(n => n.name === FLOW7_BOARD.currentBanner.name);
  const targetBanner = section.children.find(n => n.name === FLOW7_BOARD.targetBanner.name);
  const currentBottom = Math.max(analytics.y + analytics.height, notReady.y + notReady.height,
    currentBanner && 'height' in currentBanner ? currentBanner.y + currentBanner.height : 0);
  record('TARGET Ready isolated from current', analytics.x + analytics.width < notReady.x &&
    target.y >= currentBottom + 220 && Boolean(targetBanner && 'y' in targetBanner &&
      targetBanner.y >= currentBottom + 80 && targetBanner.y + targetBanner.height < target.y),
    'TARGET Ready must be spatially separated below CURRENT with a visible boundary.');
  record('ACTUAL ≠ PREDICTED', section.children.some(n => n.name === FLOW7_BOARD.seriesBoundary.name &&
    n.type === 'TEXT' && n.characters === FLOW7_BOARD.seriesBoundary.text),
    'ACTUAL and PREDICTED must be explicitly distinguished outside product UI.');
  record('M13 not ready', section.children.some(n => n.name === FLOW7_BOARD.m13Boundary.name &&
    n.type === 'TEXT' && n.characters === FLOW7_BOARD.m13Boundary.text),
    'M13 remains not ready and TARGET does not establish implementation.');

  const progressionPass = { open: false, back: false };
  for (const spec of [
    { key: 'open' as const, source: analytics, original: sources.get('Analytics Valid')!, name: 'Open Forecasts' as const,
      sourceNote: FLOW7_BOARD.openSource, external: FLOW7_BOARD.openControl, dest: notReady, label: 'Analytics → Forecasts navigation' },
    { key: 'back' as const, source: notReady, original: sources.get('MODEL_NOT_READY')!, name: 'Open Historical Analytics' as const,
      sourceNote: FLOW7_BOARD.returnSource, external: FLOW7_BOARD.returnControl, dest: analytics, label: 'Return to Analytics' },
  ]) {
    const sourceAction = approvedForecastControl(spec.original, spec.name);
    const productAction = approvedForecastControl(spec.source, spec.name);
    const sourceLabels = section.children.filter(n => n.name === spec.sourceNote.name);
    const externalMatches = section.children.filter(n => n.name === spec.external.name);
    let progression: ReactionNode | null = null;
    if (sourceAction && sourceAction.reactions.length === 0 && productAction &&
      sourceLabels.length === 1 && sourceLabels[0].type === 'TEXT' && sourceLabels[0].characters === spec.sourceNote.text &&
      externalMatches.length === 0) {
      strategies[spec.key] = 'PRODUCT CONTROL'; progression = productAction;
    } else if (sourceLabels.length === 0 && externalMatches.length === 1 && externalControl(externalMatches[0], spec.external)) {
      strategies[spec.key] = 'PROTOTYPE CONTROL'; progression = externalMatches[0] as ReactionNode;
      record(`${spec.label} external control`, progression.visible &&
        progression.x >= analytics.x + analytics.width && progression.x + progression.width <= notReady.x,
        `${spec.label}: external control must be visible between current frames.`);
    } else record(`${spec.label} strategy`, false, `${spec.label}: product/external control strategy is missing or ambiguous.`);
    const error = progression ? await reactionError(progression, spec.dest.id) : 'Progression control missing';
    record(spec.label, !error, error ?? undefined);
    progressionPass[spec.key] = !error;
    if (error) broken++;
    record(`${spec.source.name} source reactions`, sourceReactionsPreserved(spec.original, spec.source,
      strategies[spec.key] === 'PRODUCT CONTROL' ? productAction?.id : undefined),
      `${spec.source.name}: legitimate source reactions changed or progression attached to unrelated product UI.`);
  }
  record('Exact MODEL_NOT_READY destination', progressionPass.open,
    'Open Forecasts must lead to fresh MODEL_NOT_READY.');
  record('CURRENT path closed safely', section.children.some(n => n.name === FLOW7_BOARD.currentEnd.name &&
    n.type === 'TEXT' && n.characters === FLOW7_BOARD.currentEnd.text) && progressionPass.back,
    'CURRENT must return to Historical Analytics without prediction.');
  record('TARGET specimen entry', section.children.filter(n => n.name.toLowerCase().includes('target entry')).length === 0,
    'TARGET entry must remain a non-interactive specimen.');
  record('TARGET source reactions', sourceReactionsPreserved(sources.get('TARGET Ready')!, target),
    'TARGET Ready source reactions were changed.');
  let validDestinations = true;
  let noCurrentTarget = true;
  const forbidden = /TARGET Ready|Model Unavailable|Processing|Confirmed Result|Reservation Confirmed|Retry|Refresh|Generate/i;
  for (const clone of [analytics, notReady]) for (const node of reactionNodes(clone)) for (const reaction of node.reactions) {
    for (const action of [...(reaction.actions ?? []), ...(reaction.action ? [reaction.action] : [])]) {
      if (action.type !== 'NODE') continue;
      const dest = action.destinationId ? await figma.getNodeByIdAsync(action.destinationId) : null;
      if (!dest || forbidden.test(dest.name) || dest.id === target.id) {
        validDestinations = false; broken++;
        if (dest && (dest.id === target.id || /TARGET Ready/i.test(dest.name))) noCurrentTarget = false;
      }
    }
  }
  record('No current → TARGET progression', noCurrentTarget,
    'Current MODEL_NOT_READY must not navigate to TARGET Ready.');
  record('Broken / prohibited destinations', validDestinations,
    'Current path has a broken or prohibited destination.');
  return { issues, broken, checks, strategies };
}
