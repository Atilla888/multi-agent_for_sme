import { FLOW8_BOARD, cloneName } from './constants';
import { visualSignature } from './prototype-utils';

export type FlowEightRetryStrategy = 'PRODUCT CONTROL' | 'PROTOTYPE CONTROL';
export type FlowEightCheck = {
  issues: string[];
  broken: number;
  checks: { name: string; passed: boolean }[];
  retryStrategy: FlowEightRetryStrategy | null;
};
type ReactionNode = SceneNode & ReactionMixin;
const KEYS = ['Confirmation Required', 'Processing', 'Confirmed Result', 'Message Delivery Failure'] as const;
const NOTES = [FLOW8_BOARD.start, FLOW8_BOARD.step1, FLOW8_BOARD.proposalBoundary,
  FLOW8_BOARD.confirmSource, FLOW8_BOARD.customerAuthorization, FLOW8_BOARD.step2,
  FLOW8_BOARD.processingBoundary, FLOW8_BOARD.step3, FLOW8_BOARD.confirmedBoundary,
  FLOW8_BOARD.primaryEnd, FLOW8_BOARD.branch, FLOW8_BOARD.step4,
  FLOW8_BOARD.deliveryBoundary, FLOW8_BOARD.businessBoundary, FLOW8_BOARD.noReplay,
  FLOW8_BOARD.recoveryNote, FLOW8_BOARD.recoveryEnd] as const;

function allText(node: SceneNode): string {
  return [node.type === 'TEXT' ? node.characters : '', ...('findAll' in node
    ? node.findAll(n => n.type === 'TEXT').map(n => (n as TextNode).characters) : [])].join(' ').toLowerCase();
}
function reactionNodes(frame: FrameNode): ReactionNode[] {
  return [frame, ...frame.findAll(n => 'reactions' in n)] as ReactionNode[];
}

export function approvedCustomerControl(frame: FrameNode, name: 'Confirm order / focus' | 'Retry message action / focus', label: string): FrameNode & ReactionMixin | null {
  const matches = frame.findAll(n => n.type === 'FRAME' && n.name === name &&
    n.width >= 200 && n.height >= 44 &&
    n.findAll(child => child.type === 'TEXT' && child.name === 'Action label').some(child =>
      (child as TextNode).characters.trim().toLowerCase() === label.toLowerCase()) &&
    typeof n.setReactionsAsync === 'function') as (FrameNode & ReactionMixin)[];
  const visible = matches.filter(node => {
    let current: BaseNode | null = node;
    while (current) {
      if ('visible' in current && !current.visible) return false;
      if ('opacity' in current && current.opacity <= 0) return false;
      if (current.id === frame.id) break;
      current = current.parent;
    }
    return true;
  });
  return visible.length === 1 ? visible[0] : null;
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
    node.width >= 300 && node.height >= 75 && node.children.length === 2 &&
    node.children.filter(n => n.name === 'Prototype-only marker' && n.type === 'TEXT' && n.characters === item.marker).length === 1 &&
    node.children.filter(n => n.name === 'Continue scenario label' && n.type === 'TEXT' && n.characters === item.text).length === 1 &&
    node.fills !== figma.mixed && node.fills.some(p => p.type === 'SOLID' && p.visible !== false && (p.opacity ?? 1) > 0));
}

function withinMobileFrame(node: FrameNode, frame: FrameNode): boolean {
  let x = 0, y = 0;
  let current: BaseNode | null = node;
  while (current && current.id !== frame.id) {
    if (!('x' in current && 'y' in current)) return false;
    x += current.x; y += current.y;
    current = current.parent;
  }
  return Boolean(current && x >= 0 && y >= 0 && x + node.width <= frame.width + 1 && y + node.height <= frame.height + 1);
}

