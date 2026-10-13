import { SECTIONS, VARIANTS, conversationName, type Variant } from '../constants';
import { instantiate, type SemanticName, type TypeName } from '../design-system';
import { box, button, chip, frame, line, text } from '../figma-utils';
import { assertWritablePage, CONVERSATIONS_OWNED, replaceOwned } from '../ownership';
import { ensureSection } from './page-setup';
import { drawStaffChrome } from './shared-shell';

const W = 1600, H = 900;
type Kind = Variant['kind'];

function stateTone(kind: Kind): { fg: Parameters<typeof chip>[6]; bg: Parameters<typeof chip>[7] } {
  if (kind === 'confirmed') return { fg: 'status/success', bg: 'status/success-bg' };
  if (kind === 'failure') return { fg: 'status/error', bg: 'status/error-bg' };
  if (kind === 'unknown') return { fg: 'status/unknown', bg: 'status/unknown-bg' };
  if (kind === 'waiting' || kind === 'human') return { fg: 'status/waiting-human', bg: 'status/waiting-human-bg' };
  if (kind === 'dependency') return { fg: 'status/dependency', bg: 'status/dependency-bg' };
  if (kind === 'delivery') return { fg: 'status/error', bg: 'status/error-bg' };
  return { fg: 'status/pending', bg: 'status/pending-bg' };
}

function reservationFor(kind: Kind): string {
  if (kind === 'confirmed' || kind === 'delivery' || kind === 'default' || kind === 'support' || kind === 'sales') return 'Confirmed';
  if (kind === 'failure') return 'Known Failure';
  if (kind === 'unknown' || kind === 'waiting') return 'OUTCOME_UNKNOWN';
  if (kind === 'dependency') return 'Not checked — source unavailable';
  if (kind === 'proposal') return 'Not started';
  if (kind === 'processing') return 'Processing — not confirmed';
  return 'Pending review';
}

function drawList(screen: FrameNode, v: Variant): void {
  const list = frame(screen, 'Conversation List', 244, 72, 318, 828, 'surface/default');
  frame(list, 'List divider', 317, 0, 1, 828, 'border/default');
  text(list, 'List title', 'Conversations', 18, 20, 277, 'Section Heading');
  text(list, 'List count', '3 in this business', 18, 55, 270, 'Caption', 'text/secondary');
  const search = box(list, 'Search field', 18, 91, 282, 40, 'surface/subtle', 'border/default', 6);
  text(search, 'Search label', 'Search conversations', 12, 10, 252, 'Small', 'text/secondary');
  chip(list, 'All filter', 'All', 18, 147, 54, 'action/primary', 'surface/selected');
  chip(list, 'Attention filter', 'Attention', 80, 147, 97, 'text/secondary', 'surface/subtle');
  chip(list, 'Waiting filter', 'Waiting Human', 185, 147, 115, 'status/waiting-human', 'status/waiting-human-bg');
  const rows = [
    { name: 'Amina S.', channel: 'Web Chat', handler: v.handler, state: v.status, time: '10:42', selected: true },
    { name: 'Mira K.', channel: 'WhatsApp', handler: 'Human Operator', state: 'Waiting Human', time: '09:58', selected: false },
    { name: 'Dana R.', channel: 'Telegram', handler: 'Support Agent', state: 'Attention needed · unread', time: '09:34', selected: false },
  ];
  rows.forEach((r, i) => {
    const row = box(list, `Conversation row / ${i + 1}`, 12, 191 + i * 112, 294, 102, r.selected ? 'surface/selected' : 'surface/default', r.selected ? 'border/interactive' : 'border/default', 6);
    if (r.selected) frame(row, 'Selected marker', 0, 9, 3, 84, 'action/primary');
    text(row, 'Customer', r.name, 14, 10, 185, 'Body Strong');
    text(row, 'Last activity', r.time, 224, 10, 56, 'Caption', 'text/secondary');
    text(row, 'Channel', r.channel, 14, 36, 115, 'Caption', 'text/secondary');
    text(row, 'Current handler', r.handler, 133, 36, 145, 'Caption', 'text/secondary');
    text(row, 'Conversation state', r.state, 14, 69, 266, 'Small', r.state.includes('Waiting') ? 'status/waiting-human' : r.state.includes('Attention') ? 'status/warning' : r.selected ? stateTone(v.kind).fg : 'text/secondary');
  });
  line(list, 'List foot divider', 18, 763, 282);
  text(list, 'Scope note', 'North Shop · scoped case list', 18, 781, 282, 'Caption', 'text/secondary');
}

