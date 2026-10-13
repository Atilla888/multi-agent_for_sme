import { ANALYTICS_ASSET_REQUIREMENTS, ANALYTICS_VARIANTS, SECTIONS, analyticsName, type AnalyticsVariant } from '../constants';
import { fill, instantiate, requireDesignAssets, stroke, type SemanticName } from '../design-system';
import { box, frame, text } from '../figma-utils';
import { ANALYTICS_OWNED, assertWritablePage, preflightOwned, replaceOwned } from '../ownership';
import { ensureSection } from './page-setup';
import { drawStaffChrome } from './shared-shell';

type Kind = AnalyticsVariant['kind'];
const SCREEN_W = 1760;
const WORK_W = SCREEN_W - 244;
const INNER_W = WORK_W - 48;
const COPY: Record<Kind, { heading: string; explanation: string; chart: string; quality: string }> = {
  valid: { heading: 'VALID HISTORICAL RESULT', explanation: 'Observed confirmed-order counts for the selected past period.', chart: 'All three example weeks have observed values. The ACTUAL line is continuous.', quality: 'Complete coverage for this demo scope; source observed at 10:42.' },
  empty: { heading: 'VALID EMPTY', explanation: 'The trusted query succeeded. No records for this period.', chart: 'No chart is drawn: a valid empty result is not a source failure.', quality: 'The source responded for the selected scope; no qualifying records were found.' },
  incomplete: { heading: 'INCOMPLETE DATA', explanation: 'Some observed data is present, but one week is missing.', chart: 'Week B has no available observation. The ACTUAL series has a visible gap, not a zero point.', quality: 'Partial coverage: the observed counts are not a complete period total.' },
  stale: { heading: 'STALE DATA', explanation: 'Historical observations remain visible, but the snapshot may be old.', chart: 'The observed ACTUAL series remains continuous. Stale does not mean missing.', quality: 'Source observed at 10:42. Refresh before a current operational decision.' },
  unavailable: { heading: 'DEPENDENCY UNAVAILABLE', explanation: 'The trusted historical report source cannot currently return data.', chart: 'No chart or substitute zero line is drawn while the source is unavailable.', quality: 'No trusted result is available. Try again later or refresh the report.' },
  denied: { heading: 'PERMISSION DENIED', explanation: 'You are not authorized to view this report.', chart: 'Protected chart data is not shown.', quality: 'Request authorized access. Visible navigation does not grant report access.' },
};

function native(parent: FrameNode, component: string, variant: string | undefined, name: string, x: number, y: number, maxWidth: number): InstanceNode {
  const node = instantiate(parent, `Analytics / ${component}`, variant, name, x, y, maxWidth);
  if (!node) throw new Error(`Missing approved Phase 3C Analytics component or variant: ${component}${variant ? ` / ${variant}` : ''}. Nothing was replaced.`);
  return node;
}

function setText(instance: InstanceNode, name: string, value: string): void {
  const matches = instance.findAll(n => n.type === 'TEXT' && n.name === name) as TextNode[];
  if (matches.length !== 1) throw new Error(`Analytics component ${instance.name} lacks unique text ${name}. Nothing was replaced.`);
  matches[0].characters = value;
}

function action(parent: FrameNode, name: string, value: string, x: number, y: number, w: number, primary = false): FrameNode {
  const button = box(parent, name, x, y, w, 44, primary ? 'action/primary' : 'surface/default', primary ? 'action/primary' : 'border/interactive', 6);
  const label = text(button, 'Action label', value, 14, 10, w - 28, 'Small', primary ? 'text/inverse' : 'text/primary');
  button.resize(w, Math.max(44, label.y + label.height + 10));
  return button;
}

function note(parent: FrameNode, name: string, value: string, x: number, y: number, w: number, minHeight: number, tone: SemanticName = 'text/secondary'): FrameNode {
  const card = box(parent, name, x, y, w, minHeight, 'surface/subtle', 'border/default', 8);
  const label = text(card, 'Explanation', value, 16, 16, w - 32, 'Body', tone);
  card.resize(w, Math.max(minHeight, label.y + label.height + 16));
  return card;
}

