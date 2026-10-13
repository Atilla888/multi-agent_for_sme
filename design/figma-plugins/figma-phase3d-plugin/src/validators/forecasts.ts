import { FORECAST_VARIANTS, SECTIONS, TARGET_PAGE, forecastName } from '../constants';
import { allText, exactFrame } from '../figma-utils';
import type { Check, Validation } from './phase3d';

type Bounds = { x: number; y: number; width: number; height: number };
const check = (label: string, pass: boolean, detail?: string): Check => ({ label, pass, detail });
const fits = (n: Bounds, p: Bounds): boolean => [n.x, n.y, n.width, n.height].every(Number.isFinite) &&
  n.x >= 0 && n.y >= 0 && n.width > 0 && n.height > 0 && n.x + n.width <= p.width + 1 && n.y + n.height <= p.height + 1;
const overlaps = (a: Bounds, b: Bounds): boolean => a.x < b.x + b.width - 1 && b.x < a.x + a.width - 1 &&
  a.y < b.y + b.height - 1 && b.y < a.y + a.height - 1;
const direct = (parent: FrameNode | undefined, name: string): FrameNode | undefined => {
  const matches = parent?.children.filter(n => n.type === 'FRAME' && n.name === name) ?? [];
  return matches.length === 1 ? matches[0] as FrameNode : undefined;
};
const named = (parent: FrameNode | undefined, name: string): SceneNode | undefined => {
  const matches = parent?.findAll(n => n.name === name) ?? [];
  return matches.length === 1 ? matches[0] : undefined;
};
const has = (parent: FrameNode | undefined, phrase: string): boolean => Boolean(parent && allText(parent).includes(phrase));
const blocks = ['Forecast Request Summary', 'Availability State', 'Historical Context', 'Forecast Result', 'Provenance and Limitations', 'Historical Analytics Return'] as const;

// Chart marks can be rotated rectangles (the cutoff is 215 px long but only
// 2 px wide on screen). Resolve their visible bounds in chart coordinates;
// x + width on the raw node is not its horizontal extent after rotation.
function chartBounds(node: SceneNode, chart: SceneNode): Bounds | undefined {
  if (!('width' in node) || !('height' in node)) return undefined;
  let transform = [[1, 0, 0], [0, 1, 0]];
  let current: SceneNode | BaseNode | null = node;
  while (current !== chart) {
    if (!current || !('parent' in current) || !('width' in current)) return undefined;
    const local = 'relativeTransform' in current && current.relativeTransform
      ? current.relativeTransform
      : [[1, 0, current.x], [0, 1, current.y]];
    transform = [
      [local[0][0] * transform[0][0] + local[0][1] * transform[1][0], local[0][0] * transform[0][1] + local[0][1] * transform[1][1], local[0][0] * transform[0][2] + local[0][1] * transform[1][2] + local[0][2]],
      [local[1][0] * transform[0][0] + local[1][1] * transform[1][0], local[1][0] * transform[0][1] + local[1][1] * transform[1][1], local[1][0] * transform[0][2] + local[1][1] * transform[1][2] + local[1][2]],
    ];
    current = current.parent;
  }
  const corners = [[0, 0], [node.width, 0], [0, node.height], [node.width, node.height]];
  const xs = corners.map(([x, y]) => transform[0][0] * x + transform[0][1] * y + transform[0][2]);
  const ys = corners.map(([x, y]) => transform[1][0] * x + transform[1][1] * y + transform[1][2]);
  return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
}

const dashedStroke = (node: SceneNode): boolean => 'dashPattern' in node && Array.isArray(node.dashPattern) && node.dashPattern.length > 0;

function geometry(board: FrameNode): boolean {
  const canvas = direct(board, 'Staff Screen');
  const nav = direct(canvas, 'Staff navigation');
  const main = direct(canvas, 'Forecast Workspace');
  if (!canvas || !nav || !main || board.width !== 1760 || board.clipsContent || !fits(canvas, board) || !fits(nav, canvas) || !fits(main, canvas) || nav.x + nav.width > main.x + 1) return false;
  const regions = blocks.map(name => direct(main, name));
  if (regions.some(r => !r)) return false;
  const placed = regions as FrameNode[];
  if (!placed.every(r => fits(r, main)) || !placed.every((r, i) => i === 0 || r.y >= placed[i - 1].y + placed[i - 1].height + 16)) return false;
  if (!placed.every(r => r.children.every(n => !('width' in n) || fits(n, r)))) return false;
  if (!placed.every(r => {
    const children = r.children.filter(n => 'width' in n && !n.name.startsWith('Manual /')) as SceneNode[];
    return children.every((a, i) => children.slice(i + 1).every(b => !('width' in a && 'width' in b && overlaps(a, b))));
  })) return false;
  const ownTexts = board.findAll(n => n.type === 'TEXT').filter(n => {
    if (n.name.startsWith('Manual /')) return false;
    let parent = n.parent;
    while (parent && parent !== board) {
      if (parent.type === 'INSTANCE' || parent.name.startsWith('Manual /')) return false;
      parent = parent.parent;
    }
    return true;
  }) as TextNode[];
  return ownTexts.every(n => n.parent && 'width' in n.parent && fits(n, n.parent));
}

