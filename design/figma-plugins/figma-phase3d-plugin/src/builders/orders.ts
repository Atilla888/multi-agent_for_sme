import { ORDER_VARIANTS, SECTIONS, orderName, type OrderVariant } from '../constants';
import { fill, instantiate, stroke, type SemanticName, type TypeName } from '../design-system';
import { box, button, chip, frame, text } from '../figma-utils';
import { assertWritablePage, ORDERS_OWNED, replaceOwned } from '../ownership';
import { ensureSection } from './page-setup';
import { drawStaffChrome } from './shared-shell';

type Kind = Exclude<OrderVariant['kind'], 'list'>;
type Copy = {
  order: 'Created' | 'Needs Attention' | 'Stale / Conflict';
  reservation: 'Confirmed' | 'Known Failure' | 'OUTCOME_UNKNOWN';
  freshness: 'Fresh / Current' | 'Observed at 10:41' | 'Stale' | 'Requires Revalidation';
  orderNote: string; reservationNote: string; attention: string; version: string;
  next: string; nextDetail: string; escalation: string; activity: string[];
};
const SCREEN_W = 1760;
const WORK_W = 1516;
const INNER_W = 1468;
const GAP = 24;

const COPY: Record<Kind, Copy> = {
  confirmed: {
    order: 'Created', reservation: 'Confirmed', freshness: 'Fresh / Current',
    orderNote: 'Order ORD-1042 exists. create_order confirmed in the Order record at 10:43.',
    reservationNote: 'Inventory reserved · trusted reservation ref R-1042 at 10:43. This is separate from Order creation.',
    attention: 'No active business-effect recovery. A customer-message delivery problem cannot undo this reservation.',
    version: 'Order version v7 · Order source observed 10:43 · current for this illustration.',
    next: 'Inspect Order Delivery', nextDetail: 'Use the provider observation for fulfillment questions; do not infer shipping from Order creation.',
    escalation: 'No active Escalation is asserted for the confirmed business effect.',
    activity: ['10:43 · Order created · confirmed.', '10:43 · Reservation confirmed · R-1042.', '10:44 · Customer message delivery failed · communication only.'],
  },
  failed: {
    order: 'Created', reservation: 'Known Failure', freshness: 'Observed at 10:41',
    orderNote: 'Order ORD-1042 exists. create_order confirmed; do not create the same Order again.',
    reservationNote: 'Reservation failed — known result. Inventory is not reserved. No stock hold exists.',
    attention: 'Partial outcome: the Order exists, while the reservation is known not to have completed.',
    version: 'Order version v7 · observed 10:43. Inventory last observed 10:41; review the current source before a new proposal.',
    next: 'Review current inventory', nextDetail: 'Choose an authorized recovery path after reviewing current facts. Do not create the same Order again.',
    escalation: 'Open Escalation ESC-204 if authorized recovery requires human review.',
    activity: ['10:43 · Order created · confirmed.', '10:43 · Reservation failed · known result.', 'Next · review inventory and authorized recovery.'],
  },
  unknown: {
    order: 'Created', reservation: 'OUTCOME_UNKNOWN', freshness: 'Requires Revalidation',
    orderNote: 'Order ORD-1042 exists. create_order confirmed; this does not confirm a reservation.',
    reservationNote: 'Reservation effect may have committed. Confirmation unavailable. Operation RI-1042 retained. RECONCILIATION REQUIRED. NO BLIND RETRY.',
    attention: 'Reservation write is locked while the effect is unresolved. Human review is linked to ESC-204.',
    version: 'Order version v7 · observed 10:43. Recheck the authoritative reservation state before continuation.',
    next: 'Reconcile authoritative reservation state', nextDetail: 'Inspect the retained operation and authoritative effect first. Do not retry mutation blindly.',
    escalation: 'Open Escalation ESC-204 · reconciliation / human review required.',
    activity: ['10:43 · Order created · confirmed.', '10:43 · Reservation attempt · result unknown · RI-1042.', 'Pending · reconcile the effect; no mutation replay.'],
  },
  attention: {
    order: 'Needs Attention', reservation: 'Known Failure', freshness: 'Observed at 10:41',
    orderNote: 'Order ORD-1042 exists. The Order record flags an unresolved business decision for a Human Operator.',
    reservationNote: 'Reservation failed — known result; inventory is not reserved. The human path does not make it unknown.',
    attention: 'Confirmed: Order exists and no reservation completed. Unresolved: which authorized recovery the current policy permits.',
    version: 'Order version v7 · observed 10:43. Refresh current Order and inventory facts before a consequential decision.',
    next: 'Request authorized handling', nextDetail: 'Route the known partial outcome to a Human Operator; do not infer approval or repeat an Order write.',
    escalation: 'Open Escalation ESC-204 · human decision pending.',
    activity: ['10:43 · Order created · confirmed.', '10:43 · Reservation failed · known result.', 'Pending · Human Operator reviews recovery policy.'],
  },
  stale: {
    order: 'Stale / Conflict', reservation: 'Confirmed', freshness: 'Stale',
    orderNote: 'Order ORD-1042 exists, but the observed Order version may no longer be current.',
    reservationNote: 'Reservation was confirmed in the observed record. This does not establish current inventory availability.',
    attention: 'Order version v7 was observed at 10:43; a newer or conflicting revision may exist. Facts are not decision-safe.',
    version: 'Observed Order version v7 · current revision not verified. Refresh and revalidate before any consequential action.',
    next: 'Refresh and revalidate', nextDetail: 'Compare authoritative current Order and inventory facts. Do not automatically replay any write.',
    escalation: 'No active Escalation is asserted; route a persistent conflict to authorized human review.',
    activity: ['10:43 · Order version v7 observed.', 'Later · current revision not verified.', 'Next · refresh, resolve conflict and re-evaluate.'],
  },
  e02: {
    order: 'Created', reservation: 'Confirmed', freshness: 'Requires Revalidation',
    orderNote: 'Current known Order State: Created · verified in Order record. No Order update is claimed.',
    reservationNote: 'Reservation remains a separate confirmed fact. E02 is not a reservation failure or unknown effect.',
    attention: 'E02 · automatic update_order mutation is restricted. Requested change: Order ORD-1042 details. No update executed.',
    version: 'Order version v7 · observed 10:43. Recheck current state before any future approved policy path.',
    next: 'Request authorized human/policy handling', nextDetail: 'Do not enable Update Order; the unresolved E02 business policy cannot be bypassed by a visible control.',
    escalation: 'Open Escalation ESC-204 · restricted update / policy handling.',
    activity: ['10:43 · Order created · confirmed.', '10:43 · Reservation confirmed independently.', 'E02 · requested update restricted; no mutation executed.'],
  },
};

