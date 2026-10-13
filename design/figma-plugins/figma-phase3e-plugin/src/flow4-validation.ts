import { FLOW4_BOARD, cloneName } from './constants';
import { visualSignature } from './prototype-utils';

export type FlowFourStrategy = 'PRODUCT CONTROL' | 'PROTOTYPE CONTROL';
export type FlowFourCheck = {
  issues: string[]; broken: number; checks: { name: string; passed: boolean }[];
  strategies: { request: FlowFourStrategy | null; accept: FlowFourStrategy | null };
};
type ReactionNode = SceneNode & ReactionMixin;
type Step = 'request' | 'accept';
const KEYS = ['Support Active', 'Handoff', 'Sales Active'] as const;
const ANNOTATIONS = [FLOW4_BOARD.start, FLOW4_BOARD.step1, FLOW4_BOARD.supportNote,
  FLOW4_BOARD.step2, FLOW4_BOARD.handlerBoundary, FLOW4_BOARD.contextNote,
  FLOW4_BOARD.permissionBoundary, FLOW4_BOARD.step3, FLOW4_BOARD.salesNote,
  FLOW4_BOARD.authorizationNote, FLOW4_BOARD.end] as const;

function reactionNodes(frame: FrameNode): ReactionNode[] {
  return [frame, ...frame.findAll(n => 'reactions' in n)] as ReactionNode[];
}
function textIn(frame: FrameNode): string {
  return frame.findAll(n => n.type === 'TEXT').map(n => (n as TextNode).characters).join(' ').toLowerCase();
}
function namedText(frame: FrameNode, name: string): string | null {
  const contexts = frame.children.filter(n => n.type === 'FRAME' && n.name === 'Persistent Context Panel') as FrameNode[];
  if (contexts.length !== 1) return null;
  const matches = contexts[0].findAll(n => n.type === 'TEXT' && n.name === name) as TextNode[];
  return matches.length === 1 ? matches[0].characters.trim() : null;
}

export function approvedHandoffControl(frame: FrameNode, step: Step): (TextNode & ReactionMixin) | null {
  const acceptedName = step === 'request'
    ? /^(Request Sales handoff|Handoff to Sales|Request Sales involvement|Sales handoff action)$/i
    : /^(Accept handoff|Accept Sales handoff|Take ownership|Sales ownership action)$/i;
  const acceptedLabel = step === 'request'
    ? /^(request sales handoff|handoff to sales|request sales involvement)$/i
    : /^(accept(?: sales)? handoff|take ownership)$/i;
  const matches = frame.findAll(n => n.type === 'TEXT' && acceptedName.test(n.name) &&
    acceptedLabel.test((n as TextNode).characters.trim()) && typeof n.setReactionsAsync === 'function') as (TextNode & ReactionMixin)[];
  if (matches.length !== 1) return null;
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
  if (node.reactions.length !== 1) return `expected one progression reaction, found ${node.reactions.length}`;
  const reaction = node.reactions[0];
  if (reaction.trigger?.type !== 'ON_CLICK') return 'Progression trigger must be ON_CLICK';
  if (reaction.actions !== undefined && reaction.actions.length !== 1) return 'Progression must have exactly one action';
  const actions = reaction.actions === undefined ? reaction.action ? [reaction.action] : [] : reaction.actions;
  if (actions.length !== 1) return 'Progression NODE action missing';
  for (const action of [...actions, ...(reaction.action && reaction.actions !== undefined ? [reaction.action] : [])]) {
    if (action.type !== 'NODE' || action.navigation !== 'NAVIGATE') return 'Progression must use NODE/NAVIGATE';
    if (action.destinationId !== destinationId) return `Progression destination must be fresh clone ${destinationId}`;
    if (action.transition != null) return 'Animated progression is forbidden';
  }
  if (!await figma.getNodeByIdAsync(destinationId)) return 'Progression destination is broken';
  return null;
}