function drawMessageThread(workspace: FrameNode, kind: Kind): void {
  const thread = frame(workspace, 'Message Thread', 0, 94, 650, 333, 'surface/default');
  const m1 = instantiate(thread, 'Conversation / Message Row', 'Sender=Customer', 'Phase 3C / Customer message', 20, 17, 480);
  if (!m1) {
    const a = box(thread, 'Customer message', 20, 17, 476, 93, 'surface/subtle');
    text(a, 'Customer sender', 'Amina S. · Customer   10:40', 14, 10, 438, 'Small', 'text/secondary');
    text(a, 'Customer content', 'Is the Desk Lamp / Slate still available?', 14, 40, 438, 'Body');
  }
  const m2 = instantiate(thread, 'Conversation / Message Row', 'Sender=Business Assistant', 'Phase 3C / Business reply', 158, 139, 480);
  if (!m2) {
    const b = box(thread, 'Business reply', 158, 139, 470, 94, 'surface/default');
    text(b, 'Business sender', 'Business assistant · AI-assisted   10:41', 14, 10, 438, 'Small', 'text/secondary');
    text(b, 'Business content', 'I found the current product details.', 14, 40, 438, 'Body');
  }
  if (kind === 'confirmed' || kind === 'failure' || kind === 'unknown' || kind === 'delivery') return;
  const result = box(thread, 'Business-result message', 20, 264, 608, 58, 'surface/subtle', 'border/default', 6);
  text(result, 'Result sender', 'BUSINESS RESULT · 10:42', 12, 8, 550, 'Label', 'text/secondary');
  const message = kind === 'proposal' ? 'Proposal recorded · action not executed' : kind === 'processing' ? 'Reservation processing · no confirmed effect yet' : kind === 'dependency' ? 'Stock source unavailable · availability not zero' : 'Order and reservation facts are shown separately in context.';
  text(result, 'Result content', message, 12, 29, 570, 'Small');
}

type ResultLine = { name: string; value: string; type: TypeName; color?: SemanticName; gap?: number };

// Text is auto-height; each following line is positioned from its measured bounds.
function resultColumn(region: FrameNode, x: number, width: number, startY: number, lines: ResultLine[]): number {
  let y = startY;
  for (const entry of lines) {
    const node = text(region, entry.name, entry.value, x, y, width, entry.type, entry.color);
    node.textAutoResize = 'HEIGHT';
    y += node.height + (entry.gap ?? 8);
  }
  return y - (lines[lines.length - 1]?.gap ?? 8);
}

