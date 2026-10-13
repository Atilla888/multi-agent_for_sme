import { FLOW1_BOARD, cloneName } from './constants';
import { visualSignature } from './prototype-utils';

export type FlowOneCheck = { issues: string[]; broken: number; clones: Map<string, FrameNode>; visualPass: boolean; reactionReport: string | null };

function reactionNodes(frame: FrameNode): (SceneNode & ReactionMixin)[] {
  return [frame, ...frame.findAll(n => 'reactions' in n)] as (SceneNode & ReactionMixin)[];
}

function sourceReactionSignature(source: FrameNode, clone: FrameNode): boolean {
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
    if (JSON.stringify(expected) !== JSON.stringify(copies[i].reactions)) return false;
  }
  return true;
}

function reactionDiagnostic(control: FrameNode, destinationId: string | undefined, reason: string | null): string {
  const field = (value: unknown): string => value === undefined ? 'undefined' : JSON.stringify(value);
  const lines = [
    `FLOW 1 ${control.parent?.name.endsWith('/ staging') ? 'STAGING' : 'CANONICAL'} REACTION DIAGNOSTIC`,
    'Expected: ON_CLICK → NODE/NAVIGATE',
    `Destination: ${destinationId ?? 'missing staging Support Active clone'}`,
    'Transition: NONE (null or absent; no animated Transition object)',
    'Actual:',
    `reactions.count=${control.reactions.length}`,
  ];
  control.reactions.forEach((reaction, index) => {
    lines.push(`reaction[${index}].trigger.type=${field(reaction.trigger?.type)}`);
    lines.push(`reaction[${index}].actions.count=${field(reaction.actions?.length)}`);
    for (const [label, action] of [
      ...((reaction.actions ?? []).map((item, actionIndex) => [`actions[${actionIndex}]`, item] as const)),
      ...(reaction.action ? [['action', reaction.action] as const] : []),
    ]) {
      lines.push(`reaction[${index}].${label}.type=${field(action.type)}`);
      const nodeAction = action.type === 'NODE' ? action : null;
      lines.push(`reaction[${index}].${label}.navigation=${field(nodeAction?.navigation)}`);
      lines.push(`reaction[${index}].${label}.destinationId=${field(nodeAction?.destinationId)}`);
      lines.push(`reaction[${index}].${label}.transition=${field(nodeAction?.transition)}`);
      lines.push(`reaction[${index}].${label}.transition.type=${field(nodeAction?.transition?.type)}`);
      lines.push(`reaction[${index}].${label}.transition.duration=${field(nodeAction?.transition?.duration)}`);
      lines.push(`reaction[${index}].${label}.preserveScrollPosition=${field(nodeAction?.preserveScrollPosition)}`);
    }
  });
  lines.push(`Raw Figma reactions: ${JSON.stringify(control.reactions)}`);
  lines.push(reason ? `Failure reason: ${reason}` : 'Result: PASS');
  return lines.join('\n');
}

async function continueReactionIssue(control: FrameNode, destinationId: string | undefined): Promise<string | null> {
  const fail = (reason: string): string => reactionDiagnostic(control, destinationId, reason);
  if (!destinationId) return fail('Fresh staging Support Active clone is missing.');
  if (control.reactions.length !== 1) return fail(`Expected exactly one reaction; found ${control.reactions.length}.`);
  const reaction = control.reactions[0];
  if (reaction.trigger?.type !== 'ON_CLICK') return fail(`Expected ON_CLICK trigger; got ${reaction.trigger?.type ?? 'missing'}.`);
  if (reaction.actions !== undefined && reaction.actions.length !== 1) return fail(`Expected exactly one action; found ${reaction.actions.length}.`);
  const actions = reaction.actions === undefined ? reaction.action ? [reaction.action] : [] : reaction.actions;
  if (actions.length !== 1) return fail('No intended NODE/NAVIGATE action is present.');
  // Figma may return the deprecated `action` as a mirror of `actions[0]`.
  // Both representations must satisfy the same strict scenario contract.
  for (const action of [...actions, ...(reaction.action && reaction.actions !== undefined ? [reaction.action] : [])]) {
    if (action.type !== 'NODE') return fail(`Expected NODE action; got ${action.type}.`);
    if (action.navigation !== 'NAVIGATE') return fail(`Expected NAVIGATE; got ${action.navigation}.`);
    if (action.destinationId !== destinationId) return fail(`Expected fresh Support Active destination ${destinationId}; got ${action.destinationId ?? 'missing'}.`);
    if (action.transition != null) return fail(`Animated or unrecognized transition ${JSON.stringify(action.transition)} is not allowed.`);
  }
  if (!await figma.getNodeByIdAsync(destinationId)) return fail(`Fresh Support Active destination ${destinationId} does not resolve.`);
  return null;
}

