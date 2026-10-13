import { FORECAST_ASSET_REQUIREMENTS, FORECAST_ASSETS, FORECAST_VARIANTS, SECTIONS, forecastName, type ForecastVariant } from '../constants';
import { fill, instantiate, requireDesignAssets, stroke, type SemanticName } from '../design-system';
import { box, frame, text } from '../figma-utils';
import { FORECASTS_OWNED, assertWritablePage, preflightOwned, replaceOwned } from '../ownership';
import { ensureSection } from './page-setup';
import { drawStaffChrome } from './shared-shell';

type Kind = ForecastVariant['kind'];
const SCREEN_W = 1760;
const WORK_W = SCREEN_W - 244;
const INNER_W = WORK_W - 48;
const COPY: Record<Exclude<Kind, 'ready'>, { title: string; meaning: string; next: string; history: string }> = {
  'not-ready': {
    title: 'MODEL_NOT_READY', meaning: 'Validated forecast artifact is not ready. No prediction has been produced.',
    next: 'Inspect Historical Analytics or wait for validated forecast capability.',
    history: 'Authorized historical observations remain useful, but they are not a prediction.',
  },
  insufficient: {
    title: 'INSUFFICIENT HISTORY', meaning: 'Some valid history exists, but it is not long enough for forecast eligibility. No prediction was produced.',
    next: 'Gather or await sufficient valid history before requesting a forecast.',
    history: 'Available observations may be reviewed; a short history is not an incomplete source.',
  },
  incomplete: {
    title: 'INCOMPLETE HISTORY', meaning: 'Required historical observations are missing. This is a coverage issue, not merely a short series.',
    next: 'Check and recover historical source coverage. Missing intervals are not zero.',
    history: 'Coverage has gaps. Do not draw a continuous ACTUAL line across unknown intervals.',
  },
  unsupported: {
    title: 'UNSUPPORTED HORIZON', meaning: 'The requested future span is not supported. No predicted value was produced.',
    next: 'Choose an approved supported horizon; do not silently shorten the request.',
    history: 'Historical observations can still be inspected independently of this rejected horizon.',
  },
  unavailable: {
    title: 'MODEL UNAVAILABLE', meaning: 'A validated forecasting capability is conceptually required, but its model or service dependency is unavailable.',
    next: 'Check availability and retry only when the dependency is restored; no zero forecast is substituted.',
    history: 'Authorized ACTUAL history remains separate from the unavailable model dependency.',
  },
  timeout: {
    title: 'TIMEOUT', meaning: 'The forecast request did not complete within its bound. There is no confirmed result.',
    next: 'Check request status or use a bounded recovery path; no automatic retry is implied.',
    history: 'Previously authorized historical observations are not a completed forecast result.',
  },
  denied: {
    title: 'PERMISSION DENIED', meaning: 'The current principal cannot access this forecast.',
    next: 'Request authorized access. Visible navigation does not grant backend access.',
    history: 'Protected historical values, predicted values and provenance are not shown.',
  },
};

function native(parent: FrameNode, component: string, name: string, x: number, y: number, width: number): InstanceNode {
  const instance = instantiate(parent, component, undefined, name, x, y, width);
  if (!instance) throw new Error(`Approved Phase 3C Forecast asset cannot be instantiated: Component / ${component}. Nothing was replaced.`);
  return instance;
}

function setText(instance: InstanceNode, name: string, value: string): void {
  const matches = instance.findAll(n => n.type === 'TEXT' && n.name === name) as TextNode[];
  if (matches.length !== 1) throw new Error(`Forecast component ${instance.name} lacks unique text ${name}. Nothing was replaced.`);
  matches[0].characters = value;
}

function setRequestField(instance: InstanceNode, label: string, value: string): void {
  const fields = instance.findAll(n => n.type === 'FRAME' && n.name === `Request field / ${label}`) as FrameNode[];
  if (fields.length !== 1) throw new Error(`Forecast Request Summary lacks ${label}. Nothing was replaced.`);
  const values = fields[0].findAll(n => n.type === 'TEXT' && n.name === 'Field value') as TextNode[];
  if (values.length !== 1) throw new Error(`Forecast Request Summary lacks a unique ${label} value. Nothing was replaced.`);
  values[0].characters = value;
}

