import { FLOWS, SOURCE_PAGE, TARGET_PAGE, cloneName, flowSectionName, graphErrors, type FlowSpec } from './constants';
import { exactPage, inspectSources } from './source-inspector';
import { annotation, assertTarget, findUniqueControl, inspectOwned, loadAnnotationFont, navigateReaction, pageSection, visualSignature } from './prototype-utils';
import { buildProductAvailability } from './product-availability';
import { buildPurchaseSuccess } from './purchase-success';
import { buildReservationFailure } from './reservation-failure';
import { buildSupportSalesHandoff } from './support-sales-handoff';
import { buildUnknownEscalation } from './unknown-escalation';
import { buildHumanResumeTarget } from './human-resume-target';
import { buildAnalyticsForecasts } from './analytics-forecasts';
import { buildCustomerWebChat } from './customer-web-chat';

export async function inspectPrototypeApi(): Promise<string> {
  const inspection = await inspectSources();
  const candidate = inspection.findings.find(f => f.status === 'FOUND')?.exactFrames[0];
  const reactions = Boolean(candidate && typeof candidate.setReactionsAsync === 'function');
  const page = exactPage(TARGET_PAGE) ?? inspection.page;
  const startsReadable = Boolean(page && 'flowStartingPoints' in page);
  return [
    'PROTOTYPE API (READ ONLY)',
    `Create reactions: ${reactions ? 'SUPPORTED (runtime setter found)' : 'UNSUPPORTED / no inspectable FRAME setter'}`,
    `Navigation destinations: ${reactions ? 'SUPPORTED via NODE destinationId (not yet smoke-tested)' : 'UNSUPPORTED'}`,
    `Back action: ${reactions ? 'SUPPORTED by Reaction API; not used by builders' : 'UNSUPPORTED'}`,
    `Overlay action: ${reactions ? 'SUPPORTED by Reaction API; not needed or used' : 'UNSUPPORTED'}`,
    `Read flow starts: ${startsReadable ? 'SUPPORTED' : 'UNSUPPORTED'}`,
    'Write formal flow starts: UNSUPPORTED (PageNode.flowStartingPoints is read-only)',
    'Any setReactionsAsync rejection aborts the staged flow and preserves the prior approved flow.',
  ].join('\n');
}

function sourceControlCheck(source: FrameNode, control: string): void {
  findUniqueControl(source, control);
}

function sourceHasReactions(source: FrameNode): boolean {
  return source.findAll(n => 'reactions' in n && n.reactions.length > 0).length > 0 || source.reactions.length > 0;
}

function layout(flow: FlowSpec, key: string, normalIndex: number, normalHeight: number): { x: number; y: number } {
  if (flow.id === 7 && key === 'target') return { x: 1750, y: normalHeight + 300 };
  if (flow.id === 8 && key === 'delivery') return { x: 50, y: normalHeight + 300 };
  if (flow.id === 8 && key === 'recovered') return { x: 600, y: normalHeight + 300 };
  return { x: 50 + normalIndex * (flow.id === 8 ? 540 : 1710), y: 115 };
}

function setupStaticSections(page: PageNode, font: FontName): void {
  assertTarget(page);
  const principles = pageSection(page, '00 — Prototype Principles', 0, 0, 1600, 410);
  const principlesName = '3E / Principles / Summary';
  if (!principles.children.some(n => n.name === principlesName)) {
    annotation(page, principles, principlesName,
      '03D is the canonical visual source. 03E contains prototype copies. No feature or backend implementation is claimed. Interactions demonstrate intended UX only. M12 Resume and M13 ready Forecast remain TARGET. OUTCOME_UNKNOWN requires reconciliation without blind retry. Message retry never replays a business mutation.',
      35, 60, 1490, font);
  }
  pageSection(page, '09 — Prototype Validation', 0, 20000, 1600, 240);
}