function targetChart(board: FrameNode): boolean {
  const chart = named(direct(direct(direct(board, 'Staff Screen'), 'Forecast Workspace'), 'Forecast Result'), 'Actual vs Predicted Chart component');
  if (!chart || chart.type !== 'INSTANCE') return false;
  const actual = chart.findAll(n => /^ACTUAL \/ solid segment [1-4]$/.test(n.name));
  const joints = chart.findAll(n => /^ACTUAL \/ continuous joint [1-3]$/.test(n.name));
  const predicted = chart.findAll(n => /^PREDICTED \/ dash \d+$/.test(n.name));
  const cutoff = chart.findAll(n => n.name === 'CUTOFF / vertical marker');
  if (actual.length !== 4 || joints.length !== 3 || predicted.length < 3 || cutoff.length !== 1) return false;
  if (chart.findAll(n => /^(ACTUAL \/ dash|PREDICTED \/ solid)/i.test(n.name)).length || actual.some(dashedStroke)) return false;
  const dashNumbers = predicted.map(n => Number(n.name.match(/\d+$/)?.[0])).sort((a, b) => a - b);
  if (!dashNumbers.every((number, i) => number === i + 1)) return false;
  const marks = [...actual, ...joints, ...predicted, cutoff[0]];
  const bounds = marks.map(n => chartBounds(n, chart));
  if (bounds.some(b => !b || !fits(b, chart))) return false;
  const actualBounds = bounds.slice(0, actual.length);
  const predictedBounds = bounds.slice(actual.length + joints.length, -1);
  const cutoffBounds = bounds[bounds.length - 1];
  if (!cutoffBounds || cutoffBounds.height < cutoffBounds.width * 4) return false;
  const cutoffX = cutoffBounds.x + cutoffBounds.width / 2;
  const history = actualBounds as Bounds[];
  const future = (predictedBounds as Bounds[]).sort((a, b) => a.x - b.x);
  if (!history.every(b => b.x < cutoffX && b.x + b.width <= cutoffX + 3) ||
    !future.every(b => b.x >= cutoffX + 2) ||
    !future.every((b, i) => i === 0 || b.x >= future[i - 1].x + future[i - 1].width + 2)) return false;
  const chartText = allText(chart).replace(/\s+/g, ' ').toLowerCase();
  if (!/actual\s*[—–-]\s*solid line/.test(chartText) || !/predicted\s*[—–-]\s*dashed line/.test(chartText) ||
    !/cutoff\s*\/\s*last observed/.test(chartText) || !/target product ux/.test(chartText)) return false;
  const labels = chart.findAll(n => n.type === 'TEXT') as TextNode[];
  return labels.every(n => n.parent && 'width' in n.parent && fits(n, n.parent));
}

