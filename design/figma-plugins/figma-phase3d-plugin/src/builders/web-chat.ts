import { SECTIONS, WEB_CHAT_VARIANTS, webChatName, type WebChatVariant } from '../constants';
import { componentAvailable, instantiate } from '../design-system';
import { box, frame, text } from '../figma-utils';
import { assertWritablePage, preflightOwned, replaceOwned, WEB_CHAT_OWNED } from '../ownership';
import { ensureSection } from './page-setup';

const WIDTH = 414;
const CONTENT = 390;
const REQUIRED = [
  'Customer Message', 'Business Reply', 'Composer', 'Clarification Request',
  'Confirmation Request', 'Processing', 'Confirmed Result', 'Known Failure',
  'Waiting Human', 'Confirmation Pending', 'Delivery Failure',
] as const;
const messageCopy: Record<WebChatVariant['key'], { customer?: string; reply: string }> = {
  Initial: { reply: 'Hello! How can we help you today?' },
  Active: { customer: 'I would like one Desk Lamp in Slate.', reply: 'I can help with your order, Amina.' },
  Clarification: { customer: 'I would like one Desk Lamp in Slate.', reply: 'Which size would you like?' },
  'Confirmation Required': { customer: 'One Desk Lamp in Slate, please.', reply: 'Please review the details before placing your order.' },
  Processing: { customer: 'Please place my order.', reply: "We're checking your request." },
  'Confirmed Result': { customer: 'Please place my order.', reply: 'Your order update is ready.' },
  'Known Failure': { customer: 'Please place my order.', reply: 'There is an update about your order.' },
  'Waiting Human': { customer: 'Could someone help me with this?', reply: 'A person will review your request.' },
  'Confirmation Pending': { customer: 'Please place my order.', reply: 'We are checking whether your request went through.' },
  'Message Delivery Failure': { customer: 'Can you send me the update?', reply: 'Your order was created and the item was reserved.' },
};

function instance(parent: FrameNode, component: string, variant: string | undefined, name: string, x: number, y: number): InstanceNode {
  const result = instantiate(parent, `Web Chat / ${component}`, variant, name, x, y, CONTENT);
  if (!result) throw new Error(`Missing approved Phase 3C Web Chat component or variant: ${component}${variant ? ` / ${variant}` : ''}. Nothing was replaced.`);
  return result;
}

function overrideText(root: InstanceNode, name: string, value: string): void {
  const matches = root.findAll(n => n.type === 'TEXT' && n.name === name) as TextNode[];
  if (matches.length !== 1) throw new Error(`Approved component ${root.name} is missing unique text ${name}. Nothing was replaced.`);
  matches[0].characters = value;
}

function drawMessage(history: FrameNode, source: 'Customer Message' | 'Business Reply', y: number, value: string): void {
  const name = source === 'Customer Message' ? 'Customer Message' : 'Business Reply';
  const node = instance(history, source, undefined, name, 0, y);
  overrideText(node, source === 'Customer Message' ? 'Message content' : 'Reply content', value);
}

// Only screen-owned frames may grow. Phase 3C instances remain atomic; their
// approved 44 px controls and internal placement are never rewritten here.
function guidance(parent: FrameNode, name: string, value: string, minHeight: number, type: 'Body' | 'Small'): FrameNode {
  const note = box(parent, name, 0, 0, CONTENT, minHeight, 'surface/default', 'border/default', 8);
  const label = text(note, name === 'Conversation guidance' ? 'Guidance' : 'Context guidance', value, 15, 17, CONTENT - 30, type, type === 'Small' ? 'text/secondary' : 'text/primary');
  note.resize(CONTENT, Math.max(minHeight, label.y + label.height + 17));
  return note;
}