function drawBusinessResult(workspace: FrameNode, kind: 'confirmed' | 'failure' | 'unknown'): FrameNode {
  const { fg } = stateTone(kind);
  // A product screen uses one composition, not a Phase 3C specimen plus another result card.
  const region = box(workspace, 'Business Action Result', 20, 440, 610, 1, 'surface/default', 'border/default', 8);
  let left: ResultLine[];
  let right: ResultLine[];
  if (kind === 'confirmed') {
    left = [
      { name: 'Result label', value: 'BUSINESS RESULT', type: 'Label', color: fg },
      { name: 'Result state', value: 'Reservation confirmed', type: 'Card Heading' },
      { name: 'Order reference', value: 'Order #1042', type: 'Small' },
    ];
    right = [
      { name: 'Evidence label', value: 'TRUSTED RESERVATION REFERENCE', type: 'Label', color: 'text/secondary' },
      { name: 'Evidence reference', value: 'R-1042', type: 'Body Strong' },
      { name: 'Observed label', value: 'OBSERVED', type: 'Label', color: 'text/secondary' },
      { name: 'Observed time', value: '10:43', type: 'Small' },
    ];
  } else if (kind === 'failure') {
    left = [
      { name: 'Result label', value: 'BUSINESS RESULT', type: 'Label', color: fg },
      { name: 'Result state', value: 'Reservation failed', type: 'Card Heading' },
      { name: 'Result meaning', value: 'Inventory was not reserved.', type: 'Small' },
    ];
    right = [
      { name: 'Next step label', value: 'NEXT SAFE STEP', type: 'Label', color: fg },
      { name: 'Inventory review', value: 'Review current inventory.', type: 'Small' },
      { name: 'Authorized recovery', value: 'Choose an authorized recovery.', type: 'Small' },
    ];
  } else {
    left = [
      { name: 'Result label', value: 'BUSINESS RESULT', type: 'Label', color: fg },
      { name: 'Result state', value: 'OUTCOME_UNKNOWN', type: 'Card Heading' },
      { name: 'Possible effect', value: 'Reservation may have committed.', type: 'Small' },
      { name: 'Missing confirmation', value: 'Confirmation unavailable.', type: 'Small' },
    ];
    right = [
      { name: 'Operation label', value: 'OPERATION REFERENCE', type: 'Label', color: 'text/secondary', gap: 4 },
      { name: 'Operation reference', value: 'R-1042 / Order #1042', type: 'Small' },
      { name: 'Reconciliation label', value: 'RECONCILIATION', type: 'Label', color: fg, gap: 4 },
      { name: 'Reconciliation rule', value: 'Required before any mutation retry.', type: 'Small' },
      { name: 'Next step label', value: 'NEXT SAFE STEP', type: 'Label', color: fg, gap: 4 },
      { name: 'Safe retry rule', value: 'Reconcile authoritative reservation state. Do not retry mutation blindly.', type: 'Small' },
    ];
  }
  const leftBottom = resultColumn(region, 16, 270, 16, left);
  const rightBottom = resultColumn(region, 310, 284, 16, right);
  region.resize(610, Math.max(154, leftBottom, rightBottom) + 16);
  return region;
}

function drawMessageDeliveryState(workspace: FrameNode): FrameNode {
  const region = box(workspace, 'Delivery State', 20, 440, 610, 1, 'surface/default', 'border/default', 8);
  const businessBottom = resultColumn(region, 16, 270, 16, [
    { name: 'Business effect label', value: 'BUSINESS EFFECT', type: 'Label', color: 'status/success' },
    { name: 'Business effect value', value: 'Reservation confirmed', type: 'Body Strong' },
    { name: 'Business effect meaning', value: 'Trusted business effect remains valid.', type: 'Small' },
  ]);
  const communicationBottom = resultColumn(region, 310, 284, 16, [
    { name: 'Communication label', value: 'COMMUNICATION', type: 'Label', color: 'status/error' },
    { name: 'Communication value', value: 'Message delivery failed', type: 'Body Strong' },
    { name: 'Communication meaning', value: 'Customer message was not delivered.', type: 'Small' },
  ]);
  const nextY = Math.max(businessBottom, communicationBottom) + 12;
  const nextBottom = resultColumn(region, 16, 578, nextY, [
    { name: 'Next step label', value: 'NEXT SAFE STEP', type: 'Label', color: 'text/secondary', gap: 4 },
    { name: 'Communication recovery', value: 'Retry communication only. Do not repeat reserve_inventory.', type: 'Small' },
  ]);
  region.resize(610, nextBottom + 16);
  return region;
}