function tone(state: string): { fg: SemanticName; bg: SemanticName } {
  if (state === 'OUTCOME_UNKNOWN') return { fg: 'status/unknown', bg: 'status/unknown-bg' };
  if (state.includes('Failure')) return { fg: 'status/error', bg: 'status/error-bg' };
  if (state === 'Needs Attention') return { fg: 'status/warning', bg: 'status/warning-bg' };
  if (state === 'Stale / Conflict') return { fg: 'status/stale', bg: 'status/stale-bg' };
  return { fg: 'status/success', bg: 'status/success-bg' };
}

function flow(parent: FrameNode, name: string, value: string, x: number, y: number, w: number, type: TypeName = 'Small', color: SemanticName = 'text/primary'): number {
  const n = text(parent, name, value, x, y, w, type, color);
  return y + n.height;
}

function setInstanceText(instance: InstanceNode, name: string, value: string): void {
  const node = instance.findAll(n => n.type === 'TEXT' && n.name === name)[0] as TextNode | undefined;
  if (node) node.characters = value;
}

function componentOrFallback(parent: FrameNode, source: string, variant: string | undefined, name: string, x: number, y: number, w: number, h: number, heading: string, meaning: string, detail: string, color: SemanticName): FrameNode | InstanceNode {
  const native = instantiate(parent, source, variant, name, x, y, w);
  if (native) return native;
  const fallback = box(parent, name, x, y, w, h, 'surface/default', color, 8);
  flow(fallback, 'Component heading', heading, 14, 14, w - 28, 'Label', color);
  flow(fallback, 'Component meaning', meaning, 14, 50, w - 28, 'Body Strong');
  const bottom = flow(fallback, 'Component detail', detail, 14, Math.min(106, h - 52), w - 28, 'Small', 'text/secondary');
  fallback.resize(w, Math.max(h, bottom + 16));
  return fallback;
}

