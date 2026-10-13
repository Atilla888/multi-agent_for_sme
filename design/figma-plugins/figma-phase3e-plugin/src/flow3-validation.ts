import { FLOW3_BOARD, cloneName } from './constants';
import { visibleOrderLink } from './flow2-validation';
import { visualSignature } from './prototype-utils';

export type FlowThreeStrategy = 'PRODUCT CONTROL' | 'PROTOTYPE CONTROL';
export type FlowThreeCheck = { issues: string[]; broken: number; checks: { name: string; passed: boolean }[]; strategy: FlowThreeStrategy | null };

const KEYS = ['Known Failure', 'Reservation Failed'] as const;
const ANNOTATIONS = [FLOW3_BOARD.start, FLOW3_BOARD.step1, FLOW3_BOARD.confirmedFailure,
  FLOW3_BOARD.knownBoundary, FLOW3_BOARD.noReconciliation, FLOW3_BOARD.step2,
  FLOW3_BOARD.orderBoundary, FLOW3_BOARD.inventoryBoundary, FLOW3_BOARD.recovery, FLOW3_BOARD.end] as const;

type ReactionNode = SceneNode & ReactionMixin;
function reactionNodes(frame: FrameNode): ReactionNode[] {
  return [frame, ...frame.findAll(n => 'reactions' in n)] as ReactionNode[];
}
function copyReactionsPreserved(source: FrameNode, clone: FrameNode, added?: string): boolean {
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
  if (node.reactions.length !== 1) return `expected one Open Order reaction, found ${node.reactions.length}`;
  const reaction = node.reactions[0];
  if (reaction.trigger?.type !== 'ON_CLICK') return 'Open Order trigger must be ON_CLICK';
  if (reaction.actions !== undefined && reaction.actions.length !== 1) return 'Open Order must have exactly one action';
  const actions = reaction.actions === undefined ? reaction.action ? [reaction.action] : [] : reaction.actions;
  if (actions.length !== 1) return 'Open Order NODE action missing';
  for (const action of [...actions, ...(reaction.action && reaction.actions !== undefined ? [reaction.action] : [])]) {
    if (action.type !== 'NODE' || action.navigation !== 'NAVIGATE') return 'Open Order must use NODE/NAVIGATE';
    if (action.destinationId !== destinationId) return `Open Order destination must be fresh Reservation Failed ${destinationId}`;
    if (action.transition != null) return 'Open Order animation is forbidden';
  }
  if (!await figma.getNodeByIdAsync(destinationId)) return 'Open Order destination is broken';
  return null;
}

function externalControl(section: SectionNode, from: FrameNode, to: FrameNode): FrameNode | null {
  const matches = section.children.filter(n => n.name === FLOW3_BOARD.orderControl.name);
  if (matches.length !== 1 || matches[0].type !== 'FRAME') return null;
  const control = matches[0] as FrameNode;
  const labels = control.children;
  if (!control.visible || control.opacity <= 0 || control.width < 250 || control.height < 70 ||
    control.x < from.x + from.width || control.x + control.width > to.x || labels.length !== 2 ||
    labels.filter(n => n.name === 'Prototype-only marker' && n.type === 'TEXT' && n.characters === FLOW3_BOARD.orderControl.marker).length !== 1 ||
    labels.filter(n => n.name === 'Continue scenario label' && n.type === 'TEXT' && n.characters === FLOW3_BOARD.orderControl.text).length !== 1 ||
    control.fills === figma.mixed || !control.fills.some(p => p.type === 'SOLID' && p.visible !== false && (p.opacity ?? 1) > 0)) return null;
  return control;
}

function textIn(frame: FrameNode): string {
  return frame.findAll(n => n.type === 'TEXT').map(n => (n as TextNode).characters).join(' ').toLowerCase();
}