function chrome(screen: FrameNode): FrameNode {
  drawStaffChrome(screen, true);
  const nav = screen.children.find(n => n.name === 'Staff navigation') as FrameNode;
  const conversations = nav.children.find(n => n.name === 'Primary / Conversations') as FrameNode;
  const analytics = nav.children.find(n => n.name === 'Primary / Analytics') as FrameNode;
  fill(conversations, 'surface/default'); conversations.strokes = [];
  conversations.children.filter(n => n.name === 'Active marker' || n.name === 'Current state').forEach(n => n.remove());
  fill(conversations.children.find(n => n.name === 'Primary label / Conversations') as TextNode, 'text/primary');
  fill(analytics, 'surface/selected'); stroke(analytics, 'border/interactive');
  frame(analytics, 'Active marker', 0, 5, 3, 26, 'action/primary');
  fill(analytics.children.find(n => n.name === 'Primary label / Analytics') as TextNode, 'action/primary');
  text(analytics, 'Current state', '•', 184, 8, 16, 'Small', 'action/primary');
  (nav.findAll(n => n.type === 'TEXT' && n.name === 'Account / name')[0] as TextNode).characters = 'A. Owner';
  (nav.findAll(n => n.type === 'TEXT' && n.name === 'Account / status')[0] as TextNode).characters = 'Owner · Session active';
  const header = screen.children.find(n => n.name === 'Page/context header') as FrameNode;
  (header.children.find(n => n.name === 'Breadcrumb/page context') as TextNode).characters = 'Analytics  /  Historical report';
  (header.children.find(n => n.name === 'Current active area') as TextNode).characters = 'Analytics';
  header.resize(WORK_W, header.height);
  (header.children.find(n => n.name === 'Header divider') as FrameNode).resize(WORK_W, 1);
  return frame(screen, 'Analytics Workspace', 244, 72, WORK_W, 1, 'surface/subtle');
}

function reportControls(main: FrameNode, y: number): FrameNode {
  const area = box(main, 'Report Controls', 24, y, INNER_W, 230, 'surface/default', 'border/default', 8);
  native(area, 'Period Selector', 'State=Focus', 'Period Selector component', 16, 14, 470);
  const metric = frame(area, 'Metric Select', 510, 14, 430, 142, 'surface/default');
  const coreSelect = instantiate(metric, 'Select', undefined, 'Core Select component', 0, 0, 238);
  if (!coreSelect) throw new Error('Approved Phase 3C Core Select cannot be instantiated. Nothing was replaced.');
  setText(coreSelect, 'Component name', 'METRIC');
  setText(coreSelect, 'Usage', 'Observed measure');
  setText(coreSelect, 'Persistent field label', 'Metric');
  setText(coreSelect, 'Example value or placeholder', 'Confirmed orders  ▾');
  setText(coreSelect, 'Helper text', 'Count · demo report');
  text(metric, 'Metric summary', 'Confirmed orders (count)', 252, 48, 170, 'Body Strong');
  const scope = box(area, 'Business Scope', 964, 14, 488, 102, 'surface/subtle', 'border/default', 6);
  text(scope, 'Scope label', 'BUSINESS / DEMO SCOPE', 14, 11, 458, 'Label', 'text/secondary');
  text(scope, 'Scope value', 'North Shop · May · example values only', 14, 43, 458, 'Body Strong');
  const request = action(area, 'Request Report', 'Request historical report', 964, 139, 488, true);
  const helper = text(area, 'Report control note', 'Selected metric, past period and monthly granularity are explicit. Report authorization is checked by the backend.', 510, request.y + request.height + 8, 942, 'Small', 'text/secondary');
  area.resize(INNER_W, Math.max(230, 14 + 202 + 14, helper.y + helper.height + 16));
  return area;
}