export async function checkFlowOne(section: SectionNode, sources: Map<string, FrameNode>): Promise<FlowOneCheck> {
  const issues: string[] = [];
  const clones = new Map<string, FrameNode>();
  let broken = 0;
  let visualPass = true;
  let reactionReport: string | null = null;
  const expectedNames = new Set([
    cloneName(1, 'default'), cloneName(1, 'support'), FLOW1_BOARD.start.name, FLOW1_BOARD.step1.name,
    FLOW1_BOARD.step1Note.name, FLOW1_BOARD.continue.name, FLOW1_BOARD.step2.name,
    FLOW1_BOARD.productBoundary.name, FLOW1_BOARD.inventoryBoundary.name, FLOW1_BOARD.end.name,
  ]);
  for (const child of section.children) if (!expectedNames.has(child.name)) issues.push(`Unexpected node in generated Flow 1: ${child.name}`);
  for (const key of ['default', 'support']) {
    const exact = section.children.filter(n => n.name === cloneName(1, key));
    if (exact.length !== 1 || exact[0].type !== 'FRAME') issues.push(`${key}: clone missing/duplicate/wrong type`);
    else clones.set(key, exact[0] as FrameNode);
  }
  for (const item of [FLOW1_BOARD.start, FLOW1_BOARD.step1, FLOW1_BOARD.step1Note,
    FLOW1_BOARD.step2, FLOW1_BOARD.productBoundary, FLOW1_BOARD.inventoryBoundary, FLOW1_BOARD.end]) {
    const matches = section.children.filter(n => n.name === item.name);
    if (matches.length !== 1 || matches[0].type !== 'TEXT' || matches[0].characters.trim() !== item.text.trim()) issues.push(`Missing/wrong external annotation: ${item.name}`);
  }
  if (section.children.some(n => n.name === FLOW1_BOARD.legacyNote)) issues.push('Legacy generic Flow 1 note remains.');
  const first = clones.get('default');
  const second = clones.get('support');
  if (first && second) {
    for (const key of ['default', 'support']) {
      const source = sources.get(key);
      const clone = clones.get(key)!;
      if (!source || visualSignature(clone) !== visualSignature(source)) { issues.push(`Visual-source preservation failed: ${key}`); visualPass = false; }
      else {
        if (!sourceReactionSignature(source, clone)) { issues.push(`Source reactions changed or Phase 3E reaction added inside ${key} product clone.`); broken++; }
      }
    }
    if (first.findAll(n => n.name === 'Conversation row / 1').some(n => 'reactions' in n && n.reactions.some(r =>
      [...(r.actions ?? []), ...(r.action ? [r.action] : [])].some(a => a.type === 'NODE' && a.destinationId === second.id)))) {
      issues.push('Conversation row / 1 has a Phase 3E scenario reaction.'); broken++;
    }
    const supportText = second.findAll(n => n.type === 'TEXT').map(n => (n as TextNode).characters).join(' ').toLowerCase();
    if (!supportText.includes('availability')) issues.push('Support Active inventory context missing.');
  }
  const matches = section.children.filter(n => n.name === FLOW1_BOARD.continue.name);
  if (matches.length !== 1 || matches[0].type !== 'FRAME') { issues.push('Prototype-only Continue control missing/duplicate/wrong type.'); broken++; }
  else {
    const control = matches[0] as FrameNode;
    const labels = control.findAll(n => n.type === 'TEXT').map(n => (n as TextNode).characters);
    const visibleFill = control.fills !== figma.mixed && control.fills.some(p => p.type === 'SOLID' && p.visible !== false && (p.opacity ?? 1) > 0);
    const outsideProduct = first && second && control.x >= first.x + first.width && control.x + control.width <= second.x;
    if (!control.visible || control.opacity <= 0 || !visibleFill || control.width < 250 || control.height < 70 || !outsideProduct ||
      !labels.includes(FLOW1_BOARD.continue.marker) || !labels.includes(FLOW1_BOARD.continue.text)) issues.push('Continue control is not a visible, labeled external prototype control between frames.');
    const reactionIssue = await continueReactionIssue(control, second?.id);
    reactionReport = reactionDiagnostic(control, second?.id, null);
    if (reactionIssue) { issues.push(reactionIssue); broken++; }
  }
  // Source-owned reactions are allowed only when the clone still matches its 03D source.
  // Every NODE destination must remain resolvable; absent planned flows are irrelevant.
  for (const clone of clones.values()) for (const node of reactionNodes(clone)) for (const reaction of node.reactions) {
    for (const action of [...(reaction.actions ?? []), ...(reaction.action ? [reaction.action] : [])]) {
      if (action.type === 'NODE' && (!action.destinationId || !await figma.getNodeByIdAsync(action.destinationId))) {
        issues.push(`Broken source reaction destination on ${node.name}.`); broken++;
      }
    }
  }
  return { issues, broken, clones, visualPass, reactionReport };
}