function drawStatePanel(workspace: FrameNode, v: Variant): FrameNode | undefined {
  if (v.kind === 'confirmed' || v.kind === 'failure' || v.kind === 'unknown') {
    return drawBusinessResult(workspace, v.kind);
  }
  if (v.kind === 'delivery') {
    return drawMessageDeliveryState(workspace);
  }
  const { fg, bg } = stateTone(v.kind);
  const name = v.kind === 'handoff' ? 'Handoff Event' : v.kind === 'processing' ? 'Execution Summary' :
    v.kind === 'proposal' ? 'Business Action Proposal' : v.kind === 'waiting' || v.kind === 'human' ? 'Human Status' : 'Agent Status';
  if (v.kind === 'proposal' || v.kind === 'processing') {
    const source = v.kind === 'proposal' ? 'Conversation / Action Proposal' : 'Conversation / Execution Summary';
    if (instantiate(workspace, source, undefined, name, 90, 446, 470)) return;
  }
  const panel = box(workspace, name, 20, 440, 610, 190, bg, fg, 8);
  text(panel, 'State heading', v.title, 18, 12, 570, 'Card Heading', fg);
  let title = '', detail = '', next = '';
  switch (v.kind) {
    case 'handoff': title = 'Support Agent → Sales Agent'; detail = 'Reason: Sales-authorized mutation required. Verified customer and Order context carried forward; Order retrieval complete.'; next = 'Remaining: Sales reviews current facts. Permissions do not transfer.'; break;
    case 'human': title = 'Human Operator owns this case'; detail = 'AI response ownership paused. Verified context remains available for the operator.'; next = 'Next: operator reviews the current case and replies when authorized.'; break;
    case 'waiting': title = 'Human decision required'; detail = 'Reservation result remains uncertain. The case is waiting for assigned operator review.'; next = 'Open Escalation · reconcile authoritative state before any retry.'; break;
    case 'proposal': title = 'PROPOSED · NOT EXECUTED'; detail = 'Reserve inventory for Order ORD-1042. Customer confirmation is required before an authorized action.'; next = 'No reservation effect has been claimed.'; break;
    case 'processing': title = 'Processing · result pending'; detail = 'Sales Agent is performing approved work; the reservation result is not yet known.'; next = 'Do not present a completed effect while execution is pending.'; break;
    case 'dependency': title = 'Dependency unavailable'; detail = 'The trusted stock source cannot provide a reliable result.'; next = 'Availability is unknown, not zero. Wait or route to support.'; break;
    case 'sales': title = 'Sales Agent active'; detail = 'Sales owns the current case. Any consequential action still requires trusted authorization.'; next = 'Current Order and stock facts remain adjacent in context.'; break;
    case 'support': title = 'Support Agent active'; detail = 'Support is answering from verified Order facts; it does not perform Sales writes.'; next = 'Sales handoff is available only when an authorized Sales task is required.'; break;
    default: title = 'Active conversation'; detail = 'Support is handling Amina’s product and Order question using verified context.'; next = 'One current handler; the next response remains grounded in known facts.';
  }
  text(panel, 'State summary', title, 18, 46, 572, 'Body Strong');
  text(panel, 'State detail', detail, 18, 82, 572, 'Small');
  text(panel, 'Next safe step', next, 18, 139, 572, 'Small', fg);
  const native = v.kind === 'default' || v.kind === 'support' ? ['Conversation / Active Handler', 'Handler=Support Agent'] :
    v.kind === 'sales' ? ['Conversation / Active Handler', 'Handler=Sales Agent'] :
    v.kind === 'human' ? ['Conversation / Active Handler', 'Handler=Human Operator'] :
    v.kind === 'waiting' ? ['Conversation / Human Status', 'State=Waiting for Human'] :
    v.kind === 'processing' ? ['Conversation / Agent Status', 'State=Executing'] :
    undefined;
  if (native) {
    const narrow = native[0] === 'Conversation / Active Handler';
    const instance = instantiate(workspace, native[0], native[1], `Phase 3C / ${native[0]} / ${native[1]}`, narrow ? 380 : 322, 448, narrow ? 225 : 310);
    if (instance) {
      panel.resize(292, 198);
      const texts = panel.findAll(n => n.type === 'TEXT') as TextNode[];
      const shorter: Record<string, string> = {
        waiting: 'Human decision required for this case.',
        processing: 'Approved work is active; no result yet.',
      };
      for (const t of texts) {
        if (t.name === 'State detail') { t.characters = shorter[v.kind] ?? t.characters; t.y = 82; }
        if (t.name === 'Next safe step') t.y = 128;
        t.resize(Math.min(t.width, 260), t.height);
      }
    }
  }
}

