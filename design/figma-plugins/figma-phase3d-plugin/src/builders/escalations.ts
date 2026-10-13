import { ESCALATION_VARIANTS, SECTIONS, escalationName, type EscalationVariant } from '../constants';
import { fill, instantiate, stroke, type SemanticName, type TypeName } from '../design-system';
import { box, button, chip, frame, line, text } from '../figma-utils';
import { assertWritablePage, ESCALATIONS_OWNED, replaceOwned } from '../ownership';
import { ensureSection } from './page-setup';
import { drawStaffChrome } from './shared-shell';

type Kind = EscalationVariant['kind'];
type Copy = { reason: string; status: string; owner: string; age: string; facts: string[]; effect: string[]; constraints: string[]; safe: string; decision: string; decisionNote: string };
const WIDTH = 1760;
const CONTENT = 970;
const GAP = 12;

function tone(kind: Kind): { fg: SemanticName; bg: SemanticName } {
  if (kind === 'unknown') return { fg: 'status/unknown', bg: 'status/unknown-bg' };
  if (kind === 'stale') return { fg: 'status/stale', bg: 'status/stale-bg' };
  if (kind === 'authorization') return { fg: 'status/warning', bg: 'status/warning-bg' };
  if (kind === 'e02') return { fg: 'status/restricted', bg: 'status/restricted-bg' };
  if (kind === 'resolved') return { fg: 'status/success', bg: 'status/success-bg' };
  if (kind === 'waiting') return { fg: 'status/waiting-human', bg: 'status/waiting-human-bg' };
  return { fg: 'status/pending', bg: 'status/pending-bg' };
}

