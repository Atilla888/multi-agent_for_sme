import { ORDER_VARIANTS, SECTIONS, TARGET_PAGE, orderName } from '../constants';
import { allText, exactFrame } from '../figma-utils';
import type { Check, Validation } from './phase3d';

const check = (label: string, pass: boolean, detail?: string): Check => ({ label, pass, detail });
const has = (node: FrameNode | undefined, value: string): boolean => Boolean(node && allText(node).includes(value));
type Bounds = { x: number; y: number; width: number; height: number };
const fits = (n: Bounds, p: Bounds): boolean =>
  [n.x, n.y, n.width, n.height].every(Number.isFinite) && n.x >= 0 && n.y >= 0 && n.width > 0 && n.height > 0 &&
  n.x + n.width <= p.width + 1 && n.y + n.height <= p.height + 1;
const overlaps = (a: Bounds, b: Bounds): boolean =>
  a.x < b.x + b.width - 0.5 && b.x < a.x + a.width - 0.5 &&
  a.y < b.y + b.height - 0.5 && b.y < a.y + a.height - 0.5;
const direct = (root: FrameNode, name: string): SceneNode | undefined => {
  const matches = root.children.filter(n => n.name === name);
  return matches.length === 1 ? matches[0] : undefined;
};
const descendant = (root: FrameNode, name: string): SceneNode | undefined => {
  const matches = root.findAll(n => n.name === name);
  return matches.length === 1 ? matches[0] : undefined;
};
const detailBlocks = [
  'Order State', 'Reservation State', 'Attention and Safety', 'Customer Summary', 'Order Items',
  'Freshness and Version', 'Order Delivery', 'Message Delivery', 'Next Safe Step', 'Related Work', 'Business Effect Activity',
] as const;
const expectedStates: Record<string, { order: string; reservation: string }> = {
  'Reservation Confirmed': { order: 'Created', reservation: 'Confirmed' },
  'Reservation Failed': { order: 'Created', reservation: 'Known Failure' },
  OUTCOME_UNKNOWN: { order: 'Created', reservation: 'OUTCOME_UNKNOWN' },
  'Needs Attention': { order: 'Needs Attention', reservation: 'Known Failure' },
  'Stale Conflict': { order: 'Stale / Conflict', reservation: 'Confirmed' },
  'E02 Restricted': { order: 'Created', reservation: 'Confirmed' },
};

function geometryFits(screen: FrameNode, list: boolean): boolean {
  const nav = direct(screen, 'Staff navigation');
  const main = direct(screen, 'Orders Workspace');
  if (!nav || nav.type !== 'FRAME' || !main || main.type !== 'FRAME' || !fits(nav, screen) || !fits(main, screen) || overlaps(nav, main)) return false;
  const names = list ? ['Orders Filters', 'Orders List'] : [...detailBlocks];
  const blocks = names.map(name => direct(main, name));
  if (blocks.some(n => !n || (n.type !== 'FRAME' && n.type !== 'INSTANCE'))) return false;
  const placed = blocks as (FrameNode | InstanceNode)[];
  if (!placed.every(n => fits(n, main)) || !placed.every((a, i) => placed.slice(i + 1).every(b => !overlaps(a, b)))) return false;
  if (list) {
    const table = direct(main, 'Orders List') as FrameNode;
    const rows = table.children.filter(n => n.name.startsWith('Order row / '));
    if (rows.length < 5 || !rows.every(n => fits(n, table)) || !rows.every((a, i) => rows.slice(i + 1).every(b => !overlaps(a, b)))) return false;
  } else {
    const order = direct(main, 'Order State') as FrameNode;
    const reserve = direct(main, 'Reservation State') as FrameNode;
    if (!descendant(order, 'Order State component') || !descendant(reserve, 'Reservation State component')) return false;
    const next = direct(main, 'Next Safe Step') as FrameNode;
    if (!descendant(next, 'Primary safe action')) return false;
  }
  const texts = main.findAll(n => n.type === 'TEXT');
  return texts.every(n => {
    const parent = n.parent;
    return parent && 'width' in parent && 'height' in parent && fits(n, parent);
  }) && texts.every((a, i) => texts.slice(i + 1).every(b => a.parent !== b.parent || !overlaps(a, b)));
}