function drawComposer(workspace: FrameNode, kind: Kind, y = 650): FrameNode {
  const active = kind === 'human';
  const composer = box(workspace, 'Composer', 20, y, 610, 158, 'surface/default', 'border/default', 8);
  text(composer, 'Composer heading', 'Reply to customer', 16, 10, 290, 'Small', 'text/secondary');
  const input = box(composer, 'Draft input area', 16, 37, 575, 60, 'surface/default', 'border/default', 6);
  text(input, 'Draft placeholder', 'Write a message to Amina…', 12, 13, 540, 'Small', 'text/secondary');
  const helper = kind === 'proposal' ? 'Awaiting customer confirmation before action can proceed. Message only.' :
    kind === 'unknown' ? 'Message only; reconciliation is still required. No mutation retry.' :
    kind === 'waiting' ? 'Message only; human decision remains pending.' :
    kind === 'processing' ? 'Message only; business result remains pending.' :
    kind === 'delivery' ? 'Message delivery failed; retry communication only.' :
    active ? 'Human Operator is the current reply owner.' : 'Message delivery is separate from business effects.';
  text(composer, 'Composer rule', helper, 16, 109, 414, 'Caption', 'text/secondary');
  button(composer, 'Send message', 'Send message', 453, 109, 138, true);
  // A native Phase 3C Composer is 310px; the wider operational input remains a screen-level composition.
  return composer;
}

function drawWorkspace(screen: FrameNode, v: Variant): void {
  const w = frame(screen, 'Conversation Workspace', 562, 72, 650, 828, 'surface/default');
  frame(w, 'Workspace divider', 649, 0, 1, 828, 'border/default');
  text(w, 'Case title', 'Amina S.  ·  Desk Lamp / Slate', 20, 15, 520, 'Card Heading');
  text(w, 'Case metadata', 'Web Chat  ·  ORD-1042  ·  Last activity 10:42', 20, 46, 490, 'Small', 'text/secondary');
  chip(w, 'Case state', v.status, v.kind === 'delivery' ? 439 : 465, 21, v.kind === 'delivery' ? 188 : 162, stateTone(v.kind).fg, stateTone(v.kind).bg);
  line(w, 'Workspace header divider', 0, 93, 650);
  drawMessageThread(w, v.kind);
  const resultRegion = drawStatePanel(w, v);
  const composer = drawComposer(w, v.kind, resultRegion ? Math.max(650, resultRegion.y + resultRegion.height + 20) : 650);
  if (resultRegion && composer.y + composer.height + 20 > w.height) {
    w.resize(w.width, composer.y + composer.height + 20);
    const divider = w.children.find(n => n.name === 'Workspace divider') as FrameNode;
    divider.resize(divider.width, w.height);
    screen.resize(screen.width, Math.max(screen.height, w.y + w.height));
  }
}