function copyFor(kind: Kind): Copy {
  const shared = ['Order ORD-1042 exists · Order record observed 10:43.', 'create_order — confirmed · operation CO-1042.', 'Customer Amina S. verified · inventory last observed 10:42.'];
  switch (kind) {
    case 'waiting': return { reason: 'Reservation confirmation unavailable; assignment is pending.', status: 'Waiting Assignment', owner: 'Unassigned · human queue', age: 'Opened 10:43 · age 4 min', facts: shared, effect: ['OUTCOME_UNKNOWN · reservation may have committed.', 'Confirmation unavailable · operation RI-1042 retained.'], constraints: ['No blind retry while the effect is unknown.', 'No decision before an authorized Human Operator is assigned.'], safe: 'Assign an eligible Human Operator for reconciliation.', decision: 'Review eligible assignment', decisionNote: 'Assignment policy and case access are checked by the backend; no autonomous bypass.' };
    case 'assigned': return { reason: 'Known failed reservation needs an authorized recovery decision.', status: 'Awaiting Decision', owner: 'Human Operator · assigned', age: 'Assigned 10:47 · age 2 min', facts: [...shared, 'Reservation failed — known result; inventory was not reserved.'], effect: ['No uncertain effect remains in this case.', 'Known failure is not OUTCOME_UNKNOWN.'], constraints: ['Review current inventory before any new proposal.', 'Approval does not transfer Sales permissions or bypass policy.'], safe: 'Review current inventory and choose authorized recovery.', decision: 'Approve proposed continuation', decisionNote: 'Decision concerns a proposed continuation only; backend authorization and current state still apply.' };
    case 'unknown': return { reason: 'Reservation confirmation unavailable after the request.', status: 'OUTCOME_UNKNOWN', owner: 'Human Operator · reconciliation', age: 'Observed 10:43 · unresolved 4 min', facts: shared, effect: ['OUTCOME_UNKNOWN · effect may have committed.', 'Confirmation unavailable · operation RI-1042 retained.', 'RECONCILIATION REQUIRED · NO BLIND RETRY.'], constraints: ['Do not retry reserve_inventory before reconciliation.', 'Recheck current authorization before any continuation.'], safe: 'Reconcile authoritative reservation state first.', decision: 'Request reconciliation', decisionNote: 'Approval and mutation retry remain unavailable until the effect is known.' };
    case 'stale': return { reason: 'Previously observed business facts may no longer be decision-safe.', status: 'Stale Context', owner: 'Human Operator · assigned', age: 'Inventory observed 10:42 · refresh needed', facts: ['Order ORD-1042 exists · source observed 10:43.', 'Inventory observation exists from 10:42; it is not current enough for action.', 'Customer Amina S. verified in Conversation C-42.'], effect: ['No uncertain mutation effect is asserted.', 'This is stale evidence, not missing data or Permission Denied.'], constraints: ['Do not decide from an outdated Order or inventory revision.', 'Refresh source facts and revalidate before consequential action.'], safe: 'Refresh authoritative business facts.', decision: 'Request refreshed facts', decisionNote: 'A new decision follows the refreshed evidence and current case revision.' };
    case 'authorization': return { reason: 'Previous authorization assumption is no longer sufficient.', status: 'Authorization Changed', owner: 'Human Operator · review required', age: 'Scope changed after 10:43 observation', facts: ['Order ORD-1042 exists in the recorded case context.', 'The earlier operator scope was observed before this change.', 'No new business mutation is claimed.'], effect: ['No uncertain mutation effect is asserted.', 'Authorization changed is not automatically Permission Denied.'], constraints: ['Check current principal, business scope and case assignment again.', 'A visible control never grants backend access.'], safe: 'Recheck current principal and scope.', decision: 'Recheck authorization', decisionNote: 'If access is denied, do not reveal protected details; reassign an authorized Operator.' };
    case 'e02': return { reason: 'E02 automatic Order update is restricted by current policy.', status: 'E02 Restricted', owner: 'Human Operator · policy handling', age: 'Requested 10:43 · pending policy review', facts: ['Requested update: change Order ORD-1042 details.', 'Known current Order State: Created · verified.', 'update_order did not execute; no changed Order is claimed.'], effect: ['No uncertain reservation effect is asserted.', 'E02 is not OUTCOME_UNKNOWN, Reservation Failure or Permission Denied.'], constraints: ['Automatic update_order mutation remains restricted.', 'A human click cannot bypass unresolved business policy.'], safe: 'Route to authorized human/policy handling.', decision: 'Request policy clarification', decisionNote: 'No Approve update action is available until an approved policy exists.' };
    case 'resume': return { reason: 'Human decision recorded; a safe continuation would need fresh checks.', status: 'Resume Pending · TARGET M12', owner: 'Human Operator · target review', age: 'Target design · no live resume', facts: ['Order ORD-1042 and decision D-204 remain linked to ESC-204.', 'Human decision is recorded in this target UX illustration.', 'No new reservation or Order effect is claimed.'], effect: ['No mutation replay is allowed.', 'Any prior OUTCOME_UNKNOWN must be reconciled before continuation.'], constraints: ['TARGET M12 · Not currently implemented.', 'Revalidate authorization, current state and revision.', 'Human decision → Revalidation → Controlled Resume request.'], safe: 'Revalidate current rights, facts and pending effects.', decision: 'No live resume action', decisionNote: 'TARGET M12 · Not currently implemented · No mutation replay.' };
    case 'resolved': return { reason: 'Reconciliation completed and the case is ready for closure.', status: 'Resolved', owner: 'Human Operator · disposition recorded', age: 'Resolved 10:54 · history retained', facts: ['Order ORD-1042 exists · create_order confirmed.', 'Reservation effect verified from authoritative state at 10:54.', 'Customer Amina S. remains linked to Conversation C-42.'], effect: ['No uncertain effect remains after reconciliation.', 'Verified reservation outcome is recorded separately from case closure.'], constraints: ['Resolved means the effect/decision is verified.', 'Closed means no further active work; history remains available.'], safe: 'Close the escalation after recording the disposition.', decision: 'Close escalation', decisionNote: 'RESOLVED · verified outcome. CLOSED · no active work; case history retained.' };
  }
}

function flowText(parent: FrameNode, name: string, value: string, y: number, type: TypeName = 'Small', color: SemanticName = 'text/primary', width = CONTENT - 36): number {
  const node = text(parent, name, value, 18, y, width, type, color);
  node.textAutoResize = 'HEIGHT';
  return y + node.height;
}

function infoBlock(parent: FrameNode, name: string, label: string, values: string[], y: number, accent: SemanticName, background: SemanticName = 'surface/default'): FrameNode {
  const card = box(parent, name, 0, y, CONTENT, 1, background, accent, 8);
  let cursor = flowText(card, 'Hierarchy label', label, 14, 'Label', accent) + 8;
  values.forEach((value, i) => { cursor = flowText(card, `Content / ${i + 1}`, value, cursor, i === 0 ? 'Body Strong' : 'Small') + 5; });
  card.resize(CONTENT, cursor + 11);
  return card;
}

function setInstanceText(instance: InstanceNode, name: string, value: string): void {
  const node = instance.findAll(n => n.type === 'TEXT' && n.name === name)[0] as TextNode | undefined;
  if (node) node.characters = value;
}

