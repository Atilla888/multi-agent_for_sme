import { SECTIONS, TARGET_PAGE, WEB_CHAT_VARIANTS, webChatName } from '../constants';
import { allText, exactFrame } from '../figma-utils';
import type { Check, Validation } from './phase3d';

type Bounds = { x: number; y: number; width: number; height: number };
const check = (label: string, pass: boolean, detail?: string): Check => ({ label, pass, detail });
const fits = (n: Bounds, p: Bounds): boolean =>
  [n.x, n.y, n.width, n.height].every(Number.isFinite) && n.x >= 0 && n.y >= 0 && n.width > 0 && n.height > 0 &&
  n.x + n.width <= p.width + 1 && n.y + n.height <= p.height + 1;
const ordered = (a: Bounds, b: Bounds, gap = 0): boolean => a.y + a.height + gap <= b.y + 1;
const direct = (parent: FrameNode, name: string): FrameNode | undefined => {
  const matches = parent.children.filter(n => n.type === 'FRAME' && n.name === name);
  return matches.length === 1 ? matches[0] as FrameNode : undefined;
};
const named = (root: FrameNode | undefined, name: string): SceneNode | undefined => {
  if (!root) return undefined;
  const matches = root.findAll(n => n.name === name);
  return matches.length === 1 ? matches[0] : undefined;
};
const has = (node: FrameNode | undefined, phrase: string): boolean => Boolean(node && allText(node).includes(phrase));
const forbidden = /create_order|reserve_inventory|update_order|ToolCall|Agent Run|LangGraph|OUTCOME_UNKNOWN|MODEL_NOT_READY|\bE02\b|\bM12\b|internal confidence|technical handoff|chain-of-thought/i;

function geometry(screen: FrameNode): boolean {
  if (screen.width < 390 || screen.width > 430 || screen.clipsContent) return false;
  const header = direct(screen, 'Service Header');
  const history = direct(screen, 'Message History');
  const state = direct(screen, 'Customer State');
  const composer = direct(screen, 'Customer Composer');
  if (!header || !history || !state || !composer) return false;
  if (![header, history, state, composer].every(n => fits(n, screen))) return false;
  if (!ordered(header, history, 8) || !ordered(history, state, 8) || !ordered(state, composer, 8)) return false;
  const messages = history.children.filter(n => n.type === 'INSTANCE') as InstanceNode[];
  if (!messages.every(n => fits(n, history)) || !messages.every((n, i) => i === 0 || ordered(messages[i - 1], n, 8))) return false;
  if (!state.children.every(n => 'width' in n && fits(n, state))) return false;
  if (!composer.children.every(n => 'width' in n && fits(n, composer))) return false;
  const actionFrames = screen.findAll(n => n.type === 'FRAME' && /action|confirm order/i.test(n.name) && n.children?.some(c => c.type === 'TEXT' && c.name === 'Action label')) as FrameNode[];
  for (const action of actionFrames) {
    const label = action.children.find(n => n.type === 'TEXT' && n.name === 'Action label') as TextNode;
    if (action.height < 44 || !fits(label, action) || label.height > action.height - 4) return false;
  }
  for (const action of actionFrames) {
    const siblings = actionFrames.filter(other => other !== action && other.parent === action.parent);
    if (siblings.some(other => action.y < other.y + other.height - 0.5 && other.y < action.y + action.height - 0.5)) return false;
  }
  return true;
}

