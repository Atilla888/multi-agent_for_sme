import { SECTIONS, TARGET_PAGE } from './constants';
import { findPage } from './figma-utils';

type Kind = 'analytics' | 'forecast';
type Signature = { label: string; source: 'text' | 'name'; phrases: readonly string[] };
type Candidate = { frame: FrameNode; path: string; descendants: number; matched: string[]; missing: string[]; score: number; contentFingerprint: string };
type SectionAnalysis = { kind: Kind; canonical: string; archive: string; candidates: Candidate[]; selected?: Candidate; reason?: string };
type Analysis = { sections: SectionAnalysis[]; ready: boolean; alreadyResolved: boolean; archiveConflicts: string[] };
type Snapshot = { fileKey: string | undefined; pageId: string; fingerprints: string[] };

const configs: Record<Kind, { canonical: string; archive: string; signatures: readonly Signature[]; anchors: readonly string[]; minimum: number }> = {
  analytics: {
    canonical: SECTIONS.analytics,
    archive: `ARCHIVE — ${SECTIONS.analytics} — pre-refinement`,
    signatures: [
      { label: 'Missing period / unavailable observation', source: 'text', phrases: ['Missing period / unavailable observation'] },
      { label: 'VALID EMPTY', source: 'text', phrases: ['VALID EMPTY'] },
      { label: 'PERMISSION DENIED', source: 'text', phrases: ['PERMISSION DENIED'] },
      { label: 'HISTORICAL ANALYTICS', source: 'text', phrases: ['HISTORICAL ANALYTICS'] },
      { label: 'REQUEST FORECAST', source: 'text', phrases: ['REQUEST FORECAST'] },
      { label: 'ACTUAL', source: 'text', phrases: ['ACTUAL'] },
      { label: 'Dependency Unavailable', source: 'text', phrases: ['Dependency Unavailable'] },
      { label: 'Continuous ACTUAL joints', source: 'name', phrases: ['ACTUAL / continuous joint'] },
      { label: 'Explicit missing-data gap', source: 'name', phrases: ['Missing observation / visible gap', 'State=Missing-data Gap'] },
      { label: 'Incomplete and stale distinct', source: 'name', phrases: ['State=Incomplete Data', 'State=Stale Data'] },
      { label: 'Analytics → Forecast boundary', source: 'name', phrases: ['DS / Analytics / Historical to Forecast Request'] },
    ],
    anchors: ['Missing period / unavailable observation', 'HISTORICAL ANALYTICS', 'REQUEST FORECAST', 'Continuous ACTUAL joints', 'Explicit missing-data gap', 'Analytics → Forecast boundary'],
    minimum: 9,
  },
  forecast: {
    canonical: SECTIONS.forecast,
    archive: `ARCHIVE — ${SECTIONS.forecast} — pre-refinement`,
    signatures: [
      { label: 'CUTOFF / last observed', source: 'text', phrases: ['CUTOFF / last observed'] },
      { label: 'MODEL_NOT_READY', source: 'text', phrases: ['MODEL_NOT_READY'] },
      { label: 'INCOMPLETE HISTORY', source: 'text', phrases: ['INCOMPLETE HISTORY'] },
      { label: 'PERMISSION DENIED', source: 'text', phrases: ['PERMISSION DENIED'] },
      { label: 'TARGET PRODUCT UX', source: 'text', phrases: ['TARGET PRODUCT UX'] },
      { label: 'ACTUAL', source: 'text', phrases: ['ACTUAL'] },
      { label: 'PREDICTED', source: 'text', phrases: ['PREDICTED'] },
      { label: 'Insufficient History', source: 'text', phrases: ['Insufficient History'] },
      { label: 'Unsupported Horizon', source: 'text', phrases: ['Unsupported Horizon'] },
      { label: 'Continuous solid ACTUAL', source: 'name', phrases: ['ACTUAL / continuous joint', 'ACTUAL / solid segment'] },
      { label: 'Dashed future PREDICTED', source: 'name', phrases: ['PREDICTED / dash'] },
      { label: 'Actual vs Predicted chart', source: 'name', phrases: ['Component / Forecast / Actual vs Predicted Chart'] },
      { label: 'Target ready composition', source: 'name', phrases: ['DS / Forecast / TARGET Ready Composition'] },
    ],
    anchors: ['CUTOFF / last observed', 'MODEL_NOT_READY', 'TARGET PRODUCT UX', 'Continuous solid ACTUAL', 'Dashed future PREDICTED', 'Actual vs Predicted chart'],
    minimum: 11,
  },
};

