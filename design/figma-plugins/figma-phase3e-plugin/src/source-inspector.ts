import { SOURCE_PAGE, SOURCES, type SourceKey } from './constants';

export type SourceStatus = 'FOUND' | 'MISSING' | 'DUPLICATE' | 'WRONG_TYPE';
export type SourceFinding = {
  key: SourceKey;
  section: string;
  name: string;
  status: SourceStatus;
  exactFrames: FrameNode[];
  otherMatches: SceneNode[];
  path: string;
};

export function exactPage(name: string): PageNode | null {
  const matches = figma.root.children.filter(p => p.name === name);
  if (matches.length !== 1) return null;
  return matches[0];
}

function descendants(node: BaseNode & ChildrenMixin, name: string): SceneNode[] {
  return node.findAll(n => n.name === name);
}

export async function inspectSources(): Promise<{ page: PageNode | null; findings: SourceFinding[]; issues: string[] }> {
  const page = exactPage(SOURCE_PAGE);
  const issues: string[] = [];
  if (!page) {
    issues.push(`Expected exactly one ${SOURCE_PAGE} page.`);
    return { page: null, findings: [], issues };
  }
  await page.loadAsync();
  const findings: SourceFinding[] = [];
  for (const [key, source] of Object.entries(SOURCES) as [SourceKey, (typeof SOURCES)[SourceKey]][]) {
    const sections = page.children.filter(n => n.name === source.section && n.type === 'FRAME') as FrameNode[];
    const sectionNameMatches = page.children.filter(n => n.name === source.section && n.type !== 'FRAME');
    if (sections.length !== 1 || sectionNameMatches.length) issues.push(`${source.section}: expected one FRAME, got ${sections.length}; other exact-name types ${sectionNameMatches.map(n => n.type).join(', ') || 'none'}.`);
    const all = sections.flatMap(section => descendants(section, source.name));
    const exactFrames = all.filter(n => n.type === 'FRAME') as FrameNode[];
    const otherMatches = all.filter(n => n.type !== 'FRAME');
    const status: SourceStatus = exactFrames.length > 1 ? 'DUPLICATE' : otherMatches.length ? 'WRONG_TYPE' : exactFrames.length === 1 ? 'FOUND' : 'MISSING';
    findings.push({ key, section: source.section, name: source.name, status, exactFrames, otherMatches, path: `${SOURCE_PAGE} / ${source.section}` });
  }
  return { page, findings, issues };
}

export function sourceReport(result: Awaited<ReturnType<typeof inspectSources>>): string {
  const lines = [`03D SOURCE INSPECTION (READ ONLY)`, `Page: ${SOURCE_PAGE}`, ...result.issues];
  for (const finding of result.findings) {
    lines.push(`${finding.status} ${finding.name} | FRAME ${finding.exactFrames.length} | other ${finding.otherMatches.map(n => n.type).join(', ') || 'none'}`);
    for (const n of [...finding.exactFrames, ...finding.otherMatches]) lines.push(`  ${n.type} ${n.name} [${n.id}] ${finding.path} / ${n.name}`);
  }
  return lines.join('\n');
}
