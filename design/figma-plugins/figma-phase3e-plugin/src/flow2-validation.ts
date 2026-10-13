import { FLOW2_BOARD, cloneName } from './constants';
import { visualSignature } from './prototype-utils';

export type FlowTwoStrategy = 'PRODUCT CONTROL' | 'PROTOTYPE CONTROL';
export type FlowTwoCheck = {
  issues: string[];
  broken: number;
  checks: { name: string; passed: boolean }[];
  strategy: FlowTwoStrategy | null;
};

const KEYS = ['Awaiting Confirmation', 'Processing', 'Confirmed Result', 'Reservation Confirmed'] as const;
const TEXT_ITEMS = [FLOW2_BOARD.start, FLOW2_BOARD.step1, FLOW2_BOARD.proposalBoundary,
  FLOW2_BOARD.step2, FLOW2_BOARD.processingNote, FLOW2_BOARD.step3, FLOW2_BOARD.confirmedNote,
  FLOW2_BOARD.step4, FLOW2_BOARD.orderBoundary, FLOW2_BOARD.deliveryBoundary,
  FLOW2_BOARD.backendBoundary, FLOW2_BOARD.end] as const;

function reactionNodes(frame: FrameNode): (SceneNode & ReactionMixin)[] {
  return [frame, ...frame.findAll(n => 'reactions' in n)] as (SceneNode & ReactionMixin)[];
}

function textIn(frame: FrameNode): string {
  return frame.findAll(n => n.type === 'TEXT').map(n => (n as TextNode).characters).join(' ').toLowerCase();
}

export function visibleOrderLink(frame: FrameNode): (TextNode & ReactionMixin) | null {
  const matches = frame.findAll(n => n.name === 'Order link' && n.type === 'TEXT') as (TextNode & ReactionMixin)[];
  if (matches.length !== 1 || !/open\s+order/i.test(matches[0].characters) || typeof matches[0].setReactionsAsync !== 'function') return null;
  let current: BaseNode | null = matches[0];
  while (current && current.id !== frame.parent?.id) {
    if ('visible' in current && !current.visible) return null;
    if ('opacity' in current && current.opacity <= 0) return null;
    if (current.id === frame.id) break;
    current = current.parent;
  }
  return matches[0];
}

function sourceReactionsPreserved(source: FrameNode, clone: FrameNode, allowedAddedId?: string): boolean {
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
    if (copies[i].id === allowedAddedId && expected.length === 0 && copies[i].reactions.length === 1) continue;
    if (JSON.stringify(expected) !== JSON.stringify(copies[i].reactions)) return false;
  }
  return true;
}

async function expectedReaction(node: SceneNode & ReactionMixin, destinationId: string): Promise<string | null> {
  const reactions = node.reactions;
  if (reactions.length !== 1) return `expected exactly one reaction, found ${reactions.length}`;
  const reaction = reactions[0];
  if (reaction.trigger?.type !== 'ON_CLICK') return `expected ON_CLICK, got ${reaction.trigger?.type ?? 'missing'}`;
  if (reaction.actions !== undefined && reaction.actions.length !== 1) return `expected exactly one action, found ${reaction.actions.length}`;
  const actions = reaction.actions === undefined ? reaction.action ? [reaction.action] : [] : reaction.actions;
  if (actions.length !== 1) return 'NODE/NAVIGATE action missing';
  for (const action of [...actions, ...(reaction.action && reaction.actions !== undefined ? [reaction.action] : [])]) {
    if (action.type !== 'NODE') return `expected NODE, got ${action.type}`;
    if (action.navigation !== 'NAVIGATE') return `expected NAVIGATE, got ${action.navigation}`;
    if (action.destinationId !== destinationId) return `expected destination ${destinationId}, got ${action.destinationId ?? 'missing'}`;
    if (action.transition != null) return `animated transition ${JSON.stringify(action.transition)} is forbidden`;
  }
  if (!await figma.getNodeByIdAsync(destinationId)) return `destination ${destinationId} is broken`;
  return null;
}

