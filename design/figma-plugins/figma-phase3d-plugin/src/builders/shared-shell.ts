import { NAV_NESTED, NAV_PRIMARY, SECTIONS, SHELL_NAME } from '../constants';
import { instantiate } from '../design-system';
import { box, button, chip, frame, line, text } from '../figma-utils';
import { assertWritablePage, replaceOwned, SHELL_OWNED } from '../ownership';
import { ensurePrinciples, ensureSection } from './page-setup';

const TOP_Y = 160;

export function drawStaffChrome(screen: FrameNode, completeTree = false): void {
  const nav = frame(screen, 'Staff navigation', 0, 0, 244, 900, 'surface/default');
  frame(nav, 'Navigation divider', 243, 0, 1, 900, 'border/default');
  text(nav, 'Brand', 'Diplom  /  Operations', 20, 22, 205, 'Card Heading');
  text(nav, 'Staff scope', 'STAFF WORKSPACE', 20, 54, 205, 'Label', 'text/secondary');
  const tenant = box(nav, 'Business Context', 16, 88, 212, 64, 'surface/subtle', 'border/default', 6);
  text(tenant, 'Business Context / label', completeTree ? 'BUSINESS SWITCH' : 'ACTIVE BUSINESS', 12, 8, 185, 'Label', 'text/secondary');
  text(tenant, 'Business Context / name', 'North Shop   ▾', 12, 30, 185, 'Body Strong');
  let y = TOP_Y;
  for (const area of NAV_PRIMARY) {
    const active = area === 'Conversations';
    const row = box(nav, `Primary / ${area}`, 16, y, 212, 36, active ? 'surface/selected' : 'surface/default', active ? 'border/interactive' : 'border/default', 6);
    if (!active) row.strokes = [];
    if (active) frame(row, 'Active marker', 0, 5, 3, 26, 'action/primary');
    text(row, `Primary label / ${area}`, area, 14, 8, 165, 'Small', active ? 'action/primary' : 'text/primary');
    if (active) text(row, 'Current state', '•', 184, 8, 16, 'Small', 'action/primary');
    y += 39;
    const children = NAV_NESTED.filter(pair => pair[0] === area);
    if (completeTree || area === 'Conversations') for (const [, child] of children) {
      if (completeTree && area === 'Administration' && (child === 'Audit' || child === 'Agent Runs')) {
        const restricted = box(nav, `Restricted link / Administration / ${child}`, 28, y, 200, 43, 'status/restricted-bg', 'status/restricted', 6);
        text(restricted, `Nested / Administration / ${child}`, `└  ${child}`, 10, 4, 180, 'Small', 'text/primary');
        text(restricted, `Access marker / ${child}`, child === 'Audit' ? 'Restricted / permissioned' : 'Contextual / restricted', 25, 23, 165, 'Caption', 'status/restricted');
        y += 47;
      } else {
        text(nav, `Nested / ${area} / ${child}`, `└  ${child}`, 30, y + 2, 192, 'Caption');
        y += 26;
      }
    }
  }
  const bottom = box(nav, 'Account/session', 16, 820, 212, 62, 'surface/subtle', 'border/default', 6);
  text(bottom, 'Account / name', 'A. Operator', 12, 10, 185, 'Small');
  text(bottom, 'Account / status', 'Operator · Session active', 12, 33, 185, 'Caption', 'text/secondary');

  const top = frame(screen, 'Page/context header', 244, 0, 1356, 72, 'surface/default');
  line(top, 'Header divider', 0, 71, 1356);
  text(top, 'Breadcrumb/page context', 'Conversations   /   Amina S.   /   ORD-1042', 24, 13, 800, 'Small', 'text/secondary');
  text(top, 'Current active area', 'Conversations', 24, 36, 700, 'Card Heading');
  if (completeTree) text(top, 'Header business / role', 'CURRENT BUSINESS', 1007, 6, 125, 'Label', 'text/secondary');
  chip(top, 'Header business', 'North Shop', 1007, completeTree ? 34 : 22, 125, 'action/primary', 'surface/selected');
  chip(top, 'Header session', 'Session active', 1150, 22, 174, 'status/success', 'status/success-bg');
}