function drawOrdersChrome(screen: FrameNode, title: string): FrameNode {
  drawStaffChrome(screen, true);
  const nav = screen.children.find(n => n.name === 'Staff navigation') as FrameNode;
  const conversations = nav.children.find(n => n.name === 'Primary / Conversations') as FrameNode;
  const business = nav.children.find(n => n.name === 'Primary / Business') as FrameNode;
  fill(conversations, 'surface/default'); conversations.strokes = [];
  conversations.children.filter(n => n.name === 'Active marker' || n.name === 'Current state').forEach(n => n.remove());
  fill(conversations.children.find(n => n.name === 'Primary label / Conversations') as TextNode, 'text/primary');
  fill(business, 'surface/selected'); stroke(business, 'border/interactive');
  frame(business, 'Active marker', 0, 5, 3, 26, 'action/primary');
  fill(business.children.find(n => n.name === 'Primary label / Business') as TextNode, 'action/primary');
  text(business, 'Current state', '•', 184, 8, 16, 'Small', 'action/primary');
  const nested = nav.findAll(n => n.type === 'TEXT' && n.name === 'Nested / Business / Orders')[0] as TextNode;
  fill(nested, 'action/primary'); nested.fontName = { family: 'Inter', style: 'Semi Bold' };
  frame(nav, 'Orders active marker', 24, nested.y + 1, 3, 20, 'action/primary');
  const header = screen.children.find(n => n.name === 'Page/context header') as FrameNode;
  (header.children.find(n => n.name === 'Breadcrumb/page context') as TextNode).characters = `Business  /  Orders  /  ${title}`;
  (header.children.find(n => n.name === 'Current active area') as TextNode).characters = 'Orders';
  header.resize(WORK_W, header.height);
  (header.children.find(n => n.name === 'Header divider') as FrameNode).resize(WORK_W, 1);
  return frame(screen, 'Orders Workspace', 244, 72, WORK_W, 1, 'surface/subtle');
}

function finishScreen(screen: FrameNode, main: FrameNode, height: number): void {
  main.resize(WORK_W, Math.max(height, 820));
  screen.resize(SCREEN_W, main.y + main.height);
  const nav = screen.children.find(n => n.name === 'Staff navigation') as FrameNode;
  nav.resize(nav.width, screen.height);
  (nav.children.find(n => n.name === 'Navigation divider') as FrameNode).resize(1, screen.height);
  (nav.children.find(n => n.name === 'Account/session') as FrameNode).y = screen.height - 80;
}

function filter(parent: FrameNode, name: string, label: string, value: string, x: number, w: number): void {
  const control = box(parent, name, x, 88, w, 67, 'surface/default', 'border/interactive', 6);
  flow(control, 'Persistent label', label, 12, 8, w - 24, 'Label', 'text/secondary');
  flow(control, 'Visible value', value, 12, 31, w - 24, 'Small');
}

function listRow(parent: FrameNode, y: number, reference: string, customer: string, order: string, reservation: string, updated: string, attention: string, selected = false): void {
  const row = box(parent, `Order row / ${reference}`, 0, y, INNER_W, 76, selected ? 'surface/selected' : 'surface/default', selected ? 'border/interactive' : 'border/default', 8);
  if (selected) frame(row, 'Selected row marker', 0, 7, 3, 62, 'action/primary');
  flow(row, 'Order reference', reference, 16, 14, 180, 'Body Strong');
  flow(row, 'Customer', customer, 211, 16, 186, 'Small');
  const o = tone(order), r = tone(reservation);
  chip(row, 'Order state', order, 412, 21, 210, o.fg, o.bg);
  chip(row, 'Reservation state', reservation, 638, 21, 270, r.fg, r.bg);
  flow(row, 'Updated', updated, 924, 17, 173, 'Small', 'text/secondary');
  flow(row, 'Attention', attention, 1110, 12, 335, 'Small', attention === 'None' ? 'text/secondary' : 'status/warning');
}