function reportState(main: FrameNode, kind: Kind, y: number): FrameNode {
  const area = box(main, 'Report State', 24, y, INNER_W, 190, 'surface/default', 'border/default', 8);
  if (kind === 'valid') {
    const banner = box(area, 'Valid result banner', 16, 8, 470, 173, 'status/success-bg', 'status/success', 8);
    text(banner, 'State label', COPY[kind].heading, 16, 17, 438, 'Label', 'status/success');
    text(banner, 'State meaning', COPY[kind].explanation, 16, 60, 438, 'Body Strong');
    text(banner, 'State source', 'North Shop · May · demo report', 16, 125, 438, 'Small', 'text/secondary');
  } else native(area, kind === 'empty' ? 'Valid Empty' : kind === 'incomplete' ? 'Incomplete' : kind === 'stale' ? 'Stale' : kind === 'unavailable' ? 'Dependency Unavailable' : 'Permission Denied', undefined, 'Analytics State component', 16, 8, 470);
  const explanation = text(area, 'State explanation', COPY[kind].explanation, 510, 48, 910, 'Body Strong');
  const qualifier = text(area, 'Demo qualifier', 'DESIGN EXAMPLE · not live business data', 510, Math.max(105, explanation.y + explanation.height + 16), 910, 'Label', 'text/secondary');
  area.resize(INNER_W, Math.max(190, qualifier.y + qualifier.height + 16));
  return area;
}

function kpiSummary(main: FrameNode, kind: Kind, y: number): FrameNode {
  const area = box(main, 'KPI Summary', 24, y, INNER_W, 260, 'surface/default', 'border/default', 8);
  text(area, 'KPI heading', 'OBSERVED HISTORICAL KPI', 16, 15, 600, 'Section Heading');
  if (kind === 'valid' || kind === 'incomplete' || kind === 'stale') {
    const kpi = native(area, 'KPI', 'Metric=Orders', 'KPI component', 16, 43, 310);
    setText(kpi, 'Metric name', kind === 'incomplete' ? 'Observed orders · partial' : 'Confirmed orders');
    setText(kpi, 'Observed value', kind === 'incomplete' ? '14 observed' : '24');
    setText(kpi, 'Unit', kind === 'incomplete' ? 'orders in available weeks' : 'orders · count');
    setText(kpi, 'Source and completeness', kind === 'incomplete' ? 'Source: demo report / partial / 10:42' : kind === 'stale' ? 'Source: demo report / stale / 10:42' : 'Source: demo report / complete / 10:42');
    const interpretation = text(area, 'KPI interpretation', kind === 'incomplete' ? 'Available weeks: 8 + 6 observed orders. This is NOT a complete May total.' : kind === 'stale' ? '24 observed orders in the historical snapshot; refresh before a current decision.' : '24 observed confirmed orders across Week A, Week B and Week C.', 355, 77, 1070, 'Body Strong');
    const basis = text(area, 'KPI basis', 'Demo counts only · not real business data · period: May', 355, Math.max(130, interpretation.y + interpretation.height + 16), 1070, 'Small', 'text/secondary');
    area.resize(INNER_W, Math.max(260, basis.y + basis.height + 16));
  } else note(area, 'No KPI result', kind === 'empty' ? 'No records for this period. No KPI value is presented for the valid empty query.' : kind === 'unavailable' ? 'No trusted metric is available. An outage is not zero business activity.' : 'Protected metric values are not displayed.', 16, 52, INNER_W - 32, 145);
  return area;
}

function historicalChart(main: FrameNode, kind: Kind, y: number): FrameNode {
  const area = box(main, 'Historical Chart', 24, y, INNER_W, 370, 'surface/default', 'border/default', 8);
  text(area, 'Chart heading', 'HISTORICAL CHART · ACTUAL ONLY', 16, 15, 1000, 'Section Heading');
  if (kind === 'valid' || kind === 'incomplete' || kind === 'stale') {
    const variant = kind === 'incomplete' ? 'State=Missing-data Gap' : kind === 'stale' ? 'State=Stale Data' : 'State=Valid Historical Data';
    const chart = native(area, 'Historical Chart', variant, 'Historical Chart component', 16, 56, 470);
    setText(chart, 'Chart title', 'Confirmed orders / demo');
    const context = note(area, 'Chart reading', COPY[kind].chart, 510, 56, 942, 264, kind === 'incomplete' ? 'status/warning' : kind === 'stale' ? 'status/stale' : 'text/primary');
    const explanation = context.children.find(n => n.name === 'Explanation') as TextNode;
    const source = text(context, 'Chart source', 'Source: fictional historical report · period: May · unit: orders', 16, Math.max(215, explanation.y + explanation.height + 16), 890, 'Small', 'text/secondary');
    context.resize(context.width, Math.max(context.height, source.y + source.height + 16));
    area.resize(INNER_W, Math.max(370, context.y + context.height + 16));
  } else note(area, 'No chart result', COPY[kind].chart, 16, 56, INNER_W - 32, 264, kind === 'denied' ? 'status/restricted' : 'text/secondary');
  return area;
}