function drawScreen(section: FrameNode, variant: WebChatVariant, x: number, y: number): FrameNode {
  const screen = frame(section, `${webChatName(variant.key)} / staging`, x, y, WIDTH, 900, 'surface/subtle');
  try {
  const header = box(screen, 'Service Header', 0, 0, WIDTH, 72, 'surface/default', 'border/default', 0);
  text(header, 'Service identity', 'North Shop', 18, 13, 268, 'Section Heading');
  text(header, 'Service subtitle', 'Customer service', 18, 44, 268, 'Caption', 'text/secondary');
  const history = frame(screen, 'Message History', 12, 88, CONTENT, 1, 'surface/subtle');
  const copy = messageCopy[variant.key];
  let nextY = 0;
  if (copy.customer) { drawMessage(history, 'Customer Message', nextY, copy.customer); nextY += 165; }
  drawMessage(history, 'Business Reply', nextY, copy.reply);
  if (variant.key === 'Message Delivery Failure') {
    const reply = history.children.find(n => n.name === 'Business Reply') as InstanceNode;
    overrideText(reply, 'Timestamp and delivery', '10:44 · Message not delivered');
  }
  history.resize(CONTENT, nextY + 153);
  const stateY = history.y + history.height + 18;
  const state = frame(screen, 'Customer State', 12, stateY, CONTENT, 1, 'surface/subtle');
  if (variant.component) {
    const card = instance(state, variant.component, undefined, `${variant.component} component`, 0, 0);
    if (variant.key === 'Confirmation Required') overrideText(card, 'Item details', 'Desk Lamp / Slate');
    if (variant.key === 'Confirmed Result' || variant.key === 'Known Failure') overrideText(card, 'Order reference', variant.key === 'Known Failure' ? 'Order ORD-1042 already exists.' : 'Order ORD-1042');
    if (variant.key === 'Message Delivery Failure') overrideText(card, 'State label', 'MESSAGE DELIVERY FAILED');
    state.resize(CONTENT, card.height);
  } else {
    const note = guidance(state, 'Conversation guidance', variant.key === 'Initial' ? 'Ask us a question or tell us what you need.' : 'You can continue the conversation below.', 80, 'Body');
    state.resize(CONTENT, note.height);
  }
  const composer = frame(screen, 'Customer Composer', 12, stateY + state.height + 18, CONTENT, 1, 'surface/subtle');
  if (['Initial', 'Active', 'Confirmed Result', 'Waiting Human'].includes(variant.key)) {
    const ready = instance(composer, 'Composer', 'State=Ready', 'Composer / Ready', 40, 0);
    composer.resize(CONTENT, ready.height);
  } else {
    const message = variant.key === 'Confirmation Required' ? 'Choose one of the clear actions above.'
      : variant.key === 'Clarification' ? 'Send the requested detail above to continue.'
      : variant.key === 'Processing' ? 'No further action is needed right now.'
      : variant.key === 'Known Failure' ? 'Need help? Use the action above.'
      : variant.key === 'Confirmation Pending' ? 'Please wait for confirmation or contact support.'
      : 'Retry the message only, or contact support.';
    const note = guidance(composer, 'Action context', message, 64, 'Small');
    composer.resize(CONTENT, note.height);
  }
  screen.resize(WIDTH, composer.y + composer.height + 18);
  return screen;
  } catch (error) { screen.remove(); throw error; }
}

export function buildWebChat(page: PageNode): string[] {
  assertWritablePage(page.name);
  for (const name of REQUIRED) if (!componentAvailable(`Web Chat / ${name}`, name === 'Composer' ? 'State=Ready' : undefined, CONTENT))
    throw new Error(`Missing approved Phase 3C Web Chat component: ${name}. Nothing was replaced.`);
  const orders = page.children.find(n => n.name === SECTIONS.orders && n.type === 'FRAME') as FrameNode | undefined;
  const section = ensureSection(page, SECTIONS.webChat, 0, orders ? orders.y + orders.height + 32 : 0, 2260, 100);
  preflightOwned(section, WEB_CHAT_OWNED);
  const staged: FrameNode[] = [];
  try {
    let rowY = 76, rowHeight = 0;
    for (const [i, variant] of WEB_CHAT_VARIANTS.entries()) {
      if (i > 0 && i % 5 === 0) { rowY += rowHeight + 32; rowHeight = 0; }
      const screen = drawScreen(section, variant, 24 + (i % 5) * 438, rowY);
      staged.push(screen);
      rowHeight = Math.max(rowHeight, screen.height);
    }
    section.resize(2260, rowY + rowHeight + 24);
    replaceOwned(section, WEB_CHAT_OWNED, staged);
    return [...WEB_CHAT_OWNED];
  } catch (error) { staged.forEach(n => n.remove()); throw error; }
}