export async function checkFlowThree(section: SectionNode, sources: Map<string, FrameNode>): Promise<FlowThreeCheck> {
  const issues: string[] = [];
  const checks: FlowThreeCheck['checks'] = [];
  let broken = 0;
  const record = (name: string, ok: boolean, detail = name): void => {
    checks.push({ name, passed: ok });
    if (!ok) issues.push(detail);
  };
  const allowed = new Set([...KEYS.map(key => cloneName(3, key)), ...ANNOTATIONS.map(a => a.name),
    FLOW3_BOARD.orderSource.name, FLOW3_BOARD.orderControl.name]);
  record('Generated-node ownership', section.children.every(n => allowed.has(n.name)), 'Unexpected node inside generated Flow 3 section.');
  const clones = new Map<string, FrameNode>();
  for (const key of KEYS) {
    const exact = section.children.filter(n => n.name === cloneName(3, key));
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
  const conversation = clones.get('Known Failure');
  const order = clones.get('Reservation Failed');
  if (!conversation || !order) return { issues, broken, checks, strategy: null };
  record('Left-to-right known-failure scenario', conversation.x + conversation.width < order.x,
    'Known Failure and Reservation Failed frames are not ordered left to right.');
  const conversationText = textIn(conversation);
  const orderText = textIn(order);
  record('Known Failure ≠ OUTCOME_UNKNOWN', conversationText.includes('reservation failed') &&
    conversationText.includes('inventory was not reserved') && !conversationText.includes('outcome_unknown') &&
    orderText.includes('known failure') && orderText.includes('reservation failed') && !orderText.includes('outcome_unknown'),
    'Approved clones do not show a confirmed, known reservation failure distinct from OUTCOME_UNKNOWN.');
  record('No reconciliation requirement', !/reconciliation required|must reconcile|reconcile authoritative/i.test(conversationText + ' ' + orderText),
    'Known-failure product copy incorrectly requires reconciliation.');
  record('Order State ≠ Reservation State', orderText.includes('order state') && orderText.includes('reservation state') &&
    orderText.includes('created') && orderText.includes('known failure'),
    'Order detail lacks separate Created Order and Known Failure reservation states.');
  record('Safe authorized recovery', conversationText.includes('review current inventory') &&
    orderText.includes('review current inventory') && orderText.includes('authorized recovery'),
    'Approved source lacks safe, authorized recovery guidance.');
  const allExternal = section.children.filter(n => n.type === 'TEXT').map(n => (n as TextNode).characters).join(' ');
  const unsafeRetry = /retry(?:\s+reservation)?\s+automatically|automatic\s+(?:mutation\s+)?retry|reserve\s+again|repeat\s+mutation/i;
  record('No automatic retry', !unsafeRetry.test(allExternal) && !unsafeRetry.test(conversationText + ' ' + orderText),
    'Flow 3 implies an automatic mutation retry.');

  const productLink = visibleOrderLink(conversation);
  const sourceLink = sources.get('Known Failure') && visibleOrderLink(sources.get('Known Failure')!);
  const externalMatches = section.children.filter(n => n.name === FLOW3_BOARD.orderControl.name);
  const productLabels = section.children.filter(n => n.name === FLOW3_BOARD.orderSource.name);
  let strategy: FlowThreeStrategy | null = null;
  if (externalMatches.length === 0 && productLabels.length === 1 && productLabels[0].type === 'TEXT' &&
    productLabels[0].characters === FLOW3_BOARD.orderSource.text && productLink && sourceLink && sourceLink.reactions.length === 0) {
    strategy = 'PRODUCT CONTROL';
    const error = await reactionError(productLink, order.id);
    record('Open Order navigation', !error, error ?? undefined);
    if (error) broken++;
  } else if (externalMatches.length === 1 && productLabels.length === 0) {
    strategy = 'PROTOTYPE CONTROL';
    const control = externalControl(section, conversation, order);
    record('External Open Order control', Boolean(control), 'Visible external Open Order control missing or misplaced.');
    if (control) {
      const error = await reactionError(control, order.id);
      record('Open Order navigation', !error, error ?? undefined);
      if (error) broken++;
    }
  } else record('Open Order navigation', false, 'Open Order progression is missing, duplicate, or ambiguous.');

  for (const key of KEYS) {
    const source = sources.get(key);
    const clone = clones.get(key)!;
    const exception = key === 'Known Failure' && strategy === 'PRODUCT CONTROL' ? productLink?.id : undefined;
    record(`${key} source reactions`, Boolean(source) && copyReactionsPreserved(source!, clone, exception),
      `${key}: source reactions changed or unauthorized Phase 3E reaction added inside product clone.`);
  }
  let destinationsValid = true;
  for (const clone of clones.values()) for (const node of reactionNodes(clone)) for (const reaction of node.reactions) {
    for (const action of [...(reaction.actions ?? []), ...(reaction.action ? [reaction.action] : [])]) {
      if (action.type !== 'NODE') continue;
      const dest = action.destinationId ? await figma.getNodeByIdAsync(action.destinationId) : null;
      if (!dest || /OUTCOME_UNKNOWN|Reconciliation Required|Processing|Reservation Confirmed|Retry Reservation|automatic retry|Reserve Again|Repeat Mutation/i.test(dest.name)) {
        destinationsValid = false; broken++;
      }
    }
  }
  for (const control of externalMatches) for (const reaction of ('reactions' in control ? control.reactions : [])) {
    for (const action of [...(reaction.actions ?? []), ...(reaction.action ? [reaction.action] : [])]) {
      if (action.type !== 'NODE') continue;
      const dest = action.destinationId ? await figma.getNodeByIdAsync(action.destinationId) : null;
      if (!dest || /OUTCOME_UNKNOWN|Reconciliation Required|Processing|Reservation Confirmed|Retry Reservation|automatic retry|Reserve Again|Repeat Mutation/i.test(dest.name)) {
        destinationsValid = false; broken++;
      }
    }
  }
  record('Broken destinations', destinationsValid, 'Flow 3 contains a broken or prohibited destination.');
  record('Explicit END', section.children.some(n => n.name === FLOW3_BOARD.end.name && n.type === 'TEXT' &&
    n.characters.includes('Reservation Failed is the final scenario state.')),
    'END does not explicitly identify Reservation Failed as the final state.');
  return { issues, broken, checks, strategy };
}