function externalControl(section: SectionNode, name: string, marker: string, label: string, from: FrameNode, to: FrameNode): FrameNode | null {
  const matches = section.children.filter(n => n.name === name);
  if (matches.length !== 1 || matches[0].type !== 'FRAME') return null;
  const control = matches[0] as FrameNode;
  const text = control.findAll(n => n.type === 'TEXT').map(n => (n as TextNode).characters);
  const ownedLabels = control.children.length === 2 &&
    control.children.filter(n => n.name === 'Prototype-only marker' && n.type === 'TEXT').length === 1 &&
    control.children.filter(n => n.name === 'Continue scenario label' && n.type === 'TEXT').length === 1;
  const fill = control.fills !== figma.mixed && control.fills.some(p => p.type === 'SOLID' && p.visible !== false && (p.opacity ?? 1) > 0);
  if (!control.visible || control.opacity <= 0 || !fill || !ownedLabels || control.width < 250 || control.height < 70 ||
    control.x < from.x + from.width || control.x + control.width > to.x || !text.includes(marker) || !text.includes(label)) return null;
  return control;
}

export async function checkFlowTwo(section: SectionNode, sources: Map<string, FrameNode>): Promise<FlowTwoCheck> {
  const issues: string[] = [];
  const checks: FlowTwoCheck['checks'] = [];
  let broken = 0;
  const record = (name: string, passed: boolean, detail = name): void => {
    checks.push({ name, passed });
    if (!passed) issues.push(detail);
  };
  const allowed = new Set([...KEYS.map(key => cloneName(2, key)), ...TEXT_ITEMS.map(item => item.name),
    FLOW2_BOARD.confirmation.name, FLOW2_BOARD.processingComplete.name, FLOW2_BOARD.orderSource.name, FLOW2_BOARD.orderControl.name]);
  record('Generated-node ownership', section.children.every(n => allowed.has(n.name)), 'Unexpected node inside generated Flow 2 section.');
  const clones = new Map<string, FrameNode>();
  for (const key of KEYS) {
    const exact = section.children.filter(n => n.name === cloneName(2, key));
    if (exact.length === 1 && exact[0].type === 'FRAME') clones.set(key, exact[0] as FrameNode);
    record(`${key} source`, exact.length === 1 && exact[0].type === 'FRAME' && Boolean(sources.get(key)) &&
      visualSignature(exact[0] as FrameNode) === visualSignature(sources.get(key)!), `${key}: fresh 03D clone missing, duplicate, wrong type, or visually changed.`);
  }
  for (const item of TEXT_ITEMS) {
    const exact = section.children.filter(n => n.name === item.name);
    record(item.name, exact.length === 1 && exact[0].type === 'TEXT' && exact[0].characters.trim() === item.text.trim(), `Missing/wrong external annotation: ${item.name}`);
  }
  const [awaiting, processing, confirmed, order] = KEYS.map(key => clones.get(key));
  if (!awaiting || !processing || !confirmed || !order) return { issues, broken, checks, strategy: null };

  record('Left-to-right scenario sequence', awaiting.x + awaiting.width < processing.x && processing.x + processing.width < confirmed.x &&
    confirmed.x + confirmed.width < order.x, 'Scenario frames are not ordered Awaiting → Processing → Confirmed → Order.');
  const confirmation = externalControl(section, FLOW2_BOARD.confirmation.name, FLOW2_BOARD.confirmation.marker,
    FLOW2_BOARD.confirmation.text, awaiting, processing);
  record('Explicit customer-confirmation boundary', Boolean(confirmation), 'Visible external customer-confirmation control missing or misplaced.');
  if (confirmation) {
    const error = await expectedReaction(confirmation, processing.id);
    record('Customer confirmation → Processing', !error, error ?? undefined);
    if (error) broken++;
  }
  const processingControl = externalControl(section, FLOW2_BOARD.processingComplete.name, FLOW2_BOARD.processingComplete.marker,
    FLOW2_BOARD.processingComplete.text, processing, confirmed);
  record('External processing-result boundary', Boolean(processingControl), 'Visible external business-result control missing or misplaced.');
  if (processingControl) {
    const error = await expectedReaction(processingControl, confirmed.id);
    record('Processing → Confirmed Result', !error, error ?? undefined);
    if (error) broken++;
  }

  const productLink = visibleOrderLink(confirmed);
  const externalMatches = section.children.filter(n => n.name === FLOW2_BOARD.orderControl.name);
  const productLabel = section.children.filter(n => n.name === FLOW2_BOARD.orderSource.name);
  let strategy: FlowTwoStrategy | null = null;
  if (externalMatches.length === 0 && productLabel.length === 1 && productLabel[0].type === 'TEXT' &&
    productLabel[0].characters === FLOW2_BOARD.orderSource.text && productLink &&
    visibleOrderLink(sources.get('Confirmed Result')! )?.reactions.length === 0) {
    strategy = 'PRODUCT CONTROL';
    const error = await expectedReaction(productLink, order.id);
    record('Open Order navigation', !error, error ?? undefined);
    if (error) broken++;
  } else if (externalMatches.length === 1 && productLabel.length === 0) {
    strategy = 'PROTOTYPE CONTROL';
    const control = externalControl(section, FLOW2_BOARD.orderControl.name, FLOW2_BOARD.orderControl.marker,
      FLOW2_BOARD.orderControl.text, confirmed, order);
    record('External Open Order control', Boolean(control), 'Visible external Open Order control missing or misplaced.');
    if (control) {
      const error = await expectedReaction(control, order.id);
      record('Open Order navigation', !error, error ?? undefined);
      if (error) broken++;
    }
  } else record('Open Order navigation', false, 'Open Order progression is missing, duplicated, or has ambiguous ownership.');

  for (const key of KEYS) {
    const source = sources.get(key);
    const clone = clones.get(key)!;
    const exception = key === 'Confirmed Result' && strategy === 'PRODUCT CONTROL' ? productLink?.id : undefined;
    record(`${key} source reactions`, source ? sourceReactionsPreserved(source, clone, exception) : false,
      `${key}: source reactions changed or unauthorized Phase 3E reaction added inside product clone.`);
    for (const node of reactionNodes(clone)) for (const reaction of node.reactions) {
      for (const action of [...(reaction.actions ?? []), ...(reaction.action ? [reaction.action] : [])]) {
        if (action.type === 'NODE' && (!action.destinationId || !await figma.getNodeByIdAsync(action.destinationId))) {
          issues.push(`Broken inherited/product reaction destination on ${node.name}.`); broken++;
        }
      }
    }
  }
  const proposal = textIn(awaiting);
  const pending = textIn(processing);
  const result = textIn(confirmed);
  const detail = textIn(order);
  record('Proposal ≠ execution', proposal.includes('confirm') && (proposal.includes('proposed') || proposal.includes('proposal')) &&
    (proposal.includes('not executed') || proposal.includes('before action')), 'Awaiting source does not show a pre-execution proposal/confirmation boundary.');
  record('Processing ≠ confirmed', pending.includes('processing') && (pending.includes('pending') || pending.includes('not yet known')),
    'Processing source does not show a pending, unconfirmed result.');
  record('Confirmed business facts', result.includes('order') && result.includes('reservation confirmed'),
    'Confirmed Result source lacks independent Order and confirmed reservation facts.');
  record('Order State ≠ Reservation State', detail.includes('order state') && detail.includes('reservation state') &&
    detail.includes('created') && detail.includes('confirmed'), 'Order detail lacks separate Created Order and Confirmed Reservation states.');
  record('Message delivery ≠ business effect', section.children.some(n => n.name === FLOW2_BOARD.deliveryBoundary.name && n.type === 'TEXT' && n.characters === FLOW2_BOARD.deliveryBoundary.text),
    'Message delivery/business effect boundary missing.');
  return { issues, broken, checks, strategy };
}