export function drawShellSpecimen(screen: FrameNode): void {
  drawStaffChrome(screen, true);
  const main = frame(screen, 'Main content region', 244, 72, 1356, 828, 'surface/subtle');
  text(main, 'Main heading', 'Shared staff workspace', 32, 30, 800, 'Page Title');
  text(main, 'Main description', 'One desktop shell keeps business scope, account state and the current task visible.', 32, 77, 1130, 'Body', 'text/secondary');
  const card = box(main, 'Shell state specimen', 32, 132, 820, 296, 'surface/default', 'border/default', 8);
  text(card, 'Specimen heading', 'Conversations active', 24, 20, 500, 'Section Heading');
  chip(card, 'Active area badge', 'Current area', 652, 22, 132, 'action/primary', 'surface/selected');
  text(card, 'Specimen body', 'The conversation workspace, selected case and persistent context panel appear here when a case is open.', 24, 68, 760, 'Body');
  const list = box(card, 'Example conversation list region', 24, 121, 215, 141, 'surface/subtle');
  text(list, 'List label', 'CONVERSATION LIST', 14, 15, 182, 'Label', 'text/secondary');
  text(list, 'Selected case', 'Amina S. · WhatsApp', 14, 51, 182, 'Small');
  const thread = box(card, 'Example workspace region', 252, 121, 292, 141, 'surface/subtle');
  text(thread, 'Workspace label', 'MESSAGE THREAD', 14, 15, 264, 'Label', 'text/secondary');
  text(thread, 'Workspace sample', 'Customer request and trusted business result', 14, 51, 264, 'Small');
  const context = box(card, 'Example persistent context region', 558, 121, 238, 141, 'surface/subtle');
  text(context, 'Context label', 'PERSISTENT CONTEXT', 14, 15, 210, 'Label', 'text/secondary');
  text(context, 'Context sample', 'Customer · Order · Reservation · Handler', 14, 51, 210, 'Small');
  const aside = box(main, 'Shell identity guidance', 876, 132, 448, 296, 'surface/default');
  text(aside, 'Identity heading', 'Scope and session', 24, 20, 380, 'Card Heading');
  text(aside, 'Identity body', 'North Shop is the active business. A. Operator is signed in. These are separate from the selected conversation.', 24, 58, 398, 'Body');
  chip(aside, 'Current session', 'Active session', 24, 140, 142, 'status/success', 'status/success-bg');
  text(aside, 'Permission note', 'Visible navigation does not grant backend access.', 24, 197, 390, 'Small', 'text/secondary');
  const next = box(main, 'Shell navigation guidance', 32, 454, 1292, 310, 'surface/default');
  text(next, 'Navigation heading', 'Approved hierarchy', 24, 20, 500, 'Section Heading');
  text(next, 'Navigation body', 'Six primary areas. Escalations nests under Conversations; Forecasts nests under Analytics. Agent Runs and Audit stay restricted/contextual.', 24, 64, 1190, 'Body');
  line(next, 'Rule divider', 24, 115, 1244);
  text(next, 'Shell rule label', 'CONTEXT FIRST', 24, 142, 300, 'Label', 'text/secondary');
  text(next, 'Shell rule', 'Current business, page and owner remain legible while the work changes.', 24, 166, 790, 'Body');
  button(next, 'Example contextual link', 'Open selected conversation  →', 830, 202, 382, true);
  text(next, 'Reference note', '1600 px is a design reference, not a product breakpoint.', 24, 278, 790, 'Caption', 'text/secondary');
  instantiate(next, 'Navigation / Primary Item', 'State=Active', 'Phase 3C / Active Primary Item', 24, 198, 215);
  instantiate(next, 'Navigation / Restricted Link', undefined, 'Phase 3C / Restricted Link reference', 277, 196, 470);
}

export function buildSharedShell(page: PageNode): string[] {
  assertWritablePage(page.name);
  ensurePrinciples(page);
  const section = ensureSection(page, SECTIONS.shell, 0, 190, 1648, 1030);
  const staged = frame(section, `${SHELL_NAME} / staging`, 24, 92, 1600, 900, 'surface/default');
  try {
    if (!section.children.some(n => n.name === 'Shell section title')) {
      text(section, 'Shell section title', '01 · Shared Staff Shell', 24, 20, 1100, 'Section Heading');
      text(section, 'Shell section subtitle', 'Desktop reference · high-fidelity shell specimen · not a complete business screen', 24, 51, 1400, 'Small', 'text/secondary');
    }
    drawShellSpecimen(staged);
    replaceOwned(section, SHELL_OWNED, [staged]);
    return [...SHELL_OWNED];
  } catch (error) { staged.remove(); throw error; }
}
