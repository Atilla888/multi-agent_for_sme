import { ANALYTICS_VARIANTS, SECTIONS, TARGET_PAGE, analyticsName } from '../constants';
import { allText, exactFrame } from '../figma-utils';
import type { Check, Validation } from './phase3d';

type Bounds = { x: number; y: number; width: number; height: number };
const check = (label: string, pass: boolean, detail?: string): Check => ({ label, pass, detail });
const has = (node: FrameNode | undefined, value: string): boolean => Boolean(node && allText(node).includes(value));
const fits = (n: Bounds, p: Bounds): boolean => [n.x, n.y, n.width, n.height].every(Number.isFinite) &&
  n.x >= 0 && n.y >= 0 && n.width > 0 && n.height > 0 && n.x + n.width <= p.width + 1 && n.y + n.height <= p.height + 1;
const direct = (parent: FrameNode | undefined, name: string): FrameNode | undefined => {
  if (!parent) return undefined;
  const matches = parent.children.filter(n => n.type === 'FRAME' && n.name === name);
  return matches.length === 1 ? matches[0] as FrameNode : undefined;
};
const named = (parent: FrameNode | undefined, name: string): SceneNode | undefined => {
  if (!parent) return undefined;
  const matches = parent.findAll(n => n.name === name);
  return matches.length === 1 ? matches[0] : undefined;
};
const chartPartFits = (part: SceneNode, chart: InstanceNode): boolean => {
  if (!('width' in part)) return false;
  const outer = chart.absoluteBoundingBox;
  const inner = part.absoluteBoundingBox;
  if (outer && inner) return inner.x >= outer.x - 1 && inner.y >= outer.y - 1 &&
    inner.x + inner.width <= outer.x + outer.width + 1 && inner.y + inner.height <= outer.y + outer.height + 1;
  return fits(part, chart);
};
const blocks = ['Report Controls', 'Report State', 'KPI Summary', 'Historical Chart', 'Data Table', 'Data Quality', 'Forecast Contextual Link'] as const;

function geometry(screen: FrameNode): boolean {
  const nav = direct(screen, 'Staff navigation');
  const main = direct(screen, 'Analytics Workspace');
  if (!nav || !main || screen.width !== 1760 || screen.clipsContent || !fits(nav, screen) || !fits(main, screen) || nav.x + nav.width > main.x + 1) return false;
  const regions = blocks.map(name => direct(main, name));
  if (regions.some(r => !r)) return false;
  const placed = regions as FrameNode[];
  if (!placed.every(r => fits(r, main)) || !placed.every((r, i) => i === 0 || r.y >= placed[i - 1].y + placed[i - 1].height + 16)) return false;
  if (!placed.every(r => r.children.every(n => !('width' in n) || fits(n, r)))) return false;
  const chart = direct(main, 'Historical Chart');
  const table = direct(main, 'Data Table');
  const quality = direct(main, 'Data Quality');
  if (!chart || !table || !quality) return false;
  for (const region of [chart, table, quality]) {
    const instances = region.children.filter(n => n.type === 'INSTANCE') as InstanceNode[];
    if (!instances.every(n => fits(n, region))) return false;
  }
  const chartInstance = named(chart, 'Historical Chart component');
  if (chartInstance?.type === 'INSTANCE') {
    const labels = chartInstance.findAll(n => n.type === 'TEXT') as TextNode[];
    if (!labels.every(n => n.parent && 'width' in n.parent && fits(n, n.parent))) return false;
  }
  const forecast = direct(main, 'Forecast Contextual Link');
  const link = named(forecast, 'Open Forecasts');
  const ownTexts = screen.findAll(n => n.type === 'TEXT').filter(n => {
    if (n.name.startsWith('Manual /')) return false;
    let parent = n.parent;
    while (parent && parent !== screen) { if (parent.type === 'INSTANCE' || parent.name.startsWith('Manual /')) return false; parent = parent.parent; }
    return true;
  }) as TextNode[];
  return Boolean(link && link.type === 'FRAME' && link.height >= 44 && fits(link, forecast as FrameNode)) &&
    ownTexts.every(n => n.parent && 'width' in n.parent && fits(n, n.parent));
}