export async function buildFlow(id: number): Promise<string> {
  const flow = FLOWS.find(f => f.id === id);
  if (!flow) throw new Error(`Unknown flow ${id}.`);
  const graph = graphErrors(flow);
  if (graph.length) throw new Error(`Unsafe flow specification: ${graph.join('; ')}`);
  const inspection = await inspectSources();
  if (inspection.issues.length && id !== 2 && id !== 3 && id !== 4 && id !== 5 && id !== 6 && id !== 7 && id !== 8) throw new Error(`03D source sections invalid: ${inspection.issues.join('; ')}. Nothing was changed.`);
  const sources = new Map<string, FrameNode>();
  for (const item of flow.frames) {
    const result = inspection.findings.find(f => f.key === item.source);
    if (!result || result.status !== 'FOUND') throw new Error(`03D preflight ${item.source}: ${result?.status ?? 'MISSING'}. Nothing was changed.`);
    sources.set(item.key, result.exactFrames[0]);
  }
  if (id !== 1 && id !== 2 && id !== 3 && id !== 4 && id !== 5 && id !== 6 && id !== 7 && id !== 8) for (const edge of flow.edges) sourceControlCheck(sources.get(edge.from)!, edge.control);
  if (id !== 1 && id !== 2 && id !== 3 && id !== 4 && id !== 5 && id !== 6 && id !== 7 && id !== 8) for (const source of sources.values()) {
    if (sourceHasReactions(source)) throw new Error(`${source.name} already has source reactions. Refusing to clone cross-page links.`);
  }
  if (!sources.values().next().value?.setReactionsAsync) throw new Error('Prototype reaction API unavailable. Nothing was changed.');
  const font = await loadAnnotationFont();

  const existingPage = exactPage(TARGET_PAGE);
  if (figma.root.children.filter(p => p.name === TARGET_PAGE).length > 1) throw new Error(`Duplicate ${TARGET_PAGE} pages. Nothing was changed.`);
  if (existingPage) await existingPage.loadAsync();
  const existingSection = existingPage?.children.find(n => n.name === flowSectionName(id));
  if (existingSection && existingSection.type !== 'SECTION') throw new Error('03E flow section has wrong type. Nothing was changed.');
  for (const name of ['00 — Prototype Principles', '09 — Prototype Validation']) {
    const matches = existingPage?.children.filter(n => n.name === name) ?? [];
    if (matches.length > 1 || (matches.length === 1 && matches[0].type !== 'SECTION')) throw new Error(`Invalid 03E section ${name}. Nothing was changed.`);
  }
  const page = existingPage ?? figma.createPage();
  if (!existingPage) page.name = TARGET_PAGE; // The one allowed creation exception; no protected page is modified.
  await figma.setCurrentPageAsync(page);
  assertTarget(page);
  if (id === 1) {
    const result = await buildProductAvailability(page, flow, sources, font);
    setupStaticSections(page, font);
    return result;
  }
  if (id === 2) {
    const result = await buildPurchaseSuccess(page, sources, font);
    setupStaticSections(page, font);
    return result;
  }
  if (id === 3) {
    const result = await buildReservationFailure(page, sources, font);
    setupStaticSections(page, font);
    return result;
  }
  if (id === 4) {
    const result = await buildSupportSalesHandoff(page, sources, font);
    setupStaticSections(page, font);
    return result;
  }
  if (id === 5) {
    const result = await buildUnknownEscalation(page, sources, font);
    setupStaticSections(page, font);
    return result;
  }
  if (id === 6) {
    const result = await buildHumanResumeTarget(page, sources, font);
    setupStaticSections(page, font);
    return result;
  }
  if (id === 7) {
    const result = await buildAnalyticsForecasts(page, sources, font);
    setupStaticSections(page, font);
    return result;
  }
  if (id === 8) {
    const result = await buildCustomerWebChat(page, sources, font);
    setupStaticSections(page, font);
    return result;
  }

  const previous = existingSection ? inspectOwned(existingSection, flow) : [];

  const sectionWasNew = !existingSection;
  let section: SectionNode | undefined;
  const staged: SceneNode[] = [];
  try {
    section = pageSection(page, flowSectionName(id), 0, 400 + id * 2200, 2300, 1500);
    const clones = new Map<string, FrameNode>();
    let normalIndex = 0;
    let normalHeight = 900;
    for (const item of flow.frames) {
      assertTarget(page);
      const source = sources.get(item.key)!;
      const clone = source.clone();
      clone.name = `STAGING / ${cloneName(id, item.key)}`;
      section.appendChild(clone);
      staged.push(clone);
      clones.set(item.key, clone);
      if (!item.targetOnly && !(flow.id === 8 && ['delivery', 'recovered'].includes(item.key))) normalHeight = Math.max(normalHeight, clone.height);
    }
    for (const item of flow.frames) {
      const clone = clones.get(item.key)!;
      const isBranch = item.targetOnly || (flow.id === 8 && ['delivery', 'recovered'].includes(item.key));
      const at = layout(flow, item.key, normalIndex, normalHeight);
      clone.x = at.x;
      clone.y = at.y;
      if (!isBranch) normalIndex++;
      if (visualSignature(clone) !== visualSignature(sources.get(item.key)!)) throw new Error(`Visual clone mismatch: ${item.source}.`);
    }
    for (const edge of flow.edges) {
      assertTarget(page);
      const from = findUniqueControl(clones.get(edge.from)!, edge.control);
      const to = clones.get(edge.to)!;
      await from.setReactionsAsync([navigateReaction(to.id)]);
      const action = from.reactions[0]?.actions?.[0];
      if (!action || action.type !== 'NODE' || action.destinationId !== to.id) throw new Error(`Reaction write did not persist: ${edge.from} → ${edge.to}.`);
    }
    const prefix = `3E / Flow ${String(id).padStart(2, '0')}`;
    const first = clones.get(flow.frames[0].key)!;
    const normalFrames = flow.frames.filter(f => !f.targetOnly);
    const endFrame = clones.get(normalFrames[normalFrames.length - 1].key)!;
    staged.push(annotation(page, section, `STAGING / ${prefix} / START`, `START — Flow ${id}: ${flow.title}`, first.x, 35, 1450, font));
    staged.push(annotation(page, section, `STAGING / ${prefix} / END`, `END — Flow ${id} / scenario specimen`, endFrame.x, endFrame.y + endFrame.height + 30, 1450, font));
    flow.notes.forEach((note, i) => staged.push(annotation(page, section!, `STAGING / ${prefix} / Note ${i + 1}`, note, 50, normalHeight + 160 + i * 60, 1460, font)));
    let noteIndex = 0;
    for (const edge of flow.edges) if (edge.note) {
      noteIndex++;
      const from = clones.get(edge.from)!;
      staged.push(annotation(page, section, `STAGING / ${prefix} / Edge Note ${noteIndex}`, edge.note, from.x, from.y + from.height + 65, Math.min(from.width, 1450), font));
    }
    const maxX = Math.max(...section.children.map(n => 'width' in n ? n.x + n.width : 0));
    const maxY = Math.max(...section.children.map(n => 'height' in n ? n.y + n.height : 0));
    section.resize(Math.max(1600, maxX + 80), Math.max(750, maxY + 90));
    setupStaticSections(page, font);
    for (const old of previous) { assertTarget(page); old.remove(); }
    for (const node of staged) node.name = node.name.replace(/^STAGING \/ /, '');
    return `Built ${flowSectionName(id)}: ${flow.frames.length} approved 03D clones; ${flow.edges.length} real reactions. Formal start-point API is read-only; START annotation added.`;
  } catch (error) {
    for (const node of staged) if (!node.removed) { assertTarget(page); node.remove(); }
    if (sectionWasNew && section && !section.removed && section.children.length === 0) { assertTarget(page); section.remove(); }
    throw error;
  }
}