function explanatoryCard(parent: FrameNode, name: string, value: string, x: number, y: number, w: number, minH: number, tone: SemanticName = 'text/secondary'): FrameNode {
  const card = box(parent, name, x, y, w, minH, 'surface/subtle', 'border/default', 8);
  const label = text(card, 'Explanation', value, 16, 16, w - 32, 'Body', tone);
  card.resize(w, Math.max(minH, label.y + label.height + 16));
  return card;
}

function growToChildren(area: FrameNode): void {
  const bottom = Math.max(...area.children.filter(n => 'height' in n).map(n => n.y + n.height + 16));
  area.resize(area.width, Math.max(area.height, bottom));
}

function chrome(canvas: FrameNode): FrameNode {
  drawStaffChrome(canvas, true);
  const nav = canvas.children.find(n => n.name === 'Staff navigation') as FrameNode;
  const conversations = nav.children.find(n => n.name === 'Primary / Conversations') as FrameNode;
  const analytics = nav.children.find(n => n.name === 'Primary / Analytics') as FrameNode;
  fill(conversations, 'surface/default'); conversations.strokes = [];
  conversations.children.filter(n => n.name === 'Active marker' || n.name === 'Current state').forEach(n => n.remove());
  fill(conversations.children.find(n => n.name === 'Primary label / Conversations') as TextNode, 'text/primary');
  fill(analytics, 'surface/selected'); stroke(analytics, 'border/interactive');
  frame(analytics, 'Active marker', 0, 5, 3, 26, 'action/primary');
  fill(analytics.children.find(n => n.name === 'Primary label / Analytics') as TextNode, 'action/primary');
  const forecastLink = nav.findAll(n => n.type === 'TEXT' && n.name === 'Nested / Analytics / Forecasts')[0] as TextNode;
  fill(forecastLink, 'action/primary');
  frame(nav, 'Forecasts nested active marker', 25, forecastLink.y + 2, 3, 18, 'action/primary');
  (nav.findAll(n => n.type === 'TEXT' && n.name === 'Account / name')[0] as TextNode).characters = 'A. Owner';
  (nav.findAll(n => n.type === 'TEXT' && n.name === 'Account / status')[0] as TextNode).characters = 'Owner · Session active';
  const header = canvas.children.find(n => n.name === 'Page/context header') as FrameNode;
  (header.children.find(n => n.name === 'Breadcrumb/page context') as TextNode).characters = 'Analytics  /  Forecasts';
  (header.children.find(n => n.name === 'Current active area') as TextNode).characters = 'Forecasts';
  header.resize(WORK_W, header.height);
  (header.children.find(n => n.name === 'Header divider') as FrameNode).resize(WORK_W, 1);
  return frame(canvas, 'Forecast Workspace', 244, 72, WORK_W, 1, 'surface/subtle');
}

function request(main: FrameNode, kind: Kind, y: number): FrameNode {
  const area = box(main, 'Forecast Request Summary', 24, y, INNER_W, 492, 'surface/default', 'border/default', 8);
  text(area, 'Region heading', 'FORECAST REQUEST · input facts, not a produced result', 16, 14, 1380, 'Section Heading');
  const summary = native(area, FORECAST_ASSETS.request, 'Request Summary component', 16, 53, 970);
  setText(summary, 'Target annotation', kind === 'ready' ? 'TARGET PRODUCT UX / illustrative request only' : 'FORECAST REQUEST / no prediction produced');
  setRequestField(summary, 'TARGET', kind === 'denied' ? 'Protected target / not displayed' : 'Confirmed-order units / DESIGN EXAMPLE');
  setRequestField(summary, 'SCOPE', kind === 'denied' ? 'Restricted scope' : 'North Shop / demo business');
  setRequestField(summary, 'CUTOFF', kind === 'denied' ? 'Not disclosed' : 'Last observed point / illustrative');
  setRequestField(summary, 'HORIZON', kind === 'denied' ? 'Not disclosed' : 'Requested future span / validate');
  setText(summary, 'Eligibility', kind === 'ready' ? 'TARGET only: check permission, data, horizon and validated model before execution.' : 'No forecast result is available in this specimen; validate scope and capability.');
  const side = explanatoryCard(area, 'Capability guidance', kind === 'not-ready'
    ? 'CURRENT ENGINEERING STATE: M13 has no validated artifact. Request inputs do not imply a forecast run.'
    : kind === 'ready' ? 'TARGET PRODUCT UX: this is an illustrative request. No real model output, ForecastRun or approved horizon is asserted.'
      : 'Conditional design state. Target, horizon and capability must be validated before any real result.', 1006, 53, 446, 212, kind === 'not-ready' ? 'status/model-not-ready' : 'text/secondary');
  const target = native(area, FORECAST_ASSETS.target, 'Target component', 16, 284, 310);
  setText(target, 'Value', kind === 'denied' ? 'Not displayed' : 'Confirmed-order units / demo');
  setText(target, 'Rule', kind === 'denied' ? 'Authorization required.' : 'Illustrative measure · unit: orders.');
  setText(target, 'Scope', kind === 'denied' ? 'Protected business scope.' : 'North Shop / fictional scope.');
  native(area, FORECAST_ASSETS.cutoff, 'Cutoff component', 346, 284, 310);
  const horizon = native(area, FORECAST_ASSETS.horizon, 'Horizon component', 676, 284, 310);
  setText(horizon, 'Requested span', kind === 'denied' ? 'Not displayed' : 'Future span / illustrative');
  setText(horizon, 'Eligibility', kind === 'unsupported' ? 'Unsupported / choose approved span.' : 'Validate before request.');
  explanatoryCard(area, 'Request boundary', 'CUTOFF = last observed historical point. PREDICTED begins only after that boundary and only after an eligible validated run.', 1006, Math.max(284, side.y + side.height + 18), 446, 185);
  growToChildren(area);
  return area;
}