function table(main: FrameNode, kind: Kind, y: number): FrameNode {
  const area = box(main, 'Data Table', 24, y, INNER_W, 490, 'surface/default', 'border/default', 8);
  text(area, 'Table heading', 'HISTORICAL DETAIL · MAY', 16, 15, 1000, 'Section Heading');
  if (kind === 'valid' || kind === 'incomplete' || kind === 'stale') {
    const component = native(area, 'Data Table', undefined, 'Data Table component', 16, 46, 970);
    setText(component, 'Table title', 'Confirmed orders by week / demo');
    setText(component, 'Table context', 'May · orders (count) · demo report · observed 10:42');
    setText(component, 'Column 3', 'Source');
    const rows = component.findAll(n => n.type === 'FRAME' && /^Observed row [1-3]$/.test(n.name)) as FrameNode[];
    if (rows.length !== 3) throw new Error('Approved Analytics Data Table rows changed. Nothing was replaced.');
    rows.forEach((row, i) => {
      const cells = row.findAll(n => n.type === 'TEXT' && (n.name === 'Cell 2' || n.name === 'Cell 3' || n.name === 'Cell 4')) as TextNode[];
      if (cells.length !== 3) throw new Error('Approved Analytics Data Table cells changed. Nothing was replaced.');
      (cells.find(n => n.name === 'Cell 2') as TextNode).characters = kind === 'incomplete' && i === 1 ? '—' : ['8', '10', '6'][i];
      (cells.find(n => n.name === 'Cell 3') as TextNode).characters = 'Demo report';
      (cells.find(n => n.name === 'Cell 4') as TextNode).characters = kind === 'incomplete' && i === 1 ? 'Missing' : 'Complete';
    });
    setText(component, 'Empty label', kind === 'incomplete' ? 'MISSING OBSERVATION' : kind === 'stale' ? 'STALE SNAPSHOT NOTE' : 'DATA QUALITY NOTE');
    setText(component, 'Empty meaning', kind === 'incomplete' ? 'Week B unavailable; a missing observation is not zero.' : kind === 'stale' ? 'Values remain historical; refresh before a current decision.' : 'All three selected weeks have observed records.');
    setText(component, 'Table note', kind === 'incomplete' ? 'Partial coverage: no complete May total is claimed.' : kind === 'stale' ? 'Observed 10:42; source snapshot may no longer be current.' : 'Observed counts are fictional design examples, not live business data.');
    const reading = note(area, 'Table reading', kind === 'incomplete' ? 'Week A: 8 · Week B: unavailable · Week C: 6. Do not infer a zero for Week B.' : kind === 'stale' ? 'Week A: 8 · Week B: 10 · Week C: 6. These remain observed historical values.' : 'Week A: 8 · Week B: 10 · Week C: 6. Total: 24 observed confirmed orders.', 1010, 46, 442, 210);
    area.resize(INNER_W, Math.max(490, reading.y + reading.height + 16));
  } else note(area, 'No table result', kind === 'empty' ? 'Valid Empty · query succeeded · no records for this period. No rows or zero-filled cells are shown.' : kind === 'unavailable' ? 'Report dependency unavailable · no trusted rows are returned. Retry when the source is available.' : 'Permission Denied · protected report rows are not disclosed. Request authorized access.', 16, 56, INNER_W - 32, 390, kind === 'denied' ? 'status/restricted' : 'text/secondary');
  return area;
}

function dataQuality(main: FrameNode, kind: Kind, y: number): FrameNode {
  const area = box(main, 'Data Quality', 24, y, INNER_W, 230, 'surface/default', 'border/default', 8);
  text(area, 'Quality heading', 'DATA QUALITY · FRESHNESS + COMPLETENESS', 16, 15, 1000, 'Section Heading');
  if (kind !== 'denied') {
    native(area, 'Freshness', kind === 'stale' ? 'State=Stale' : kind === 'unavailable' ? 'State=Requires Refresh' : 'State=Current', 'Freshness component', 16, 55, 470);
    native(area, 'Completeness', kind === 'incomplete' ? 'State=Incomplete' : kind === 'unavailable' ? 'State=Unavailable' : 'State=Complete', 'Completeness component', 510, 55, 310);
    const explanation = text(area, 'Quality explanation', COPY[kind].quality, 850, 80, 590, 'Body Strong');
    area.resize(INNER_W, Math.max(230, explanation.y + explanation.height + 16));
  } else note(area, 'Protected quality state', COPY[kind].quality, 16, 58, INNER_W - 32, 130, 'status/restricted');
  return area;
}