function drawContext(screen: FrameNode, v: Variant): void {
  const c = frame(screen, 'Persistent Context Panel', 1212, 72, 388, 828, 'surface/subtle');
  text(c, 'Context heading', 'Case context', 18, 18, 310, 'Card Heading');
  text(c, 'Context subtitle', 'Verified facts · current business', 18, 48, 340, 'Caption', 'text/secondary');
  const customer = box(c, 'Customer Context', 16, 83, 356, 132, 'surface/default');
  text(customer, 'Customer heading', 'CUSTOMER', 14, 12, 310, 'Label', 'text/secondary');
  text(customer, 'Customer identity', 'Amina S. · C-1042', 14, 37, 315, 'Body Strong');
  text(customer, 'Customer source', 'Web Chat · verified in North Shop', 14, 64, 315, 'Small');
  text(customer, 'Customer freshness', 'Observed 10:40 · current source', 14, 88, 315, 'Caption', 'text/secondary');
  text(customer, 'Customer link', 'Open Customer record  ↗', 14, 108, 310, 'Caption', 'action/primary');

  const order = box(c, 'Order Context', 16, 226, 356, 177, 'surface/default');
  text(order, 'Order heading', 'ORDER · ORD-1042', 14, 11, 315, 'Label', 'text/secondary');
  text(order, 'Order State label', 'ORDER STATE', 14, 41, 160, 'Label', 'text/secondary');
  text(order, 'Order State value', 'Created', 189, 40, 145, 'Body Strong', 'status/success');
  line(order, 'Order separation', 14, 75, 327);
  text(order, 'Reservation State label', 'RESERVATION STATE', 14, 86, 180, 'Label', 'text/secondary');
  text(order, 'Reservation State value', reservationFor(v.kind), 14, 111, 320, 'Small', v.kind === 'failure' ? 'status/error' : v.kind === 'unknown' || v.kind === 'waiting' ? 'status/unknown' : v.kind === 'dependency' ? 'status/dependency' : v.kind === 'confirmed' || v.kind === 'delivery' ? 'status/success' : 'text/primary');
  text(order, 'Order link', 'Open Order record  ↗', 14, 146, 310, 'Caption', 'action/primary');

  const stock = box(c, 'Inventory/Freshness', 16, 414, 356, 108, 'surface/default');
  text(stock, 'Inventory heading', 'INVENTORY · DESK LAMP / SLATE', 14, 10, 324, 'Label', 'text/secondary');
  text(stock, 'Availability', v.kind === 'dependency' ? 'Source unavailable · not zero stock' : 'Latest known availability: 4 units', 14, 38, 324, 'Small', v.kind === 'dependency' ? 'status/dependency' : 'text/primary');
  text(stock, 'Freshness', v.kind === 'dependency' ? 'Refresh when trusted source recovers' : 'Observed 10:41 · revalidate before action', 14, 70, 324, 'Caption', 'text/secondary');

  const handler = box(c, 'Active Handler', 16, 533, 356, 113, 'surface/default');
  text(handler, 'Handler heading', 'CURRENT HANDLER', 14, 10, 324, 'Label', 'text/secondary');
  const human = v.handler === 'Human Operator';
  chip(handler, 'Handler identity', human ? 'HUMAN' : 'AI SPECIALIST', 14, 37, human ? 91 : 126, human ? 'status/waiting-human' : 'status/info', human ? 'status/waiting-human-bg' : 'surface/selected');
  text(handler, 'Handler name', v.handler, 155, 39, 177, 'Small');
  text(handler, 'Handler ownership', 'One current owner · previous in history', 14, 80, 324, 'Caption', 'text/secondary');

  const escalation = box(c, 'Escalation State', 16, 657, 356, 100, v.kind === 'waiting' || v.kind === 'unknown' ? 'status/unknown-bg' : 'surface/default', 'border/default', 8);
  text(escalation, 'Escalation heading', 'ESCALATION', 14, 10, 324, 'Label', 'text/secondary');
  text(escalation, 'Escalation status', v.kind === 'waiting' ? 'Waiting for Human · decision required' : v.kind === 'unknown' ? 'Reconciliation needed · pending review' : 'No active escalation for this case', 14, 35, 324, 'Small', v.kind === 'waiting' ? 'status/waiting-human' : v.kind === 'unknown' ? 'status/unknown' : 'text/primary');
  text(escalation, 'Escalation link', 'Open Escalation  ↗', 14, 69, 230, 'Caption', 'action/primary');
  text(c, 'Context source note', 'Case facts are scoped; links recheck access.', 18, 781, 350, 'Caption', 'text/secondary');
}

