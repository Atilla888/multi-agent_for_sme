import { NAV_PRIMARY, PROHIBITED_NAV, SECTIONS, SHELL_NAME, TARGET_PAGE, VARIANTS, conversationName } from '../constants';
import { allText, exactFrame } from '../figma-utils';

export interface Check { label: string; pass: boolean; detail?: string }
export interface Validation { section: string; checks: Check[]; pass: boolean }

const check = (label: string, pass: boolean, detail?: string): Check => ({ label, pass, detail });
const hasNamed = (root: FrameNode, name: string): boolean => root.findAll(n => n.name === name).length > 0;
const hasText = (root: FrameNode, pattern: string): boolean => allText(root).includes(pattern);
const namedFrame = (root: FrameNode, name: string): FrameNode | undefined => root.findAll(n => n.type === 'FRAME' && n.name === name)[0] as FrameNode | undefined;
type Bounds = { x: number; y: number; width: number; height: number };
const inside = (child: Bounds, parent: Bounds): boolean =>
  [child.x, child.y, child.width, child.height].every(Number.isFinite) &&
  child.x >= 0 && child.y >= 0 && child.width > 0 && child.height > 0 &&
  child.x + child.width <= parent.width + 1 && child.y + child.height <= parent.height + 1;
const intersects = (a: Bounds, b: Bounds): boolean =>
  a.x < b.x + b.width - 0.5 && b.x < a.x + a.width - 0.5 &&
  a.y < b.y + b.height - 0.5 && b.y < a.y + a.height - 0.5;

function resultComposition(screen: FrameNode | undefined, name: 'Business Action Result' | 'Delivery State'): { unique: boolean; fits: boolean } {
  const workspace = screen && namedFrame(screen, 'Conversation Workspace');
  if (!workspace) return { unique: false, fits: false };
  const matches = workspace.children.filter(n => n.name === name);
  const region = matches.length === 1 && matches[0].type === 'FRAME' ? matches[0] as FrameNode : undefined;
  const semanticFrames = workspace.findAll(n => (n.type === 'FRAME' || n.type === 'INSTANCE') &&
    (['Business Action Result', 'Delivery State', 'Authoritative result', 'Business Effect', 'Communication', 'Known Failure', 'Confirmed Business Result', 'OUTCOME_UNKNOWN', 'Business-result message'].includes(n.name) || n.name.includes('Action Result')));
  const unique = Boolean(region && semanticFrames.length === 1 && semanticFrames[0] === region);
  if (!unique || !region) return { unique, fits: false };
  const children = region.children;
  const composer = workspace.children.find(n => n.type === 'FRAME' && n.name === 'Composer') as FrameNode | undefined;
  const fits = inside(region, workspace) && children.length > 0 && children.every(n => n.type === 'TEXT' && (n as TextNode).textAutoResize === 'HEIGHT' && inside(n, region)) &&
    children.every((a, i) => children.slice(i + 1).every(b => !intersects(a, b))) &&
    workspace.children.filter(n => n !== region && (n.type === 'FRAME' || n.type === 'INSTANCE')).every(n => !intersects(region, n)) &&
    Boolean(composer && inside(composer, workspace) && composer.y >= region.y + region.height + 12);
  return { unique, fits };
}

export function validateSharedShell(page: PageNode | undefined): Validation {
  const section = page ? exactFrame(page, SECTIONS.shell) : undefined;
  const shell = section ? exactFrame(section, SHELL_NAME) : undefined;
  const checks: Check[] = [check('03D page', Boolean(page && page.name === TARGET_PAGE)), check('Shared Shell frame', Boolean(shell))];
  if (shell) {
    checks.push(check('Staff navigation', hasNamed(shell, 'Staff navigation')));
    for (const name of NAV_PRIMARY) checks.push(check(`Primary / ${name}`, hasNamed(shell, `Primary / ${name}`)));
    checks.push(check('Conversations active', hasNamed(shell, 'Current state') && hasNamed(shell, 'Primary / Conversations')));
    checks.push(check('Business Context', hasNamed(shell, 'Business Context')));
    checks.push(check('Breadcrumb/page context', hasNamed(shell, 'Breadcrumb/page context')));
    checks.push(check('Account/session', hasNamed(shell, 'Account/session')));
    checks.push(check('Main content region', hasNamed(shell, 'Main content region')));
    for (const [destination, marker] of [['Audit', 'Restricted / permissioned'], ['Agent Runs', 'Contextual / restricted']] as const) {
      const row = shell.findAll(n => n.type === 'FRAME' && n.name === `Restricted link / Administration / ${destination}`)[0] as FrameNode | undefined;
      checks.push(check(`${destination} restricted/contextual navigation`, Boolean(row && hasNamed(row, `Access marker / ${destination}`) && allText(row).includes(marker) && !allText(row).includes('Disabled'))));
    }
    checks.push(check('Sidebar business switch / header indicator', hasText(shell, 'BUSINESS SWITCH') && hasText(shell, 'CURRENT BUSINESS') && hasText(shell, 'North Shop')));
    checks.push(check('Backend authorization explanation', hasText(shell, 'Visible navigation does not grant backend access.')));
    checks.push(check('No prohibited architecture navigation', PROHIBITED_NAV.every(n => !hasNamed(shell, `Primary / ${n}`))));
  }
  return { section: 'Shared Shell', checks, pass: checks.every(c => c.pass) };
}

