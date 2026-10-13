import { FLOW6_BOARD, cloneName } from './constants';
import { visualSignature } from './prototype-utils';

export type FlowSixStrategy = 'PRODUCT CONTROL' | 'PROTOTYPE CONTROL';
export type FlowSixCheck = { issues: string[]; broken: number; checks: { name: string; passed: boolean }[]; strategy: FlowSixStrategy | null };
type ReactionNode = SceneNode & ReactionMixin;
const KEYS = ['Awaiting Decision', 'Resume Pending'] as const;
const TOP_NOTES = [FLOW6_BOARD.start, FLOW6_BOARD.step1, FLOW6_BOARD.hierarchyNote,
  FLOW6_BOARD.decisionBoundary, FLOW6_BOARD.step3, FLOW6_BOARD.targetNote,
  FLOW6_BOARD.currentTarget, FLOW6_BOARD.end] as const;
const GATE_NOTES = [FLOW6_BOARD.step2, FLOW6_BOARD.principal, FLOW6_BOARD.scope,
  FLOW6_BOARD.authorization, FLOW6_BOARD.state, FLOW6_BOARD.revision,
  FLOW6_BOARD.replayBoundary, FLOW6_BOARD.unknownBoundary, FLOW6_BOARD.e02Boundary] as const;
const GATE_LABELS = ['STEP 2 revalidation', 'Principal revalidation', 'Business scope revalidation',
  'Authorization revalidation', 'Business-state revalidation', 'Revision/stale revalidation',
  'Revalidation / Replay boundary', 'OUTCOME_UNKNOWN boundary', 'E02 safety boundary'] as const;
const HIERARCHY = ['Why Automation Stopped', 'Confirmed Facts', 'Uncertain Effect',
  'Constraints', 'Next Safe Step', 'Human Decision'] as const;

function reactionNodes(frame: FrameNode): ReactionNode[] {
  return [frame, ...frame.findAll(n => 'reactions' in n)] as ReactionNode[];
}
function allText(node: SceneNode): string {
  return [node.type === 'TEXT' ? node.characters : '', ...('findAll' in node
    ? node.findAll(n => n.type === 'TEXT').map(n => (n as TextNode).characters) : [])].join(' ').toLowerCase();
}

