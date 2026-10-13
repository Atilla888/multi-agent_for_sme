import { ESCALATION_VARIANTS, SECTIONS, TARGET_PAGE, escalationName } from '../constants';
import { allText, exactFrame } from '../figma-utils';
import type { Check, Validation } from './phase3d';

const check = (label: string, pass: boolean, detail?: string): Check => ({ label, pass, detail });
const textHas = (node: FrameNode, value: string): boolean => allText(node).includes(value);
const normalizedTexts = (node: FrameNode): string[] => node.findAll(n => n.type === 'TEXT')
  .map(n => (n as TextNode).characters.toLowerCase().replace(/\s+/g, ' ').trim());

function unknownOutcomeIsSafe(screen: FrameNode): boolean {
  const texts = normalizedTexts(screen);
  const hasLabel = texts.some(value => value.includes('outcome_unknown'));
  const needsAuthoritativeReconciliation = texts.some(value =>
    /\b(?:reconciliation (?:is )?required|reconcile|must reconcile|requires reconciliation)\b.{0,100}\bauthoritative (?:reservation )?state\b/.test(value));
  const forbidsBlindRetry = texts.some(value =>
    /\b(?:no blind retry|do not (?:blindly )?retry|no mutation action here|do not replay|no mutation replay)\b/.test(value));
  return hasLabel && needsAuthoritativeReconciliation && forbidsBlindRetry;
}
type Bounds = { x: number; y: number; width: number; height: number };
const contained = (a: Bounds, p: Bounds): boolean =>
  [a.x, a.y, a.width, a.height].every(Number.isFinite) && a.x >= 0 && a.y >= 0 && a.width > 0 && a.height > 0 &&
  a.x + a.width <= p.width + 1 && a.y + a.height <= p.height + 1;
const crosses = (a: Bounds, b: Bounds): boolean =>
  a.x < b.x + b.width - 0.5 && b.x < a.x + a.width - 0.5 &&
  a.y < b.y + b.height - 0.5 && b.y < a.y + a.height - 0.5;
const one = (root: FrameNode, name: string): SceneNode | undefined => {
  const matches = root.findAll(n => n.name === name);
  return matches.length === 1 ? matches[0] : undefined;
};
const majorBlocks = ['Why Automation Stopped', 'Confirmed Facts', 'Uncertain Effect', 'Constraints', 'Next Safe Step', 'Human Decision'] as const;

function layoutFits(screen: FrameNode): boolean {
  const nav = one(screen, 'Staff navigation');
  const main = one(screen, 'Escalations Workspace');
  const queue = one(screen, 'Escalation Queue');
  const context = one(screen, 'Decision Context');
  const selected = one(screen, 'Selected Queue Item');
  if (!nav || !main || !queue || !context || !selected ||
    nav.type !== 'FRAME' || main.type !== 'FRAME' || queue.type !== 'FRAME' || context.type !== 'FRAME') return false;
  if (!contained(nav, screen) || !contained(main, screen) || crosses(nav, main) ||
    !contained(queue, main) || !contained(context, main) || crosses(queue, context) || !contained(selected, queue)) return false;
  const detail = majorBlocks.map(name => context.children.filter(n => n.name === name));
  if (detail.some(matches => matches.length !== 1 || (matches[0].type !== 'FRAME' && matches[0].type !== 'INSTANCE'))) return false;
  const ordered = detail.map(matches => matches[0]);
  if (!ordered.every(n => contained(n, context)) || !ordered.every((n, i) => i === 0 || n.y >= ordered[i - 1].y + ordered[i - 1].height + 8)) return false;
  const queueCards = ['Selected Queue Item', 'Queue row / 2', 'Queue row / 3', 'Agent Run contextual link']
    .map(name => queue.children.filter(n => n.name === name));
  if (queueCards.some(matches => matches.length !== 1)) return false;
  const rows = queueCards.map(matches => matches[0]);
  if (!rows.every(n => contained(n, queue)) || !rows.every((a, i) => rows.slice(i + 1).every(b => !crosses(a, b)))) return false;
  const authored = [...ordered, ...rows].filter(n => n.type === 'FRAME' || n.type === 'INSTANCE') as (FrameNode | InstanceNode)[];
  return authored.every(root => {
    const texts = root.findAll(n => n.type === 'TEXT');
    return texts.every(n => {
      const parent = n.parent;
      return parent && 'width' in parent && 'height' in parent && contained(n, parent);
    }) && texts.every((a, i) => texts.slice(i + 1).every(b => a.parent !== b.parent || !crosses(a, b)));
  });
}