function drawList(screen: FrameNode): void {
  const main = drawOrdersChrome(screen, 'List');
  flow(main, 'Page title', 'Orders', 24, 24, 700, 'Page Title');
  flow(main, 'Page subtitle', 'North Shop · inspect Order and Reservation as independent business facts', 24, 64, 1200, 'Small', 'text/secondary');
  const filters = frame(main, 'Orders Filters', 24, 108, INNER_W, 173, 'surface/subtle');
  flow(filters, 'Filter heading', 'FIND AN ORDER', 0, 4, 600, 'Label', 'text/secondary');
  filter(filters, 'Search orders', 'SEARCH ORDERS', 'Order reference or customer', 0, 400);
  filter(filters, 'Order-state filter', 'ORDER STATE', 'All Order states  ▾', 416, 300);
  filter(filters, 'Reservation-state filter', 'RESERVATION STATE', 'All reservation states  ▾', 732, 350);
  filter(filters, 'Attention filter', 'NEEDS REVIEW', 'All  ▾', 1098, 370);
  const table = frame(main, 'Orders List', 24, 305, INNER_W, 1, 'surface/subtle');
  flow(table, 'List heading', 'Orders List · mixed states', 0, 0, 900, 'Section Heading');
  flow(table, 'List explanation', 'Each row keeps Order State and Reservation State separate. Select a row to inspect current facts.', 0, 35, 1400, 'Small', 'text/secondary');
  const header = box(table, 'Column headings', 0, 72, INNER_W, 37, 'surface/default', 'border/default', 6);
  for (const [name, x, w] of [['ORDER', 16, 180], ['CUSTOMER', 211, 186], ['ORDER STATE', 412, 210], ['RESERVATION STATE', 638, 270], ['UPDATED', 924, 173], ['ATTENTION', 1110, 335]] as const)
    flow(header, `Column / ${name}`, name, x, 9, w, 'Label', 'text/secondary');
  listRow(table, 121, 'ORD-1042', 'Amina S.', 'Created', 'Confirmed', '10:43 · current', 'None', true);
  listRow(table, 209, 'ORD-1043', 'Sample customer B.', 'Created', 'Failed · Known Failure', '10:43 · observed', 'Review inventory');
  listRow(table, 297, 'ORD-1044', 'Sample customer C.', 'Created', 'OUTCOME_UNKNOWN', '10:43 · pending', 'Reconcile before retry');
  listRow(table, 385, 'ORD-1045', 'Sample customer D.', 'Needs Attention', 'Known Failure', '10:47 · review', 'Human attention');
  listRow(table, 473, 'ORD-1046', 'Sample customer E.', 'Stale / Conflict', 'Confirmed', '10:43 · stale', 'Refresh facts');
  flow(table, 'List safety note', 'Search/filter is scoped to authorized records. A visible Order reference does not grant backend access.', 0, 566, 1380, 'Caption', 'text/secondary');
  table.resize(INNER_W, 601);
  finishScreen(screen, main, table.y + table.height + 24);
}

function statePanel(main: FrameNode, name: 'Order State' | 'Reservation State', spec: Copy, x: number, y: number): FrameNode {
  const panel = box(main, name, x, y, 722, 265, 'surface/default', 'border/default', 8);
  const isOrder = name === 'Order State';
  flow(panel, 'State hierarchy label', isOrder ? 'ORDER STATE · ORDER RECORD' : 'RESERVATION STATE · STOCK HOLD', 16, 12, 690, 'Label', 'text/secondary');
  const state = isOrder ? spec.order : spec.reservation;
  const size = isOrder ? { h: 172, source: 'Business / Order State' } : { h: 224, source: 'Business / Reservation State' };
  const component = componentOrFallback(panel, size.source, `State=${state}`, `${name} component`, 16, 38, 310, size.h, name.toUpperCase(), state, isOrder ? 'Order record exists or needs current review.' : spec.reservationNote, tone(state).fg);
  let end = flow(panel, 'State explanation', isOrder ? spec.orderNote : spec.reservationNote, 350, 51, 350, 'Body Strong');
  end = flow(panel, 'State source', isOrder ? 'Source: Order record · observed 10:43' : 'Source: reservation result / operation evidence', 350, end + 15, 350, 'Small', 'text/secondary');
  panel.resize(722, Math.max(265, component.height + 54, end + 18));
  return panel;
}