// Exact names from the previous generated result compositions. replaceOwned preserves
// unmatched descendants as manual work, so obsolete generated layers need a scoped cleanup.
const LEGACY_RESULT_LAYERS = new Set([
  'Authoritative result', 'Phase 3C / Authoritative Action Result',
  'Result metadata heading', 'Result reference', 'Result observation', 'Result entity',
  'Result business', 'Result customer', 'Order remains', 'Failure observation',
  'Next safe step', 'Case customer', 'Escalation route',
  'Business Effect', 'Communication', 'Delivery heading',
  'Result label', 'Result state', 'Result meaning', 'Result evidence or next step',
  'Business effect label', 'Business effect value', 'Communication label', 'Communication value',
  'Result sender', 'Result content',
]);
const LEGACY_ROOT_LAYERS = new Set([
  'Authoritative result', 'Phase 3C / Authoritative Action Result',
  'Result metadata heading', 'Result reference', 'Result observation', 'Result entity',
  'Result business', 'Result customer', 'Order remains', 'Failure observation',
  'Next safe step', 'Case customer', 'Escalation route',
  'Business Effect', 'Communication', 'Delivery heading',
]);

function discardLegacyLayer(node: SceneNode, region: FrameNode): void {
  if ('children' in node) for (const child of [...node.children]) {
    if (LEGACY_RESULT_LAYERS.has(child.name)) discardLegacyLayer(child, region);
    else region.appendChild(child); // preserve manual descendants of an obsolete generated card
  }
  node.remove();
}

function pruneLegacyResultLayers(screen: FrameNode, kind: Kind): void {
  if (kind !== 'confirmed' && kind !== 'failure' && kind !== 'unknown' && kind !== 'delivery') return;
  const workspace = screen.children.find(n => n.type === 'FRAME' && n.name === 'Conversation Workspace') as FrameNode | undefined;
  const name = kind === 'delivery' ? 'Delivery State' : 'Business Action Result';
  const region = workspace?.children.find(n => n.type === 'FRAME' && n.name === name) as FrameNode | undefined;
  if (!workspace || !region) return;
  for (const child of [...workspace.children]) if (child !== region &&
    (child.name === 'Authoritative result' || child.name === 'Phase 3C / Authoritative Action Result')) discardLegacyLayer(child, region);
  for (const child of [...region.children]) if (LEGACY_ROOT_LAYERS.has(child.name)) discardLegacyLayer(child, region);
  const thread = workspace.children.find(n => n.type === 'FRAME' && n.name === 'Message Thread') as FrameNode | undefined;
  if (thread) for (const child of [...thread.children]) if (child.type === 'FRAME' && child.name === 'Business-result message') discardLegacyLayer(child, thread);
}

export function drawConversation(screen: FrameNode, v: Variant): void {
  drawStaffChrome(screen);
  drawList(screen, v);
  drawWorkspace(screen, v);
  drawContext(screen, v);
}

export function buildConversations(page: PageNode): string[] {
  assertWritablePage(page.name);
  const section = ensureSection(page, SECTIONS.conversations, 0, 1240, 4940, 4810);
  const staged: FrameNode[] = [];
  try {
    let rowY = 92;
    let rowHeight = 0;
    for (const [i, v] of VARIANTS.entries()) {
      if (i > 0 && i % 3 === 0) { rowY += rowHeight + 32; rowHeight = 0; }
      const x = 24 + (i % 3) * 1628;
      const n = frame(section, `${conversationName(v.key)} / staging`, x, rowY, W, H, 'surface/default');
      staged.push(n);
      drawConversation(n, v);
      rowHeight = Math.max(rowHeight, n.height);
    }
    section.resize(section.width, Math.max(section.height, rowY + rowHeight + 24));
    replaceOwned(section, CONVERSATIONS_OWNED, staged);
    for (const [i, v] of VARIANTS.entries()) pruneLegacyResultLayers(staged[i], v.kind);
    return [...CONVERSATIONS_OWNED];
  } catch (error) { staged.forEach(n => n.remove()); throw error; }
}