function forecastLink(main: FrameNode, y: number): FrameNode {
  const area = box(main, 'Forecast Contextual Link', 24, y, INNER_W, 112, 'surface/default', 'border/default', 8);
  text(area, 'Forecast boundary heading', 'NEED FUTURE VALUES?', 16, 15, 780, 'Label', 'text/secondary');
  const boundary = text(area, 'Forecast boundary', 'Forecasts is a separate nested Analytics destination. This report contains observed history only.', 16, 49, 980, 'Small');
  const open = action(area, 'Open Forecasts', 'Open Forecasts  →', 1090, 31, 362);
  area.resize(INNER_W, Math.max(112, boundary.y + boundary.height + 16, open.y + open.height + 16));
  return area;
}

function finish(screen: FrameNode, main: FrameNode, bottom: number): void {
  main.resize(WORK_W, bottom + 24);
  screen.resize(SCREEN_W, main.y + main.height);
  const nav = screen.children.find(n => n.name === 'Staff navigation') as FrameNode;
  nav.resize(nav.width, screen.height);
  (nav.children.find(n => n.name === 'Navigation divider') as FrameNode).resize(1, screen.height);
  (nav.children.find(n => n.name === 'Account/session') as FrameNode).y = screen.height - 80;
}

function drawScreen(section: FrameNode, variant: AnalyticsVariant, x: number, y: number): FrameNode {
  const screen = frame(section, `${analyticsName(variant.key)} / staging`, x, y, SCREEN_W, 900, 'surface/default');
  try {
    const main = chrome(screen);
    text(main, 'Page title', 'Analytics', 24, 22, 800, 'Page Title');
    text(main, 'Page subtitle', 'Historical business performance · observed confirmed-order counts only', 24, 64, INNER_W, 'Small', 'text/secondary');
    let cursor = 112;
    const controls = reportControls(main, cursor); cursor += controls.height + 24;
    const state = reportState(main, variant.kind, cursor); cursor += state.height + 24;
    const kpis = kpiSummary(main, variant.kind, cursor); cursor += kpis.height + 24;
    const chart = historicalChart(main, variant.kind, cursor); cursor += chart.height + 24;
    const details = table(main, variant.kind, cursor); cursor += details.height + 24;
    const quality = dataQuality(main, variant.kind, cursor); cursor += quality.height + 24;
    const link = forecastLink(main, cursor);
    finish(screen, main, link.y + link.height);
    return screen;
  } catch (error) { screen.remove(); throw error; }
}

export function buildAnalytics(page: PageNode): string[] {
  assertWritablePage(page.name);
  requireDesignAssets(ANALYTICS_ASSET_REQUIREMENTS);
  const webChat = page.children.find(n => n.type === 'FRAME' && n.name === SECTIONS.webChat) as FrameNode | undefined;
  const section = ensureSection(page, SECTIONS.analytics, 0, webChat ? webChat.y + webChat.height + 32 : 30000, 3580, 1);
  preflightOwned(section, ANALYTICS_OWNED);
  const staged: FrameNode[] = [];
  try {
    let rowY = 76, rowHeight = 0;
    for (const [i, variant] of ANALYTICS_VARIANTS.entries()) {
      if (i > 0 && i % 2 === 0) { rowY += rowHeight + 32; rowHeight = 0; }
      const screen = drawScreen(section, variant, 24 + (i % 2) * 1780, rowY);
      staged.push(screen);
      rowHeight = Math.max(rowHeight, screen.height);
    }
    section.resize(3580, rowY + rowHeight + 24);
    replaceOwned(section, ANALYTICS_OWNED, staged);
    return [...ANALYTICS_OWNED];
  } catch (error) { staged.forEach(n => n.remove()); throw error; }
}