function externalControl(section: SectionNode, item: { name: string; marker: string; text: string }, from: FrameNode, to: FrameNode): FrameNode | null {
  const matches = section.children.filter(n => n.name === item.name);
  if (matches.length !== 1 || matches[0].type !== 'FRAME') return null;
  const control = matches[0] as FrameNode;
  if (!control.visible || control.opacity <= 0 || control.width < 250 || control.height < 70 ||
    control.x < from.x + from.width || control.x + control.width > to.x || control.children.length !== 2 ||
    control.children.filter(n => n.name === 'Prototype-only marker' && n.type === 'TEXT' && n.characters === item.marker).length !== 1 ||
    control.children.filter(n => n.name === 'Continue scenario label' && n.type === 'TEXT' && n.characters === item.text).length !== 1 ||
    control.fills === figma.mixed || !control.fills.some(p => p.type === 'SOLID' && p.visible !== false && (p.opacity ?? 1) > 0)) return null;
  return control;
}

export async function checkFlowFour(section: SectionNode, sources: Map<string, FrameNode>): Promise<FlowFourCheck> {
  const issues: string[] = [];
  const checks: FlowFourCheck['checks'] = [];
  let broken = 0;
  const strategies: FlowFourCheck['strategies'] = { request: null, accept: null };
  const record = (name: string, ok: boolean, detail = name): void => {
    checks.push({ name, passed: ok });
    if (!ok) issues.push(detail);
  };
  const allowed = new Set([...KEYS.map(key => cloneName(4, key)), ...ANNOTATIONS.map(a => a.name),
    FLOW4_BOARD.requestSource.name, FLOW4_BOARD.requestControl.name,
    FLOW4_BOARD.acceptSource.name, FLOW4_BOARD.acceptControl.name]);
  record('Generated-node ownership', section.children.every(n => allowed.has(n.name)), 'Unexpected node inside generated Flow 4 section.');
  const clones = new Map<string, FrameNode>();
  for (const key of KEYS) {
    const exact = section.children.filter(n => n.name === cloneName(4, key));
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
  const support = clones.get('Support Active');
  const handoff = clones.get('Handoff');
  const sales = clones.get('Sales Active');
  if (!support || !handoff || !sales) return { issues, broken, checks, strategies };
  record('Required Support → Handoff → Sales sequence', support.x + support.width < handoff.x &&
    handoff.x + handoff.width < sales.x, 'Flow 4 must pass through Handoff between Support and Sales.');
  const supportText = textIn(support);
  const handoffText = textIn(handoff);
  const salesText = textIn(sales);
  record('Support current handler', namedText(support, 'Handler name') === 'Support Agent' &&
    supportText.includes('support agent active') && supportText.includes('does not perform sales writes'),
    'Support Active must identify Support as current handler without Sales-write authority.');
  record('Previous handler Support', handoffText.includes('support agent → sales agent') &&
    handoffText.includes('reason:'), 'Handoff must identify previous Support handler and handoff reason.');
  record('Next handler Sales', handoffText.includes('support agent → sales agent') &&
    namedText(handoff, 'Handler name') === 'Sales Agent', 'Handoff must identify Sales as next handler.');
  const contextNames = ['Customer identity', 'Order heading', 'Availability', 'Freshness'];
  const commonFacts = contextNames.every(name => {
    const values = [support, handoff, sales].map(frame => namedText(frame, name));
    return values[0] !== null && values.every(value => value === values[0]);
  });
  const threadContent = [support, handoff, sales].map(frame => {
    const matches = frame.findAll(n => n.type === 'FRAME' && n.name === 'Message Thread') as FrameNode[];
    return matches.length === 1 ? matches[0].findAll(n => n.type === 'TEXT').map(n => (n as TextNode).characters).join('|') : null;
  });
  const commonConversation = threadContent[0] !== null && threadContent.every(value => value === threadContent[0]);
  record('Context preserved', commonFacts && commonConversation && handoffText.includes('verified customer and order context carried forward') &&
    handoffText.includes('remaining: sales reviews current facts'),
    'Customer/Order/Inventory context, reason, or remaining work was lost at handoff.');
  record('Handoff ≠ Permission Transfer', handoffText.includes('permissions do not transfer') &&
    !/handoff grants? (?:new |sales |support )?permissions?|permissions? (?:are |is )?transferred by handoff|inherits? (?:support|sales) permissions?/i.test(handoffText),
    'Handoff incorrectly implies permission transfer or automatic grant.');
  record('Sales current handler', namedText(sales, 'Handler name') === 'Sales Agent' &&
    salesText.includes('sales agent active') && salesText.includes('sales owns the current case'),
    'Sales Active must identify Sales as final current handler.');
  record('Authorization independently enforced', supportText.includes('does not perform sales writes') &&
    salesText.includes('requires trusted authorization') &&
    handoffText.includes('permissions do not transfer') &&
    !/handoff grants? (?:new |sales |support )?permissions?|bypass(?:es)? (?:tool executor |backend )?authorization/i.test(
      section.children.filter(n => n.type === 'TEXT').map(n => (n as TextNode).characters).join(' ')),
    'Flow 4 claims implicit permission escalation or bypasses independent authorization.');

  const steps: { key: Step; from: FrameNode; to: FrameNode; source: FrameNode; item: typeof FLOW4_BOARD.requestControl | typeof FLOW4_BOARD.acceptControl;
    sourceItem: typeof FLOW4_BOARD.requestSource | typeof FLOW4_BOARD.acceptSource; label: string }[] = [
    { key: 'request', from: support, to: handoff, source: sources.get('Support Active')!, item: FLOW4_BOARD.requestControl,
      sourceItem: FLOW4_BOARD.requestSource, label: 'Support → Handoff navigation' },
    { key: 'accept', from: handoff, to: sales, source: sources.get('Handoff')!, item: FLOW4_BOARD.acceptControl,
      sourceItem: FLOW4_BOARD.acceptSource, label: 'Handoff → Sales Active navigation' },
  ];
  const allowedAdded = new Map<string, string>();
  for (const step of steps) {
    const product = approvedHandoffControl(step.from, step.key);
    const approvedSource = approvedHandoffControl(step.source, step.key);
    const controls = section.children.filter(n => n.name === step.item.name);
    const labels = section.children.filter(n => n.name === step.sourceItem.name);
    let chosen: ReactionNode | null = null;
    if (controls.length === 0 && labels.length === 1 && labels[0].type === 'TEXT' && labels[0].characters === step.sourceItem.text &&
      product && approvedSource && approvedSource.reactions.length === 0) {
      strategies[step.key] = 'PRODUCT CONTROL';
      chosen = product;
      allowedAdded.set(step.from.name, product.id);
    } else if (controls.length === 1 && labels.length === 0) {
      strategies[step.key] = 'PROTOTYPE CONTROL';
      chosen = externalControl(section, step.item, step.from, step.to);
      record(`${step.label} external control`, Boolean(chosen), `${step.label}: visible external control missing or misplaced.`);
    }
    if (!chosen) record(step.label, false, `${step.label}: progression is missing or semantically ambiguous.`);
    else {
      const error = await reactionError(chosen, step.to.id);
      record(step.label, !error, error ?? undefined);
      if (error) broken++;
    }
  }
  for (const key of KEYS) {
    const source = sources.get(key);
    const clone = clones.get(key)!;
    record(`${key} source reactions`, Boolean(source) && sourceReactionsPreserved(source!, clone, allowedAdded.get(clone.name)),
      `${key}: inherited reactions changed or Phase 3E progression was attached to unrelated product UI.`);
  }
  let destinationsValid = true;
  for (const clone of clones.values()) for (const node of reactionNodes(clone)) for (const reaction of node.reactions) {
    for (const action of [...(reaction.actions ?? []), ...(reaction.action ? [reaction.action] : [])]) {
      if (action.type === 'NODE' && (!action.destinationId || !await figma.getNodeByIdAsync(action.destinationId))) {
        destinationsValid = false; broken++;
      }
    }
  }
  record('Broken destinations', destinationsValid, 'Flow 4 contains a broken reaction destination.');
  record('Explicit END', section.children.some(n => n.name === FLOW4_BOARD.end.name && n.type === 'TEXT' &&
    n.characters.includes('Sales Active is the final scenario state.')),
    'END does not explicitly identify Sales Active as the final state.');
  return { issues, broken, checks, strategies };
}