export function validateForecasts(page: PageNode | undefined): Validation {
  const section = page ? exactFrame(page, SECTIONS.forecasts) : undefined;
  const checks: Check[] = [
    check('03D page', Boolean(page && page.name === TARGET_PAGE)),
    check('Forecasts section', Boolean(section)),
  ];
  const boards = new Map<string, FrameNode>();
  for (const variant of FORECAST_VARIANTS) {
    const matches = section?.children.filter(n => n.name === forecastName(variant.key)) ?? [];
    const valid = matches.length === 1 && matches[0].type === 'FRAME';
    checks.push(check(`Variant / ${variant.key}`, valid, valid ? undefined : `${matches.length} exact match(es)`));
    if (valid) boards.set(variant.key, matches[0] as FrameNode);
  }
  for (const variant of FORECAST_VARIANTS) {
    const board = boards.get(variant.key);
    if (!board) continue;
    const canvas = direct(board, 'Staff Screen');
    const main = direct(canvas, 'Forecast Workspace');
    const request = direct(main, 'Forecast Request Summary');
    const state = direct(main, 'Availability State');
    const history = direct(main, 'Historical Context');
    const result = direct(main, 'Forecast Result');
    const evidence = direct(main, 'Provenance and Limitations');
    const back = direct(main, 'Historical Analytics Return');
    checks.push(check(`${variant.key} / stable structure`, Boolean(main && blocks.every(name => direct(main, name)))));
    checks.push(check(`${variant.key} / request target, scope, cutoff and horizon`, Boolean(
      named(request, 'Request Summary component')?.type === 'INSTANCE' && named(request, 'Target component')?.type === 'INSTANCE' &&
      named(request, 'Cutoff component')?.type === 'INSTANCE' && named(request, 'Horizon component')?.type === 'INSTANCE' &&
      ['TARGET', 'SCOPE', 'CUTOFF', 'HORIZON'].every(label => has(request, label)) &&
      (variant.kind === 'denied' ? has(request, 'Not disclosed') : has(request, 'last observed') && has(request, 'future span'))
    )));
    checks.push(check(`${variant.key} / nested navigation and historical return`, Boolean(
      named(canvas, 'Primary / Analytics') && named(canvas, 'Nested / Analytics / Forecasts') &&
      named(canvas, 'Forecasts nested active marker') && named(back, 'Open Historical Analytics') &&
      has(back, 'Historical Analytics')
    )));
    checks.push(check(`${variant.key} / geometry`, geometry(board)));
    if (variant.kind !== 'ready') {
      const source = allText(board);
      checks.push(check(`${variant.key} / no fake predicted result`, Boolean(result &&
        named(result, 'No prediction result') && !named(board, 'Actual vs Predicted Chart component') &&
        !named(board, 'Predicted Series component') && !named(board, 'Result component') &&
        !named(board, 'Provenance component') && !board.findAll(n => /^PREDICTED \/ dash \d+$/.test(n.name)).length &&
        !/\b(?:predicted|forecast)(?:\s+(?:value|result))?\s*(?::|=)?\s*\d+(?:[.,]\d+)?\b/i.test(source) &&
        !/\b\d+(?:[.,]\d+)?\s*(?:predicted|forecast)\b/i.test(source)
      )));
    }
    if (variant.kind !== 'denied' && variant.kind !== 'incomplete')
      checks.push(check(`${variant.key} / separate ACTUAL context`, named(history, 'Actual Series component')?.type === 'INSTANCE' && has(history, 'not a prediction')));
    if (variant.kind === 'denied')
      checks.push(check('Permission Denied / protected result withheld', Boolean(
        has(state, 'PERMISSION DENIED') && has(request, 'Protected target') && has(request, 'Restricted scope') &&
        !named(board, 'Actual Series component') && !named(board, 'Predicted Series component') &&
        !named(board, 'Provenance component') && has(result, 'NO PREDICTION PRODUCED') &&
        !/\b\d+(?:[.,]\d+)?\s*(?:orders|sales|predicted|forecast)\b/i.test(allText(board))
      )));
  }
  const ready = boards.get('TARGET Ready');
  const current = boards.get('MODEL_NOT_READY');
  checks.push(check('TARGET Ready / illustrative and separate from current', has(ready, 'TARGET PRODUCT UX') && has(ready, 'CURRENT ENGINEERING STATE: MODEL_NOT_READY') && has(ready, 'no forecast values')));
  checks.push(check('TARGET Ready / ACTUAL, cutoff and dashed PREDICTED', Boolean(ready && targetChart(ready) &&
    named(ready, 'Actual Series component')?.type === 'INSTANCE' && named(ready, 'Predicted Series component')?.type === 'INSTANCE' &&
    named(ready, 'Cutoff component')?.type === 'INSTANCE')));
  checks.push(check('TARGET Ready / provenance and limitations placeholders', Boolean(
    named(ready, 'Provenance component')?.type === 'INSTANCE' && named(ready, 'Limitations component')?.type === 'INSTANCE' &&
    named(ready, 'Result component')?.type === 'INSTANCE' && has(ready, '[real run only]') && has(ready, 'No model version')
  )));
  checks.push(check('MODEL_NOT_READY / current and no result', Boolean(
    has(current, 'CURRENT ENGINEERING STATE') && named(current, 'MODEL_NOT_READY component')?.type === 'INSTANCE' &&
    has(current, 'No prediction has been produced') && !named(current, 'Predicted Series component') && !named(current, 'Result component')
  )));
  const insufficient = boards.get('Insufficient History');
  const incomplete = boards.get('Incomplete History');
  checks.push(check('Insufficient History / short but available', has(insufficient, 'not long enough') && named(insufficient, 'Actual Series component')?.type === 'INSTANCE'));
  checks.push(check('Incomplete History / missing coverage, not zero', has(incomplete, 'observations are missing') && has(incomplete, 'gap is not zero') && !named(incomplete, 'Actual Series component')));
  checks.push(check('Unsupported Horizon / no silent shortening', has(boards.get('Unsupported Horizon'), 'not supported') && has(boards.get('Unsupported Horizon'), 'do not silently shorten')));
  checks.push(check('Model Unavailable / dependency, not readiness', has(boards.get('Model Unavailable'), 'dependency is unavailable') && !named(boards.get('Model Unavailable'), 'MODEL_NOT_READY component')));
  checks.push(check('Timeout / no confirmed result', has(boards.get('Timeout'), 'no confirmed result') && has(boards.get('Timeout'), 'no automatic retry')));
  return { section: 'Forecasts', checks, pass: checks.every(c => c.pass) };
}

export function formatForecastValidation(result: Validation): string {
  return [
    'PHASE 3D FORECASTS VALIDATION',
    `${result.pass ? 'PASS' : 'FAIL'} · structural, semantic and generated-node geometry; manual visual review required.`,
    ...result.checks.map(c => `${c.label}: ${c.pass ? 'PASS' : 'FAIL'}${c.detail ? ` (${c.detail})` : ''}`),
  ].join('\n');
}