let prepared: Snapshot | undefined;

function normalize(value: string): string { return value.normalize('NFKC').replace(/\s+/g, ' ').toUpperCase(); }

function path(node: SceneNode, page: PageNode): string {
  const parts = [node.name];
  let parent: BaseNode | null = node.parent;
  for (let depth = 0; parent && parent !== page && depth < 32; depth++) {
    parts.unshift(parent.name);
    parent = parent.parent;
  }
  return [page.name, ...parts].join(' / ');
}

function inspectCandidate(frame: FrameNode, page: PageNode, signatures: readonly Signature[]): Candidate {
  const descendants = frame.findAll();
  const textCorpus = normalize(descendants.filter((node): node is TextNode => node.type === 'TEXT').map(node => node.characters).join('\n'));
  const nameCorpus = normalize(descendants.map(node => node.name).join('\n'));
  const matched: string[] = [], missing: string[] = [];
  for (const signature of signatures) {
    const corpus = signature.source === 'text' ? textCorpus : nameCorpus;
    (signature.phrases.every(phrase => corpus.includes(normalize(phrase))) ? matched : missing).push(signature.label);
  }
  const contentFingerprint = JSON.stringify(descendants.map(node => [node.id, node.type, node.name,
    node.type === 'TEXT' ? node.characters : '']));
  return { frame, path: path(frame, page), descendants: descendants.length, matched, missing, score: matched.length, contentFingerprint };
}

function analyzePage(page: PageNode): Analysis {
  const nodes = page.findAll();
  const sections = (['analytics', 'forecast'] as const).map(kind => {
    const config = configs[kind];
    const frames = nodes.filter((node): node is FrameNode => node.type === 'FRAME' && node.name === config.canonical);
    const candidates = frames.map(frame => inspectCandidate(frame, page, config.signatures));
    const strong = candidates.filter(candidate => candidate.score >= config.minimum &&
      config.anchors.every(anchor => candidate.matched.includes(anchor)));
    const selected = candidates.length === 2 && strong.length === 1 &&
      strong[0].score - candidates.find(candidate => candidate !== strong[0])!.score >= 3 ? strong[0] : undefined;
    const reason = candidates.length !== 2 ? `Expected exactly two canonical FRAME candidates; found ${candidates.length}.`
      : !selected ? 'No unique strong latest-refinement match with a score lead of at least 3.' : undefined;
    return { kind, canonical: config.canonical, archive: config.archive, candidates, selected, reason };
  });
  const archiveConflicts = sections.filter(section => nodes.some(node => node.name === section.archive)).map(section => section.archive);
  const ready = sections.every(section => section.selected) && archiveConflicts.length === 0;
  const alreadyResolved = sections.every(section => section.candidates.length === 1 &&
    nodes.filter(node => node.type === 'FRAME' && node.name === section.archive).length === 1);
  return { sections, ready, alreadyResolved, archiveConflicts };
}

function fingerprint(analysis: Analysis): string[] {
  return analysis.sections.flatMap(section => section.candidates.map(candidate =>
    `${section.kind}:${candidate.frame.id}:${candidate.path}:${candidate.frame.width}x${candidate.frame.height}:${candidate.score}:${candidate.contentFingerprint}`)).sort();
}