function drawSelected(queue: FrameNode, kind: Kind, c: Copy): number {
  const variant = kind === 'waiting' ? 'State=Waiting Assignment' : kind === 'assigned' ? 'State=Assigned' : kind === 'unknown' ? 'State=OUTCOME_UNKNOWN / Reconciliation Required' : kind === 'resume' ? 'State=Resume Pending — TARGET M12' : undefined;
  const native = variant ? instantiate(queue, 'Escalation / Queue Item', variant, 'Selected Queue Item', 0, 102, 470) : undefined;
  if (native) {
    stroke(native, 'border/interactive');
    setInstanceText(native, 'Escalation reference', 'ESC-204 / Conversation C-42');
    setInstanceText(native, 'Affected object', 'Order ORD-1042 / Desk Lamp / Slate');
    // Keep the approved compact triage reason; the full cause belongs in Decision Context.
    setInstanceText(native, 'Owner', `Owner: ${c.owner}`);
    setInstanceText(native, 'Time or target note', c.age);
    const marker = native.findAll(n => n.type === 'FRAME' && n.name === 'Queue status marker')[0] as FrameNode | undefined;
    if (marker) {
      const { fg, bg } = tone(kind); fill(marker, bg); stroke(marker, fg);
      const meaning = marker.findAll(n => n.type === 'TEXT' && n.name === 'Meaning')[0] as TextNode | undefined;
      if (meaning) meaning.characters = c.status;
    }
  } else {
    const selected = box(queue, 'Selected Queue Item', 0, 102, 470, 213, 'surface/selected', 'border/interactive', 8);
    flowText(selected, 'Escalation reference', 'ESC-204 / Conversation C-42', 13, 'Body Strong', 'text/primary', 438);
    flowText(selected, 'Affected object', 'Order ORD-1042 / Desk Lamp / Slate', 41, 'Small', 'text/secondary', 438);
    chip(selected, 'Queue status marker', c.status, 14, 70, 440, tone(kind).fg, tone(kind).bg);
    const reasonBottom = flowText(selected, 'Reason', `Reason: ${c.reason}`, 113, 'Small', 'text/primary', 438);
    const ownerBottom = flowText(selected, 'Owner', `Owner: ${c.owner}`, reasonBottom + 8, 'Caption', 'text/secondary', 438);
    const timeBottom = flowText(selected, 'Time or target note', c.age, ownerBottom + 8, 'Caption', 'text/secondary', 438);
    selected.resize(470, Math.max(213, timeBottom + 12));
  }
  const selected = queue.children.find(n => n.name === 'Selected Queue Item') as FrameNode | InstanceNode;
  frame(queue, 'Selected queue marker', 0, 109, 4, selected.height - 14, 'action/primary');
  return 102 + selected.height;
}

function queueSummary(parent: FrameNode, name: string, ref: string, detail: string, status: string, y: number): void {
  const row = box(parent, name, 0, y, 470, 90, 'surface/default', 'border/default', 8);
  flowText(row, 'Reference', ref, 10, 'Body Strong', 'text/primary', 420);
  flowText(row, 'Reason', detail, 35, 'Small', 'text/secondary', 420);
  flowText(row, 'Status', status, 64, 'Caption', 'status/waiting-human', 420);
}

function drawQueue(main: FrameNode, kind: Kind, c: Copy): FrameNode {
  const q = frame(main, 'Escalation Queue', 24, 24, 470, 680, 'surface/subtle');
  text(q, 'Queue heading', 'Escalation Queue', 0, 0, 350, 'Section Heading');
  text(q, 'Queue scope', 'TRIAGE · North Shop · one selected case', 0, 35, 460, 'Label', 'text/secondary');
  text(q, 'Queue filter', 'Needs attention  /  Assigned  /  Reconciliation', 0, 66, 470, 'Small', 'text/secondary');
  const nextRow = drawSelected(q, kind, c) + 14;
  queueSummary(q, 'Queue row / 2', 'ESC-198 · Conversation C-39', 'Product availability needs clarification', 'Waiting Human · 7 min', nextRow);
  queueSummary(q, 'Queue row / 3', 'ESC-201 · Conversation C-40', 'Known delivery-status question', 'Assigned · 5 min', nextRow + 102);
  const linkY = nextRow + 216;
  const link = instantiate(q, 'Navigation / Restricted Link', undefined, 'Agent Run contextual link', 0, linkY, 470);
  if (!link) {
    const l = box(q, 'Agent Run contextual link', 0, linkY, 470, 72, 'surface/default', 'status/restricted', 6);
    flowText(l, 'Contextual destination', 'Agent Runs  ↗', 9, 'Small', 'text/primary', 438);
    flowText(l, 'Restriction label', 'Contextual / permitted case only', 31, 'Caption', 'status/restricted', 438);
    flowText(l, 'Authorization rule', 'Visible link still requires server authorization.', 50, 'Caption', 'text/secondary', 438);
  }
  const linkHeight = link?.height ?? 72;
  const owner = text(q, 'Queue owner', `CASE OWNER · ${c.owner}`, 0, linkY + linkHeight + 24, 460, 'Small', tone(kind).fg);
  q.resize(470, owner.y + owner.height + 14);
  return q;
}

