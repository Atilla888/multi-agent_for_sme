import { FLOW5_BOARD, cloneName } from './constants';
import { visualSignature } from './prototype-utils';

export type FlowFiveStrategy = 'PRODUCT CONTROL' | 'PROTOTYPE CONTROL';
export type FlowFiveCheck = { issues: string[]; broken: number; checks: { name: string; passed: boolean }[]; strategy: FlowFiveStrategy | null };
type ReactionNode = SceneNode & ReactionMixin;
const KEYS = ['Conversation OUTCOME_UNKNOWN', 'Escalation Reconciliation'] as const;
const ANNOTATIONS = [FLOW5_BOARD.start, FLOW5_BOARD.step1, FLOW5_BOARD.uncertain,
  FLOW5_BOARD.unknownBoundary, FLOW5_BOARD.noBlindRetry, FLOW5_BOARD.reconcileFirst,
  FLOW5_BOARD.step2, FLOW5_BOARD.reconciliation, FLOW5_BOARD.knownBoundary,
  FLOW5_BOARD.e02Boundary, FLOW5_BOARD.m12Boundary, FLOW5_BOARD.end] as const;
const HIERARCHY = ['Why Automation Stopped', 'Confirmed Facts', 'Uncertain Effect',
  'Constraints', 'Next Safe Step', 'Human Decision'] as const;

function reactionNodes(frame: FrameNode): ReactionNode[] {
  return [frame, ...frame.findAll(n => 'reactions' in n)] as ReactionNode[];
}
function allText(node: SceneNode): string {
  return [node.type === 'TEXT' ? node.characters : '', ...('findAll' in node
    ? node.findAll(n => n.type === 'TEXT').map(n => (n as TextNode).characters) : [])].join(' ').toLowerCase();
}
function uniqueDescendant(frame: FrameNode, name: string): SceneNode | null {
  const matches = frame.findAll(n => n.name === name);
  return matches.length === 1 ? matches[0] : null;
}

export function visibleEscalationLink(frame: FrameNode): (TextNode & ReactionMixin) | null {
  const matches = frame.findAll(n => n.name === 'Escalation link' && n.type === 'TEXT') as (TextNode & ReactionMixin)[];
  if (matches.length !== 1 || !/^open\s+escalation\b/i.test(matches[0].characters.trim()) ||
    typeof matches[0].setReactionsAsync !== 'function') return null;
  let current: BaseNode | null = matches[0];
  while (current) {
    if ('visible' in current && !current.visible) return null;
    if ('opacity' in current && current.opacity <= 0) return null;
    if (current.id === frame.id) break;
    current = current.parent;
  }
  return matches[0];
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
  if (node.reactions.length !== 1) return `expected one Open Escalation reaction, found ${node.reactions.length}`;
  const reaction = node.reactions[0];
  if (reaction.trigger?.type !== 'ON_CLICK') return 'Open Escalation trigger must be ON_CLICK';
  if (reaction.actions !== undefined && reaction.actions.length !== 1) return 'Open Escalation must have exactly one action';
  const actions = reaction.actions === undefined ? reaction.action ? [reaction.action] : [] : reaction.actions;
  if (actions.length !== 1) return 'Open Escalation NODE action missing';
  for (const action of [...actions, ...(reaction.action && reaction.actions !== undefined ? [reaction.action] : [])]) {
    if (action.type !== 'NODE' || action.navigation !== 'NAVIGATE') return 'Open Escalation must use NODE/NAVIGATE';
    if (action.destinationId !== destinationId) return `Open Escalation destination must be fresh Escalation Reconciliation ${destinationId}`;
    if (action.transition != null) return 'Open Escalation animation is forbidden';
  }
  if (!await figma.getNodeByIdAsync(destinationId)) return 'Open Escalation destination is broken';
  return null;
}

function externalControl(section: SectionNode, from: FrameNode, to: FrameNode): FrameNode | null {
  const matches = section.children.filter(n => n.name === FLOW5_BOARD.escalationControl.name);
  if (matches.length !== 1 || matches[0].type !== 'FRAME') return null;
  const control = matches[0] as FrameNode;
  if (!control.visible || control.opacity <= 0 || control.width < 250 || control.height < 70 ||
    control.x < from.x + from.width || control.x + control.width > to.x || control.children.length !== 2 ||
    control.children.filter(n => n.name === 'Prototype-only marker' && n.type === 'TEXT' && n.characters === FLOW5_BOARD.escalationControl.marker).length !== 1 ||
    control.children.filter(n => n.name === 'Continue scenario label' && n.type === 'TEXT' && n.characters === FLOW5_BOARD.escalationControl.text).length !== 1 ||
    control.fills === figma.mixed || !control.fills.some(p => p.type === 'SOLID' && p.visible !== false && (p.opacity ?? 1) > 0)) return null;
  return control;
}