function attentionPanel(main: FrameNode, kind: Kind, spec: Copy, y: number): FrameNode {
  const p = box(main, 'Attention and Safety', 24, y, INNER_W, 1, kind === 'unknown' ? 'status/unknown-bg' : kind === 'e02' ? 'status/restricted-bg' : kind === 'stale' ? 'status/stale-bg' : 'surface/default', kind === 'unknown' ? 'status/unknown' : kind === 'e02' ? 'status/restricted' : 'border/default', 8);
  if (kind === 'e02') {
    const native = instantiate(p, 'Business / E02 Restricted', undefined, 'E02 Restricted component', 16, 16, 970);
    if (native) {
      setInstanceText(native, 'Requested change value', 'Change Order ORD-1042 details');
      setInstanceText(native, 'Known Order state value', 'Created / verified in Order record');
    } else componentOrFallback(p, 'Business / E02 Restricted', undefined, 'E02 Restricted component', 16, 16, 970, 234, 'E02 / AUTOMATIC ORDER UPDATE RESTRICTED', 'Requested change: Order ORD-1042 details', 'update_order unavailable · route to authorized human/policy handling.', 'status/restricted');
    const boundaryEnd = flow(p, 'E02 boundary', 'Automatic update_order restricted. NOT Permission Denied. NOT Reservation Failure. NOT OUTCOME_UNKNOWN. No update executed.', 1008, 52, 420, 'Body Strong', 'status/restricted');
    const noteEnd = flow(p, 'E02 policy note', 'A visible action cannot bypass backend policy. No normal Update Order control is enabled.', 1008, boundaryEnd + 14, 420, 'Small', 'text/secondary');
    p.resize(INNER_W, Math.max(266, noteEnd + 18));
  } else {
    flow(p, 'Attention heading', kind === 'confirmed' ? 'CURRENT BUSINESS EFFECT' : kind === 'unknown' ? 'RECONCILIATION REQUIRED' : kind === 'stale' ? 'STATE SAFETY / STALE' : 'NEEDS REVIEW', 18, 16, 800, 'Label', kind === 'unknown' ? 'status/unknown' : kind === 'stale' ? 'status/stale' : 'text/secondary');
    const end = flow(p, 'Attention meaning', spec.attention, 18, 45, INNER_W - 36, 'Body Strong');
    p.resize(INNER_W, Math.max(100, end + 18));
  }
  return p;
}

function customerItemsFreshness(main: FrameNode, spec: Copy, y: number): number {
  const customer = componentOrFallback(main, 'Business / Customer Summary', undefined, 'Customer Summary', 24, y, 470, 268, 'CUSTOMER SUMMARY', 'Amina S. · C-1042', 'Verified in North Shop · Conversation C-42.', 'status/success');
  const items = box(main, 'Order Items', 24 + 470 + 29, y, 470, 268, 'surface/default', 'border/default', 8);
  flow(items, 'Items heading', 'ORDER ITEMS', 16, 14, 438, 'Label', 'text/secondary');
  flow(items, 'Product', 'Product · Desk Lamp', 16, 51, 438, 'Body Strong');
  flow(items, 'Variant', 'Variant · Slate', 16, 84, 438, 'Small');
  flow(items, 'Quantity', 'Quantity · 1', 16, 115, 438, 'Small');
  flow(items, 'Catalog boundary', 'Product record exists ≠ inventory available.', 16, 158, 438, 'Small', 'status/info');
  flow(items, 'Inventory boundary', 'Stock requires current Inventory Status; unavailable ≠ zero stock.', 16, 199, 438, 'Small', 'text/secondary');
  const fresh = box(main, 'Freshness and Version', 24 + 2 * (470 + 29), y, 470, 268, 'surface/default', 'border/default', 8);
  const native = componentOrFallback(fresh, 'Business / Freshness', `State=${spec.freshness}`, 'Freshness component', 0, 0, 470, 150, 'FRESHNESS', spec.freshness, 'Refresh before consequential action when stale.', 'status/stale');
  const v = flow(fresh, 'Version note', spec.version, 16, native.height + 16, 438, 'Small', 'text/secondary');
  fresh.resize(470, Math.max(268, v + 16));
  return y + Math.max(customer.height, items.height, fresh.height);
}