export async function checkFlowEight(section: SectionNode, sources: Map<string, FrameNode>): Promise<FlowEightCheck> {
  const issues: string[] = [];
  const checks: FlowEightCheck['checks'] = [];
  let broken = 0;
  let retryStrategy: FlowEightRetryStrategy | null = null;
  const record = (name: string, passed: boolean, detail = name): void => {
    checks.push({ name, passed });
    if (!passed) issues.push(detail);
  };
  const allowed = new Set([...KEYS.map(key => cloneName(8, key)), ...Object.values(FLOW8_BOARD).map(item => item.name)]);
  record('Generated-node ownership', section.children.every(n => allowed.has(n.name)), 'Unexpected node inside generated Flow 8 section.');
  const clones = new Map<string, FrameNode>();
  for (const key of KEYS) {
    const exact = section.children.filter(n => n.name === cloneName(8, key));
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
  const confirmation = clones.get('Confirmation Required');
  const processing = clones.get('Processing');
  const confirmed = clones.get('Confirmed Result');
  const delivery = clones.get('Message Delivery Failure');
  if (!confirmation || !processing || !confirmed || !delivery) return { issues, broken, checks, retryStrategy };
  const confirmationText = allText(confirmation);
  const processingText = allText(processing);
  const confirmedText = allText(confirmed);
  const deliveryText = allText(delivery);
  const forbiddenCustomer = /\b(?:toolcall|tool executor|agent run|langgraph|outcome_unknown|e02|m12|internal confidence|authorization logic|transport failure|mutation committed|idempotency)\b|revision\s*(?:id|#)/i;
  record('Customer-only surface', [...clones.values()].every(frame => !forbiddenCustomer.test(allText(frame))) &&
    [...clones.values()].every(frame => frame.findAll(n => n.name === 'Staff navigation').length === 0),
    'Customer Web Chat product UI exposes internal/staff terminology.');
  record('Proposal ≠ Execution', confirmationText.includes('confirmation required') &&
    confirmationText.includes('if you confirm, we will place this order') &&
    !confirmationText.includes('order created') &&
    section.children.some(n => n.name === FLOW8_BOARD.proposalBoundary.name && n.type === 'TEXT' && n.characters === FLOW8_BOARD.proposalBoundary.text),
    'Confirmation Required must remain a proposal before customer authorization.');
  const sourceConfirm = approvedCustomerControl(sources.get('Confirmation Required')!, 'Confirm order / focus', 'Confirm order');
  const confirm = approvedCustomerControl(confirmation, 'Confirm order / focus', 'Confirm order');
  record('Explicit Confirm order', Boolean(sourceConfirm && confirm && sourceConfirm.reactions.length === 0 &&
    section.children.some(n => n.name === FLOW8_BOARD.confirmSource.name && n.type === 'TEXT' && n.characters === FLOW8_BOARD.confirmSource.text)),
    'Visible approved Confirm order PRODUCT CONTROL is missing, ambiguous or pre-reactive.');
  const confirmError = confirm ? await reactionError(confirm, processing.id) : 'Confirm order PRODUCT CONTROL missing';
  record('Confirm order → Processing', !confirmError, confirmError ?? undefined);
  if (confirmError) broken++;
  record('Customer authorization before Processing', !confirmError &&
    confirmation.x + confirmation.width < processing.x &&
    section.children.some(n => n.name === FLOW8_BOARD.customerAuthorization.name && n.type === 'TEXT' &&
      n.characters === FLOW8_BOARD.customerAuthorization.text),
    'Processing must follow explicit customer authorization, never AI or operator self-confirmation.');
  record('Change details preserved', Boolean(confirmation.findAll(n => n.name === 'Change details action').length === 1 &&
    confirmationText.includes('change details')), 'Approved Change details action was lost.');
  record('Processing ≠ Confirmed Result', processingText.includes('processing') &&
    processingText.includes('no further action is needed') &&
    !processingText.includes('order created') && !processingText.includes('item reserved') &&
    section.children.some(n => n.name === FLOW8_BOARD.processingBoundary.name && n.type === 'TEXT' && n.characters === FLOW8_BOARD.processingBoundary.text),
    'Processing must not claim a confirmed business effect or invent a customer completion action.');
  const resultMatches = section.children.filter(n => n.name === FLOW8_BOARD.resultControl.name);
  const resultControl = resultMatches.length === 1 && externalControl(resultMatches[0], FLOW8_BOARD.resultControl)
    ? resultMatches[0] as FrameNode : null;
  record('Processing → Confirmed Result external control', Boolean(resultControl && resultControl.x >= processing.x + processing.width &&
    resultControl.x + resultControl.width <= confirmed.x),
    'System-result progression must use a visible external prototype control.');
  const resultError = resultControl ? await reactionError(resultControl, confirmed.id) : 'System-result progression control missing';
  record('Processing → Confirmed Result', !resultError, resultError ?? undefined);
  if (resultError) broken++;
  record('Confirmed business result', confirmedText.includes('order created') && confirmedText.includes('item reserved') &&
    confirmedText.includes('order ord-1042'),
    'Confirmed Result must present distinct customer-safe Order and Reservation facts.');
  record('Primary END', section.children.some(n => n.name === FLOW8_BOARD.primaryEnd.name &&
    n.type === 'TEXT' && n.characters === FLOW8_BOARD.primaryEnd.text),
    'Purchase-success END annotation is missing.');
  const branchMatches = section.children.filter(n => n.name === FLOW8_BOARD.branchControl.name);
  const branchControl = branchMatches.length === 1 && externalControl(branchMatches[0], FLOW8_BOARD.branchControl)
    ? branchMatches[0] as FrameNode : null;
  record('Message-delivery branch', Boolean(branchControl && delivery.y > Math.max(confirmation.y + confirmation.height,
    processing.y + processing.height, confirmed.y + confirmed.height) + 300 &&
    branchControl.y > confirmed.y + confirmed.height && branchControl.y + branchControl.height < delivery.y &&
    section.children.some(n => n.name === FLOW8_BOARD.branch.name && n.type === 'TEXT' && n.characters === FLOW8_BOARD.branch.text)),
    'Delivery failure branch must start externally after an already confirmed business effect.');
  const branchError = branchControl ? await reactionError(branchControl, delivery.id) : 'Delivery-failure branch control missing';
  record('Confirmed Result → Message Delivery Failure', !branchError, branchError ?? undefined);
  if (branchError) broken++;
  record('Business effect remains confirmed', deliveryText.includes('reservation remains confirmed') &&
    deliveryText.includes('your order was created') &&
    deliveryText.includes('not delivered') &&
    section.children.some(n => n.name === FLOW8_BOARD.businessBoundary.name && n.type === 'TEXT' && n.characters === FLOW8_BOARD.businessBoundary.text),
    'Delivery failure must retain the known confirmed business effect.');
  record('Message Delivery Failure ≠ Business Action Failure', deliveryText.includes('only your message needs attention') &&
    section.children.some(n => n.name === FLOW8_BOARD.deliveryBoundary.name && n.type === 'TEXT' && n.characters === FLOW8_BOARD.deliveryBoundary.text),
    'Communication failure must not become Order or Reservation failure.');

  const sourceRetry = approvedCustomerControl(sources.get('Message Delivery Failure')!, 'Retry message action / focus', 'Retry message');
  const retry = approvedCustomerControl(delivery, 'Retry message action / focus', 'Retry message');
  const retrySourceNotes = section.children.filter(n => n.name === FLOW8_BOARD.retrySource.name);
  const retryMatches = section.children.filter(n => n.name === FLOW8_BOARD.retryControl.name);
  let retryControl: ReactionNode | null = null;
  if (sourceRetry && sourceRetry.reactions.length === 0 && retry &&
    retrySourceNotes.length === 1 && retrySourceNotes[0].type === 'TEXT' &&
    retrySourceNotes[0].characters === FLOW8_BOARD.retrySource.text && retryMatches.length === 0) {
    retryStrategy = 'PRODUCT CONTROL'; retryControl = retry;
  } else if (retrySourceNotes.length === 0 && retryMatches.length === 1 &&
    externalControl(retryMatches[0], FLOW8_BOARD.retryControl)) {
    retryStrategy = 'PROTOTYPE CONTROL'; retryControl = retryMatches[0] as ReactionNode;
    record('External Retry message control', retryControl.visible && retryControl.x >= delivery.x + delivery.width,
      'Fallback Retry message control must be visible outside customer product UI.');
  } else record('Retry message strategy', false, 'Message retry source is missing or ambiguous.');
  const retryError = retryControl ? await reactionError(retryControl, confirmed.id) : 'Retry message progression missing';
  record('Retry message only', !retryError && Boolean(retryStrategy), retryError ?? 'Retry message source unresolved');
  if (retryError) broken++;
  record('Recovery to existing Confirmed Result', !retryError &&
    section.children.some(n => n.name === FLOW8_BOARD.recoveryNote.name && n.type === 'TEXT' && n.characters === FLOW8_BOARD.recoveryNote.text),
    'Communication retry must return to the existing confirmed business state only.');
  record('Message recovery END', section.children.some(n => n.name === FLOW8_BOARD.recoveryEnd.name &&
    n.type === 'TEXT' && n.characters === FLOW8_BOARD.recoveryEnd.text),
    'Message-recovery END annotation is missing.');
  record('No duplicate Order', section.children.some(n => n.name === FLOW8_BOARD.noReplay.name &&
    n.type === 'TEXT' && n.characters === FLOW8_BOARD.noReplay.text) &&
    !/create_order again|repeat(?: the)? order|duplicate order creation/i.test(deliveryText),
    'Message retry would create a duplicate Order.');
  record('No duplicate Reservation', !/reserve_inventory again|repeat(?: the)? reservation|duplicate reservation attempt/i.test(deliveryText),
    'Message retry would repeat the Reservation.');

  for (const key of KEYS) {
    const source = sources.get(key)!;
    const clone = clones.get(key)!;
    const added = key === 'Confirmation Required' ? confirm?.id : key === 'Message Delivery Failure' && retryStrategy === 'PRODUCT CONTROL' ? retry?.id : undefined;
    record(`${key} source reactions`, sourceReactionsPreserved(source, clone, added),
      `${key}: source reactions changed or unrelated customer UI received scenario progression.`);
  }
  const controls = [confirm, retry, section.children.find(n => n.name === FLOW8_BOARD.resultControl.name),
    section.children.find(n => n.name === FLOW8_BOARD.branchControl.name)].filter((n): n is FrameNode => Boolean(n && n.type === 'FRAME'));
  record('Mobile geometry', [...clones.values()].every(frame => frame.width >= 390 && frame.width <= 430 && frame.height >= 500) &&
    Boolean(confirm && withinMobileFrame(confirm, confirmation)) &&
    Boolean(retryStrategy !== 'PRODUCT CONTROL' || retry && withinMobileFrame(retry, delivery)) &&
    controls.every(node => node === confirm || node === retry || node.parent?.id === section.id),
    'Mobile frame/touch-target geometry or external annotation placement is invalid.');
  let validDestinations = true;
  let noReplay = true;
  const forbidden = /create_order|reserve_inventory|update_order|repeat (?:order|reservation)|retry (?:order|reservation)/i;
  for (const [key, frame] of clones) for (const node of reactionNodes(frame)) for (const reaction of node.reactions) {
    for (const action of [...(reaction.actions ?? []), ...(reaction.action ? [reaction.action] : [])]) {
      if (action.type !== 'NODE') continue;
      const dest = action.destinationId ? await figma.getNodeByIdAsync(action.destinationId) : null;
      const unsafe = !dest || forbidden.test(dest.name) ||
        (key === 'Message Delivery Failure' && /Processing|Confirmation Required/i.test(dest.name)) ||
        (key === 'Confirmation Required' && /Confirmed Result|Message Delivery Failure/i.test(dest.name)) ||
        (key === 'Confirmed Result' && dest.id === delivery.id);
      if (unsafe) {
        validDestinations = false; broken++;
        if (dest && (forbidden.test(dest.name) || (key === 'Message Delivery Failure' && /Processing|Confirmation Required/i.test(dest.name)))) noReplay = false;
      }
    }
  }
  record('No business mutation replay', noReplay && validDestinations &&
    Boolean(retryControl && !confirmError && !resultError && !branchError && !retryError),
    'Message recovery replays or implies another business mutation.');
  record('Broken / prohibited destinations', validDestinations,
    'Web Chat flow contains a broken destination, confirmation bypass or prohibited replay.');
  return { issues, broken, checks, retryStrategy };
}