export async function checkFlowFive(section: SectionNode, sources: Map<string, FrameNode>): Promise<FlowFiveCheck> {
  const issues: string[] = [];
  const checks: FlowFiveCheck['checks'] = [];
  let broken = 0;
  const record = (name: string, ok: boolean, detail = name): void => {
    checks.push({ name, passed: ok });
    if (!ok) issues.push(detail);
  };
  const allowed = new Set([...KEYS.map(key => cloneName(5, key)), ...ANNOTATIONS.map(a => a.name),
    FLOW5_BOARD.escalationSource.name, FLOW5_BOARD.escalationControl.name]);
  record('Generated-node ownership', section.children.every(n => allowed.has(n.name)), 'Unexpected node inside generated Flow 5 section.');
  const clones = new Map<string, FrameNode>();
  for (const key of KEYS) {
    const exact = section.children.filter(n => n.name === cloneName(5, key));
    if (exact.length === 1 && exact[0].type === 'FRAME') clones.set(key, exact[0] as FrameNode);
    record(`${key} source`, exact.length === 1 && exact[0].type === 'FRAME' && Boolean(sources.get(key)) &&
      visualSignature(exact[0] as FrameNode) === visualSignature(sources.get(key)!),
    `${key}: fresh 03D clone missing, duplicate, wrong type, or visually changed.`);
  }
  for (const item of ANNOTATIONS) {
    const exact = section.children.filter(n => n.name === item.name);
    record(item.name, exact.length === 1 && exact[0].type === 'TEXT' && exact[0].characters.trim() === item.text.trim(),
      `Missing/wrong external annotation: ${item.name}`);
  }
  const conversation = clones.get('Conversation OUTCOME_UNKNOWN');
  const escalation = clones.get('Escalation Reconciliation');
  if (!conversation || !escalation) return { issues, broken, checks, strategy: null };
  record('Left-to-right reconciliation path', conversation.x + conversation.width < escalation.x,
    'Conversation OUTCOME_UNKNOWN must precede Escalation Reconciliation.');
  const result = uniqueDescendant(conversation, 'Business Action Result');
  const resultText = result ? allText(result) : '';
  const resultState = result && 'findAll' in result
    ? result.findAll(n => n.type === 'TEXT' && n.name === 'Result state') as TextNode[] : [];
  record('Uncertain business effect', resultState.length === 1 && resultState[0].characters.trim() === 'OUTCOME_UNKNOWN' &&
    resultText.includes('reservation may have committed') && resultText.includes('confirmation unavailable') &&
    !/reservation (?:failed|confirmed)\b/i.test(resultText),
    'Conversation must show an uncertain effect, not Known Failure, success, or timeout-only meaning.');
  record('OUTCOME_UNKNOWN ≠ Known Failure', resultText.includes('outcome_unknown') &&
    !resultText.includes('known failure'), 'Conversation result incorrectly collapses OUTCOME_UNKNOWN into Known Failure.');
  record('No blind retry', resultText.includes('do not retry mutation blindly') &&
    resultText.includes('required before any mutation retry'), 'Conversation lacks no-blind-retry protection.');
  record('Reconcile before mutation', resultText.includes('reconcile authoritative reservation state') &&
    resultText.includes('required before any mutation retry'), 'Conversation lacks reconciliation-before-mutation semantics.');
  record('E02 ≠ OUTCOME_UNKNOWN', resultState.length === 1 && resultState[0].characters.trim() !== 'E02 Restricted' &&
    section.children.some(n => n.name === FLOW5_BOARD.e02Boundary.name && n.type === 'TEXT' && n.characters === FLOW5_BOARD.e02Boundary.text),
    'E02 policy restriction was confused with uncertain business effect.');

  const contexts = escalation.findAll(n => n.name === 'Decision Context' && n.type === 'FRAME') as FrameNode[];
  const context = contexts.length === 1 ? contexts[0] : null;
  const blocks = context ? HIERARCHY.map(name => context.children.filter(n => n.name === name)) : [];
  const hierarchy = Boolean(context && blocks.every(group => group.length === 1 && (group[0].type === 'FRAME' || group[0].type === 'INSTANCE')) &&
    blocks.every((group, i) => i === 0 || group[0].y > blocks[i - 1][0].y));
  record('Decision Context hierarchy', hierarchy,
    'Decision Context must retain Why → Confirmed → Uncertain → Constraints → Next Safe Step → Human Decision in order.');
  const confirmed = hierarchy ? allText(blocks[1][0]) : '';
  const uncertain = hierarchy ? allText(blocks[2][0]) : '';
  const constraints = hierarchy ? allText(blocks[3][0]) : '';
  const next = hierarchy ? allText(blocks[4][0]) : '';
  const human = hierarchy ? allText(blocks[5][0]) : '';
  record('Confirmed Facts ≠ Uncertain Effect', confirmed.includes('order ord-1042 exists') &&
    confirmed.includes('create_order') && confirmed.includes('confirmed') &&
    !confirmed.includes('reservation confirmed') && uncertain.includes('outcome_unknown') &&
    uncertain.includes('may have committed') && uncertain.includes('confirmation unavailable'),
    'Confirmed Order facts and uncertain reservation effect are not independently represented.');
  record('Reconciliation Required', uncertain.includes('reconciliation required') &&
    next.includes('reconcile authoritative reservation state') && constraints.includes('do not retry reserve_inventory'),
    'Escalation lacks authoritative-state reconciliation before any retry.');
  record('Human review / safe next step', human.includes('human decision') &&
    human.includes('request reconciliation') && human.includes('retry remain unavailable'),
    'Human review or safe next-step boundary is missing.');
  const contextText = context ? allText(context) : '';
  record('Context preserved', contextText.includes('conversation c-42') &&
    contextText.includes('order ord-1042') && contextText.includes('agent run') &&
    allText(escalation).includes('human operator') && confirmed.includes('customer amina s. verified'),
    'Escalation lost Conversation, Order, Agent Run, human owner, or verified facts.');
  const allContent = section.children.filter(n => n.type === 'TEXT').map(n => (n as TextNode).characters).join(' ') +
    ' ' + allText(conversation) + ' ' + allText(escalation);
  record('No automatic replay', !/(?:reconciliation|human review|human decision)\s+(?:automatically|immediately)\s+(?:retries|replays|resumes)|(?:retry|replay)\s+(?:reserve_inventory|create_order|update_order|mutation)\s+automatically/i.test(allContent),
    'Flow 5 implies automatic mutation retry or replay after reconciliation.');
  record('M12 kept outside Flow 5', !/resume pending|target m12/i.test(allText(conversation) + ' ' + allText(escalation)) &&
    section.children.some(n => n.name === FLOW5_BOARD.m12Boundary.name && n.type === 'TEXT' && n.characters === FLOW5_BOARD.m12Boundary.text),
    'Flow 5 enters Resume Pending / TARGET M12 or lacks its explicit boundary.');

  const sourceLink = sources.get('Conversation OUTCOME_UNKNOWN') && visibleEscalationLink(sources.get('Conversation OUTCOME_UNKNOWN')!);
  const productLink = visibleEscalationLink(conversation);
  const externalMatches = section.children.filter(n => n.name === FLOW5_BOARD.escalationControl.name);
  const productLabels = section.children.filter(n => n.name === FLOW5_BOARD.escalationSource.name);
  let strategy: FlowFiveStrategy | null = null;
  if (externalMatches.length === 0 && productLabels.length === 1 && productLabels[0].type === 'TEXT' &&
    productLabels[0].characters === FLOW5_BOARD.escalationSource.text && sourceLink && sourceLink.reactions.length === 0 && productLink) {
    strategy = 'PRODUCT CONTROL';
    const error = await reactionError(productLink, escalation.id);
    record('Open Escalation navigation', !error, error ?? undefined);
    if (error) broken++;
  } else if (externalMatches.length === 1 && productLabels.length === 0) {
    strategy = 'PROTOTYPE CONTROL';
    const control = externalControl(section, conversation, escalation);
    record('External Open Escalation control', Boolean(control), 'Visible external escalation control missing or misplaced.');
    if (control) {
      const error = await reactionError(control, escalation.id);
      record('Open Escalation navigation', !error, error ?? undefined);
      if (error) broken++;
    }
  } else record('Open Escalation navigation', false, 'Open Escalation progression is missing, duplicate, or ambiguous.');
  for (const key of KEYS) {
    const source = sources.get(key);
    const clone = clones.get(key)!;
    const exception = key === 'Conversation OUTCOME_UNKNOWN' && strategy === 'PRODUCT CONTROL' ? productLink?.id : undefined;
    record(`${key} source reactions`, Boolean(source) && sourceReactionsPreserved(source!, clone, exception),
      `${key}: source reactions changed or unauthorized Phase 3E progression attached to product UI.`);
  }
  let destinationsValid = true;
  const forbidden = /Processing|Confirmed Result|Reservation Confirmed|Known Failure|E02 Restricted|Resume Pending|TARGET M12|Retry Mutation|Retry Reservation|Reserve Again|create_order again|reserve_inventory again|update_order again/i;
  for (const clone of clones.values()) for (const node of reactionNodes(clone)) for (const reaction of node.reactions) {
    for (const action of [...(reaction.actions ?? []), ...(reaction.action ? [reaction.action] : [])]) {
      if (action.type !== 'NODE') continue;
      const dest = action.destinationId ? await figma.getNodeByIdAsync(action.destinationId) : null;
      if (!dest || forbidden.test(dest.name)) { destinationsValid = false; broken++; }
    }
  }
  record('Broken / prohibited destinations', destinationsValid,
    'Flow 5 contains a broken or prohibited Processing, Confirmed, retry, Known Failure, E02, or Resume destination.');
  record('Explicit END', section.children.some(n => n.name === FLOW5_BOARD.end.name && n.type === 'TEXT' &&
    n.characters.includes('Reconciliation / human review is the final scenario state.')),
    'END does not explicitly identify reconciliation / human review as the endpoint.');
  return { issues, broken, checks, strategy };
}