export function validateConversations(page: PageNode | undefined): Validation {
  const section = page ? exactFrame(page, SECTIONS.conversations) : undefined;
  const checks: Check[] = [check('03D page', Boolean(page && page.name === TARGET_PAGE)), check('Conversations section', Boolean(section))];
  const screens = new Map<string, FrameNode>();
  if (section) for (const v of VARIANTS) {
    const matches = section.children.filter(n => n.name === conversationName(v.key));
    const valid = matches.length === 1 && matches[0].type === 'FRAME';
    checks.push(check(v.title, valid, valid ? undefined : `${matches.length} exact FRAME(s)`));
    if (valid) screens.set(v.key, matches[0] as FrameNode);
  }
  for (const [key, screen] of screens) {
    for (const name of ['Staff navigation', 'Conversation List', 'Conversation Workspace', 'Message Thread', 'Composer', 'Persistent Context Panel', 'Customer Context', 'Order Context', 'Inventory/Freshness', 'Active Handler', 'Escalation State']) {
      checks.push(check(`${key} / ${name}`, hasNamed(screen, name)));
    }
    checks.push(check(`${key} / Order vs Reservation`, hasNamed(screen, 'Order State label') && hasNamed(screen, 'Reservation State label')));
  }
  const any = (name: string): boolean => [...screens.values()].some(s => hasNamed(s, name));
  checks.push(check('Agent Status', any('Agent Status')));
  checks.push(check('Human Status', any('Human Status')));
  checks.push(check('Handoff Event', any('Handoff Event')));
  checks.push(check('Business Action Proposal', any('Business Action Proposal')));
  checks.push(check('Business Action Result', any('Business Action Result')));
  checks.push(check('Execution Summary', any('Execution Summary')));
  checks.push(check('Delivery State', any('Delivery State')));
  const handoff = screens.get('Support to Sales Handoff');
  checks.push(check('Handoff does not transfer permissions', Boolean(handoff && hasText(handoff, 'Permissions do not transfer'))));
  const proposal = screens.get('Awaiting Confirmation');
  checks.push(check('Proposal is not executed', Boolean(proposal && hasText(proposal, 'NOT EXECUTED') && !hasText(proposal, 'Reservation confirmed'))));
  checks.push(check('Awaiting customer confirmation / messaging separate', Boolean(proposal && hasText(proposal, 'Awaiting customer confirmation before action can proceed') && hasNamed(proposal, 'Send message') && !hasText(proposal, 'Reply paused while the result is checked'))));
  const confirmed = screens.get('Confirmed Result');
  const confirmedLayout = resultComposition(confirmed, 'Business Action Result');
  checks.push(check('Confirmed result region unique', confirmedLayout.unique));
  checks.push(check('Confirmed result layout fits', confirmedLayout.fits));
  checks.push(check('Confirmed effect', Boolean(confirmed && hasText(confirmed, 'Reservation confirmed') && confirmedLayout.unique)));
  const failure = screens.get('Known Failure');
  const failureLayout = resultComposition(failure, 'Business Action Result');
  checks.push(check('Known failure result region unique', failureLayout.unique));
  checks.push(check('Known failure result layout fits', failureLayout.fits));
  checks.push(check('Known failure · no hold', Boolean(failure && hasText(failure, 'Inventory was not reserved') && !hasText(failure, 'Reconcile authoritative state first') && failureLayout.unique)));
  const unknown = screens.get('OUTCOME_UNKNOWN');
  const unknownLayout = resultComposition(unknown, 'Business Action Result');
  checks.push(check('OUTCOME_UNKNOWN result region unique', unknownLayout.unique));
  checks.push(check('OUTCOME_UNKNOWN result layout fits', unknownLayout.fits));
  checks.push(check('OUTCOME_UNKNOWN · reconcile / no blind retry', Boolean(unknown && hasText(unknown, 'may have committed') && hasText(unknown, 'Reconcile authoritative reservation state') && hasText(unknown, 'Do not retry mutation blindly') && unknownLayout.unique)));
  const waiting = screens.get('Waiting Human');
  checks.push(check('Waiting Human', Boolean(waiting && hasText(waiting, 'Human decision required'))));
  const delivery = screens.get('Delivery Failure');
  const deliveryLayout = resultComposition(delivery, 'Delivery State');
  checks.push(check('Message delivery result region unique', deliveryLayout.unique));
  checks.push(check('Message delivery failure after confirmed effect', Boolean(delivery && deliveryLayout.unique && hasText(delivery, 'BUSINESS EFFECT') && hasText(delivery, 'COMMUNICATION') && hasText(delivery, 'Reservation confirmed') && hasText(delivery, 'Message delivery failed') && hasText(delivery, 'Retry communication only') && hasText(delivery, 'Do not repeat reserve_inventory'))));
  checks.push(check('Message delivery layout fits', deliveryLayout.fits));
  const unavailable = screens.get('Dependency Unavailable');
  checks.push(check('Dependency unavailable is not zero inventory', Boolean(unavailable && hasText(unavailable, 'not zero stock'))));
  return { section: 'Conversations', checks, pass: checks.every(c => c.pass) };
}