function formatAnalysis(analysis: Analysis): string {
  const lines = ['PHASE 3C DUPLICATE ANALYSIS', `Page: ${TARGET_PAGE}`, 'Read-only: no Figma nodes were changed.'];
  for (const section of analysis.sections) {
    lines.push('', section.kind.toUpperCase(), `Canonical: ${section.canonical}`);
    section.candidates.forEach((candidate, index) => {
      lines.push(`Candidate ${index === 0 ? 'A' : 'B'}:`, `- id: ${candidate.frame.id}`, `- path: ${candidate.path}`,
        `- size: ${candidate.frame.width} × ${candidate.frame.height}`,
        `- descendants: ${candidate.descendants}`,
        `- refinement signature score: ${candidate.score}/${configs[section.kind].signatures.length}`,
        `- matched: ${candidate.matched.join('; ') || 'none'}`,
        `- missing: ${candidate.missing.join('; ') || 'none'}`);
    });
    lines.push(section.selected ? `Selected canonical candidate: ${section.selected.path} (id ${section.selected.frame.id})`
      : `Selected canonical candidate: NONE — ${section.reason}`);
  }
  if (analysis.archiveConflicts.length && !analysis.alreadyResolved) lines.push(`Archive name collision: ${analysis.archiveConflicts.join('; ')}`);
  lines.push('', analysis.ready ? 'READY FOR EXPLICIT RESOLVE — only the two non-selected FRAME names will be archived.'
    : analysis.alreadyResolved ? 'ALREADY RESOLVED — one canonical FRAME and one archive exist for each section.'
      : 'DUPLICATE RESOLUTION BLOCKED — MANUAL REVIEW REQUIRED.');
  return lines.join('\n');
}

export async function analyzeDuplicates(): Promise<{ text: string; canResolve: boolean }> {
  prepared = undefined;
  const page = await findPage();
  if (!page) return { text: `DUPLICATE RESOLUTION BLOCKED — MANUAL REVIEW REQUIRED.\n${TARGET_PAGE} is absent.`, canResolve: false };
  const analysis = analyzePage(page);
  if (analysis.ready) prepared = { fileKey: figma.fileKey ?? undefined, pageId: page.id, fingerprints: fingerprint(analysis) };
  return { text: formatAnalysis(analysis), canResolve: analysis.ready };
}

export async function resolveDuplicates(): Promise<string> {
  const page = await findPage();
  if (!page) return `DUPLICATE RESOLUTION BLOCKED — MANUAL REVIEW REQUIRED.\n${TARGET_PAGE} is absent.`;
  const analysis = analyzePage(page);
  if (analysis.alreadyResolved) { prepared = undefined; return 'ALREADY RESOLVED — one canonical FRAME and one archive exist for Analytics and Forecast. No changes made.'; }
  if (!prepared || !analysis.ready || prepared.fileKey !== (figma.fileKey ?? undefined) || prepared.pageId !== page.id ||
      JSON.stringify(prepared.fingerprints) !== JSON.stringify(fingerprint(analysis))) {
    prepared = undefined;
    return 'DUPLICATE RESOLUTION BLOCKED — MANUAL REVIEW REQUIRED. Run Analyze 11/12 Duplicates again; candidates changed or selection is ambiguous.';
  }
  const nodes = page.findAll();
  if (analysis.sections.some(section => nodes.some(node => node.name === section.archive))) {
    prepared = undefined;
    return 'DUPLICATE RESOLUTION BLOCKED — MANUAL REVIEW REQUIRED. An archive name already exists; no nodes were changed.';
  }
  const archives = analysis.sections.map(section => ({ section, frame: section.candidates.find(candidate => candidate !== section.selected)!.frame }));
  try {
    for (const { section, frame } of archives) frame.name = section.archive;
    const after = analyzePage(page);
    if (!after.alreadyResolved) throw new Error('Post-rename structural check did not find one canonical FRAME and one archive for each section.');
  } catch (error) {
    const rollbackErrors: string[] = [];
    for (const { section, frame } of archives) {
      try { if (frame.name === section.archive) frame.name = section.canonical; }
      catch (rollbackError) { rollbackErrors.push(rollbackError instanceof Error ? rollbackError.message : String(rollbackError)); }
    }
    prepared = undefined;
    throw new Error(`Duplicate resolution failed: ${error instanceof Error ? error.message : String(error)}.${rollbackErrors.length ? ` Rollback also failed: ${rollbackErrors.join('; ')}.` : ' Original names were restored.'}`);
  }
  prepared = undefined;
  return ['DUPLICATE RESOLUTION COMPLETE', ...analysis.sections.flatMap(section => {
    const archived = archives.find(item => item.section === section)!.frame;
    return [`${section.kind === 'analytics' ? 'Analytics' : 'Forecast'} canonical: ${section.selected!.path} (id ${section.selected!.frame.id})`,
      `${section.kind === 'analytics' ? 'Analytics' : 'Forecast'} archived: ${path(archived, page)} (id ${archived.id})`];
  }), 'No nodes deleted. No descendants or visual content changed.'].join('\n');
}
