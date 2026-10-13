import { SECTIONS } from '../constants';
import { assertWritablePage } from '../ownership';
import { box, exactFrame, text } from '../figma-utils';

export function ensureSection(page: PageNode, name: string, x: number, y: number, w: number, h: number): FrameNode {
  assertWritablePage(page.name);
  const existing = exactFrame(page, name);
  if (existing) return existing;
  const section = box(page, name, x, y, w, h, 'surface/subtle', 'border/default', 8);
  return section;
}

export function ensurePrinciples(page: PageNode): FrameNode {
  const existing = exactFrame(page, SECTIONS.principles);
  if (existing) return existing;
  const n = ensureSection(page, SECTIONS.principles, 0, 0, 1600, 166);
  text(n, 'Principles / title', 'Phase 3D · High-fidelity principles', 24, 20, 900, 'Section Heading');
  text(n, 'Principles / authority', 'Phase 3B controls UX · Phase 3C controls visual language · Phase 3D applies both', 24, 59, 1500, 'Body Strong');
  text(n, 'Principles / rules', 'Calm Operational SaaS · No feature invention · AI visible but restrained · Business state before technical detail', 24, 91, 1500, 'Body');
  text(n, 'Principles / unknown', 'OUTCOME_UNKNOWN is neither success nor known failure: reconcile authoritative state; never retry a mutation blindly.', 24, 122, 1500, 'Body', 'status/unknown');
  return n;
}