function availability(main: FrameNode, kind: Kind, y: number): FrameNode {
  const tall = kind === 'not-ready';
  const area = box(main, 'Availability State', 24, y, INNER_W, tall ? 412 : 278, 'surface/default', 'border/default', 8);
  text(area, 'Region heading', 'AVAILABILITY / CAPABILITY STATE', 16, 15, 1200, 'Section Heading');
  if (kind === 'ready') {
    const ready = box(area, 'TARGET Ready availability', 16, 53, 1436, 180, 'status/pending-bg', 'status/pending', 8);
    text(ready, 'State label', 'TARGET PRODUCT UX · conditional ready composition', 16, 17, 1380, 'Body Strong', 'status/pending');
    text(ready, 'State meaning', 'A ready result requires eligibility, a validated artifact, authorized data and a real completed run. None is asserted here.', 16, 67, 1380, 'Body');
    text(ready, 'Current boundary', 'CURRENT ENGINEERING STATE: MODEL_NOT_READY. The result below is a design example only.', 16, 126, 1380, 'Small', 'status/model-not-ready');
  } else if (kind === 'not-ready') {
    native(area, FORECAST_ASSETS.notReady, 'MODEL_NOT_READY component', 16, 53, 970);
    explanatoryCard(area, 'Current safe path', `${COPY[kind].meaning}\n\n${COPY[kind].next}`, 1006, 53, 446, 331, 'status/model-not-ready');
  } else {
    const asset = {
      insufficient: FORECAST_ASSETS.insufficient, incomplete: FORECAST_ASSETS.incomplete,
      unsupported: FORECAST_ASSETS.unsupported, unavailable: FORECAST_ASSETS.unavailable,
      timeout: FORECAST_ASSETS.timeout, denied: FORECAST_ASSETS.denied,
    }[kind];
    native(area, asset, `${COPY[kind].title} component`, 16, 53, 470);
    explanatoryCard(area, 'State explanation', `${COPY[kind].meaning}\n\nNEXT SAFE STEP\n${COPY[kind].next}`, 510, 53, 942, 204);
  }
  growToChildren(area);
  return area;
}

function historical(main: FrameNode, kind: Kind, y: number): FrameNode {
  const area = box(main, 'Historical Context', 24, y, INNER_W, 248, 'surface/default', 'border/default', 8);
  text(area, 'Region heading', 'HISTORICAL CONTEXT · ACTUAL is observed, never predicted', 16, 15, 1380, 'Section Heading');
  if (kind !== 'denied' && kind !== 'incomplete') native(area, FORECAST_ASSETS.actual, 'Actual Series component', 16, 55, 470);
  else explanatoryCard(area, kind === 'denied' ? 'Protected history' : 'Incomplete history gap', kind === 'denied'
    ? 'Protected historical observations are not displayed without forecast and data authorization.'
    : 'Required observations are missing. A gap is not zero and is not drawn as a continuous line.', 16, 55, 470, 157, kind === 'denied' ? 'status/restricted' : 'status/stale');
  const meaning = kind === 'ready' ? 'Illustrative ACTUAL history ends at the marked cutoff. This is not live business data.' : COPY[kind].history;
  explanatoryCard(area, 'Historical reading', `${meaning} ACTUAL is not a prediction.\n\nOpen Historical Analytics for authorized observed reports; this Forecast surface does not replace them.`, 510, 55, 942, 157);
  growToChildren(area);
  return area;
}