export function formatValidation(shell: Validation, conversations: Validation): string {
  const variantChecks = conversations.checks.filter(c => VARIANTS.some(v => v.title === c.label));
  const componentLabels = ['Agent Status', 'Human Status', 'Handoff Event', 'Business Action Proposal', 'Business Action Result', 'Execution Summary', 'Delivery State'];
  const componentPass = conversations.checks.filter(c => componentLabels.includes(c.label)).every(c => c.pass);
  const semanticLabels = ['Handoff does not transfer permissions', 'Proposal is not executed', 'Awaiting customer confirmation / messaging separate', 'Confirmed effect', 'Known failure · no hold', 'OUTCOME_UNKNOWN · reconcile / no blind retry', 'Waiting Human', 'Dependency unavailable is not zero inventory'];
  const semanticPass = conversations.checks.filter(c => semanticLabels.includes(c.label)).every(c => c.pass);
  const orderPass = conversations.checks.filter(c => c.label.endsWith('/ Order vs Reservation')).every(c => c.pass) && variantChecks.length === VARIANTS.length;
  const deliveryPass = conversations.checks.find(c => c.label === 'Message delivery failure after confirmed effect')?.pass ?? false;
  return [
    'PHASE 3D HIGH-FI VALIDATION',
    `Page: ${TARGET_PAGE}`,
    `Shared Shell: ${shell.pass ? 'PASS' : 'FAIL'}`,
    `Conversations: ${conversations.pass ? 'PASS' : 'FAIL'}`,
    ...variantChecks.map(c => `${c.label}: ${c.pass ? 'PASS' : 'FAIL'}`),
    `Required components: ${componentPass ? 'PASS' : 'FAIL'}`,
    `Semantic consistency: ${semanticPass ? 'PASS' : 'FAIL'}`,
    `Order / Reservation separation: ${orderPass ? 'PASS' : 'FAIL'}`,
    `Delivery / Business Effect separation: ${deliveryPass ? 'PASS' : 'FAIL'}`,
    '', 'Shared Shell checks:', ...shell.checks.map(c => `- ${c.label}: ${c.pass ? 'PASS' : 'FAIL'}${c.detail ? ` (${c.detail})` : ''}`),
    '', 'Conversations checks:', ...conversations.checks.map(c => `- ${c.label}: ${c.pass ? 'PASS' : 'FAIL'}${c.detail ? ` (${c.detail})` : ''}`),
    '', 'Scope: structural validation only; manual visual review required.',
  ].join('\n');
}