function deliveryPanel(main: FrameNode, kind: Kind, y: number): number {
  const order = box(main, 'Order Delivery', 24, y, 722, 242, 'surface/default', 'border/default', 8);
  flow(order, 'Domain label', 'ORDER DELIVERY · logistics / fulfillment', 16, 13, 680, 'Label', 'text/secondary');
  if (kind === 'confirmed') {
    componentOrFallback(order, 'Business / Order Delivery Status', 'Example=In Transit', 'Order Delivery Status component', 16, 44, 470, 153, 'ORDER DELIVERY / DESIGN EXAMPLE', 'In Transit · example only', 'Provider status / observed 10:45.', 'status/info');
    flow(order, 'Order Delivery meaning', 'Design/demo value only; not a frozen backend enum. Provider source and observed time govern the claim.', 502, 55, 202, 'Small');
  } else {
    const empty = box(order, 'No Order Delivery claim', 16, 44, 470, 153, 'surface/subtle', 'border/default', 8);
    flow(empty, 'No claim label', 'NO PROVIDER RESULT SHOWN', 14, 16, 442, 'Label', 'text/secondary');
    flow(empty, 'No claim detail', 'This scenario makes no claim about current logistics status.', 14, 59, 442, 'Small');
    flow(order, 'Order Delivery meaning', 'Order Delivery comes from an authorized provider read; unavailable is not “not shipped”.', 502, 55, 202, 'Small');
  }
  const message = box(main, 'Message Delivery', 24 + 722 + GAP, y, 722, 242, 'surface/default', 'border/default', 8);
  flow(message, 'Domain label', 'MESSAGE DELIVERY · customer communication', 16, 13, 680, 'Label', 'text/secondary');
  if (kind === 'confirmed') {
    componentOrFallback(message, 'Communication / Message Delivery Status', 'State=Delivery Failed', 'Message Delivery Status component', 16, 44, 310, 178, 'MESSAGE DELIVERY', 'Delivery Failed', 'Recover communication only.', 'status/error');
    flow(message, 'Message Delivery meaning', 'Customer message failed. Order remains created; Reservation remains confirmed. Retry communication only; never replay reserve_inventory.', 350, 58, 350, 'Small');
  } else {
    const empty = box(message, 'No Message Delivery claim', 16, 44, 310, 178, 'surface/subtle', 'border/default', 8);
    flow(empty, 'No claim label', 'NO MESSAGE RESULT SHOWN', 14, 16, 282, 'Label', 'text/secondary');
    flow(empty, 'No claim detail', 'No communication receipt is asserted in this state.', 14, 60, 282, 'Small');
    flow(message, 'Message Delivery meaning', 'Message delivery is transport; it never changes the known Order or Reservation effect.', 350, 58, 350, 'Small');
  }
  return y + Math.max(order.height, message.height);
}