function drawHumanDecision(context: FrameNode, kind: Kind, c: Copy, y: number): FrameNode | InstanceNode {
  if (kind === 'assigned') {
    const native = instantiate(context, 'Escalation / Human Decision Panel', undefined, 'Human Decision', 0, y, CONTENT);
    if (native) {
      setInstanceText(native, 'Proposal summary', 'Decision D-204: review current inventory and an authorized recovery proposal.');
      setInstanceText(native, 'Decision scope', 'Human Operator / Order ORD-1042 / current authorization required');
      return native;
    }
  }
  const panel = box(context, 'Human Decision', 0, y, CONTENT, 1, 'surface/default', 'border/default', 8);
  let cursor = flowText(panel, 'Hierarchy label', 'HUMAN DECISION', 14, 'Label', 'status/waiting-human') + 8;
  cursor = flowText(panel, 'Decision object', c.decisionNote, cursor, 'Small') + 16;
  if (kind === 'assigned') {
    button(panel, 'Primary decision', 'Approve proposed continuation', 18, cursor, 290, true);
    button(panel, 'Reject decision', 'Reject proposed continuation', 320, cursor, 290);
    button(panel, 'Clarification decision', 'Request clarification', 622, cursor, 240);
    cursor += 49;
    const target = box(panel, 'TARGET M12 resume request / unavailable', 18, cursor, 320, 37, 'surface/subtle', 'border/default', 6);
    flowText(target, 'Contextual action label', 'Revalidate → Resume request', 9, 'Small', 'text/secondary', 292);
    button(panel, 'Close decision', 'Close escalation', 350, cursor, 205);
    cursor += 49;
  } else if (kind !== 'resume') {
    button(panel, 'Primary decision', c.decision, 18, cursor, 320, true);
    button(panel, 'Secondary decision', kind === 'resolved' ? 'View decision history' : 'Request clarification', 356, cursor, 240);
    cursor += 49;
  }
  if (kind === 'resolved') {
    chip(panel, 'Resolved state', 'RESOLVED · effect verified', 18, cursor, 274, 'status/success', 'status/success-bg');
    chip(panel, 'Closed state', 'CLOSED · history retained', 310, cursor, 267, 'text/secondary', 'surface/subtle');
    cursor += 40;
  }
  if (kind === 'resume') cursor = flowText(panel, 'Target M12 note', 'TARGET M12 · Not currently implemented · No mutation replay.', cursor, 'Body Strong', 'status/pending') + 8;
  else cursor = flowText(panel, 'Decision boundary', 'Visible action does not grant backend access; current case, policy and revision are checked.', cursor, 'Caption', 'text/secondary') + 8;
  panel.resize(CONTENT, cursor + 11);
  return panel;
}