function chartSemantics(screen: FrameNode, expected: 'continuous' | 'gap' | 'none'): boolean {
  const chartRegion = direct(direct(screen, 'Analytics Workspace'), 'Historical Chart');
  const chart = named(chartRegion, 'Historical Chart component');
  if (expected === 'none') return !chart && !named(chartRegion, 'ACTUAL / solid segment 1') && Boolean(named(chartRegion, 'No chart result'));
  if (!chart || chart.type !== 'INSTANCE') return false;
  const segments = chart.findAll(n => /^ACTUAL \/ solid segment [1-4]$/.test(n.name));
  const gap = chart.findAll(n => n.name === 'Missing observation / visible gap');
  const textValue = allText(chart);
  if (![...segments, ...gap].every(n => chartPartFits(n, chart))) return false;
  if (!textValue.includes('ACTUAL ━ solid / observed only') || /PREDICTED|forecast series|future series/i.test(textValue)) return false;
  if (expected === 'gap') return segments.length === 2 && gap.length === 1 && textValue.includes('MISSING') && !segments.some(n => n.name === 'ACTUAL / solid segment 2' || n.name === 'ACTUAL / solid segment 3');
  return segments.length === 4 && gap.length === 0;
}

export function validateAnalytics(page: PageNode | undefined): Validation {
  const section = page ? exactFrame(page, SECTIONS.analytics) : undefined;
  const checks: Check[] = [
    check('03D page', Boolean(page && page.name === TARGET_PAGE)),
    check('Analytics section', Boolean(section)),
  ];
  const screens = new Map<string, FrameNode>();
  for (const variant of ANALYTICS_VARIANTS) {
    const matches = section?.children.filter(n => n.name === analyticsName(variant.key)) ?? [];
    const valid = matches.length === 1 && matches[0].type === 'FRAME';
    checks.push(check(`Variant / ${variant.key}`, valid, valid ? undefined : `${matches.length} exact match(es)`));
    if (valid) screens.set(variant.key, matches[0] as FrameNode);
  }
  for (const variant of ANALYTICS_VARIANTS) {
    const screen = screens.get(variant.key);
    if (!screen) continue;
    const main = direct(screen, 'Analytics Workspace');
    const controls = direct(main, 'Report Controls');
    const kpi = direct(main, 'KPI Summary');
    const chart = direct(main, 'Historical Chart');
    const table = direct(main, 'Data Table');
    const quality = direct(main, 'Data Quality');
    checks.push(check(`${variant.key} / stable structure`, Boolean(main && blocks.every(n => direct(main, n)))));
    checks.push(check(`${variant.key} / geometry`, geometry(screen)));
    checks.push(check(`${variant.key} / Analytics active; Forecasts nested`, Boolean(named(screen, 'Primary / Analytics') && named(screen, 'Active marker') && named(screen, 'Nested / Analytics / Forecasts') && named(main, 'Open Forecasts'))));
    checks.push(check(`${variant.key} / report controls`, Boolean(controls && named(controls, 'Period Selector component')?.type === 'INSTANCE' && named(controls, 'Core Select component')?.type === 'INSTANCE' && named(controls, 'Metric Select') && has(controls, 'Confirmed orders (count)') && has(controls, 'May / selected') && has(controls, 'Monthly') && named(controls, 'Request Report'))));
    checks.push(check(`${variant.key} / observed-only boundary`, !/PREDICTED|forecast series|future series|recognized revenue|Sales = 0|Orders = 0/i.test(allText(screen)) && !Boolean(screen.findAll(n => /Forecast \/ Predicted|PREDICTED|dashed forecast/i.test(n.name)).length)));
    checks.push(check(`${variant.key} / Forecasts contextual link`, Boolean(named(main, 'Forecast Contextual Link') && named(main, 'Open Forecasts') && has(main, 'separate nested Analytics destination'))));
    checks.push(check(`${variant.key} / expected regions`, Boolean(kpi && chart && table && quality)));
  }
  const valid = screens.get('Valid');
  checks.push(check('Valid / historical KPI and complete table', has(valid, '24') && has(valid, 'Week A') && has(valid, 'Week B') && has(valid, 'Week C') && has(valid, '8') && has(valid, '10') && has(valid, '6') && has(valid, 'Complete') && Boolean(named(valid, 'KPI component') && named(valid, 'Data Table component'))));
  checks.push(check('Valid / continuous ACTUAL chart', Boolean(valid && chartSemantics(valid, 'continuous'))));
  checks.push(check('Valid / freshness and completeness', Boolean(named(valid, 'Freshness component') && named(valid, 'Completeness component') && has(valid, 'Current observed snapshot') && has(valid, 'Source coverage complete'))));
  const empty = screens.get('Valid Empty');
  checks.push(check('Valid Empty / successful no-record result', has(empty, 'Query succeeded; no records for this period.') && has(empty, 'Not a source failure.') && has(empty, 'No records for this period') && !Boolean(named(empty, 'KPI component') || named(empty, 'Data Table component')) && Boolean(empty && chartSemantics(empty, 'none'))));
  const incomplete = screens.get('Incomplete');
  const incompleteTable = direct(direct(incomplete, 'Analytics Workspace'), 'Data Table');
  checks.push(check('Incomplete / partial, never complete total', has(incomplete, 'Partial coverage') && has(incomplete, '14 observed') && has(incomplete, 'NOT a complete May total') && has(incompleteTable, 'Week B unavailable') && has(incompleteTable, 'Missing') && has(incomplete, 'Source coverage complete') === false));
  checks.push(check('Incomplete / visible gap, not zero', Boolean(incomplete && chartSemantics(incomplete, 'gap')) && has(incomplete, 'missing observation is not zero') && !Boolean(incomplete && /Week B:\s*0\b/.test(allText(incomplete)))));
  checks.push(check('Incomplete / freshness and completeness independent', Boolean(named(incomplete, 'Freshness component') && named(incomplete, 'Completeness component') && has(incomplete, 'Partial coverage ≠ zero activity'))));
  const stale = screens.get('Stale');
  checks.push(check('Stale / retains observed values and requests refresh', has(stale, '24') && has(stale, 'Source observed at 10:42') && has(stale, 'Refresh before') && Boolean(named(stale, 'Data Table component')) && Boolean(stale && chartSemantics(stale, 'continuous'))));
  const unavailable = screens.get('Dependency Unavailable');
  checks.push(check('Dependency Unavailable / no substitute zero', has(unavailable, 'DEPENDENCY UNAVAILABLE') && has(unavailable, 'No trusted result') && has(unavailable, 'Try again later') && !Boolean(named(unavailable, 'KPI component') || named(unavailable, 'Data Table component')) && Boolean(unavailable && chartSemantics(unavailable, 'none'))));
  checks.push(check('Dependency Unavailable / unavailable completeness', Boolean(named(unavailable, 'Completeness component')) && has(unavailable, 'No trusted result; do not show zero')));
  const denied = screens.get('Permission Denied');
  checks.push(check('Permission Denied / no protected report values', has(denied, 'PERMISSION DENIED') && has(denied, 'Request authorized access') && !Boolean(named(denied, 'KPI component') || named(denied, 'Data Table component') || named(denied, 'Freshness component') || named(denied, 'Completeness component')) && Boolean(denied && chartSemantics(denied, 'none')) && !Boolean(denied && /\b24\b|\b14 observed\b|Week A:\s*8|\b\d+\s+(?:orders|sales)\b/i.test(allText(denied)))));
  return { section: 'Analytics', checks, pass: checks.every(c => c.pass) };
}

export function formatAnalyticsValidation(result: Validation): string {
  return [
    'PHASE 3D ANALYTICS VALIDATION',
    `${result.pass ? 'PASS' : 'FAIL'} · structural, semantic and generated-node geometry; manual visual review required.`,
    ...result.checks.map(c => `${c.label}: ${c.pass ? 'PASS' : 'FAIL'}${c.detail ? ` (${c.detail})` : ''}`),
  ].join('\n');
}