function forecastResult(main: FrameNode, kind: Kind, y: number): FrameNode {
  const area = box(main, 'Forecast Result', 24, y, INNER_W, kind === 'ready' ? 730 : 252, 'surface/default', 'border/default', 8);
  text(area, 'Region heading', kind === 'ready' ? 'TARGET RESULT · ACTUAL → CUTOFF → PREDICTED' : 'FORECAST RESULT · no prediction produced', 16, 15, 1390, 'Section Heading');
  if (kind === 'ready') {
    native(area, FORECAST_ASSETS.chart, 'Actual vs Predicted Chart component', 16, 53, 970);
    native(area, FORECAST_ASSETS.predicted, 'Predicted Series component', 998, 53, 470);
    explanatoryCard(area, 'Series reading', 'ACTUAL = solid, observed, before cutoff. CUTOFF = last observed point. PREDICTED = dashed, future-only, illustrative TARGET UX. No numeric prediction is claimed.', 1006, 234, 446, 205);
    native(area, FORECAST_ASSETS.result, 'Result component', 16, 492, 970);
    explanatoryCard(area, 'Result evidence boundary', 'A production result would need a real validated run and provenance. This specimen intentionally has no forecast values, intervals, run ID, artifact version or generated timestamp.', 1006, 492, 446, 212, 'status/pending');
  } else {
    const card = box(area, 'No prediction result', 16, 53, 1436, 168, kind === 'denied' ? 'status/restricted-bg' : 'surface/subtle', kind === 'denied' ? 'status/restricted' : 'border/default', 8);
    text(card, 'Result label', `${COPY[kind].title} · NO PREDICTION PRODUCED`, 16, 18, 1390, 'Body Strong', kind === 'denied' ? 'status/restricted' : 'text/primary');
    const meaning = text(card, 'Result meaning', kind === 'timeout' ? 'The request has no confirmed result. Do not present a stale or partial prediction as complete.' : kind === 'not-ready' ? 'No validated forecast artifact exists in the current engineering state. This is not a zero or valid-empty forecast.' : COPY[kind].meaning, 16, 65, 1390, 'Body');
    const next = text(card, 'Result next step', COPY[kind].next, 16, Math.max(122, meaning.y + meaning.height + 12), 1390, 'Small', 'text/secondary');
    card.resize(card.width, Math.max(card.height, next.y + next.height + 16));
  }
  growToChildren(area);
  return area;
}

function evidence(main: FrameNode, kind: Kind, y: number): FrameNode {
  const area = box(main, 'Provenance and Limitations', 24, y, INNER_W, kind === 'ready' ? 322 : 176, 'surface/default', 'border/default', 8);
  text(area, 'Region heading', 'PROVENANCE / LIMITATIONS', 16, 14, 1380, 'Section Heading');
  if (kind === 'ready') {
    const provenance = native(area, FORECAST_ASSETS.provenance, 'Provenance component', 16, 54, 470);
    setText(provenance, 'Source', 'Data source: [authorized history, illustrative]');
    setText(provenance, 'Run reference', 'Forecast run: [real run only]');
    setText(provenance, 'Model reference', 'Validated artifact: [real evidence only]');
    setText(provenance, 'Cutoff', 'Cutoff: [last observed point]');
    setText(provenance, 'Time', 'Generated time: [real run only]');
    native(area, FORECAST_ASSETS.limitations, 'Limitations component', 510, 54, 470);
    explanatoryCard(area, 'Evidence note', 'These fields are placeholders for TARGET PRODUCT UX. No model version, dataset hash, confidence interval, prediction accuracy or ForecastRun is being claimed.', 1006, 54, 446, 246, 'status/pending');
  } else explanatoryCard(area, 'No run provenance', kind === 'denied'
    ? 'Protected forecast result and provenance are not disclosed. Request authorized access.'
    : 'No completed forecast result exists in this state. Do not invent a run reference, model version or generated time.', 16, 54, 1436, 98);
  growToChildren(area);
  return area;
}