function drawContext(main: FrameNode, kind: Kind, c: Copy): FrameNode {
  const d = frame(main, 'Decision Context', 518, 24, CONTENT, 1, 'surface/subtle');
  text(d, 'Context title', 'ESC-204 · Decision Context', 0, 0, 650, 'Section Heading');
  chip(d, 'Case status', c.status, 684, 0, 280, tone(kind).fg, tone(kind).bg);
  text(d, 'Selected case relationship', 'Selected queue item → Amina S. · Conversation C-42 · Order ORD-1042', 0, 35, 955, 'Small', 'text/secondary');
  text(d, 'Conversation reference', 'Open Conversation C-42  ↗', 0, 64, 290, 'Caption', 'action/primary');
  text(d, 'Order reference', 'Open Order ORD-1042  ↗', 305, 64, 250, 'Caption', 'action/primary');
  text(d, 'Run access', 'Agent Run · permitted case only  ↗', 585, 64, 370, 'Caption', 'status/restricted');
  let y = 101;
  const blocks: [string, string, string[], SemanticName, SemanticName?][] = [
    ['Why Automation Stopped', 'WHY AUTOMATION STOPPED', [c.reason], 'text/primary'],
    ['Confirmed Facts', 'CONFIRMED FACTS', c.facts, 'status/success', 'status/success-bg'],
    ['Uncertain Effect', 'UNCERTAIN EFFECT', c.effect, tone(kind).fg, kind === 'unknown' || kind === 'waiting' ? 'status/unknown-bg' : 'surface/default'],
    ['Constraints', 'CONSTRAINTS', c.constraints, kind === 'e02' ? 'status/restricted' : 'text/secondary', 'surface/default'],
    ['Next Safe Step', 'NEXT SAFE STEP', [c.safe], tone(kind).fg, tone(kind).bg],
  ];
  for (const [name, label, values, fg, bg] of blocks) {
    const native = name === 'Uncertain Effect' && kind === 'unknown' ? instantiate(d, 'Escalation / Uncertain Effect', undefined, name, 0, y, CONTENT) : undefined;
    const block = native ?? infoBlock(d, name, label, values, y, fg, bg);
    y += block.height + GAP;
  }
  const decision = drawHumanDecision(d, kind, c, y);
  d.resize(CONTENT, y + decision.height + 14);
  return d;
}

export function drawEscalation(screen: FrameNode, variant: EscalationVariant): void {
  const c = copyFor(variant.kind);
  drawStaffChrome(screen);
  const nav = screen.children.find(n => n.name === 'Staff navigation') as FrameNode;
  const nested = nav.findAll(n => n.type === 'TEXT' && n.name === 'Nested / Conversations / Escalations')[0] as TextNode;
  fill(nested, 'action/primary');
  nested.fontName = { family: 'Inter', style: 'Semi Bold' };
  frame(nav, 'Escalations active marker', 24, nested.y + 1, 3, 20, 'action/primary');
  const header = screen.children.find(n => n.name === 'Page/context header') as FrameNode;
  (header.children.find(n => n.name === 'Breadcrumb/page context') as TextNode).characters = 'Conversations  /  Escalations  /  ESC-204';
  (header.children.find(n => n.name === 'Current active area') as TextNode).characters = 'Escalations';
  header.resize(WIDTH - 244, header.height);
  (header.children.find(n => n.name === 'Header divider') as FrameNode).resize(WIDTH - 244, 1);
  const main = frame(screen, 'Escalations Workspace', 244, 72, WIDTH - 244, 1, 'surface/subtle');
  const queue = drawQueue(main, variant.kind, c);
  const context = drawContext(main, variant.kind, c);
  main.resize(WIDTH - 244, Math.max(queue.y + queue.height, context.y + context.height) + 24);
  screen.resize(WIDTH, main.y + main.height);
  nav.resize(nav.width, screen.height);
  (nav.children.find(n => n.name === 'Navigation divider') as FrameNode).resize(1, screen.height);
  (nav.children.find(n => n.name === 'Account/session') as FrameNode).y = screen.height - 80;
}

export function buildEscalations(page: PageNode): string[] {
  assertWritablePage(page.name);
  const conversations = page.children.find(n => n.type === 'FRAME' && n.name === SECTIONS.conversations) as FrameNode | undefined;
  const y = conversations ? conversations.y + conversations.height + 60 : 6100;
  const section = ensureSection(page, SECTIONS.escalations, 0, y, 3580, 1);
  const staged: FrameNode[] = [];
  try {
    let rowY = 86, rowHeight = 0;
    for (const [i, variant] of ESCALATION_VARIANTS.entries()) {
      if (i > 0 && i % 2 === 0) { rowY += rowHeight + 32; rowHeight = 0; }
      const screen = frame(section, `${escalationName(variant.key)} / staging`, 24 + (i % 2) * 1780, rowY, WIDTH, 900, 'surface/default');
      staged.push(screen);
      drawEscalation(screen, variant);
      rowHeight = Math.max(rowHeight, screen.height);
    }
    section.resize(section.width, rowY + rowHeight + 24);
    replaceOwned(section, ESCALATIONS_OWNED, staged);
    return [...ESCALATIONS_OWNED];
  } catch (error) { staged.forEach(n => n.remove()); throw error; }
}