export function approvedDecisionControl(frame: FrameNode): (FrameNode & ReactionMixin) | null {
  const matches = frame.findAll(n => n.type === 'FRAME' &&
    (n.name === 'Primary decision' || n.name === 'Primary decision / focus') &&
    n.findAll(child => child.type === 'TEXT').some(child =>
      /approve proposed continuation/i.test((child as TextNode).characters)) &&
    typeof n.setReactionsAsync === 'function') as (FrameNode & ReactionMixin)[];
  const usable = matches.filter(node => {
    let current: BaseNode | null = node;
    while (current) {
      if ('visible' in current && !current.visible) return false;
      if ('opacity' in current && current.opacity <= 0) return false;
      if (current !== node && current.type === 'INSTANCE') return false; // Do not alter a nested 03C instance control.
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
  if (node.reactions.length !== 1) return `expected one progression reaction, found ${node.reactions.length}`;
  const reaction = node.reactions[0];
  if (reaction.trigger?.type !== 'ON_CLICK') return 'Progression trigger must be ON_CLICK';
  if (reaction.actions !== undefined && reaction.actions.length !== 1) return 'Progression must have exactly one action';
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

function labeledControl(node: SceneNode | undefined, item: { name: string; marker: string; text: string }): node is FrameNode {
  if (!node || node.type !== 'FRAME' || node.name !== item.name || !node.visible || node.opacity <= 0 ||
    node.width < 250 || node.height < 70 || node.children.length !== 2 ||
    node.children.filter(n => n.name === 'Prototype-only marker' && n.type === 'TEXT' && n.characters === item.marker).length !== 1 ||
    node.children.filter(n => n.name === 'Continue scenario label' && n.type === 'TEXT' && n.characters === item.text).length !== 1 ||
    node.fills === figma.mixed || !node.fills.some(p => p.type === 'SOLID' && p.visible !== false && (p.opacity ?? 1) > 0)) return false;
  return true;
}

export async function checkFlowSix(section: SectionNode, sources: Map<string, FrameNode>): Promise<FlowSixCheck> {
  const issues: string[] = [];
  const checks: FlowSixCheck['checks'] = [];
  let broken = 0;
  const record = (name: string, ok: boolean, detail = name): void => {
    checks.push({ name, passed: ok });
    if (!ok) issues.push(detail);
  };
  const allowed = new Set([...KEYS.map(key => cloneName(6, key)), ...TOP_NOTES.map(item => item.name),
    FLOW6_BOARD.targetBanner.name, FLOW6_BOARD.decisionSource.name, FLOW6_BOARD.decisionControl.name,
    FLOW6_BOARD.gate.name]);
  record('Generated-node ownership', section.children.every(n => allowed.has(n.name)), 'Unexpected node inside generated Flow 6 section.');
  const clones = new Map<string, FrameNode>();
  for (const key of KEYS) {
    const exact = section.children.filter(n => n.name === cloneName(6, key));
    if (exact.length === 1 && exact[0].type === 'FRAME') clones.set(key, exact[0] as FrameNode);
    record(`${key} source`, exact.length === 1 && exact[0].type === 'FRAME' && Boolean(sources.get(key)) &&
      visualSignature(exact[0] as FrameNode) === visualSignature(sources.get(key)!),
      `${key}: fresh 03D clone missing, duplicate, wrong type, or visually changed.`);
  }
  for (const item of TOP_NOTES) {
    const exact = section.children.filter(n => n.name === item.name);
    record(item.name, exact.length === 1 && exact[0].type === 'TEXT' && exact[0].characters.trim() === item.text.trim(),
      `Missing/wrong external annotation: ${item.name}`);
  }
  const bannerNodes = section.children.filter(n => n.name === FLOW6_BOARD.targetBanner.name);
  const banner = bannerNodes.length === 1 && bannerNodes[0].type === 'FRAME' ? bannerNodes[0] as FrameNode : null;
  record('TARGET M12 explicit', Boolean(banner && banner.visible && banner.opacity > 0 && banner.width >= 1200 && banner.height >= 60 &&
    banner.fills !== figma.mixed && banner.fills.some(p => p.type === 'SOLID' && p.visible !== false) &&
    banner.children.filter(n => n.type === 'TEXT' && n.characters === FLOW6_BOARD.targetBanner.text &&
      typeof n.fontSize === 'number' && n.fontSize >= 24).length === 1),
    'Large visible TARGET M12 / not-current banner is missing.');
  const gateNodes = section.children.filter(n => n.name === FLOW6_BOARD.gate.name);
  const gate = gateNodes.length === 1 && gateNodes[0].type === 'FRAME' ? gateNodes[0] as FrameNode : null;
  record('Revalidation required', Boolean(gate && gate.visible && gate.opacity > 0 && gate.width >= 680 && gate.height >= 700 &&
    gate.fills !== figma.mixed && gate.fills.some(p => p.type === 'SOLID' && p.visible !== false) &&
    gate.children.filter(n => n.name === 'Prototype-only marker' && n.type === 'TEXT' && n.characters === FLOW6_BOARD.gate.marker).length === 1),
    'Visible external Revalidation Gate is missing or too small.');
  for (const [index, item] of GATE_NOTES.entries()) {
    const exact = gate?.children.filter(n => n.name === item.name) ?? [];
    record(GATE_LABELS[index], exact.length === 1 && exact[0].type === 'TEXT' && exact[0].characters.trim() === item.text.trim(),
      `Missing/wrong Revalidation Gate check: ${item.name}`);
  }
  const resumeMatches = gate?.children.filter(n => n.name === FLOW6_BOARD.resumeControl.name) ?? [];
  const resumeControl = resumeMatches.length === 1 && labeledControl(resumeMatches[0], FLOW6_BOARD.resumeControl)
    ? resumeMatches[0] as FrameNode : null;
  record('Controlled Resume request', Boolean(resumeControl && gate &&
    resumeControl.y > Math.max(...GATE_NOTES.map(item => {
      const note = gate.children.find(n => n.name === item.name);
      return note && 'height' in note ? note.y + note.height : 0;
    })) && resumeControl.y + resumeControl.height <= gate.height),
    'Controlled Resume request must be a visible prototype-only control after all revalidation checks.');
  const decision = clones.get('Awaiting Decision');
  const target = clones.get('Resume Pending');
  if (!decision || !target || !gate) return { issues, broken, checks, strategy: null };
  record('Decision → Revalidation → Resume Pending sequence', decision.x + decision.width < gate.x &&
    gate.x + gate.width < target.x && decision.y > (banner?.y ?? -1),
    'Flow 6 must visibly place Revalidation Gate between Decision and Resume Pending.');
  const contexts = decision.findAll(n => n.name === 'Decision Context' && n.type === 'FRAME') as FrameNode[];
  const context = contexts.length === 1 ? contexts[0] : null;
  const blocks = context ? HIERARCHY.map(name => context.children.filter(n => n.name === name)) : [];
  const hierarchy = Boolean(context && blocks.every(group => group.length === 1 && (group[0].type === 'FRAME' || group[0].type === 'INSTANCE')) &&
    blocks.every((group, i) => i === 0 || group[0].y > blocks[i - 1][0].y));
  record('Decision Context hierarchy', hierarchy,
    'Decision Context must retain Why → Confirmed → Uncertain → Constraints → Next Safe Step → Human Decision in order.');
  const decisionText = hierarchy ? allText(blocks[5][0]) : '';
  record('Human Decision ≠ Mutation Execution', hierarchy && decisionText.includes('approve proposed continuation') &&
    (decisionText.includes('current authorization required') || decisionText.includes('backend authorization')) &&
    !/executed mutation|mutation executed|reservation confirmed/i.test(decisionText),
    'Human decision must record intent without executing or replaying a mutation.');
  const targetText = allText(target);
  record('CURRENT vs TARGET separation', targetText.includes('resume pending') && targetText.includes('target m12') &&
    targetText.includes('not currently implemented') &&
    section.children.some(n => n.name === FLOW6_BOARD.currentTarget.name && n.type === 'TEXT' && n.characters === FLOW6_BOARD.currentTarget.text),
    'TARGET M12 is incorrectly represented as a current capability.');
  record('No confirmed business effect', targetText.includes('no new reservation or order effect is claimed') &&
    targetText.includes('no mutation replay') && !targetText.includes('reservation confirmed'),
    'Resume Pending incorrectly claims mutation replay or a newly confirmed business effect.');
  record('OUTCOME_UNKNOWN reconciliation prerequisite', gate.children.some(child =>
    child.name === FLOW6_BOARD.unknownBoundary.name && child.type === 'TEXT' && child.characters === FLOW6_BOARD.unknownBoundary.text) &&
    targetText.includes('any prior outcome_unknown must be reconciled'),
    'Unknown effect may reach controlled Resume without reconciliation.');
  record('E02 not bypassed', gate.children.some(n => n.name === FLOW6_BOARD.e02Boundary.name && n.type === 'TEXT' &&
    n.characters === FLOW6_BOARD.e02Boundary.text), 'Controlled Resume would bypass E02/domain policy.');

  const sourceAction = sources.get('Awaiting Decision') && approvedDecisionControl(sources.get('Awaiting Decision')!);
  const productAction = approvedDecisionControl(decision);
  const externalMatches = section.children.filter(n => n.name === FLOW6_BOARD.decisionControl.name);
  const sourceLabels = section.children.filter(n => n.name === FLOW6_BOARD.decisionSource.name);
  let strategy: FlowSixStrategy | null = null;
  if (externalMatches.length === 0 && sourceLabels.length === 1 && sourceLabels[0].type === 'TEXT' &&
    sourceLabels[0].characters === FLOW6_BOARD.decisionSource.text && sourceAction && sourceAction.reactions.length === 0 && productAction) {
    strategy = 'PRODUCT CONTROL';
    const error = await reactionError(productAction, gate.id);
    record('Human decision progression', !error, error ?? undefined);
    if (error) broken++;
  } else if (externalMatches.length === 1 && sourceLabels.length === 0) {
    strategy = 'PROTOTYPE CONTROL';
    const control = labeledControl(externalMatches[0], FLOW6_BOARD.decisionControl) ? externalMatches[0] as FrameNode : null;
    record('External human decision control', Boolean(control && control.x >= decision.x + decision.width &&
      control.x + control.width <= gate.x), 'Visible external human decision control missing or misplaced.');
    if (control) {
      const error = await reactionError(control, gate.id);
      record('Human decision progression', !error, error ?? undefined);
      if (error) broken++;
    }
  } else record('Human decision progression', false, 'Decision progression is missing or attached to an ambiguous product node.');
  if (resumeControl) {
    const error = await reactionError(resumeControl, target.id);
    record('Exact Resume Pending destination', !error, error ?? undefined);
    if (error) broken++;
  }
  for (const key of KEYS) {
    const source = sources.get(key);
    const clone = clones.get(key)!;
    const exception = key === 'Awaiting Decision' && strategy === 'PRODUCT CONTROL' ? productAction?.id : undefined;
    record(`${key} source reactions`, Boolean(source) && sourceReactionsPreserved(source!, clone, exception),
      `${key}: source reactions changed or Phase 3E progression attached to unrelated product UI.`);
  }
  const boardText = section.children.filter(n => n.type === 'TEXT').map(n => (n as TextNode).characters).join(' ') +
    ' ' + allText(gate) + ' ' + allText(decision) + ' ' + targetText;
  record('No mutation replay', targetText.includes('no mutation replay') &&
    gate.children.some(n => n.name === FLOW6_BOARD.replayBoundary.name && n.type === 'TEXT' &&
      n.characters === FLOW6_BOARD.replayBoundary.text) &&
    !/resume execution now|retry mutation now|run again|repeat mutation|revalidation automatically (?:retries|replays|resumes)/i.test(boardText),
    'Flow 6 implies direct execution or mutation replay.');
  let destinationsValid = true;
  const forbidden = /Processing|Confirmed Result|Reservation Confirmed|Retry Mutation|Repeat Mutation|create_order|update_order|reserve_inventory/i;
  for (const clone of clones.values()) for (const node of reactionNodes(clone)) for (const reaction of node.reactions) {
    for (const action of [...(reaction.actions ?? []), ...(reaction.action ? [reaction.action] : [])]) {
      if (action.type !== 'NODE') continue;
      const dest = action.destinationId ? await figma.getNodeByIdAsync(action.destinationId) : null;
      if (!dest || forbidden.test(dest.name) || (clone === decision && dest.id === target.id)) { destinationsValid = false; broken++; }
    }
  }
  record('Broken / prohibited destinations', destinationsValid,
    'Decision or Resume Pending links directly to execution, confirmed effect, replay, or bypasses revalidation.');
  record('Explicit END', section.children.some(n => n.name === FLOW6_BOARD.end.name && n.type === 'TEXT' &&
    n.characters.includes('Resume Pending — TARGET M12 is the final prototype state.')),
    'END must identify Resume Pending — TARGET M12 with no mutation replay.');
  return { issues, broken, checks, strategy };
}