export function validateWebChat(page: PageNode | undefined): Validation {
  const section = page ? exactFrame(page, SECTIONS.webChat) : undefined;
  const checks: Check[] = [
    check('03D page', Boolean(page && page.name === TARGET_PAGE)),
    check('Customer Web Chat section', Boolean(section)),
  ];
  const screens = new Map<string, FrameNode>();
  for (const variant of WEB_CHAT_VARIANTS) {
    const matches = section?.children.filter(n => n.name === webChatName(variant.key)) ?? [];
    const valid = matches.length === 1 && matches[0].type === 'FRAME';
    checks.push(check(`Variant / ${variant.key}`, valid, valid ? undefined : `${matches.length} exact match(es)`));
    if (valid) screens.set(variant.key, matches[0] as FrameNode);
  }
  for (const variant of WEB_CHAT_VARIANTS) {
    const screen = screens.get(variant.key);
    if (!screen) continue;
    checks.push(check(`${variant.key} / customer structure`, Boolean(direct(screen, 'Service Header') && direct(screen, 'Message History') && direct(screen, 'Customer State') && direct(screen, 'Customer Composer'))));
    checks.push(check(`${variant.key} / mobile geometry`, geometry(screen)));
    checks.push(check(`${variant.key} / customer-only surface`, !Boolean(named(screen, 'Staff navigation')) && !Boolean(named(screen, 'Agent Run')) && !forbidden.test(allText(screen))));
    checks.push(check(`${variant.key} / Business Reply`, Boolean(named(screen, 'Business Reply')) && has(screen, 'Business')));
    if (variant.key !== 'Initial') checks.push(check(`${variant.key} / Customer Message`, Boolean(named(screen, 'Customer Message')) && has(screen, 'You')));
    if (variant.component) checks.push(check(`${variant.key} / Phase 3C ${variant.component}`, named(screen, `${variant.component} component`)?.type === 'INSTANCE'));
  }
  for (const key of ['Initial', 'Active', 'Confirmed Result', 'Waiting Human'])
    checks.push(check(`${key} / Composer`, named(screens.get(key), 'Composer / Ready')?.type === 'INSTANCE'));
  const clarification = screens.get('Clarification');
  checks.push(check('Clarification Request / plain-language input', has(clarification, 'Which size would you like?') && has(clarification, 'Send details') && !has(clarification, 'missing parameter')));
  const confirmation = screens.get('Confirmation Required');
  checks.push(check('Confirmation Request / explicit business authorization', has(confirmation, 'Desk Lamp / Slate') && has(confirmation, 'Quantity: 1') && has(confirmation, 'Confirm order') && has(confirmation, 'Change details') && !Boolean(confirmation && /\bConfirm\b(?! order)/.test(allText(confirmation)))));
  const processing = screens.get('Processing');
  checks.push(check('Processing / neutral pending result', has(processing, 'We are processing your request.') && has(processing, "We'll update you here when the result is available.") && !Boolean(processing && /keep (the )?chat open|reservation remains confirmed|order created/i.test(allText(processing)))));
  const confirmed = screens.get('Confirmed Result');
  checks.push(check('Confirmed Result / independent trusted facts', has(confirmed, 'ORDER') && has(confirmed, 'Order created') && has(confirmed, 'RESERVATION') && has(confirmed, 'Item reserved') && has(confirmed, 'ORD-1042')));
  const failure = screens.get('Known Failure');
  checks.push(check('Known Failure / existing order and duplicate protection', has(failure, 'Your order was created, but the item was not reserved.') && has(failure, "Please don't place the same order again.") && has(failure, "We'll help you with the next step.") && !Boolean(failure && /retry order|reserve again/i.test(allText(failure)))));
  const waiting = screens.get('Waiting Human');
  checks.push(check('Waiting Human / person, not automated processing', has(waiting, 'A person is reviewing this.') && has(waiting, "We'll update you here.") && !has(waiting, 'We are processing your request.')));
  const pending = screens.get('Confirmation Pending');
  checks.push(check('Confirmation Pending / unknown result in customer language', has(pending, 'may have gone through') && has(pending, 'cannot confirm it yet') && has(pending, 'Please do not submit the same request again.') && has(pending, 'We will update you when confirmation is available.') && !Boolean(pending && /OUTCOME_UNKNOWN|Retry order|Reserve again|Submit same request/i.test(allText(pending)))));
  const delivery = screens.get('Message Delivery Failure');
  checks.push(check('Message Delivery Failure / transport and business effect separate', has(delivery, 'MESSAGE DELIVERY FAILED') && has(delivery, 'Message not delivered') && has(delivery, 'Not delivered') && has(delivery, 'BUSINESS RESULT') && has(delivery, 'Reservation remains confirmed') && has(delivery, 'Retry message') && has(delivery, 'Only your message needs attention.') && !Boolean(delivery && /Retry order|Reserve again|retry reservation/i.test(allText(delivery)))));
  return { section: 'Customer Web Chat', checks, pass: checks.every(c => c.pass) };
}

export function formatWebChatValidation(result: Validation): string {
  return [
    'PHASE 3D CUSTOMER WEB CHAT VALIDATION',
    `${result.pass ? 'PASS' : 'FAIL'} · structural, semantic and generated-node geometry; manual visual review required.`,
    ...result.checks.map(c => `${c.label}: ${c.pass ? 'PASS' : 'FAIL'}${c.detail ? ` (${c.detail})` : ''}`),
  ].join('\n');
}