function returnLink(main: FrameNode, y: number): FrameNode {
  const area = box(main, 'Historical Analytics Return', 24, y, INNER_W, 122, 'surface/default', 'border/default', 8);
  text(area, 'Return heading', 'RELATED, NOT INTERCHANGEABLE', 16, 15, 700, 'Label', 'text/secondary');
  const explanation = text(area, 'Return explanation', 'Forecasts is nested under Analytics. Historical Analytics shows observed reports; forecast capability and permissions are checked separately.', 16, 52, 1000, 'Small');
  const action = box(area, 'Open Historical Analytics', 1090, 32, 362, 48, 'surface/selected', 'border/interactive', 6);
  stroke(action, 'focus/ring'); action.strokeWeight = 2;
  const label = text(action, 'Action label', 'Open Historical Analytics  →', 14, 12, 334, 'Small', 'action/primary');
  action.resize(action.width, Math.max(48, label.y + label.height + 12));
  area.resize(INNER_W, Math.max(122, action.y + action.height + 16, explanation.y + explanation.height + 16));
  return area;
}

function finish(board: FrameNode, canvas: FrameNode, main: FrameNode, bottom: number): void {
  main.resize(WORK_W, bottom + 24);
  canvas.resize(SCREEN_W, main.y + main.height);
  const nav = canvas.children.find(n => n.name === 'Staff navigation') as FrameNode;
  nav.resize(nav.width, canvas.height);
  (nav.children.find(n => n.name === 'Navigation divider') as FrameNode).resize(1, canvas.height);
  (nav.children.find(n => n.name === 'Account/session') as FrameNode).y = canvas.height - 80;
  board.resize(SCREEN_W, canvas.y + canvas.height + 12);
}

function drawScreen(section: FrameNode, variant: ForecastVariant, x: number, y: number): FrameNode {
  const board = frame(section, `${forecastName(variant.key)} / staging`, x, y, SCREEN_W, 900, 'surface/subtle');
  try {
    text(board, 'Specimen annotation', variant.kind === 'not-ready'
      ? 'CURRENT ENGINEERING STATE · MODEL_NOT_READY · no forecast artifact or prediction'
      : 'TARGET PRODUCT UX · conditional design example · not current system output', 24, 11, 1700, 'Label', variant.kind === 'not-ready' ? 'status/model-not-ready' : 'status/pending');
    const canvas = frame(board, 'Staff Screen', 0, 44, SCREEN_W, 900, 'surface/default');
    const main = chrome(canvas);
    text(main, 'Page title', 'Forecasts', 24, 22, 850, 'Page Title');
    text(main, 'Page subtitle', variant.kind === 'not-ready'
      ? 'Current capability: no validated forecast artifact · historical reports remain separate'
      : variant.kind === 'ready' ? 'Illustrative future sales outlook · TARGET design, not a current forecast'
        : 'Conditional forecast state · no prediction produced', 24, 66, INNER_W, 'Small', 'text/secondary');
    let cursor = 112;
    for (const build of [request, availability, historical, forecastResult, evidence] as const) {
      const region = build(main, variant.kind, cursor);
      cursor += region.height + 24;
    }
    const link = returnLink(main, cursor);
    finish(board, canvas, main, link.y + link.height);
    return board;
  } catch (error) { board.remove(); throw error; }
}

export function buildForecasts(page: PageNode): string[] {
  assertWritablePage(page.name);
  requireDesignAssets(FORECAST_ASSET_REQUIREMENTS);
  const analytics = page.children.find(n => n.type === 'FRAME' && n.name === SECTIONS.analytics) as FrameNode | undefined;
  const section = ensureSection(page, SECTIONS.forecasts, 0, analytics ? analytics.y + analytics.height + 32 : 42000, 3580, 1);
  preflightOwned(section, FORECASTS_OWNED);
  const staged: FrameNode[] = [];
  try {
    let rowY = 76, rowHeight = 0;
    for (const [i, variant] of FORECAST_VARIANTS.entries()) {
      if (i > 0 && i % 2 === 0) { rowY += rowHeight + 32; rowHeight = 0; }
      const screen = drawScreen(section, variant, 24 + (i % 2) * 1780, rowY);
      staged.push(screen);
      rowHeight = Math.max(rowHeight, screen.height);
    }
    section.resize(3580, rowY + rowHeight + 24);
    replaceOwned(section, FORECASTS_OWNED, staged);
    return [...FORECASTS_OWNED];
  } catch (error) { staged.forEach(n => n.remove()); throw error; }
}