function nextAndLinks(main: FrameNode, kind: Kind, spec: Copy, y: number): number {
  const next = box(main, 'Next Safe Step', 24, y, INNER_W, 1, 'surface/default', 'border/interactive', 8);
  flow(next, 'Step heading', 'NEXT SAFE STEP', 18, 14, 800, 'Label', 'action/primary');
  const detailEnd = flow(next, 'Step explanation', spec.nextDetail, 18, 44, 1010, 'Body Strong');
  button(next, 'Primary safe action', spec.next, 1056, 30, 390, true);
  next.resize(INNER_W, Math.max(96, detailEnd + 18));
  const relatedY = y + next.height + GAP;
  const related = box(main, 'Related Work', 24, relatedY, INNER_W, 1, 'surface/default', 'border/default', 8);
  const conversation = box(related, 'Related Conversation', 16, 43, 710, 111, 'surface/subtle', 'border/default', 8);
  flow(conversation, 'Conversation reference', 'RELATED CONVERSATION · C-42', 14, 12, 680, 'Label', 'text/secondary');
  flow(conversation, 'Conversation status', 'Amina S. · North Shop · customer communication context', 14, 37, 680, 'Small');
  flow(conversation, 'Conversation link', 'Open Conversation C-42  ↗', 14, 72, 680, 'Small', 'action/primary');
  const escalation = box(related, 'Escalation Relationship', 742, 43, 710, 111, 'surface/subtle', 'border/default', 8);
  flow(escalation, 'Escalation heading', 'ATTENTION / ESCALATION', 14, 12, 680, 'Label', 'text/secondary');
  flow(escalation, 'Escalation meaning', spec.escalation, 14, 37, 680, 'Small');
  if (kind === 'unknown' || kind === 'attention' || kind === 'e02') flow(escalation, 'Escalation link', 'Open Escalation ESC-204  ↗', 14, 72, 680, 'Small', 'action/primary');
  related.resize(INNER_W, 170);
  flow(related, 'Related heading', 'RELATED RECORDS · scoped links recheck access', 16, 13, 1200, 'Label', 'text/secondary');
  const activityY = relatedY + related.height + GAP;
  const activity = box(main, 'Business Effect Activity', 24, activityY, INNER_W, 1, 'surface/default', 'border/default', 8);
  let cursor = flow(activity, 'Activity heading', 'BUSINESS EFFECT / ACTIVITY SUMMARY', 18, 14, INNER_W - 36, 'Label', 'text/secondary') + 12;
  for (const [i, item] of spec.activity.entries()) cursor = flow(activity, `Activity / ${i + 1}`, item, 18, cursor, INNER_W - 36, 'Small') + 8;
  activity.resize(INNER_W, cursor + 12);
  return activityY + activity.height;
}

function drawDetail(screen: FrameNode, kind: Kind): void {
  const spec = COPY[kind];
  const main = drawOrdersChrome(screen, 'ORD-1042');
  flow(main, 'Page title', 'Order ORD-1042', 24, 24, 880, 'Page Title');
  flow(main, 'Page subtitle', 'Amina S. · Desk Lamp / Slate · North Shop · authoritative Order and separate Reservation', 24, 65, 1390, 'Small', 'text/secondary');
  const stateY = 110;
  const order = statePanel(main, 'Order State', spec, 24, stateY);
  const reservation = statePanel(main, 'Reservation State', spec, 24 + 722 + GAP, stateY);
  const attentionY = stateY + Math.max(order.height, reservation.height) + GAP;
  const attention = attentionPanel(main, kind, spec, attentionY);
  const contextBottom = customerItemsFreshness(main, spec, attentionY + attention.height + GAP);
  const deliveryBottom = deliveryPanel(main, kind, contextBottom + GAP);
  const bottom = nextAndLinks(main, kind, spec, deliveryBottom + GAP);
  finishScreen(screen, main, bottom + 24);
}

export function buildOrders(page: PageNode): string[] {
  assertWritablePage(page.name);
  const escalations = page.children.find(n => n.type === 'FRAME' && n.name === SECTIONS.escalations) as FrameNode | undefined;
  const section = ensureSection(page, SECTIONS.orders, 0, escalations ? escalations.y + escalations.height + 60 : 10000, 3580, 1);
  const staged: FrameNode[] = [];
  try {
    let rowY = 86, rowHeight = 0;
    for (const [i, variant] of ORDER_VARIANTS.entries()) {
      if (i > 0 && i % 2 === 0) { rowY += rowHeight + 32; rowHeight = 0; }
      const screen = frame(section, `${orderName(variant.key)} / staging`, 24 + (i % 2) * 1780, rowY, SCREEN_W, 900, 'surface/default');
      staged.push(screen);
      if (variant.kind === 'list') drawList(screen);
      else drawDetail(screen, variant.kind);
      rowHeight = Math.max(rowHeight, screen.height);
    }
    section.resize(section.width, rowY + rowHeight + 24);
    replaceOwned(section, ORDERS_OWNED, staged);
    return [...ORDERS_OWNED];
  } catch (error) { staged.forEach(n => n.remove()); throw error; }
}