export function validateOrders(page: PageNode | undefined): Validation {
  const section = page ? exactFrame(page, SECTIONS.orders) : undefined;
  const checks: Check[] = [
    check('03D page', Boolean(page && page.name === TARGET_PAGE)),
    check('Orders section', Boolean(section)),
  ];
  const screens = new Map<string, FrameNode>();
  if (section) for (const variant of ORDER_VARIANTS) {
    const matches = section.children.filter(n => n.name === orderName(variant.key));
    const valid = matches.length === 1 && matches[0].type === 'FRAME';
    checks.push(check(variant.title, valid, valid ? undefined : `${matches.length} exact match(es)`));
    if (valid) screens.set(variant.key, matches[0] as FrameNode);
  }
  for (const [key, screen] of screens) {
    const list = key === 'List';
    const main = direct(screen, 'Orders Workspace') as FrameNode | undefined;
    checks.push(check(`${key} / Business → Orders navigation`, has(screen, 'Business') && has(screen, 'Orders') && Boolean(descendant(screen, 'Orders active marker'))));
    checks.push(check(`${key} / geometry`, geometryFits(screen, list)));
    if (list) {
      const filters = main ? direct(main, 'Orders Filters') : undefined;
      checks.push(check('List / search and independent filters', Boolean(filters && filters.type === 'FRAME' && ['Search orders', 'Order-state filter', 'Reservation-state filter', 'Attention filter'].every(n => Boolean(direct(filters, n))))));
      checks.push(check('List / mixed independent states', has(screen, 'Created') && has(screen, 'Confirmed') && has(screen, 'Known Failure') && has(screen, 'OUTCOME_UNKNOWN') && has(screen, 'Needs Attention')));
    } else {
      checks.push(check(`${key} / Order Detail structure`, Boolean(main && detailBlocks.every(n => Boolean(direct(main, n))))));
      checks.push(check(`${key} / Customer + Items + Freshness`, has(screen, 'Amina S.') && has(screen, 'Desk Lamp') && has(screen, 'Slate') && has(screen, 'Quantity') && has(screen, 'version v7')));
      checks.push(check(`${key} / related Conversation`, has(screen, 'Open Conversation C-42')));
      const orderBlock = main ? direct(main, 'Order State') : undefined;
      const reservationBlock = main ? direct(main, 'Reservation State') : undefined;
      const expected = expectedStates[key];
      checks.push(check(`${key} / Order and Reservation separate`, Boolean(orderBlock && reservationBlock && orderBlock.type === 'FRAME' && reservationBlock.type === 'FRAME' && expected && allText(orderBlock).includes(expected.order) && allText(reservationBlock).includes(expected.reservation))));
    }
  }
  const confirmed = screens.get('Reservation Confirmed');
  checks.push(check('Confirmed reservation independently trusted', has(confirmed, 'Order ORD-1042 exists') && has(confirmed, 'Inventory reserved') && has(confirmed, 'Reservation confirmed')));
  const failed = screens.get('Reservation Failed');
  checks.push(check('Known Failure is known and has authorized recovery', has(failed, 'Reservation failed — known result') && has(failed, 'Inventory is not reserved') && has(failed, 'Review current inventory') && has(failed, 'authorized recovery') && !Boolean(failed && /reconcil/i.test(allText(failed)))));
  const unknown = screens.get('OUTCOME_UNKNOWN');
  const unknownAction = unknown ? descendant(unknown, 'Primary safe action') : undefined;
  const unknownActionText = unknownAction && unknownAction.type === 'FRAME' ? allText(unknownAction) : '';
  checks.push(check('OUTCOME_UNKNOWN reconciles before retry', has(unknown, 'Reservation effect may have committed') && has(unknown, 'Confirmation unavailable') && has(unknown, 'RI-1042') && has(unknown, 'RECONCILIATION REQUIRED') && has(unknown, 'NO BLIND RETRY') && has(unknown, 'Reconcile authoritative reservation state') && !/retry reservation|reserve again|repeat mutation/i.test(unknownActionText)));
  checks.push(check('OUTCOME_UNKNOWN links Escalation', has(unknown, 'Open Escalation ESC-204')));
  const attention = screens.get('Needs Attention');
  checks.push(check('Needs Human Attention keeps known and unresolved facts separate', has(attention, 'Order ORD-1042 exists') && has(attention, 'Unresolved:') && has(attention, 'Human Operator') && has(attention, 'Open Escalation ESC-204')));
  const stale = screens.get('Stale Conflict');
  checks.push(check('Stale / Conflict requires refresh and revalidation', has(stale, 'Stale / Conflict') && has(stale, 'current revision not verified') && has(stale, 'Refresh and revalidate') && has(stale, 'Do not automatically replay')));
  const e02 = screens.get('E02 Restricted');
  const e02Action = e02 ? descendant(e02, 'Primary safe action') : undefined;
  const e02ActionText = e02Action && e02Action.type === 'FRAME' ? allText(e02Action) : '';
  checks.push(check('E02 update restricted and separate', has(e02, 'update_order') && has(e02, 'No update executed') && has(e02, 'NOT Permission Denied') && has(e02, 'NOT OUTCOME_UNKNOWN') && has(e02, 'human/policy handling') && has(e02, 'RESERVATION STATE · STOCK HOLD') && has(e02, 'Confirmed') && !/^(?:update order|approve update)$/i.test(e02ActionText.trim())));
  checks.push(check('Product existence is not inventory availability', ORDER_VARIANTS.filter(v => v.kind !== 'list').every(v => has(screens.get(v.key), 'Product record exists ≠ inventory available'))));
  checks.push(check('Unavailable inventory is not zero stock', ORDER_VARIANTS.filter(v => v.kind !== 'list').every(v => has(screens.get(v.key), 'unavailable ≠ zero stock'))));
  checks.push(check('Order Delivery remains separate from Message Delivery', Boolean(confirmed && descendant(confirmed, 'Order Delivery') && descendant(confirmed, 'Message Delivery') && has(confirmed, 'ORDER DELIVERY · logistics') && has(confirmed, 'MESSAGE DELIVERY · customer communication') && has(confirmed, 'Retry communication only') && has(confirmed, 'Reservation remains confirmed'))));
  return { section: 'Orders', checks, pass: checks.every(c => c.pass) };
}

export function formatOrdersValidation(result: Validation): string {
  return [
    'PHASE 3D ORDERS VALIDATION',
    `${result.pass ? 'PASS' : 'FAIL'} · structural, semantic and generated-node geometry; manual visual review required.`,
    ...result.checks.map(c => `${c.label}: ${c.pass ? 'PASS' : 'FAIL'}${c.detail ? ` (${c.detail})` : ''}`),
  ].join('\n');
}