export function validateEscalations(page: PageNode | undefined): Validation {
  const section = page ? exactFrame(page, SECTIONS.escalations) : undefined;
  const checks: Check[] = [
    check('03D page', Boolean(page && page.name === TARGET_PAGE)),
    check('Escalations section', Boolean(section)),
  ];
  const screens = new Map<string, FrameNode>();
  if (section) for (const v of ESCALATION_VARIANTS) {
    const matches = section.children.filter(n => n.name === escalationName(v.key));
    const valid = matches.length === 1 && matches[0].type === 'FRAME';
    checks.push(check(v.title, valid, valid ? undefined : `${matches.length} exact match(es)`));
    if (valid) screens.set(v.key, matches[0] as FrameNode);
  }
  for (const [key, screen] of screens) {
    for (const name of ['Escalation Queue', 'Selected Queue Item', 'Decision Context', ...majorBlocks]) {
      checks.push(check(`${key} / ${name}`, Boolean(one(screen, name))));
    }
    checks.push(check(`${key} / selected drives detail`, textHas(screen, 'ESC-204') && textHas(screen, 'C-42') && textHas(screen, 'ORD-1042')));
    checks.push(check(`${key} / Conversation + Order + Run links`, textHas(screen, 'Open Conversation C-42') && textHas(screen, 'Open Order ORD-1042') && textHas(screen, 'Agent Run · permitted case only')));
    checks.push(check(`${key} / Human owner`, textHas(screen, 'Human Operator') || key === 'Waiting Assignment' && textHas(screen, 'Unassigned')));
    checks.push(check(`${key} / geometry`, layoutFits(screen)));
    checks.push(check(`${key} / nested navigation`, textHas(screen, 'Conversations') && textHas(screen, 'Escalations') && Boolean(one(screen, 'Escalations active marker'))));
  }
  const unknown = screens.get('OUTCOME_UNKNOWN');
  checks.push(check('OUTCOME_UNKNOWN reconciliation / no blind retry', Boolean(unknown && unknownOutcomeIsSafe(unknown))));
  const stale = screens.get('Stale');
  checks.push(check('Stale facts refresh / revalidation', Boolean(stale && textHas(stale, 'observation exists') && textHas(stale, 'Refresh authoritative business facts') && textHas(stale, 'revalidate'))));
  const auth = screens.get('Authorization Changed');
  checks.push(check('Authorization Changed rechecks principal / scope', Boolean(auth && textHas(auth, 'not automatically Permission Denied') && textHas(auth, 'Recheck current principal and scope'))));
  const e02 = screens.get('E02 Restricted');
  checks.push(check('E02 update_order restricted, not unknown', Boolean(e02 && textHas(e02, 'update_order did not execute') && textHas(e02, 'Automatic update_order mutation remains restricted') && textHas(e02, 'not OUTCOME_UNKNOWN') && textHas(e02, 'authorized human/policy handling') && !one(e02, 'Approve update'))));
  const resume = screens.get('Resume Pending');
  checks.push(check('TARGET M12 decision → revalidation → request, no replay', Boolean(resume && textHas(resume, 'TARGET M12') && textHas(resume, 'Not currently implemented') && textHas(resume, 'Human decision → Revalidation → Controlled Resume request') && textHas(resume, 'No mutation replay') && !Boolean(one(resume, 'Primary decision')))));
  const resolved = screens.get('Resolved Closed');
  checks.push(check('Resolved distinct from Closed', Boolean(resolved && Boolean(one(resolved, 'Resolved state')) && Boolean(one(resolved, 'Closed state')) && textHas(resolved, 'RESOLVED · verified outcome') && textHas(resolved, 'CLOSED · no active work'))));
  const assigned = screens.get('Awaiting Decision');
  checks.push(check('Contextual human decisions', Boolean(assigned && textHas(assigned, 'Approve proposed continuation') && textHas(assigned, 'Reject proposed continuation') && textHas(assigned, 'Request clarification') && textHas(assigned, 'Revalidate → Resume request') && textHas(assigned, 'Close escalation'))));
  return { section: 'Escalations', checks, pass: checks.every(c => c.pass) };
}

export function formatEscalationValidation(result: Validation): string {
  return [
    'PHASE 3D ESCALATIONS VALIDATION',
    `${result.pass ? 'PASS' : 'FAIL'} · structural and generated-node geometry; manual visual review required.`,
    ...result.checks.map(c => `${c.label}: ${c.pass ? 'PASS' : 'FAIL'}${c.detail ? ` (${c.detail})` : ''}`),
  ].join('\n');
}
