import { DIRECTIONS, SECTIONS, SELECTED_DIRECTION } from './constants';
import { box, component, fill, labelCard, note, section, stroke, txt, upsertVariablesAndStyles, type SemanticName } from './figma-utils';
import { contrast, primitive, radius, semantic, spacing, typeScale } from './tokens';
import { buildUsage } from './usage';
export { buildUsage } from './usage';

type Card = [string, string, SemanticName?];

function cards(parent: FrameNode, data: Card[], startY = 108, columns = 3, cellW = 318, cellH = 128): void {
  data.forEach(([name, body, accent], i) => {
    const x = 28 + (i % columns) * (cellW + 18);
    const y = startY + Math.floor(i / columns) * (cellH + 18);
    labelCard(parent, name, body, x, y, cellW, cellH, accent);
  });
}

const SECTION_Y: Record<string, number> = {
  [SECTIONS.direction]: 80, [SECTIONS.foundations]: 840, [SECTIONS.color]: 1580,
  [SECTIONS.typography]: 2320, [SECTIONS.spacing]: 3060, [SECTIONS.states]: 3800,
  [SECTIONS.core]: 4790, [SECTIONS.navigation]: 6100, [SECTIONS.conversation]: 6800,
  [SECTIONS.business]: 7670, [SECTIONS.escalation]: 8540, [SECTIONS.analytics]: 9400,
  [SECTIONS.forecast]: 10270, [SECTIONS.webchat]: 11240, [SECTIONS.accessibility]: 12130,
  [SECTIONS.usage]: 12890, [SECTIONS.validation]: 13630,
};

function sectionAt(page: PageNode, name: string, _row: number, height: number, description: string): FrameNode {
  return section(page, name, 80, SECTION_Y[name], height, description);
}

export async function buildDirection(page: PageNode): Promise<FrameNode[]> {
  const s = sectionAt(page, SECTIONS.direction, 0, 700, 'Three concepts scored 1–5; only selected direction informs the system.');
  s.resize(2200, 700); // Preview area stays beside the matrix, clear of later 03C sections.
  const metrics = 'trust / clarity / SME fit / AI / data / status / density / accessibility / low-fi fit';
  txt(s, 'Evaluation criteria', metrics, 28, 94, 1000, 12, 'text/secondary');
  DIRECTIONS.forEach((d, i) => {
    const c = box(s, `DS / Direction / ${d.id}`, 28 + i * 337, 142, 318, 390, d.id === SELECTED_DIRECTION ? 'surface/selected' : 'surface/default', d.id === SELECTED_DIRECTION ? 'border/interactive' : 'border/default');
    txt(c, 'Name', d.name, 18, 20, 280, 17, 'text/primary', 'Semi Bold');
    txt(c, 'Decision', d.id === SELECTED_DIRECTION ? 'SELECTED FOR REVIEW' : 'CANDIDATE', 18, 54, 280, 12, d.id === SELECTED_DIRECTION ? 'status/info' : 'text/secondary', 'Bold');
    const labels = ['Trust', 'Clarity', 'SME ops', 'AI visibility', 'Data readability', 'Status readability', 'Density', 'Accessibility', 'Low-fi fit'];
    labels.forEach((label, j) => txt(c, `Score / ${label}`, `${label}: ${d.scores[j]}/5`, 18, 82 + j * 22, 280, 12));
    txt(c, 'Rationale', d.note, 18, 300, 280, 12, 'text/secondary');
  });
  note(s, 'Selected because operational truth, safe decisions and readable status outweigh visual AI spectacle. Review this choice before Foundations. Change SELECTED_DIRECTION in constants.ts and rebuild if rejected.', 565);

  // Exploratory native shapes/text only. No Variables, styles or production components.
  const profiles = {
    'calm-operational-saas': {
      name: 'A / CALM OPERATIONAL SAAS', page: '#F6F8FB', surface: '#FFFFFF',
      accent: '#174A7E', ink: '#1E293B', muted: '#586779', border: '#D7E0E9',
      success: '#147555', pending: '#285F9A', unknown: '#68459A', human: '#4A5D8C',
      roleSurface: '#EDF3FA', shadow: 0.07, radius: 8, density: 'Balanced · facts first',
    },
    'modern-ai-workspace': {
      name: 'B / MODERN AI WORKSPACE', page: '#F3F5FB', surface: '#FFFFFF',
      accent: '#454F9B', ink: '#1F2944', muted: '#5F6982', border: '#D9DFF0',
      success: '#107965', pending: '#325EA8', unknown: '#70469C', human: '#4F579A',
      roleSurface: '#E9EBFA', shadow: 0.11, radius: 10, density: 'Specialist identity forward',
    },
    'data-forward-console': {
      name: 'C / DATA-FORWARD CONSOLE', page: '#F1F5F6', surface: '#FFFFFF',
      accent: '#17636A', ink: '#19333A', muted: '#536A70', border: '#CFDDE0',
      success: '#176F56', pending: '#256882', unknown: '#66508E', human: '#526477',
      roleSurface: '#E8F0F1', shadow: 0.04, radius: 4, density: 'Compact · data legible',
    },
  } as const;

  type PreviewParent = FrameNode | PageNode;
  const paint = (hex: string): SolidPaint => {
    const value = Number.parseInt(hex.slice(1), 16);
    return { type: 'SOLID', color: {
      r: ((value >> 16) & 255) / 255,
      g: ((value >> 8) & 255) / 255,
      b: (value & 255) / 255,
    } };
  };
  const shape = (parent: PreviewParent, name: string, x: number, y: number, w: number, h: number, bg: string, border?: string, r = 0): FrameNode => {
    const node = figma.createFrame();
    parent.appendChild(node);
    node.name = name; node.x = x; node.y = y; node.resize(w, h);
    node.fills = [paint(bg)]; node.strokes = border ? [paint(border)] : [];
    node.strokeWeight = border ? 1 : 0; node.cornerRadius = r;
    node.clipsContent = false;
    return node;
  };
  const text = (parent: PreviewParent, name: string, value: string, x: number, y: number, w: number, size: number, color: string, weight: 'Regular' | 'Semi Bold' | 'Bold' = 'Regular'): TextNode => {
    const node = figma.createText();
    parent.appendChild(node);
    node.name = name; node.fontName = { family: 'Inter', style: weight };
    node.fontSize = size; node.characters = value;
    node.textAutoResize = 'HEIGHT'; node.resize(w, node.height);
    node.x = x; node.y = y; node.fills = [paint(color)];
    return node;
  };

  text(s, 'Style tile heading', 'VISUAL STYLE TILES · exploratory, not approved', 1110, 24, 1040, 17, '#1E293B', 'Bold');
  text(s, 'Style tile note', 'Same content in every tile; no Variables, styles or reusable production components are created.', 1110, 59, 1035, 12, '#586779');

  DIRECTIONS.forEach((direction, index) => {
    const p = profiles[direction.id];
    const tile = shape(s, `DS / Direction / ${direction.id} / Style Tile`, 1110 + index * 337, 102, 318, 558, p.page, p.border, p.radius);
    text(tile, 'Direction label', p.name, 16, 13, 288, 12, p.ink, 'Bold');
    text(tile, 'Density note', p.density, 16, 33, 288, 11, p.muted);
    shape(tile, 'Primary accent swatch', 16, 56, 286, 5, p.accent, undefined, 2);
    const card = shape(tile, 'Elevated surface sample', 16, 75, 286, 465, p.surface, p.border, p.radius);
    card.effects = [{
      type: 'DROP_SHADOW', color: { r: 0.07, g: 0.13, b: 0.22, a: p.shadow },
      offset: { x: 0, y: 3 }, radius: 10, spread: 0, visible: true, blendMode: 'NORMAL',
    }];
    if (index === 1) shape(card, 'AI workspace accent rail', 0, 13, 3, 103, p.accent);
    text(card, 'Heading sample', 'Order review', 15, 13, 256, index === 2 ? 15 : 16, p.ink, 'Bold');
    text(card, 'Body sample', 'One clear decision, grounded in current facts.', 15, 42, 256, 12, p.ink);
    text(card, 'Secondary text sample', 'Observed 10:42 · Business North', 15, 64, 256, 11, p.muted);
    const action = shape(card, 'Primary action button sample', 15, 91, 140, 34, p.accent, undefined, p.radius === 10 ? 7 : 5);
    text(action, 'Primary action label', 'Confirm order', 13, 8, 116, 12, '#FFFFFF', 'Semi Bold');
    text(card, 'Status group label', 'STATUS', 15, 140, 250, 10, p.muted, 'Bold');
    const statuses = [
      ['Success', '✓', p.success], ['Pending', '◷', p.pending],
      ['OUTCOME_UNKNOWN', '?', p.unknown], ['Waiting Human', '◇', p.human],
    ] as const;
    statuses.forEach(([label, icon, color], stateIndex) => {
      const x = 15 + (stateIndex % 2) * 130, y = 158 + Math.floor(stateIndex / 2) * 36;
      const status = shape(card, `Status sample / ${label}`, x, y, 122, 30, p.surface, color, p.radius === 4 ? 3 : 6);
      shape(status, 'Status shape', 7, 8, 13, 13, p.surface, color, 3);
      text(status, 'Status icon', icon, 9, 7, 11, 11, color, 'Bold');
      text(status, 'Status label', label, 25, 8, 94, label === 'OUTCOME_UNKNOWN' ? 10 : 11, color, 'Semi Bold');
    });
    text(card, 'Handler group label', 'CURRENT HANDLER', 15, 238, 250, 10, p.muted, 'Bold');
    const sales = shape(card, 'Handler sample / Sales Agent', 15, 254, 122, 31, p.roleSurface, p.accent, p.radius === 4 ? 3 : 7);
    text(sales, 'AI role', 'AI', 8, 8, 17, 11, p.accent, 'Bold');
    text(sales, 'Agent name', 'Sales Agent', 28, 8, 87, 11, p.ink, 'Semi Bold');
    const human = shape(card, 'Handler sample / Human Operator', 145, 254, 126, 31, p.surface, p.border, p.radius === 4 ? 3 : 7);
    text(human, 'Human role', 'H', 8, 8, 15, 11, p.human, 'Bold');
    text(human, 'Operator name', 'Human Operator', 25, 8, 96, 11, p.ink, 'Semi Bold');
    const entity = shape(card, 'Business entity sample / Order and Reservation', 15, 296, 256, 72, p.page, p.border, p.radius === 4 ? 3 : 6);
    text(entity, 'Order heading', 'ORDER  #1042', 10, 8, 236, 11, p.ink, 'Bold');
    text(entity, 'Order state', 'Order state  ·  Created', 10, 29, 236, 11, p.success);
    text(entity, 'Reservation state', 'Reservation  ·  OUTCOME_UNKNOWN', 10, 47, 236, 10, p.unknown, 'Semi Bold');
    if (index === 2) shape(entity, 'Compact entity row divider', 10, 44, 236, 1, p.border);
    text(card, 'Analytics group label', 'TINY ANALYTICS SAMPLE', 15, 381, 250, 10, p.muted, 'Bold');
    text(card, 'Actual label', 'ACTUAL', 15, 401, 105, 10, p.ink, 'Semi Bold');
    text(card, 'Predicted label', 'PREDICTED', 153, 401, 118, 10, p.unknown, 'Semi Bold');
    shape(card, 'ACTUAL / solid line', 15, 427, 111, 3, p.accent, undefined, 1);
    shape(card, 'Cutoff marker', 139, 412, 2, 30, p.border);
    if (index === 2) shape(card, 'Data gridline', 15, 441, 256, 1, p.border);
    for (let dash = 0; dash < 6; dash++) {
      shape(card, `PREDICTED / dash ${dash + 1}`, 153 + dash * 20, 427, 12, 3, p.unknown, undefined, 1);
    }
    text(tile, 'Preview disclaimer', 'Style exploration only · no direction approved', 16, 544, 286, 10, p.muted);
  });
  return [s];
}

export async function buildFoundations(page: PageNode): Promise<FrameNode[]> {
  await upsertVariablesAndStyles();
  const foundations = sectionAt(page, SECTIONS.foundations, 1, 650, 'Calm Operational SaaS · one light theme · semantic variables alias primitives.');
  cards(foundations, [
    ['DS / Foundation / Principles', 'Trustworthy facts > AI theater. Safe action and owner visible.'],
    ['DS / Foundation / Density', 'Staff: moderate density, 40–44 px rows; customer chat: more breathing room.'],
    ['DS / Foundation / Layout', 'Desktop-first staff components; mobile-important Web Chat. No full-screen layouts here.'],
    ['DS / Foundation / Radius', '4 small · 6 controls · 8 cards · pill only badges.'],
    ['DS / Foundation / Borders', 'Subtle dividers; strong interactive border; status uses text and structure.'],
    ['DS / Foundation / Elevation', 'Base none; floating subtle; modal moderate with scrim.'],
    ['DS / Foundation / Icons', 'One 16/20 px outline family; consistent stroke, labelled semantic reinforcement.'],
    ['DS / Foundation / Focus', 'Visible 2 px focus ring plus neutral separation; no color-only focus.'],
    ['DS / Foundation / Themes', 'Light only. Semantic aliases permit a later theme without rebuilding meaning.'],
  ]);
  const color = sectionAt(page, SECTIONS.color, 2, 650, 'Figma collection Phase 3C / Light: primitive/color/* → semantic/* aliases.');
  const palette = Object.entries(primitive);
  palette.forEach(([name, hex], i) => {
    const x = 28 + (i % 6) * 170, y = 108 + Math.floor(i / 6) * 112;
    const swatch = box(color, `DS / Color / ${name}`, x, y, 150, 78, name as keyof typeof primitive, 'border/default', 6);
    txt(swatch, 'Name', name, 9, 49, 130, 12, contrast(primitive.white, hex) >= 4.5 ? 'text/inverse' : 'text/primary', 'Semi Bold');
    txt(color, `Hex / ${name}`, hex, x, y + 82, 150, 12, 'text/secondary');
  });
  note(color, 'Semantic tokens cover surface, text, border, action, focus, statuses and actual/predicted charts. Avoid raw-color bindings in product components.', 570);
  const typography = sectionAt(page, SECTIONS.typography, 3, 650, 'Inter Regular / Semi Bold / Bold; visible labels, readable 12+ px metadata.');
  Object.entries(typeScale).forEach(([name, [size, lineHeight, weight]], i) => {
    const y = 105 + i * 54;
    txt(typography, `DS / Type / ${name}`, `${name} · ${size}/${lineHeight} · ${weight} — Order state / Состояние заказа`, 28, y, 1000, size, 'text/primary', weight);
  });
  note(typography, 'Verify Inter glyph coverage and real text expansion for English, Russian and Kazakh in Figma and later browser tests. Do not force tiny text.', 570);
  const layout = sectionAt(page, SECTIONS.spacing, 4, 650, '4-point base, moderate staff density, forgiving customer touch targets.');
  spacing.forEach((n, i) => {
    const x = 28 + i * 143;
    box(layout, `DS / Space / ${n}`, x, 128, 110, n + 10, 'surface/selected', 'border/interactive', 4);
    txt(layout, `Space label / ${n}`, `${n} px`, x, 202, 110, 13, 'text/primary', 'Semi Bold');
  });
  cards(layout, [
    ['DS / Layout / Row', 'Staff row: 40–44 px; separate primary and metadata lines.'],
    ['DS / Layout / Control', 'Controls: 36–40 px desktop; 44 px touch target in chat.'],
    ['DS / Layout / Card', 'Card padding 16/24; 8 px radius; border before shadow.'],
    ['DS / Layout / Wrap', 'Wrap labels; stack context cards; truncate only recoverable noncritical identifiers.'],
    ['DS / Layout / Grid', 'Responsive behavior is specified, not a finished responsive screen.'],
    ['DS / Layout / Radius', `Small ${radius.small}, control ${radius.control}, card ${radius.card}.`],
  ], 260);
  const access = sectionAt(page, SECTIONS.accessibility, 18, 670, 'WCAG 2.2 AA-level design target; structural notes are not certification.');
  const pairs = [
    ['primary text / white', primitive.neutral900, primitive.white],
    ['secondary text / white', primitive.neutral600, primitive.white],
    ['inverse text / primary action', primitive.white, primitive.navy700],
    ['success / pale success', primitive.green700, primitive.green50],
    ['error / pale error', primitive.red700, primitive.red50],
    ['unknown / pale unknown', primitive.violet700, primitive.violet50],
  ] as const;
  pairs.forEach(([name, fg, bg], i) => {
    const ratio = contrast(fg, bg);
    labelCard(access, `DS / Contrast / ${name}`, `${ratio.toFixed(2)}:1 · ${ratio >= 4.5 ? 'normal text target met' : 'review required'}`, 28 + (i % 3) * 337, 108 + Math.floor(i / 3) * 132, 318, 112, 'text/secondary');
  });
  cards(access, [
    ['DS / Access / Focus', 'Keyboard-visible focus ring; no meaning from hover alone.'],
    ['DS / Access / Status', 'Every state has label + structural cue + safe next step, not color alone.'],
    ['DS / Access / Disabled', 'Disabled is visually distinct and accompanied by explanation when needed.'],
    ['DS / Locale / Expansion', 'English, Russian, Kazakh: allow 30–50% label growth; preserve full critical text.'],
    ['DS / Responsive / Staff', 'Desktop primary; stack/collapse panels based on priority, never hide critical status.'],
    ['DS / Responsive / Chat', 'Mobile-important: 44 px touch targets, wrap message and confirmation copy.'],
  ], 398);
  return [foundations, color, typography, layout, access];
}

const stateData: Array<[string, string, string, SemanticName, SemanticName]> = [
  ['Success', '✓', 'Confirmed effect with trusted receipt.', 'status/success', 'status/success-bg'],
  ['Pending', '◷', 'An operation is still in progress.', 'status/pending', 'status/pending-bg'],
  ['Known Failure', '×', 'Effect is known not to have completed; review facts.', 'status/error', 'status/error-bg'],
  ['OUTCOME_UNKNOWN', '?', 'Effect may exist. Reconcile authoritative state; no blind retry.', 'status/unknown', 'status/unknown-bg'],
  ['Stale', '↻', 'Data exists, but refresh before consequential decision.', 'status/stale', 'status/stale-bg'],
  ['Restricted', '⌁', 'Operation intentionally restricted (E02); not a permission denial.', 'status/restricted', 'status/restricted-bg'],
  ['Permission Denied', '⊘', 'This principal is not authorized for the action.', 'status/error', 'status/error-bg'],
  ['Waiting Human', '◇', 'Human operator owns the next decision.', 'status/waiting-human', 'status/waiting-human-bg'],
  ['Dependency Unavailable', '—', 'Required source cannot supply a trustworthy result.', 'status/dependency', 'status/dependency-bg'],
  ['MODEL_NOT_READY', '∅', 'Validated forecast capability is not ready; no predicted value.', 'status/model-not-ready', 'status/model-not-ready-bg'],
  ['Processing', '⋯', 'Work is ongoing; no result implied.', 'status/pending', 'status/pending-bg'],
  ['Confirmed', '✓', 'Trusted business effect has completed.', 'status/success', 'status/success-bg'],
  ['Delivery Failed', '!', 'Communication failed; confirmed business effect is unchanged.', 'status/error', 'status/error-bg'],
  ['Valid Empty', '○', 'Query succeeded and genuinely returned no records.', 'status/info', 'status/info-bg'],
];

export async function buildStates(page: PageNode): Promise<FrameNode[]> {
  const s = sectionAt(page, SECTIONS.states, 5, 900, 'Status = icon/shape + explicit label + safe next step. Never color alone.');
  stateData.forEach(([name, icon, body, fg, bg], i) => {
    const x = 28 + (i % 3) * 337, y = 108 + Math.floor(i / 3) * 142;
    const c = component(s, `Component / Badge / Status / ${name}`, x, y, 318, 120, bg);
    stroke(c, fg); c.strokeWeight = name === 'OUTCOME_UNKNOWN' ? 2 : 1;
    const iconBox = box(c, 'Outline state marker', 14, 12, 25, 25, bg, fg, 4);
    txt(iconBox, 'Icon', icon, 5, 2, 15, 16, fg, 'Bold');
    txt(c, 'Status', name, 46, 17, 260, 14, fg, 'Bold');
    txt(c, 'Meaning', body, 16, 47, 286, 13, 'text/primary');
  });
  note(s, 'Known Failure = known non-effect. OUTCOME_UNKNOWN = possible commit and reconciliation. Confirmed business effect + Delivery Failed must render simultaneously, never as one generic error.', 845);
  return [s];
}

function button(parent: FrameNode, emphasis: string, state: string, x: number, y: number): ComponentNode {
  const primary = emphasis === 'Primary', destructive = emphasis === 'Destructive';
  const bg: SemanticName = state === 'Disabled' ? 'surface/subtle' : primary ? 'action/primary' : destructive ? 'action/destructive' : emphasis === 'Secondary' ? 'action/secondary' : 'surface/default';
  const n = component(parent, `Emphasis=${emphasis}, State=${state}`, x, y, 170, 40, bg);
  n.cornerRadius = 6;
  if (state === 'Focus') { stroke(n, 'focus/ring'); n.strokeWeight = 2; }
  if (state === 'Disabled') stroke(n, 'border/strong');
  if (state === 'Hover' || state === 'Pressed') n.opacity = state === 'Hover' ? 0.88 : 0.75;
  txt(n, 'Label', state === 'Loading' ? 'Working…' : emphasis === 'Destructive' ? 'Remove' : 'Continue', 16, 10, 138, 14, state === 'Disabled' ? 'text/secondary' : primary || destructive ? 'text/inverse' : 'text/primary', 'Semi Bold');
  return n;
}

function coreSpecimen(parent: FrameNode, name: string, description: string, i: number): void {
  const w = 238, h = 142, x = 28 + (i % 4) * 256, y = 590 + Math.floor(i / 4) * 148;
  const c = component(parent, name, x, y, w, h);
  txt(c, 'Component name', name.replace('Component / ', ''), 12, 9, 214, 12, 'text/primary', 'Semi Bold');
  txt(c, 'Usage', description, 12, 31, 214, 11, 'text/secondary');
  const lower = 82;
  if (/Input|Textarea|Select/.test(name)) {
    const fieldLabel = name.includes('Search') ? 'Search orders' : name.includes('Select') ? 'Reservation status' : name.includes('Textarea') ? 'Message to customer' : 'Customer reference';
    const value = name.includes('Search') ? 'Order ID or customer…' : name.includes('Select') ? 'All statuses  ▾' : name.includes('Textarea') ? 'Write a reply…' : 'e.g. C-1042';
    txt(c, 'Persistent field label', fieldLabel, 12, 59, 214, 12, 'text/primary', 'Semi Bold');
    const field = box(c, 'Control / labelled field', 12, 80, 214, name.includes('Textarea') ? 40 : 36, 'surface/default', 'border/default', 6);
    txt(field, 'Example value or placeholder', value, 10, 9, 185, 12, 'text/secondary');
    if (!name.includes('Textarea')) txt(c, 'Helper text', name.includes('Search') ? 'Search within this business' : name.includes('Select') ? 'Filter by known state' : 'Use a verified reference', 12, 121, 214, 11, 'text/secondary');
  } else if (name.endsWith('Checkbox')) {
    box(c, 'Checkbox control', 12, lower + 5, 18, 18, 'surface/default', 'border/interactive', 4);
    txt(c, 'Selection mark', '✓', 15, lower + 6, 14, 13, 'text/primary', 'Bold');
    txt(c, 'Checkbox label', 'I understand', 40, lower + 5, 175, 12);
  } else if (name.endsWith('Tabs')) {
    txt(c, 'Active tab', 'Overview', 12, lower + 2, 82, 12, 'status/info', 'Semi Bold');
    txt(c, 'Inactive tab', 'History', 110, lower + 2, 82, 12, 'text/secondary');
    const line = box(c, 'Active underline', 12, lower + 26, 70, 2, 'action/primary', 'border/interactive', 0); line.strokes = [];
  } else if (name.includes('Badge / Handler')) {
    const badge = box(c, 'Handler pill', 12, lower, 130, 28, 'surface/selected', 'border/interactive', 999);
    txt(badge, 'Handler', 'Sales Agent · AI', 10, 6, 112, 11, 'status/pending', 'Semi Bold');
  } else if (name.includes('Alert')) {
    const banner = box(c, 'Alert with status', 12, lower - 4, 214, 43, 'status/unknown-bg', 'status/unknown', 6);
    txt(banner, 'State', '?  Result needs checking', 8, 5, 194, 11, 'status/unknown', 'Semi Bold');
    txt(banner, 'Next', 'Reconcile before retry', 8, 22, 194, 10, 'text/primary');
  } else if (name.includes('Card / Panel')) {
    const panel = box(c, 'Panel', 12, lower - 4, 214, 43, 'surface/subtle');
    txt(panel, 'Panel heading', 'Order context', 8, 6, 190, 11, 'text/primary', 'Semi Bold');
  } else if (name.endsWith('Divider')) {
    const line = box(c, 'Divider line', 12, lower + 12, 214, 1, 'border/default', 'border/default', 0); line.strokes = [];
  } else if (name.endsWith('Avatar')) {
    const avatar = box(c, 'Initials avatar', 12, lower, 32, 32, 'surface/selected', 'border/interactive', 16);
    txt(avatar, 'Initials', 'AO', 6, 7, 22, 11, 'text/primary', 'Semi Bold');
    txt(c, 'Identity', 'Assigned operator', 54, lower + 9, 160, 11);
  } else if (name.includes('Loading')) {
    box(c, 'Skeleton line 1', 12, lower + 1, 170, 8, 'border/default', 'border/default', 4).strokes = [];
    box(c, 'Skeleton line 2', 12, lower + 16, 110, 8, 'border/default', 'border/default', 4).strokes = [];
  } else if (name.endsWith('Pagination')) {
    txt(c, 'Pagination', '‹   1   2   3   ›', 12, lower + 4, 200, 13, 'text/primary', 'Semi Bold');
  } else if (name.endsWith('Icon Button')) {
    const control = box(c, 'Accessible icon button / Focus', 12, lower, 40, 40, 'surface/default', 'focus/ring', 6);
    control.strokeWeight = 2;
    txt(control, 'Outline icon', '↻', 10, 10, 20, 14, 'text/primary');
    txt(c, 'Accessible name', 'Name: Refresh facts', 60, lower + 11, 164, 12, 'text/primary');
  } else {
    txt(c, 'Example state', name.includes('Empty') ? '○  No matching records' : 'i  Context available', 12, lower + 7, 210, 12, 'text/secondary');
  }
}

function inputState(parent: FrameNode, state: string, i: number): ComponentNode {
  const x = 1110 + (i % 3) * 337, y = 160 + Math.floor(i / 3) * 190;
  const c = component(parent, `State=${state}`, x, y, 318, 170);
  txt(c, 'Input state heading', state, 16, 13, 286, 14, state === 'Error' ? 'status/error' : 'text/primary', 'Semi Bold');
  txt(c, 'Persistent field label', 'Customer reference', 16, 46, 286, 12, 'text/primary', 'Semi Bold');
  const subdued = state === 'Disabled' || state === 'Read-only';
  const border: SemanticName = state === 'Focused' ? 'focus/ring' : state === 'Error' ? 'status/error' : state === 'Read-only' ? 'border/strong' : 'border/default';
  const field = box(c, 'Input control', 16, 72, 286, 44, subdued ? 'surface/subtle' : 'surface/default', border, 6);
  field.strokeWeight = state === 'Focused' || state === 'Error' ? 2 : 1;
  const value = state === 'Filled' || state === 'Read-only' ? 'C-1042' : state === 'Error' ? 'C-?42' : state === 'Disabled' ? 'Unavailable' : 'e.g. C-1042';
  txt(field, 'Input value', value, 12, 12, 235, 13, state === 'Disabled' ? 'text/secondary' : state === 'Filled' || state === 'Read-only' ? 'text/primary' : 'text/secondary');
  if (state === 'Error') {
    const marker = box(field, 'Error icon / structural cue', 255, 12, 20, 20, 'status/error-bg', 'status/error', 4);
    txt(marker, 'Error icon', '!', 7, 1, 9, 13, 'status/error', 'Bold');
  }
  const helper = state === 'Error' ? 'Enter a valid customer reference.'
    : state === 'Disabled' ? 'Not interactive.'
    : state === 'Read-only' ? 'Value is readable; editing unavailable.'
    : state === 'Focused' ? 'Visible focus ring.'
    : state === 'Filled' ? 'Value entered.' : 'Use a verified reference.';
  txt(c, 'Helper or explicit error message', helper, 16, 127, 286, 12, state === 'Error' ? 'status/error' : 'text/secondary');
  return c;
}

export async function buildCore(page: PageNode): Promise<FrameNode[]> {
  const s = sectionAt(page, SECTIONS.core, 6, 1220, 'Native reusable Figma components; Button uses semantic Emphasis and State variants.');
  s.resize(2200, 1220);
  txt(s, 'Button column heading', 'BUTTON EMPHASIS →', 28, 102, 240, 12, 'text/secondary', 'Semi Bold');
  ['Primary', 'Secondary', 'Tertiary / Ghost', 'Destructive'].forEach((label, i) => {
    txt(s, `Button column / ${label}`, label, 128 + i * 220, 105, 205, 13, 'text/primary', 'Semi Bold');
  });
  txt(s, 'Button row heading', 'STATE ↓', 28, 135, 90, 12, 'text/secondary', 'Semi Bold');
  const variants: ComponentNode[] = [];
  ['Primary', 'Secondary', 'Ghost', 'Destructive'].forEach((emphasis, i) => {
    ['Default', 'Hover', 'Pressed', 'Focus', 'Disabled', 'Loading'].forEach((state, j) => variants.push(button(s, emphasis, state, 128 + i * 220, 160 + j * 58)));
  });
  const set = figma.combineAsVariants(variants, s);
  set.name = 'Component / Button'; set.x = 128; set.y = 160;
  ['Default', 'Hover', 'Pressed', 'Focus', 'Disabled', 'Loading'].forEach((label, i) => {
    txt(s, `Button row / ${label}`, label, 28, 172 + i * 58, 92, 13, 'text/primary', 'Semi Bold');
  });
  note(s, 'One dominant Primary action; Secondary/Ghost are restrained. Destructive is for destructive ACTIONS only—not Known Failure, Permission Denied or OUTCOME_UNKNOWN. Focus is visible; Disabled stays legible; Loading is not success.', 530);
  ([
    ['Component / Icon Button', 'Outline icon + accessible name.'],
    ['Component / Input', 'Visible label; six defined states.'],
    ['Component / Textarea', 'Label, helper, error; grows.'],
    ['Component / Search Input', 'Search + clear action.'],
    ['Component / Select', 'Label and selected value.'],
    ['Component / Checkbox', 'Explicit acknowledgement label.'],
    ['Component / Tabs', 'Selected + labelled content.'],
    ['Component / Badge / Handler', 'AI vs Human ownership.'],
    ['Component / Alert / State Banner', 'Reason + safe next step.'],
    ['Component / Card / Panel', 'Heading, content and source.'],
    ['Component / Divider', 'Subtle group separation.'],
    ['Component / Avatar', 'Initials + identity.'],
    ['Component / Empty State', 'Valid empty only; not outage.'],
    ['Component / Loading / Skeleton', 'Loading, no fake result.'],
    ['Component / Pagination', 'Page, total and controls.'],
    ['Component / Context Helper', 'Noncritical explanation.'],
  ] as const).forEach(([name, description], i) => coreSpecimen(s, name, description, i));

  txt(s, 'Input matrix heading', 'INPUT STATE MATRIX', 1110, 105, 992, 17, 'text/primary', 'Bold');
  txt(s, 'Input matrix usage', 'The same persistent label and 44 px control height across six reusable states.', 1110, 130, 992, 12, 'text/secondary');
  const inputVariants = ['Default', 'Focused', 'Filled', 'Error', 'Disabled', 'Read-only'].map((state, i) => inputState(s, state, i));
  const inputSet = figma.combineAsVariants(inputVariants, s);
  inputSet.name = 'Component / Input / State Matrix'; inputSet.x = 1110; inputSet.y = 160;

  const semantics = box(s, 'DS / Core / Outcome Semantics', 1110, 590, 992, 184, 'surface/default');
  txt(semantics, 'Heading', 'Do not collapse these states', 18, 14, 946, 16, 'text/primary', 'Semi Bold');
  txt(semantics, 'Success meaning', 'SUCCESS — general UI/system operation completed (settings saved; document uploaded).', 18, 46, 946, 13, 'status/success');
  txt(semantics, 'Confirmed meaning', 'CONFIRMED — trusted BUSINESS EFFECT completed (Order created; reservation confirmed).', 18, 76, 946, 13, 'status/success');
  txt(semantics, 'Pending meaning', 'PENDING — waiting for an external result, confirmation or next event.', 18, 106, 946, 13, 'status/pending');
  txt(semantics, 'Processing meaning', 'PROCESSING — system actively working; no completed result implied.', 18, 136, 946, 13, 'status/pending');

  const formRules = box(s, 'DS / Core / Form and Access Rules', 1110, 794, 992, 176, 'surface/default');
  txt(formRules, 'Heading', 'Control use rules', 18, 14, 946, 16, 'text/primary', 'Semi Bold');
  txt(formRules, 'Persistent labels', 'Input, Textarea, Search and Select keep visible labels; placeholders are examples, not labels.', 18, 48, 946, 13);
  txt(formRules, 'Focus and error', 'Focus has a visible ring. Error has border + icon + explicit message, never color alone.', 18, 78, 946, 13);
  txt(formRules, 'Disabled vs read-only', 'Disabled is inactive yet legible; Read-only preserves a readable value without editing.', 18, 108, 946, 13);
  txt(formRules, 'Language expansion', 'Allow English, Russian and Kazakh labels to wrap; do not shrink typography to fit.', 18, 138, 946, 13);

  const stateRules = box(s, 'DS / Core / Empty Loading Alert Rules', 1110, 990, 992, 172, 'surface/default');
  txt(stateRules, 'Heading', 'Empty, loading and alert semantics', 18, 14, 946, 16, 'text/primary', 'Semi Bold');
  txt(stateRules, 'Empty', 'Valid Empty ≠ Error ≠ Dependency Unavailable. Do not substitute an outage with zero data.', 18, 48, 946, 13);
  txt(stateRules, 'Loading', 'Skeleton means loading only—not zero, empty result or confirmed success.', 18, 78, 946, 13);
  txt(stateRules, 'Unknown alert', 'OUTCOME_UNKNOWN alert retains its own structure: uncertain effect → reconcile → no blind retry.', 18, 108, 946, 13, 'status/unknown');
  return [s];
}

export async function buildNavigation(page: PageNode): Promise<FrameNode[]> {
  const s = sectionAt(page, SECTIONS.navigation, 7, 680, 'Approved six-area staff IA; native component variants and a compact hierarchy specimen, not an application screen.');
  s.resize(2200, 680);
  txt(s, 'Primary variant heading', 'PRIMARY ITEM · same destination, different visual states', 28, 101, 990, 14, 'text/primary', 'Semi Bold');

  const primaryStates = ['Default', 'Hover', 'Active', 'Focus'] as const;
  const primaryVariants = primaryStates.map((state, i) => {
    const item = component(s, `State=${state}`, 28 + i * 245, 134, 215, 64, state === 'Active' ? 'surface/selected' : state === 'Hover' ? 'surface/subtle' : 'surface/default');
    item.cornerRadius = 6;
    if (state === 'Focus') { stroke(item, 'focus/ring'); item.strokeWeight = 2; }
    if (state === 'Active') {
      const marker = box(item, 'Selected marker', 0, 8, 4, 48, 'action/primary', 'border/interactive', 0);
      marker.strokes = [];
    }
    txt(item, 'State label', state, 13, 7, 185, 11, 'text/secondary', 'Semi Bold');
    txt(item, 'Destination', 'Conversations', 13, 29, 159, 14, 'text/primary', 'Semi Bold');
    if (state === 'Active') txt(item, 'Non-color selection cue', '✓ Current', 138, 31, 65, 11, 'status/info', 'Semi Bold');
    return item;
  });
  const primarySet = figma.combineAsVariants(primaryVariants, s);
  primarySet.name = 'Component / Navigation / Primary Item'; primarySet.x = 28; primarySet.y = 134;
  txt(s, 'Primary state note', 'Active has a marker and “Current” cue. Focus is a separate ring, not a synonym for Active.', 28, 212, 990, 12, 'text/secondary');

  txt(s, 'Nested variant heading', 'NESTED ITEM · child keeps its parent context', 28, 246, 990, 14, 'text/primary', 'Semi Bold');
  const nestedStates = ['Default', 'Active', 'Focus'] as const;
  const nestedVariants = nestedStates.map((state, i) => {
    const item = component(s, `State=${state}`, 28 + i * 320, 277, 300, 64, state === 'Active' ? 'surface/selected' : 'surface/default');
    item.cornerRadius = 6;
    if (state === 'Focus') { stroke(item, 'focus/ring'); item.strokeWeight = 2; }
    if (state === 'Active') {
      const marker = box(item, 'Nested selected marker', 0, 8, 4, 48, 'action/primary', 'border/interactive', 0);
      marker.strokes = [];
    }
    txt(item, 'State label', state, 13, 7, 270, 11, 'text/secondary', 'Semi Bold');
    txt(item, 'Hierarchy connector', '└', 16, 30, 16, 14, 'text/secondary');
    txt(item, 'Nested destination', 'Escalations', 40, 29, 200, 14, 'text/primary', 'Semi Bold');
    if (state === 'Active') txt(item, 'Non-color selection cue', '✓', 267, 30, 18, 13, 'status/info', 'Bold');
    return item;
  });
  const nestedSet = figma.combineAsVariants(nestedVariants, s);
  nestedSet.name = 'Component / Navigation / Nested Item'; nestedSet.x = 28; nestedSet.y = 277;

  txt(s, 'Disclosure heading', 'NORMAL GROUP DISCLOSURE', 28, 364, 990, 14, 'text/primary', 'Semi Bold');
  const disclosureVariants = (['Expanded', 'Collapsed'] as const).map((state, i) => {
    const item = component(s, `State=${state}`, 28 + i * 490, 394, 470, 64);
    txt(item, 'Disclosure affordance', state === 'Expanded' ? '▾' : '▸', 16, 15, 24, 18, 'text/primary', 'Semi Bold');
    txt(item, 'Parent destination', 'Conversations', 48, 12, 238, 14, 'text/primary', 'Semi Bold');
    txt(item, 'Explicit disclosure state', state, 48, 36, 238, 12, 'text/secondary');
    if (state === 'Expanded') txt(item, 'Visible child cue', '└ Escalations', 314, 23, 138, 12, 'text/secondary');
    return item;
  });
  const disclosureSet = figma.combineAsVariants(disclosureVariants, s);
  disclosureSet.name = 'Component / Navigation / Expand'; disclosureSet.x = 28; disclosureSet.y = 394;

  const business = component(s, 'Component / Navigation / Business Context', 28, 480, 300, 110);
  txt(business, 'Context label', 'ACTIVE BUSINESS', 14, 10, 270, 11, 'text/secondary', 'Semi Bold');
  txt(business, 'Business name', 'Business North Shop', 14, 29, 270, 14, 'text/primary', 'Semi Bold');
  txt(business, 'Switch affordance', 'Switch business  ▾', 14, 76, 140, 12, 'status/info', 'Semi Bold');
  txt(business, 'Reset rule', 'Scope resets on switch', 160, 76, 126, 11, 'text/secondary');

  const breadcrumb = component(s, 'Component / Navigation / Breadcrumb', 347, 480, 320, 110);
  txt(breadcrumb, 'Breadcrumb path', 'Conversations  ›  Order #1042', 14, 16, 292, 13, 'text/primary', 'Semi Bold');
  txt(breadcrumb, 'Return action', '← Back to conversation', 14, 56, 292, 12, 'status/info', 'Semi Bold');
  txt(breadcrumb, 'Origin preservation', 'Origin filter and draft preserved', 14, 80, 292, 11, 'text/secondary');

  const account = component(s, 'Component / Navigation / Account', 686, 480, 312, 110);
  const avatar = box(account, 'Account avatar', 14, 28, 42, 42, 'surface/selected', 'border/interactive', 21);
  txt(avatar, 'Initials', 'AO', 10, 11, 26, 13, 'text/primary', 'Semi Bold');
  txt(account, 'Session identity', 'Amina Operator', 68, 15, 212, 14, 'text/primary', 'Semi Bold');
  txt(account, 'Role and session', 'Operator · Session active', 68, 57, 212, 12, 'text/secondary');
  txt(account, 'Accessible menu affordance', 'Account menu  ▾', 68, 81, 212, 11, 'status/info', 'Semi Bold');

  const restricted = component(s, 'Component / Navigation / Restricted Link', 28, 599, 470, 66, 'surface/default');
  stroke(restricted, 'border/strong');
  txt(restricted, 'Contextual destination', 'Agent Runs  ↗', 14, 9, 220, 13, 'text/primary', 'Semi Bold');
  txt(restricted, 'Restriction label', 'Contextual / permitted case only', 14, 31, 442, 12, 'status/restricted', 'Semi Bold');
  txt(restricted, 'Authorization rule', 'Visible link still requires server authorization.', 14, 50, 442, 11, 'text/secondary');
  const unavailable = box(s, 'DS / Navigation / Disabled Comparison', 518, 599, 480, 66, 'surface/subtle', 'border/default', 8);
  txt(unavailable, 'Disabled comparison label', 'Disabled / unavailable', 14, 10, 452, 13, 'text/secondary', 'Semi Bold');
  txt(unavailable, 'Disabled meaning', 'Inactive control · no navigation action', 14, 34, 452, 12, 'text/secondary');
  txt(unavailable, 'Contrast with contextual', 'Different from a permissioned contextual link.', 14, 51, 452, 11, 'text/secondary');

  const demo = box(s, 'DS / Navigation / Approved Hierarchy Demo', 1110, 105, 992, 554, 'surface/default', 'border/default', 8);
  txt(demo, 'Demo heading', 'APPROVED STAFF NAVIGATION · component demonstration', 18, 14, 950, 15, 'text/primary', 'Semi Bold');
  txt(demo, 'Demo scope', 'Role-visible entries only; this is not a complete screen.', 18, 39, 950, 12, 'text/secondary');
  const hierarchy = [
    { label: 'Overview', depth: 0 },
    { label: 'Conversations', depth: 0 },
    { label: 'Escalations', depth: 1, parent: 'Conversations' },
    { label: 'Business', depth: 0 },
    { label: 'Customers', depth: 1, parent: 'Business' },
    { label: 'Orders', depth: 1, parent: 'Business' },
    { label: 'Products', depth: 1, parent: 'Business' },
    { label: 'Inventory', depth: 1, parent: 'Business' },
    { label: 'Knowledge', depth: 0 },
    { label: 'Documents', depth: 1, parent: 'Knowledge' },
    { label: 'Analytics', depth: 0 },
    { label: 'Forecasts', depth: 1, parent: 'Analytics' },
    { label: 'Administration', depth: 0 },
    { label: 'Integrations', depth: 1, parent: 'Administration' },
    { label: 'Settings', depth: 1, parent: 'Administration' },
    { label: 'Audit', depth: 1, parent: 'Administration', qualifier: 'restricted' },
    { label: 'Agent Runs', depth: 1, parent: 'Administration', qualifier: 'contextual / restricted' },
  ] as const;
  hierarchy.forEach((entry, i) => {
    const row = box(demo, `Hierarchy row / ${entry.label}`, 18, 68 + i * 27, 510, 25, entry.label === 'Conversations' ? 'surface/selected' : 'surface/default', 'border/default', 4);
    row.strokes = [];
    if (entry.label === 'Conversations') {
      const marker = box(row, 'Current group marker', 0, 3, 3, 19, 'action/primary', 'border/interactive', 0);
      marker.strokes = [];
    }
    txt(row, entry.depth === 0 ? `Demo / Top-level / ${entry.label}` : `Demo / Nested / ${entry.parent}/${entry.label}`, `${entry.depth ? '└  ' : ''}${entry.label}`, entry.depth ? 35 : 12, 4, 245, 12, 'text/primary', entry.depth === 0 ? 'Semi Bold' : 'Regular');
    if ('qualifier' in entry) txt(row, `Access marker / ${entry.label}`, entry.qualifier, 294, 4, 205, 11, 'status/restricted', 'Semi Bold');
  });
  const demoNotes = box(demo, 'Hierarchy notes', 552, 68, 420, 460, 'surface/subtle', 'border/default', 6);
  txt(demoNotes, 'Hierarchy rule', 'Conversations → Escalations', 16, 17, 388, 13, 'text/primary', 'Semi Bold');
  txt(demoNotes, 'Forecast rule', 'Analytics → Forecasts', 16, 49, 388, 13, 'text/primary', 'Semi Bold');
  txt(demoNotes, 'Business rule', 'Business groups Customers, Orders, Products and Inventory.', 16, 81, 388, 12, 'text/secondary');
  txt(demoNotes, 'Knowledge rule', 'Knowledge contains Documents; it is not a new top-level Brain page.', 16, 137, 388, 12, 'text/secondary');
  txt(demoNotes, 'Restricted rule', 'Audit and Agent Runs are contextual or restricted—not universal Operator destinations.', 16, 199, 388, 12, 'status/restricted');
  txt(demoNotes, 'Customer separation', 'Customer Web Chat is separate from staff navigation.', 16, 263, 388, 12, 'text/secondary');
  txt(demoNotes, 'Authorization rule', 'Frontend visibility ≠ backend authorization. Recheck scope and rights on entry.', 16, 311, 388, 12, 'text/secondary');
  txt(demoNotes, 'Localization rule', 'Allow English, Russian and Kazakh expansion: wrap labels; never shrink type or truncate critical state.', 16, 376, 388, 12, 'text/secondary');
  return [s];
}

export async function buildConversation(page: PageNode): Promise<FrameNode[]> {
  const s = sectionAt(page, SECTIONS.conversation, 8, 780, 'Reusable parts for List + Workspace + persistent Context Panel; no complete Conversations screen.');
  s.resize(5350, 780);
  const heading = (name: string, value: string, x: number, y = 99, w = 990): void => {
    txt(s, name, value, x, y, w, 14, 'text/primary', 'Semi Bold');
  };
  const badge = (parent: FrameNode | ComponentNode, name: string, value: string, x: number, y: number, w: number, fg: SemanticName, bg: SemanticName): void => {
    const b = box(parent, name, x, y, w, 26, bg, fg, 6);
    txt(b, 'Badge label', value, 9, 5, w - 18, 12, fg, 'Semi Bold');
  };
  const makeSet = (name: string, variants: ComponentNode[], x: number, y: number): ComponentSetNode => {
    const set = figma.combineAsVariants(variants, s);
    set.name = name; set.x = x; set.y = y;
    return set;
  };

  // Lane 1 — queue discovery and readable thread rows.
  heading('List item family', 'CONVERSATION LIST ITEM · customer, source, owner, state, activity', 28);
  const listStates = ['Default', 'Attention Needed', 'Active', 'Waiting Human'] as const;
  const listItems = listStates.map((state, i) => {
    const x = 28 + (i % 2) * 490, y = 130 + Math.floor(i / 2) * 112;
    const c = component(s, `State=${state}`, x, y, 470, 102, state === 'Active' ? 'surface/selected' : 'surface/default');
    if (state === 'Active') {
      const marker = box(c, 'Selected conversation marker', 0, 8, 4, 84, 'action/primary', 'border/interactive', 0);
      marker.strokes = [];
    }
    const avatar = box(c, 'Customer initials', 14, 16, 38, 38, 'surface/subtle', 'border/default', 19);
    txt(avatar, 'Initials', 'AS', 9, 10, 23, 12, 'text/primary', 'Semi Bold');
    txt(c, 'Customer', 'Amina S.', 64, 13, 180, 14, 'text/primary', 'Semi Bold');
    txt(c, 'Channel source', 'Web Chat · customer', 64, 39, 195, 12, 'text/secondary');
    txt(c, 'Current handler', `Current: ${state === 'Waiting Human' ? 'Human Operator' : 'Support Agent (AI)'}`, 254, 14, 205, 12, 'text/primary', 'Semi Bold');
    const stateLabel = state === 'Active' ? '✓ Current selection' : state === 'Attention Needed' ? '! Attention needed' : state === 'Waiting Human' ? '◇ Waiting for human' : 'Active conversation';
    txt(c, 'Conversation state', stateLabel, 254, 40, 205, 12, state === 'Waiting Human' ? 'status/waiting-human' : state === 'Attention Needed' ? 'status/warning' : 'text/secondary');
    txt(c, 'Last activity', 'Last activity 10:42 · today', 64, 73, 380, 12, 'text/secondary');
    return c;
  });
  makeSet('Component / Conversation / List Item', listItems, 28, 130);
  txt(s, 'List selection rule', 'Selected is marked by position and text, not by fill alone. Waiting Human names the owner.', 28, 365, 980, 12, 'text/secondary');

  heading('Message family', 'MESSAGE ROW · sender, time, content and independent delivery', 28, 395);
  const messages = [
    ['Customer', 'Customer · Amina S.', 'Is the item still available?', 'Received'],
    ['Human Operator', 'Human Operator · Amina', 'I will check the current stock.', 'Delivered'],
    ['Business Assistant', 'Business assistant · AI-assisted', 'I found the current product details.', 'Sending'],
    ['System Result', 'Business result', 'Order created; reservation is still pending.', 'Effect: Order created'],
  ] as const;
  const messageRows = messages.map(([kind, sender, body, delivery], i) => {
    const c = component(s, `Sender=${kind}`, 28 + (i % 2) * 490, 426 + Math.floor(i / 2) * 124, 470, 114, kind === 'System Result' ? 'surface/subtle' : 'surface/default');
    txt(c, 'Sender', sender, 14, 12, 342, 13, 'text/primary', 'Semi Bold');
    txt(c, 'Timestamp', '10:42', 377, 12, 78, 12, 'text/secondary');
    txt(c, 'Message content', body, 14, 42, 440, 13, 'text/primary');
    txt(c, kind === 'System Result' ? 'Business effect label' : 'Message delivery label', delivery, 14, 85, 440, 12, delivery === 'Sending' ? 'status/pending' : 'text/secondary', 'Semi Bold');
    return c;
  });
  makeSet('Component / Conversation / Message Row', messageRows, 28, 426);
  txt(s, 'Message privacy rule', 'No hidden reasoning, raw calls or confidence internals. Message delivery never proves business effect.', 28, 689, 980, 12, 'text/secondary');

  // Lane 2 — drafting and persistent, compact verified context.
  heading('Composer family', 'COMPOSER · delivery state is not a business mutation result', 1080);
  const composerStates = ['Ready', 'Sending', 'Delivery Failed'] as const;
  const composers = composerStates.map((state, i) => {
    const c = component(s, `State=${state}`, 1080 + i * 330, 130, 310, 142);
    txt(c, 'Composer state', state, 14, 12, 280, 13, state === 'Delivery Failed' ? 'status/error' : 'text/primary', 'Semi Bold');
    const field = box(c, 'Draft input area', 14, 39, 282, 54, 'surface/default', 'border/default', 6);
    txt(field, 'Draft text', 'Draft reply to customer…', 10, 12, 258, 13, 'text/secondary');
    const send = box(c, 'Send action / focus treatment', 210, 101, 86, 31, state === 'Ready' ? 'action/primary' : 'surface/subtle', state === 'Ready' ? 'focus/ring' : 'border/default', 6);
    send.strokeWeight = state === 'Ready' ? 2 : 1;
    txt(send, 'Send label', state === 'Sending' ? 'Sending…' : 'Send', 14, 7, 61, 12, state === 'Ready' ? 'text/inverse' : 'text/secondary', 'Semi Bold');
    txt(c, 'Delivery helper', state === 'Delivery Failed' ? 'Retry delivery only' : state === 'Sending' ? 'Awaiting delivery' : 'Message only', 14, 109, 185, 12, state === 'Delivery Failed' ? 'status/error' : 'text/secondary');
    return c;
  });
  makeSet('Component / Conversation / Composer', composers, 1080, 130);

  heading('Context family', 'PERSISTENT CONTEXT · verified facts stay near the thread', 1080, 300);
  const customer = component(s, 'Component / Conversation / Customer Context', 1080, 331, 470, 174);
  txt(customer, 'Context heading', 'CUSTOMER CONTEXT', 16, 13, 438, 12, 'text/secondary', 'Semi Bold');
  txt(customer, 'Customer identity', 'Amina S. · Customer #C-1042', 16, 38, 438, 14, 'text/primary', 'Semi Bold');
  txt(customer, 'Source', 'Source: Web Chat · current business', 16, 68, 438, 12);
  txt(customer, 'Verified fact', 'Verified: customer record matched', 16, 92, 438, 12, 'status/success');
  txt(customer, 'Freshness', 'Observed 10:40 · source current', 16, 116, 438, 12, 'text/secondary');
  const customerLink = box(customer, 'Customer link / focus', 14, 137, 198, 29, 'surface/default', 'focus/ring', 4);
  customerLink.strokeWeight = 2;
  txt(customerLink, 'Customer link label', 'Open customer record  ↗', 9, 6, 178, 12, 'status/info', 'Semi Bold');

  const order = component(s, 'Component / Conversation / Order Context', 1580, 331, 470, 174);
  txt(order, 'Context heading', 'ORDER CONTEXT · #1042', 16, 13, 438, 12, 'text/secondary', 'Semi Bold');
  txt(order, 'Order state label', 'ORDER STATE', 16, 43, 200, 12, 'text/secondary', 'Semi Bold');
  txt(order, 'Order state value', 'Created', 220, 43, 230, 13, 'status/success', 'Semi Bold');
  txt(order, 'Reservation state label', 'RESERVATION STATE', 16, 76, 200, 12, 'text/secondary', 'Semi Bold');
  txt(order, 'Reservation state value', 'OUTCOME_UNKNOWN', 220, 76, 230, 12, 'status/unknown', 'Semi Bold');
  txt(order, 'Order freshness', 'Observed 10:41 · authoritative ref #1042', 16, 112, 438, 12, 'text/secondary');
  const orderLink = box(order, 'Order link / focus', 14, 137, 178, 29, 'surface/default', 'focus/ring', 4);
  orderLink.strokeWeight = 2;
  txt(orderLink, 'Order link label', 'Open order record  ↗', 9, 6, 158, 12, 'status/info', 'Semi Bold');

  heading('Handler family', 'CURRENT HANDLER · AI and Human remain distinct', 1080, 526);
  const handlers = ['Sales Agent', 'Support Agent', 'Analytics Agent', 'Human Operator'] as const;
  const handlerVariants = handlers.map((name, i) => {
    const c = component(s, `Handler=${name}`, 1080 + i * 245, 558, 225, 145, name === 'Human Operator' ? 'surface/subtle' : 'surface/default');
    txt(c, 'Ownership label', 'CURRENT HANDLER', 13, 12, 199, 11, 'text/secondary', 'Semi Bold');
    const role = name === 'Human Operator' ? 'HUMAN' : 'AI SPECIALIST';
    badge(c, 'Handler type marker', role, 13, 39, name === 'Human Operator' ? 90 : 112, name === 'Human Operator' ? 'status/waiting-human' : 'status/info', name === 'Human Operator' ? 'status/waiting-human-bg' : 'surface/selected');
    txt(c, 'Handler name', name, 13, 79, 199, 14, 'text/primary', 'Semi Bold');
    txt(c, 'Ownership status', 'One current owner', 13, 111, 199, 12, 'text/secondary');
    return c;
  });
  makeSet('Component / Conversation / Active Handler', handlerVariants, 1080, 558);
  txt(s, 'Handler ownership rule', 'Previous handlers belong in events; they are not simultaneously current.', 1080, 721, 980, 12, 'text/secondary');

  // Lane 3 — lifecycle, human ownership and evidence-preserving handoff.
  heading('Agent status family', 'AGENT STATUS · intent, execution and trusted outcome are different', 2130);
  const agentStates = [
    ['Proposed', 'Proposed action · not executed', 'Await confirmation', 'text/secondary', 'surface/subtle'],
    ['Executing', 'Executing approved work', 'No result yet', 'status/pending', 'status/pending-bg'],
    ['Pending', 'Waiting for result', 'No effect claim', 'status/pending', 'status/pending-bg'],
    ['Verified Result', 'Trusted result available', 'Inspect effect ref', 'status/success', 'status/success-bg'],
    ['Known Failure', 'Effect known not completed', 'Review current facts', 'status/error', 'status/error-bg'],
    ['OUTCOME_UNKNOWN', 'Effect may have committed', 'Reconcile; no blind retry', 'status/unknown', 'status/unknown-bg'],
  ] as const;
  const agentVariants = agentStates.map(([state, meaning, next, fg, bg], i) => {
    const c = component(s, `State=${state}`, 2130 + (i % 3) * 330, 130 + Math.floor(i / 3) * 125, 310, 112, bg);
    stroke(c, state === 'Proposed' ? 'border/strong' : fg);
    txt(c, 'Agent state', `${state === 'Verified Result' ? '✓ ' : state === 'OUTCOME_UNKNOWN' ? '? ' : ''}${state}`, 14, 13, 282, 14, state === 'Proposed' ? 'text/primary' : fg, 'Semi Bold');
    txt(c, 'State meaning', meaning, 14, 45, 282, 12, 'text/primary');
    txt(c, 'Next or source', next, 14, 81, 282, 12, 'text/secondary');
    return c;
  });
  makeSet('Component / Conversation / Agent Status', agentVariants, 2130, 130);

  heading('Human status family', 'HUMAN STATUS · ownership differs from automated Pending', 2130, 401);
  const humanStates = [
    ['Human Active', 'Operator currently handling this case.'],
    ['Waiting for Human', 'Case awaits human assignment/attention.'],
    ['Human Decision Required', 'A named decision is needed before continuation.'],
  ] as const;
  const humanVariants = humanStates.map(([state, meaning], i) => {
    const c = component(s, `State=${state}`, 2130 + i * 330, 432, 310, 103, 'status/waiting-human-bg');
    stroke(c, 'status/waiting-human');
    txt(c, 'Human ownership marker', '◇ HUMAN', 14, 12, 282, 12, 'status/waiting-human', 'Semi Bold');
    txt(c, 'Human state', state, 14, 37, 282, 14, 'text/primary', 'Semi Bold');
    txt(c, 'Meaning', meaning, 14, 69, 282, 12, 'text/secondary');
    return c;
  });
  makeSet('Component / Conversation / Human Status', humanVariants, 2130, 432);

  heading('Handoff family', 'HANDOFF EVENT · verified context, no permission transfer', 2130, 550);
  const handoff = component(s, 'Component / Conversation / Handoff Event', 2130, 580, 970, 170);
  txt(handoff, 'Handoff heading', 'SUPPORT → SALES HANDOFF', 18, 12, 932, 14, 'text/primary', 'Semi Bold');
  txt(handoff, 'Previous handler', 'PREVIOUS  Support Agent', 18, 41, 420, 12, 'text/secondary', 'Semi Bold');
  txt(handoff, 'Current handler', 'CURRENT  Sales Agent', 500, 41, 440, 12, 'status/info', 'Semi Bold');
  txt(handoff, 'Reason', 'Reason: Sales-authorized mutation required.', 18, 72, 932, 12);
  txt(handoff, 'Verified context', 'Verified context: Customer and Order already verified.', 18, 96, 932, 12);
  txt(handoff, 'Completed work', 'Completed: Order retrieved.', 18, 121, 420, 12);
  txt(handoff, 'Remaining task', 'Remaining: Authorized sales action.', 500, 121, 440, 12);
  txt(handoff, 'Permission boundary', 'Permissions do not transfer with the handoff.', 18, 146, 932, 12, 'text/secondary', 'Semi Bold');

  // Lane 4 — proposals, authoritative results, case trace and escalation.
  heading('Action family', 'BUSINESS ACTION · proposal is not a confirmed result', 3180);
  const proposal = component(s, 'Component / Conversation / Action Proposal', 3180, 130, 470, 178, 'surface/subtle');
  stroke(proposal, 'border/strong');
  txt(proposal, 'Proposal marker', 'PROPOSED · NOT EXECUTED', 16, 12, 438, 12, 'text/secondary', 'Semi Bold');
  txt(proposal, 'Business action', 'Reserve inventory for Order #1042', 16, 44, 438, 14, 'text/primary', 'Semi Bold');
  txt(proposal, 'Business summary', 'One item requested; current stock must be checked.', 16, 75, 438, 12);
  txt(proposal, 'Confirmation rule', 'Confirmation required before authorized action.', 16, 105, 438, 12, 'status/pending');
  txt(proposal, 'Next action', 'Next: Review and confirm the proposed action.', 16, 139, 438, 12, 'text/primary', 'Semi Bold');

  const execution = component(s, 'Component / Conversation / Execution Summary', 3680, 130, 470, 178);
  txt(execution, 'Summary heading', 'EXECUTION SUMMARY', 16, 12, 438, 12, 'text/secondary', 'Semi Bold');
  txt(execution, 'Status', 'Status: Executing · result pending', 16, 42, 438, 12, 'status/pending', 'Semi Bold');
  txt(execution, 'Handler', 'Specialist: Sales Agent', 16, 67, 438, 12);
  txt(execution, 'Action summary', 'Action: reservation request for Order #1042', 16, 92, 438, 12);
  const runLink = box(execution, 'Run reference / focus', 14, 111, 295, 30, 'surface/default', 'focus/ring', 4);
  runLink.strokeWeight = 2;
  txt(runLink, 'Run reference', 'Agent Run: Open permitted reference  ↗', 9, 7, 274, 12, 'status/info', 'Semi Bold');
  txt(execution, 'Timestamp', 'Observed 10:42 · same business scope', 16, 144, 438, 12, 'text/secondary');

  heading('Result family', 'ACTION RESULT · confirmed, known failed and uncertain are separate', 3180, 327);
  const resultStates = [
    ['Confirmed', '✓ Reservation confirmed', 'Trusted reservation ref #R-1042', 'Observed 10:43', 'status/success', 'status/success-bg'],
    ['Known Failure', '× Reservation failed', 'Inventory was not reserved', 'Review current facts', 'status/error', 'status/error-bg'],
    ['OUTCOME_UNKNOWN', '? Reservation unconfirmed', 'Effect may have committed; confirmation unavailable.', 'Reconcile first · no blind retry', 'status/unknown', 'status/unknown-bg'],
  ] as const;
  const resultVariants = resultStates.map(([state, effect, evidence, next, fg, bg], i) => {
    const c = component(s, `Outcome=${state}`, 3180 + i * 330, 357, 310, 178, bg);
    stroke(c, fg); c.strokeWeight = state === 'OUTCOME_UNKNOWN' ? 2 : 1;
    txt(c, 'Result state', state, 14, 12, 282, 13, fg, 'Semi Bold');
    txt(c, 'Business effect', effect, 14, 45, 282, 14, 'text/primary', 'Semi Bold');
    txt(c, 'Trusted evidence or uncertainty', evidence, 14, 83, 282, 12, 'text/primary');
    txt(c, 'Timestamp or safe next step', next, 14, 131, 282, 12, state === 'OUTCOME_UNKNOWN' ? 'status/unknown' : 'text/secondary', state === 'OUTCOME_UNKNOWN' ? 'Semi Bold' : 'Regular');
    return c;
  });
  makeSet('Component / Conversation / Action Result', resultVariants, 3180, 357);

  heading('Escalation family', 'ESCALATION STATE · compact link, not a decision context', 3180, 552);
  const escalation = component(s, 'Component / Conversation / Escalation State', 3180, 582, 970, 165, 'status/unknown-bg');
  stroke(escalation, 'status/unknown');
  txt(escalation, 'Escalation heading', 'HUMAN DECISION REQUIRED', 18, 14, 932, 13, 'status/unknown', 'Semi Bold');
  txt(escalation, 'Reason', 'Reason: reservation result uncertain; effect may have committed.', 18, 45, 932, 12);
  txt(escalation, 'Escalation status', 'Status: awaiting assigned operator decision', 18, 73, 932, 12, 'status/waiting-human');
  txt(escalation, 'Safe next step', 'Next safe step: reconcile authoritative reservation state before any retry.', 18, 101, 932, 12, 'text/primary', 'Semi Bold');
  const escalationLink = box(escalation, 'Contextual navigation / focus', 16, 126, 248, 30, 'surface/default', 'focus/ring', 4);
  escalationLink.strokeWeight = 2;
  txt(escalationLink, 'Escalation link label', 'Open escalation context  ↗', 9, 7, 229, 12, 'status/info', 'Semi Bold');

  // Lane 5 — delivery only, then small coexistence specimens.
  heading('Delivery family', 'DELIVERY STATE · communication is separate from business effect', 4230);
  const deliveryStates = [
    ['Delivered', 'Customer message delivered', '10:44 · channel receipt', 'status/success', 'status/success-bg'],
    ['Sending / Pending', 'Waiting for delivery result', 'No delivery confirmation yet', 'status/pending', 'status/pending-bg'],
    ['Delivery Failed', 'Customer message not delivered', 'Recover communication only', 'status/error', 'status/error-bg'],
  ] as const;
  const deliveryVariants = deliveryStates.map(([state, meaning, next, fg, bg], i) => {
    const c = component(s, `State=${state}`, 4230 + i * 330, 130, 310, 130, bg);
    stroke(c, fg);
    txt(c, 'Delivery state', state, 14, 12, 282, 13, fg, 'Semi Bold');
    txt(c, 'Delivery meaning', meaning, 14, 46, 282, 12, 'text/primary');
    txt(c, 'Delivery reference or recovery', next, 14, 90, 282, 12, 'text/secondary');
    return c;
  });
  makeSet('Component / Conversation / Delivery State', deliveryVariants, 4230, 130);

  heading('Composition heading', 'SMALL COMPOSITIONS · coexistence without a full screen', 4230, 281);
  const compositions = [
    {
      name: 'A / Active AI handling', firstLabel: 'CURRENT HANDLER', first: 'Support Agent · AI', firstFg: 'status/info', firstBg: 'surface/selected',
      secondLabel: 'AGENT STATUS', second: 'Executing · result pending', secondFg: 'status/pending', secondBg: 'status/pending-bg',
      rule: 'No verified business effect yet.',
    },
    {
      name: 'B / Support → Sales handoff', firstLabel: 'PREVIOUS', first: 'Support Agent', firstFg: 'text/secondary', firstBg: 'surface/subtle',
      secondLabel: 'CURRENT', second: 'Sales Agent', secondFg: 'status/info', secondBg: 'surface/selected',
      rule: 'Verified context moves; permissions do not.',
    },
    {
      name: 'C / Confirmed + Delivery Failed', firstLabel: 'BUSINESS EFFECT', first: 'Reservation confirmed', firstFg: 'status/success', firstBg: 'status/success-bg',
      secondLabel: 'COMMUNICATION', second: 'Delivery failed', secondFg: 'status/error', secondBg: 'status/error-bg',
      rule: 'Retry communication only; do not replay reservation.',
    },
    {
      name: 'D / Unknown + Escalation', firstLabel: 'BUSINESS EFFECT', first: 'OUTCOME_UNKNOWN', firstFg: 'status/unknown', firstBg: 'status/unknown-bg',
      secondLabel: 'ESCALATION', second: 'Human decision required', secondFg: 'status/waiting-human', secondBg: 'status/waiting-human-bg',
      rule: 'Reconcile authoritative effect; no blind retry.',
    },
  ] as const;
  compositions.forEach((spec, i) => {
    const x = 4230 + (i % 2) * 500, y = 311 + Math.floor(i / 2) * 190;
    const c = box(s, `DS / Conversation / Composition / ${spec.name}`, x, y, 470, 176, 'surface/default', 'border/default', 8);
    txt(c, 'Composition name', spec.name, 14, 12, 442, 13, 'text/primary', 'Semi Bold');
    const first = box(c, 'First semantic block', 14, 42, 442, 48, spec.firstBg, spec.firstFg, 6);
    txt(first, 'First label', spec.firstLabel, 10, 5, 418, 11, spec.firstFg, 'Semi Bold');
    txt(first, 'First value', spec.first, 10, 23, 418, 12, 'text/primary', 'Semi Bold');
    const second = box(c, 'Second semantic block', 14, 98, 442, 48, spec.secondBg, spec.secondFg, 6);
    txt(second, 'Second label', spec.secondLabel, 10, 5, 418, 11, spec.secondFg, 'Semi Bold');
    txt(second, 'Second value', spec.second, 10, 23, 418, 12, 'text/primary', 'Semi Bold');
    txt(c, 'Composition safety rule', spec.rule, 14, 153, 442, 11, 'text/secondary');
  });
  txt(s, 'Conversation library scope', 'Components wrap English, Russian and Kazakh labels; links require focus and permission checks. No chain-of-thought or full Conversations screen.', 4230, 711, 1000, 12, 'text/secondary');
  return [s];
}

export async function buildBusiness(page: PageNode): Promise<FrameNode[]> {
  const s = sectionAt(page, SECTIONS.business, 9, 780, 'Entity summaries and independent effect states; no E02 success path.');
  s.resize(6320, 780); // Six specimen lanes; the next 03C section starts below this one.
  const heading = (name: string, value: string, x: number, y = 99): void => {
    txt(s, name, value, x, y, 980, 14, 'text/primary', 'Semi Bold');
  };
  const makeSet = (name: string, variants: ComponentNode[], x: number, y: number): void => {
    const set = figma.combineAsVariants(variants, s);
    set.name = name; set.x = x; set.y = y;
  };
  const field = (parent: ComponentNode | FrameNode, name: string, label: string, value: string, x: number, y: number, w: number, color: SemanticName = 'text/primary'): void => {
    txt(parent, `${name} label`, label, x, y, w, 11, 'text/secondary', 'Semi Bold');
    txt(parent, `${name} value`, value, x, y + 20, w, 13, color, 'Semi Bold');
  };
  const link = (parent: ComponentNode, name: string, value: string, x: number, y: number, w: number): void => {
    const control = box(parent, `${name} / focus`, x, y, w, 32, 'surface/default', 'focus/ring', 5);
    control.strokeWeight = 2;
    txt(control, `${name} label`, value, 10, 7, w - 20, 12, 'status/info', 'Semi Bold');
  };

  // Compact verified records. Product existence makes no stock claim.
  heading('Record summaries heading', 'CUSTOMER + PRODUCT / compact verified context', 28);
  const customer = component(s, 'Component / Business / Customer Summary', 28, 130, 470, 268);
  txt(customer, 'Heading', 'CUSTOMER SUMMARY', 16, 13, 438, 12, 'text/secondary', 'Semi Bold');
  txt(customer, 'Identity', 'Amina S.', 16, 41, 438, 16, 'text/primary', 'Semi Bold');
  field(customer, 'Reference', 'CUSTOMER REFERENCE', 'C-1042', 16, 79, 210);
  field(customer, 'Channel', 'SOURCE / CHANNEL', 'Web Chat', 238, 79, 216);
  field(customer, 'Relationship', 'RELATIONSHIP / VERIFICATION', 'Matched in current business', 16, 137, 438, 'status/success');
  txt(customer, 'Freshness', 'Observed 10:40 / customer record', 16, 195, 438, 12, 'text/secondary');
  link(customer, 'Customer record link', 'Open customer record  →', 16, 225, 225);

  const product = component(s, 'Component / Business / Product Summary', 528, 130, 470, 268);
  txt(product, 'Heading', 'PRODUCT SUMMARY / RECORD EXISTS', 16, 13, 438, 12, 'text/secondary', 'Semi Bold');
  txt(product, 'Product and variant', 'Desk Lamp / Slate', 16, 41, 438, 16, 'text/primary', 'Semi Bold');
  field(product, 'Reference', 'PRODUCT REFERENCE', 'SKU-LAMP-42', 16, 79, 210);
  field(product, 'Attribute', 'VARIANT / ATTRIBUTE', 'Slate / standard', 238, 79, 216);
  field(product, 'Source', 'SOURCE', 'Product catalog / observed 10:38', 16, 137, 438);
  txt(product, 'Catalog freshness and stock boundary', 'Catalog: Current. Stock must be checked separately.', 16, 194, 438, 12, 'status/info', 'Semi Bold');
  link(product, 'Product record link', 'Open product record  →', 16, 225, 225);
  const recordRule = box(s, 'DS / Business / Product existence rule', 28, 430, 970, 150, 'surface/subtle', 'border/strong');
  txt(recordRule, 'Rule heading', 'PRODUCT EXISTS ≠ INVENTORY AVAILABLE', 18, 19, 934, 14, 'text/primary', 'Semi Bold');
  txt(recordRule, 'Rule meaning', 'The product card establishes catalog facts. Inventory needs its own observed status before a consequential decision.', 18, 55, 934, 13);
  txt(recordRule, 'Rule next', 'Next: inspect current Inventory Status; do not infer quantity from product existence.', 18, 105, 934, 12, 'text/secondary');

  // Order delivery is an operational provider read, not customer-message transport.
  const orderDeliverySpecs = [
    { state: 'In Transit', source: 'Provider status / observed 10:45', next: 'Next: share qualified status', fg: 'status/info', bg: 'status/info-bg' },
    { state: 'Dependency Unavailable', source: 'Provider status unavailable / no current observation', next: 'Next: check source later; do not infer delivery', fg: 'status/dependency', bg: 'status/dependency-bg' },
  ] as const;
  const orderDeliveries = orderDeliverySpecs.map((spec, i) => {
    const c = component(s, `Example=${spec.state}`, 28 + i * 500, 600, 470, 153, spec.bg);
    stroke(c, spec.fg);
    txt(c, 'Example qualifier', 'DESIGN-SYSTEM EXAMPLE / not a backend enum', 14, 10, 442, 11, 'text/secondary', 'Semi Bold');
    txt(c, 'Order reference', 'ORDER #1042 / logistics delivery', 14, 33, 442, 12, 'text/primary', 'Semi Bold');
    txt(c, 'Order delivery state', spec.state, 14, 58, 442, 14, spec.fg, 'Semi Bold');
    txt(c, 'Order delivery source and freshness', `Source: ${spec.source}`, 14, 91, 442, 12, 'text/secondary');
    txt(c, 'Safe next step', spec.next, 14, 124, 442, 12, 'text/primary');
    return c;
  });
  makeSet('Component / Business / Order Delivery Status', orderDeliveries, 28, 600);

  // Inventory: missing data is never shown as zero, and stale is not conflicting.
  heading('Inventory heading', 'INVENTORY STATUS / quantity, evidence, decision safety', 1080);
  const inventorySpecs = [
    { state: 'Available', quantity: 'Quantity: 8 available', evidence: 'Observed 10:41 / inventory service', safe: 'Decision: current fact; normal checks', next: 'Next: continue authorized flow', fg: 'status/success', bg: 'status/success-bg' },
    { state: 'Zero Stock', quantity: 'Quantity: 0 confirmed', evidence: 'Observed 10:41 / inventory service', safe: 'Decision: no stock available', next: 'Next: do not promise reservation', fg: 'status/warning', bg: 'status/warning-bg' },
    { state: 'Stale', quantity: 'Last seen: 8 / not current', evidence: 'Observed earlier / inventory service', safe: 'Decision: unsafe for mutation', next: 'Next: refresh inventory first', fg: 'status/stale', bg: 'status/stale-bg' },
    { state: 'Dependency Unavailable', quantity: 'Quantity: unavailable (not zero)', evidence: 'Inventory source unavailable', safe: 'Decision: cannot establish stock', next: 'Next: wait / recover source', fg: 'status/dependency', bg: 'status/dependency-bg' },
    { state: 'Conflicting / Revalidation Required', quantity: 'Quantity: conflicting reports', evidence: 'Sources disagree / current state unclear', safe: 'Decision: unsafe for mutation', next: 'Next: revalidate authoritative state', fg: 'status/unknown', bg: 'status/unknown-bg' },
  ] as const;
  const inventory = inventorySpecs.map((spec, i) => {
    const c = component(s, `State=${spec.state}`, 1080 + (i % 3) * 330, 130 + Math.floor(i / 3) * 250, 310, 230, spec.bg);
    stroke(c, spec.fg);
    txt(c, 'Inventory state', spec.state, 14, 13, 282, 13, spec.fg, 'Semi Bold');
    txt(c, 'Quantity or absence', spec.quantity, 14, 48, 282, 14, 'text/primary', 'Semi Bold');
    txt(c, 'Observed source', spec.evidence, 14, 89, 282, 12, 'text/secondary');
    txt(c, 'Decision safety', spec.safe, 14, 137, 282, 12, spec.fg, 'Semi Bold');
    txt(c, 'Safe next step', spec.next, 14, 184, 282, 12, 'text/primary');
    return c;
  });
  makeSet('Component / Business / Inventory Status', inventory, 1080, 130);
  txt(s, 'Inventory distinction', 'Unavailable = no trusted quantity. Zero Stock = known zero. Stale and conflicting facts require different recovery.', 1080, 651, 980, 12, 'text/secondary');

  // An Order can exist with three different independent Reservation results.
  heading('Order heading', 'ORDER SUMMARY / independent Order and Reservation facts', 2130);
  const orderSpecs = [
    { state: 'Confirmed', reservation: 'Confirmed', fg: 'status/success', bg: 'status/success-bg' },
    { state: 'Known Failure', reservation: 'Failed (known)', fg: 'status/error', bg: 'status/error-bg' },
    { state: 'OUTCOME_UNKNOWN', reservation: 'OUTCOME_UNKNOWN', fg: 'status/unknown', bg: 'status/unknown-bg' },
  ] as const;
  const orders = orderSpecs.map((spec, i) => {
    const c = component(s, `Reservation=${spec.state}`, 2130 + i * 330, 130, 310, 276);
    txt(c, 'Heading', 'ORDER SUMMARY / #1042', 14, 12, 282, 12, 'text/secondary', 'Semi Bold');
    txt(c, 'Customer', 'Customer: Amina S.', 14, 40, 282, 13, 'text/primary', 'Semi Bold');
    field(c, 'Order state', 'ORDER STATE', 'Created', 14, 75, 282, 'status/success');
    const reservation = box(c, 'Reservation separate field', 12, 131, 286, 60, spec.bg, spec.fg, 6);
    field(reservation, 'Reservation state', 'RESERVATION STATE', spec.reservation, 10, 7, 266, spec.fg);
    txt(c, 'Source and time', 'Order record / observed 10:43', 14, 207, 282, 12, 'text/secondary');
    link(c, 'Order record link', 'Open Order  →', 14, 239, 156);
    return c;
  });
  makeSet('Component / Business / Order Summary', orders, 2130, 130);
  heading('Order states heading', 'ORDER STATE / no Reservation meaning hidden inside', 2130, 431);
  const orderStateSpecs = [
    ['Created', 'Order record exists', 'Verified in Order source', 'status/success', 'status/success-bg'],
    ['Needs Attention', 'Order needs authorized review', 'Inspect current Order facts', 'status/warning', 'status/warning-bg'],
    ['Stale / Conflict', 'Order facts not decision-safe', 'Refresh / resolve conflict', 'status/stale', 'status/stale-bg'],
  ] as const;
  const orderStates = orderStateSpecs.map(([state, meaning, next, fg, bg], i) => {
    const c = component(s, `State=${state}`, 2130 + i * 330, 461, 310, 172, bg);
    stroke(c, fg);
    txt(c, 'State', state, 14, 14, 282, 14, fg, 'Semi Bold');
    txt(c, 'Meaning', meaning, 14, 54, 282, 13, 'text/primary', 'Semi Bold');
    txt(c, 'Safe next step', next, 14, 106, 282, 12, 'text/secondary');
    return c;
  });
  makeSet('Component / Business / Order State', orderStates, 2130, 461);
  const orderDeliveryComposition = box(s, 'DS / Business / Order + Reservation + Order Delivery', 2130, 651, 970, 102, 'surface/default', 'border/default');
  const orderDeliveryFacts = [
    ['ORDER STATE', 'Created', 'status/success', 'status/success-bg'],
    ['RESERVATION STATE', 'Confirmed', 'status/success', 'status/success-bg'],
    ['ORDER DELIVERY', 'In Transit / example', 'status/info', 'status/info-bg'],
  ] as const;
  orderDeliveryFacts.forEach(([label, value, fg, bg], i) => {
    const fact = box(orderDeliveryComposition, `Business fact / ${label}`, 18 + i * 310, 7, 290, 88, bg, fg, 6);
    field(fact, `Business fact ${label}`, label, value, 12, 10, 266, fg);
  });

  // Business mutation and customer communication never share one status.
  heading('Reservation heading', 'RESERVATION STATE / known failure ≠ uncertain effect', 3180);
  const reservationSpecs = [
    { state: 'Confirmed', effect: 'Inventory reserved', evidence: 'Trusted ref #R-1042 / 10:43', next: 'Next: show confirmed result', fg: 'status/success', bg: 'status/success-bg' },
    { state: 'Known Failure', effect: 'Effect known not completed', evidence: 'Reservation failed; no stock held', next: 'Next: review current inventory', fg: 'status/error', bg: 'status/error-bg' },
    { state: 'OUTCOME_UNKNOWN', effect: 'Effect may have committed', evidence: 'Confirmation unavailable', next: 'Reconcile first; no blind retry', fg: 'status/unknown', bg: 'status/unknown-bg' },
  ] as const;
  const reservations = reservationSpecs.map((spec, i) => {
    const c = component(s, `State=${spec.state}`, 3180 + i * 330, 130, 310, 224, spec.bg);
    stroke(c, spec.fg); c.strokeWeight = spec.state === 'OUTCOME_UNKNOWN' ? 2 : 1;
    txt(c, 'State', spec.state, 14, 14, 282, 13, spec.fg, 'Semi Bold');
    txt(c, 'Business effect', spec.effect, 14, 59, 282, 13, 'text/primary', 'Semi Bold');
    txt(c, 'Evidence or uncertainty', spec.evidence, 14, 108, 282, 12, 'text/secondary');
    txt(c, 'Safe next step', spec.next, 14, 162, 282, 12, spec.fg, 'Semi Bold');
    return c;
  });
  makeSet('Component / Business / Reservation State', reservations, 3180, 130);
  heading('Delivery heading', 'MESSAGE DELIVERY STATUS / customer-message transport only', 3180, 388);
  const deliverySpecs = [
    ['Delivered', 'Message delivered', 'Channel receipt / 10:44', 'status/success', 'status/success-bg'],
    ['Pending / Sending', 'Delivery not yet confirmed', 'Wait for delivery result', 'status/pending', 'status/pending-bg'],
    ['Delivery Failed', 'Message not delivered', 'Recover communication only', 'status/error', 'status/error-bg'],
  ] as const;
  const deliveries = deliverySpecs.map(([state, meaning, next, fg, bg], i) => {
    const c = component(s, `State=${state}`, 3180 + i * 330, 419, 310, 178, bg);
    stroke(c, fg);
    txt(c, 'Message delivery state', state, 14, 14, 282, 13, fg, 'Semi Bold');
    txt(c, 'Communication result', meaning, 14, 59, 282, 13, 'text/primary', 'Semi Bold');
    txt(c, 'Receipt or recovery', next, 14, 111, 282, 12, 'text/secondary');
    return c;
  });
  makeSet('Component / Communication / Message Delivery Status', deliveries, 3180, 419);
  txt(s, 'Delivery rule', 'Message delivery failure does not undo a confirmed reservation. Retry communication only; never replay reserve_inventory.', 3180, 638, 980, 12, 'text/secondary');
  const confirmedDelivery = box(s, 'DS / Business / Confirmed Effect + Message Delivery Failed', 3180, 665, 970, 88, 'surface/default', 'border/default');
  const confirmedEffect = box(confirmedDelivery, 'Business effect separate fact', 14, 10, 455, 68, 'status/success-bg', 'status/success', 6);
  field(confirmedEffect, 'Business effect', 'BUSINESS EFFECT', 'Reservation confirmed', 12, 10, 429, 'status/success');
  const failedDelivery = box(confirmedDelivery, 'Communication separate fact', 501, 10, 455, 68, 'status/error-bg', 'status/error', 6);
  field(failedDelivery, 'Communication', 'COMMUNICATION', 'Message delivery failed', 12, 10, 429, 'status/error');

  // Qualitative freshness; no invented TTL. E02 is a policy restriction, not an effect state.
  heading('Freshness heading', 'FRESHNESS / customer, order, inventory, analytics', 4230);
  const freshnessSpecs = [
    ['Fresh / Current', 'Current verified facts', 'Observed now / trusted source', 'status/success', 'status/success-bg'],
    ['Observed at 10:41', 'Snapshot with observation time', 'Source: Order record', 'status/info', 'status/info-bg'],
    ['Stale', 'Data exists; may be unsafe', 'Refresh before consequential action', 'status/stale', 'status/stale-bg'],
    ['Requires Revalidation', 'Current facts need confirmation', 'Recheck authoritative source', 'status/unknown', 'status/unknown-bg'],
  ] as const;
  const freshness = freshnessSpecs.map(([state, meaning, next, fg, bg], i) => {
    const c = component(s, `State=${state}`, 4230 + (i % 2) * 500, 130 + Math.floor(i / 2) * 166, 470, 150, bg);
    stroke(c, fg);
    txt(c, 'Freshness state', state, 16, 13, 438, 13, fg, 'Semi Bold');
    txt(c, 'Freshness meaning', meaning, 16, 53, 438, 13, 'text/primary');
    txt(c, 'Source or next', next, 16, 99, 438, 12, 'text/secondary');
    return c;
  });
  makeSet('Component / Business / Freshness', freshness, 4230, 130);
  heading('E02 heading', 'E02 RESTRICTED / policy boundary, not an effect outcome', 4230, 480);
  const e02 = component(s, 'Component / Business / E02 Restricted', 4230, 511, 970, 234, 'status/restricted-bg');
  stroke(e02, 'status/restricted');
  txt(e02, 'Restriction heading', 'E02 / AUTOMATIC ORDER UPDATE RESTRICTED', 18, 14, 934, 13, 'status/restricted', 'Semi Bold');
  field(e02, 'Requested change', 'REQUESTED CHANGE', 'Change Order #1042 details', 18, 50, 440);
  field(e02, 'Known Order state', 'CURRENT KNOWN ORDER STATE', 'Created / verified in Order record', 500, 50, 440, 'status/success');
  txt(e02, 'Restriction', 'Restriction: automatic update_order mutation remains unavailable pending policy resolution.', 18, 121, 934, 13, 'text/primary', 'Semi Bold');
  txt(e02, 'Safe next step', 'Next: route to authorized human/policy handling; preserve the known Order state.', 18, 160, 934, 12, 'text/secondary');
  txt(e02, 'Distinct meaning', 'Not Permission Denied, reservation failure, or OUTCOME_UNKNOWN.', 18, 198, 934, 12, 'status/restricted');

  // Small coexistence specimens; no complete Business or Orders screen.
  heading('Composition heading', 'SMALL COMPOSITIONS / independent facts', 5280);
  const partial = box(s, 'DS / Business / Partial Result Composition', 5280, 130, 970, 275, 'surface/default', 'border/default');
  txt(partial, 'Heading', 'PARTIAL RESULT / KNOWN RESERVATION FAILURE', 18, 15, 934, 14, 'text/primary', 'Semi Bold');
  const partialFacts = [
    ['ORDER STATE', 'Created', 'status/success', 'status/success-bg'],
    ['RESERVATION STATE', 'Failed (known)', 'status/error', 'status/error-bg'],
    ['COMMUNICATION', 'Message delivery failed', 'status/error', 'status/error-bg'],
  ] as const;
  partialFacts.forEach(([label, value, fg, bg], i) => {
    const fact = box(partial, `Fact / ${label}`, 18 + i * 310, 53, 290, 89, bg, fg, 6);
    field(fact, `Fact ${label}`, label, value, 12, 10, 266, fg);
  });
  txt(partial, 'Safe step heading', 'NEXT SAFE STEP', 18, 164, 934, 11, 'text/secondary', 'Semi Bold');
  txt(partial, 'Safe step', 'Review current inventory. Choose an authorized recovery.', 18, 186, 934, 13, 'text/primary', 'Semi Bold');
  txt(partial, 'Duplicate protection', 'Do not create the same Order again.', 18, 220, 934, 13, 'status/warning', 'Semi Bold');

  const unknown = box(s, 'DS / Business / Unknown Reservation Composition', 5280, 427, 970, 270, 'surface/default', 'border/default');
  txt(unknown, 'Heading', 'ORDER EXISTS / RESERVATION OUTCOME UNCERTAIN', 18, 15, 934, 14, 'text/primary', 'Semi Bold');
  const unknownFacts = [
    ['ORDER STATE', 'Created', 'status/success', 'status/success-bg'],
    ['RESERVATION STATE', 'OUTCOME_UNKNOWN', 'status/unknown', 'status/unknown-bg'],
    ['FRESHNESS', 'Current Order facts', 'status/info', 'status/info-bg'],
  ] as const;
  unknownFacts.forEach(([label, value, fg, bg], i) => {
    const fact = box(unknown, `Fact / ${label}`, 18 + i * 310, 53, 290, 89, bg, fg, 6);
    field(fact, `Fact ${label}`, label, value, 12, 10, 266, fg);
  });
  txt(unknown, 'Safe step heading', 'NEXT SAFE STEP', 18, 165, 934, 11, 'text/secondary', 'Semi Bold');
  txt(unknown, 'Safe step', 'Reconcile authoritative reservation state before retry.', 18, 187, 934, 13, 'status/unknown', 'Semi Bold');
  txt(unknown, 'No blind retry', 'Effect may have committed; confirmation unavailable. No blind retry.', 18, 222, 934, 12, 'text/secondary');
  txt(s, 'Business library scope', 'Reusable components only. Allow English, Russian and Kazakh label expansion; links keep focus treatment.', 5280, 720, 980, 12, 'text/secondary');
  return [s];
}

export async function buildEscalation(page: PageNode): Promise<FrameNode[]> {
  const s = sectionAt(page, SECTIONS.escalation, 10, 770, 'Queue is triage; Decision Context follows the reviewed six-part hierarchy.');
  s.resize(7370, 770); // Seven bounded specimen lanes; not an application screen.
  const heading = (name: string, value: string, x: number, y = 99): void => {
    txt(s, name, value, x, y, 980, 14, 'text/primary', 'Semi Bold');
  };
  const makeSet = (name: string, variants: ComponentNode[], x: number, y: number): void => {
    const set = figma.combineAsVariants(variants, s);
    set.name = name; set.x = x; set.y = y;
  };
  const fact = (parent: FrameNode | ComponentNode, name: string, value: string, x: number, y: number, w: number, h: number, fg: SemanticName, bg: SemanticName): FrameNode => {
    const n = box(parent, name, x, y, w, h, bg, fg, 6);
    txt(n, 'Meaning', value, 11, 10, w - 22, 12, fg, 'Semi Bold');
    return n;
  };
  const action = (parent: ComponentNode, name: string, value: string, x: number, y: number, w: number, kind: 'primary' | 'secondary' | 'ghost', focused = false): void => {
    const bg: SemanticName = kind === 'primary' ? 'action/primary' : kind === 'secondary' ? 'action/secondary' : 'surface/default';
    const border: SemanticName = focused ? 'focus/ring' : kind === 'primary' ? 'action/primary' : 'border/interactive';
    const b = box(parent, name, x, y, w, 37, bg, border, 6);
    b.strokeWeight = focused ? 2 : 1;
    txt(b, 'Contextual action label', value, 11, 9, w - 22, 12, kind === 'primary' ? 'text/inverse' : 'text/primary', 'Semi Bold');
  };

  // Queue items remain triage summaries; full Decision Context is separate.
  heading('Queue heading', 'ESCALATION QUEUE ITEM / triage only', 28);
  const queueSpecs = [
    { state: 'Waiting Assignment', reason: 'Reservation confirmation unavailable', owner: 'Unassigned / human queue', time: 'Opened 10:43', fg: 'status/waiting-human', bg: 'status/waiting-human-bg' },
    { state: 'Assigned', reason: 'Human decision required', owner: 'Human Operator / assigned', time: 'Assigned 10:47', fg: 'status/info', bg: 'status/info-bg' },
    { state: 'OUTCOME_UNKNOWN / Reconciliation Required', reason: 'Reservation effect uncertain', owner: 'Human Operator / reconcile first', time: 'Observed 10:43', fg: 'status/unknown', bg: 'status/unknown-bg' },
    { state: 'Resume Pending — TARGET M12', reason: 'Decision recorded; revalidation pending', owner: 'Human Operator / no replay', time: 'Not currently implemented', fg: 'status/pending', bg: 'status/pending-bg' },
  ] as const;
  const queue = queueSpecs.map((spec, i) => {
    const c = component(s, `State=${spec.state}`, 28 + (i % 2) * 500, 130 + Math.floor(i / 2) * 230, 470, 213);
    txt(c, 'Escalation reference', 'ESC-204 / Conversation C-42', 15, 13, 440, 12, 'text/primary', 'Semi Bold');
    txt(c, 'Affected object', 'Order #1042 / reservation', 15, 40, 440, 12, 'text/secondary');
    const state = fact(c, 'Queue status marker', spec.state, 13, 69, 444, 40, spec.fg, spec.bg);
    state.strokeWeight = spec.state.startsWith('OUTCOME_UNKNOWN') ? 2 : 1;
    txt(c, 'Reason', `Reason: ${spec.reason}`, 15, 121, 440, 12, 'text/primary');
    txt(c, 'Owner', `Owner: ${spec.owner}`, 15, 151, 440, 12, 'text/secondary');
    txt(c, 'Time or target note', spec.time, 15, 180, 440, 12, spec.state.includes('TARGET') ? 'status/pending' : 'text/secondary', 'Semi Bold');
    return c;
  });
  makeSet('Component / Escalation / Queue Item', queue, 28, 130);
  txt(s, 'Queue scope', 'Queue item = reference, reason, state, owner and age. Open Decision Context for evidence and actions.', 28, 619, 980, 12, 'text/secondary');

  // Distinct blocks correspond to the reviewed Phase 3B hierarchy.
  heading('Evidence heading', 'DECISION CONTEXT BLOCKS / known facts ≠ uncertain effect', 1080);
  const reason = component(s, 'Component / Escalation / Reason', 1080, 130, 970, 122);
  txt(reason, 'Hierarchy label', 'WHY AUTOMATION STOPPED', 16, 15, 938, 12, 'text/secondary', 'Semi Bold');
  txt(reason, 'Specific operational cause', 'Reservation confirmation unavailable after the request.', 16, 48, 938, 14, 'text/primary', 'Semi Bold');
  txt(reason, 'Privacy boundary', 'Operational cause only; no hidden reasoning or raw model trace.', 16, 85, 938, 12, 'text/secondary');

  const confirmed = component(s, 'Component / Escalation / Confirmed Facts', 1080, 273, 970, 170, 'surface/default');
  txt(confirmed, 'Hierarchy label', 'CONFIRMED FACTS / trusted source', 16, 14, 938, 12, 'status/success', 'Semi Bold');
  txt(confirmed, 'Order fact', 'Order #1042 exists / Order record observed 10:43', 16, 46, 938, 13, 'text/primary', 'Semi Bold');
  txt(confirmed, 'Confirmed operation', 'create_order — CONFIRMED / operation ref CO-1042', 16, 82, 938, 13, 'text/primary');
  txt(confirmed, 'Inventory observation', 'Inventory last observed at 10:42 / not a reservation result', 16, 119, 938, 12, 'text/secondary');

  const uncertain = component(s, 'Component / Escalation / Uncertain Effect', 1080, 464, 970, 257, 'status/unknown-bg');
  stroke(uncertain, 'status/unknown'); uncertain.strokeWeight = 2;
  txt(uncertain, 'Hierarchy label', 'UNCERTAIN EFFECT / OUTCOME_UNKNOWN', 17, 15, 936, 13, 'status/unknown', 'Semi Bold');
  txt(uncertain, 'Possible effect', 'Reservation effect may have committed.', 17, 51, 936, 14, 'text/primary', 'Semi Bold');
  txt(uncertain, 'Missing confirmation', 'Confirmation unavailable; this is not a Known Failure.', 17, 88, 936, 13, 'text/primary');
  txt(uncertain, 'Operation reference', 'Operation ref RI-1042 / Order #1042', 17, 127, 936, 12, 'text/secondary');
  txt(uncertain, 'Reconciliation requirement', 'Reconciliation required against authoritative reservation state.', 17, 165, 936, 13, 'status/unknown', 'Semi Bold');
  txt(uncertain, 'No blind retry', 'NO BLIND RETRY / no mutation action here', 17, 205, 936, 13, 'status/unknown', 'Semi Bold');

  heading('Continuation heading', 'CONSTRAINTS + ONE NEXT SAFE STEP', 2130);
  const constraints = component(s, 'Component / Escalation / Constraints', 2130, 130, 970, 175, 'surface/subtle');
  txt(constraints, 'Hierarchy label', 'CONSTRAINTS / independent safety boundaries', 16, 14, 938, 12, 'text/secondary', 'Semi Bold');
  txt(constraints, 'Unknown effect constraint', 'OUTCOME_UNKNOWN: do not retry reservation before reconciliation.', 16, 48, 938, 13, 'status/unknown', 'Semi Bold');
  txt(constraints, 'Authorization constraint', 'Recheck current authorization before any continuation.', 16, 88, 938, 13, 'text/primary');
  txt(constraints, 'E02 constraint', 'E02: automatic update_order remains restricted by policy.', 16, 128, 938, 13, 'status/restricted');

  const safeSpecs = [
    ['Reconcile', 'Reconcile authoritative reservation state', 'Before any reservation retry', 'status/unknown', 'status/unknown-bg'],
    ['Refresh', 'Refresh stale business facts', 'Before consequential action', 'status/stale', 'status/stale-bg'],
    ['Clarify', 'Request customer clarification', 'When required facts are missing', 'status/info', 'status/info-bg'],
    ['Human / Policy', 'Route to authorized human/policy handling', 'E02 stays restricted', 'status/restricted', 'status/restricted-bg'],
  ] as const;
  const safeSteps = safeSpecs.map(([state, next, precondition, fg, bg], i) => {
    const c = component(s, `Step=${state}`, 2130 + (i % 2) * 500, 340 + Math.floor(i / 2) * 166, 470, 150, bg);
    stroke(c, fg);
    txt(c, 'Hierarchy label', 'NEXT SAFE STEP', 15, 13, 438, 11, fg, 'Semi Bold');
    txt(c, 'Single action', next, 15, 48, 438, 14, 'text/primary', 'Semi Bold');
    txt(c, 'Precondition', precondition, 15, 104, 438, 12, 'text/secondary');
    return c;
  });
  makeSet('Component / Escalation / Next Safe Step', safeSteps, 2130, 340);
  txt(s, 'Safe step rule', 'One action per state; the next step is not blanket permission to resume or replay a write.', 2130, 690, 980, 12, 'text/secondary');

  heading('Decision heading', 'HUMAN DECISION / named object, contextual actions', 3180);
  const decision = component(s, 'Component / Escalation / Human Decision Panel', 3180, 130, 970, 292);
  txt(decision, 'Hierarchy label', 'HUMAN DECISION / proposed continuation', 16, 14, 938, 13, 'text/primary', 'Semi Bold');
  txt(decision, 'Proposal summary', 'Decision D-204: reconcile reservation, then review authorized continuation.', 16, 49, 938, 13, 'text/primary');
  txt(decision, 'Decision scope', 'Human Operator / Order #1042 / no permissions transferred', 16, 84, 938, 12, 'text/secondary');
  action(decision, 'Primary decision / focus', 'Approve proposed continuation', 16, 126, 270, 'primary', true);
  action(decision, 'Secondary decision', 'Reject proposed continuation', 298, 126, 270, 'secondary');
  action(decision, 'Clarification action', 'Request clarification', 580, 126, 210, 'ghost');
  const resumeAction = box(decision, 'TARGET M12 resume request / unavailable', 16, 179, 318, 37, 'surface/subtle', 'border/default', 6);
  txt(resumeAction, 'Contextual action label', 'Revalidate → Resume request', 11, 9, 296, 12, 'text/secondary', 'Semi Bold');
  action(decision, 'Close action', 'Close escalation', 346, 179, 197, 'ghost');
  txt(decision, 'Resume availability', 'TARGET M12 / not currently implemented. A decision alone never resumes a mutation.', 16, 234, 938, 12, 'status/pending', 'Semi Bold');
  txt(decision, 'Button hierarchy rule', 'One Primary; Secondary and Ghost actions stay subordinate. Backend checks remain required.', 16, 263, 938, 12, 'text/secondary');

  const warning = component(s, 'Component / Escalation / Reconciliation Warning', 3180, 447, 970, 253, 'status/unknown-bg');
  stroke(warning, 'status/unknown'); warning.strokeWeight = 2;
  txt(warning, 'Warning heading', 'OUTCOME UNCERTAIN / not a normal Error', 17, 15, 936, 14, 'status/unknown', 'Semi Bold');
  txt(warning, 'Possible effect', 'Effect may already exist. Reservation may have committed.', 17, 53, 936, 13, 'text/primary', 'Semi Bold');
  txt(warning, 'Missing result', 'Confirmation unavailable / operation RI-1042 / Order #1042', 17, 91, 936, 12, 'text/secondary');
  txt(warning, 'Required action', 'Reconciliation required against authoritative state.', 17, 132, 936, 13, 'status/unknown', 'Semi Bold');
  txt(warning, 'Prohibited action', 'Do not retry mutation or issue a new operation key blindly.', 17, 174, 936, 13, 'status/unknown', 'Semi Bold');
  txt(warning, 'Meaning', 'This is not a confirmed failure; preserve the operation reference and context.', 17, 214, 936, 12, 'text/secondary');

  heading('Guard heading', 'RESUME GUARDS / stale, authorization and E02 remain distinct', 4230);
  const resume = component(s, 'Component / Escalation / Resume Revalidation', 4230, 130, 970, 275, 'status/pending-bg');
  stroke(resume, 'status/pending');
  txt(resume, 'Target annotation', 'TARGET M12 / Not currently implemented / No mutation replay', 16, 13, 938, 13, 'status/pending', 'Semi Bold');
  txt(resume, 'Sequence heading', 'Human decision → Revalidation → Controlled Resume request', 16, 45, 938, 14, 'text/primary', 'Semi Bold');
  const resumeStages = [
    ['1 / HUMAN DECISION', 'Named operator decision recorded'],
    ['2 / REVALIDATION', 'Authorization + current state + revisions checked'],
    ['3 / CONTROLLED REQUEST', 'New bounded request only after guards pass'],
  ] as const;
  resumeStages.forEach(([label, value], i) => {
    const stage = box(resume, `Stage / ${label}`, 16 + i * 310, 87, 290, 105, 'surface/default', 'border/default', 6);
    txt(stage, 'Stage label', label, 12, 13, 266, 12, 'status/pending', 'Semi Bold');
    txt(stage, 'Stage meaning', value, 12, 47, 266, 12, 'text/primary');
  });
  txt(resume, 'Resume boundary', 'A click must not immediately replay create_order, reserve_inventory or update_order.', 16, 217, 938, 12, 'text/primary', 'Semi Bold');
  txt(resume, 'Implementation boundary', 'Current UX is a design target; durable resume is not evidenced as implemented.', 16, 244, 938, 12, 'text/secondary');

  const stale = component(s, 'Component / Escalation / Stale Context', 4230, 426, 470, 135, 'status/stale-bg');
  stroke(stale, 'status/stale');
  txt(stale, 'State', 'STALE CONTEXT / data exists', 15, 13, 438, 13, 'status/stale', 'Semi Bold');
  txt(stale, 'Meaning', 'Order facts observed earlier; not decision-safe now.', 15, 51, 438, 12, 'text/primary');
  txt(stale, 'Next', 'Next: refresh and revalidate before action.', 15, 92, 438, 12, 'text/secondary');

  const auth = component(s, 'Component / Escalation / Authorization Changed', 4730, 426, 470, 135, 'surface/subtle');
  stroke(auth, 'border/strong');
  txt(auth, 'State', 'AUTHORIZATION CHANGED / recheck required', 15, 13, 438, 13, 'text/primary', 'Semi Bold');
  txt(auth, 'Meaning', 'Earlier permission assumptions are no longer enough.', 15, 51, 438, 12, 'text/primary');
  txt(auth, 'Next', 'Next: check current principal and scope again.', 15, 92, 438, 12, 'text/secondary');

  const e02 = component(s, 'Component / Escalation / E02 Restricted', 4230, 581, 970, 164, 'status/restricted-bg');
  stroke(e02, 'status/restricted');
  txt(e02, 'Restriction heading', 'E02 / AUTOMATIC ORDER UPDATE RESTRICTED', 16, 13, 938, 13, 'status/restricted', 'Semi Bold');
  txt(e02, 'Requested update', 'Requested: change Order #1042 details', 16, 47, 445, 12, 'text/primary');
  txt(e02, 'Current known state', 'Known Order state: Created / verified', 493, 47, 445, 12, 'status/success');
  txt(e02, 'Restriction', 'update_order automatic mutation unavailable pending policy resolution.', 16, 85, 938, 13, 'text/primary', 'Semi Bold');
  txt(e02, 'Next', 'Next: authorized human/policy handling. Not OUTCOME_UNKNOWN, reservation failure, Permission Denied, or success.', 16, 124, 938, 12, 'text/secondary');

  heading('Hierarchy heading', 'DECISION CONTEXT / approved six-part hierarchy', 5280);
  const context = component(s, 'Component / Escalation / Decision Block', 5280, 130, 970, 604);
  txt(context, 'Specimen label', 'DESIGN-SYSTEM COMPOSITION / reservation OUTCOME_UNKNOWN', 16, 12, 938, 12, 'text/secondary', 'Semi Bold');
  const hierarchy = [
    ['WHY AUTOMATION STOPPED', 'Reservation confirmation unavailable after request.', 'text/primary', 'surface/subtle'],
    ['CONFIRMED FACTS', 'Order #1042 exists / create_order confirmed / source 10:43.', 'status/success', 'status/success-bg'],
    ['UNCERTAIN EFFECT', 'Reservation may have committed; operation RI-1042 unconfirmed.', 'status/unknown', 'status/unknown-bg'],
    ['CONSTRAINTS', 'No blind retry; recheck authorization; E02 remains separate.', 'status/restricted', 'status/restricted-bg'],
    ['NEXT SAFE STEP', 'Reconcile authoritative reservation state first.', 'status/unknown', 'status/unknown-bg'],
    ['HUMAN DECISION', 'Review named proposed continuation after verified facts.', 'status/waiting-human', 'status/waiting-human-bg'],
  ] as const;
  hierarchy.forEach(([label, value, fg, bg], i) => {
    const block = box(context, `Hierarchy / ${label}`, 16, 43 + i * 91, 938, 77, bg, fg, 6);
    txt(block, 'Hierarchy label', `${i + 1}. ${label}`, 13, 9, 910, 12, fg, 'Semi Bold');
    txt(block, 'Hierarchy value', value, 13, 37, 910, 12, 'text/primary');
  });

  heading('Specimens heading', 'SMALL COMPOSITIONS / safe coexistence, not a screen', 6330);
  const compositionSpecs = [
    { name: 'A / Unknown → Reconciliation → Human Decision', values: [
      ['OUTCOME_UNKNOWN / possible commit', 'status/unknown', 'status/unknown-bg'],
      ['Reconcile authoritative state', 'status/unknown', 'status/unknown-bg'],
      ['Human Decision / named proposal', 'status/waiting-human', 'status/waiting-human-bg'],
    ], footer: 'No mutation retry before reconciliation.' },
    { name: 'B / Stale Context → Refresh', values: [
      ['STALE CONTEXT / old facts exist', 'status/stale', 'status/stale-bg'],
      ['Refresh + revalidate current facts', 'status/info', 'status/info-bg'],
      ['Consequential action waits', 'text/secondary', 'surface/subtle'],
    ], footer: 'Stale is not missing data or confirmed denial.' },
    { name: 'C / E02 → Human/Policy', values: [
      ['E02 / update_order restricted', 'status/restricted', 'status/restricted-bg'],
      ['Known Order state: Created', 'status/success', 'status/success-bg'],
      ['Authorized human/policy handling', 'status/waiting-human', 'status/waiting-human-bg'],
    ], footer: 'No successful automatic update is implied.' },
    { name: 'D / Resume Pending — TARGET M12', values: [
      ['TARGET M12 / not implemented', 'status/pending', 'status/pending-bg'],
      ['Human decision → revalidation', 'status/info', 'status/info-bg'],
      ['Controlled Resume request / no replay', 'status/pending', 'status/pending-bg'],
    ], footer: 'Authorization, state and revision checks first.' },
  ] as const;
  compositionSpecs.forEach((spec, i) => {
    const c = box(s, `DS / Escalation / Composition / ${spec.name}`, 6330 + (i % 2) * 500, 130 + Math.floor(i / 2) * 290, 470, 272, 'surface/default', 'border/default', 8);
    txt(c, 'Composition title', spec.name, 14, 13, 442, 13, 'text/primary', 'Semi Bold');
    spec.values.forEach(([value, fg, bg], j) => fact(c, `Stage ${j + 1}`, value, 14, 47 + j * 56, 442, 48, fg, bg));
    txt(c, 'Safety footer', spec.footer, 14, 229, 442, 12, 'text/secondary');
  });
  txt(s, 'Escalation library scope', 'Components only. Labels may wrap in English, Russian or Kazakh; focus and permission checks remain explicit.', 6330, 718, 980, 12, 'text/secondary');
  return [s];
}

export async function buildAnalyticsForecast(page: PageNode): Promise<FrameNode[]> {
  const a = sectionAt(page, SECTIONS.analytics, 11, 780, 'Historical observed data only; unavailable is not zero.');
  const f = sectionAt(page, SECTIONS.forecast, 12, 880, 'Prediction is separate, conditional TARGET UX; current engineering state is MODEL_NOT_READY.');
  a.resize(6320, 780);
  f.resize(7370, 880);
  const heading = (parent: FrameNode, name: string, value: string, x: number, y = 99): void => {
    txt(parent, name, value, x, y, 980, 14, 'text/primary', 'Semi Bold');
  };
  const makeSet = (parent: FrameNode, name: string, variants: ComponentNode[], x: number, y: number): void => {
    const set = figma.combineAsVariants(variants, parent);
    set.name = name; set.x = x; set.y = y;
  };
  const line = (parent: FrameNode | ComponentNode, name: string, x1: number, y1: number, x2: number, y2: number, color: SemanticName, thickness = 3): FrameNode => {
    const dx = x2 - x1, dy = y2 - y1;
    const length = Math.hypot(dx, dy);
    if (length === 0) throw new Error(`Zero-length chart segment: ${name}`);
    const segment = box(parent, name, x1, y1, length, thickness, color, 'border/default', 0);
    segment.strokes = [];
    // Place the rectangle's centerline exactly between chart points. Figma's
    // rotation angle has the opposite sign from screen-space atan2(dy, dx).
    const cos = dx / length, sin = dy / length;
    segment.relativeTransform = [
      [cos, -sin, x1 + sin * thickness / 2],
      [sin, cos, y1 - cos * thickness / 2],
    ];
    return segment;
  };
  const join = (parent: ComponentNode, name: string, x: number, y: number): void => {
    const dot = box(parent, name, x - 3, y - 3, 6, 6, 'chart/actual', 'border/default', 3);
    dot.strokes = [];
  };

  // Historical Analytics only: compact metrics and controls.
  heading(a, 'KPI heading', 'HISTORICAL KPI / design-system examples, not metric requirements', 28);
  const kpiSpecs = [
    ['Orders', '24', 'orders', 'Complete'],
    ['Confirmed order value', '1,240', 'currency units', 'Observed'],
    ['Average order value', '52', 'currency units/order', 'Incomplete'],
  ] as const;
  const kpis = kpiSpecs.map(([metric, value, unit, coverage], i) => {
    const c = component(a, `Metric=${metric}`, 28 + i * 330, 130, 310, 206);
    txt(c, 'Sample qualifier', 'EXAMPLE / not live data', 14, 11, 282, 11, 'text/secondary', 'Semi Bold');
    txt(c, 'Metric name', metric, 14, 39, 282, 14, 'text/primary', 'Semi Bold');
    txt(c, 'Observed value', value, 14, 75, 282, 24, 'text/primary', 'Semi Bold');
    txt(c, 'Unit', unit, 14, 113, 282, 12, 'text/secondary');
    txt(c, 'Period', 'Historical period: May', 14, 140, 282, 12, 'text/secondary');
    txt(c, 'Source and completeness', `Source: report / ${coverage} / observed 10:42`, 14, 168, 282, 12, coverage === 'Incomplete' ? 'status/warning' : 'text/secondary');
    return c;
  });
  makeSet(a, 'Component / Analytics / KPI', kpis, 28, 130);

  heading(a, 'Period heading', 'PERIOD SELECTOR / clear scope and visible focus', 28, 365);
  const periodSpecs = [
    ['Default', 'May / selected', 'Monthly', false],
    ['Focus', 'May / selected', 'Monthly', true],
  ] as const;
  const periods = periodSpecs.map(([state, period, granularity, focused], i) => {
    const c = component(a, `State=${state}`, 28 + i * 500, 398, 470, 202);
    txt(c, 'Field label', 'HISTORICAL PERIOD', 16, 15, 438, 12, 'text/secondary', 'Semi Bold');
    const selector = box(c, 'Period control', 14, 46, 442, 53, 'surface/default', focused ? 'focus/ring' : 'border/interactive', 6);
    selector.strokeWeight = focused ? 2 : 1;
    txt(selector, 'Selected period', period, 12, 15, 355, 14, 'text/primary', 'Semi Bold');
    txt(selector, 'Disclosure affordance', '▾', 402, 14, 24, 16, 'text/primary', 'Semi Bold');
    txt(c, 'Granularity label', `Granularity: ${granularity}`, 16, 117, 438, 13, 'text/primary');
    txt(c, 'Scope helper', 'Selected past period only; no forecast query here.', 16, 154, 438, 12, 'text/secondary');
    return c;
  });
  makeSet(a, 'Component / Analytics / Period Selector', periods, 28, 398);

  // Freshness is qualitative; completeness distinguishes partial from zero.
  heading(a, 'Quality heading', 'FRESHNESS + COMPLETENESS / independent facts', 1080);
  const freshnessSpecs = [
    ['Current', 'Current observed snapshot', 'status/success', 'status/success-bg'],
    ['Observed at 10:42', 'Source time visible', 'status/info', 'status/info-bg'],
    ['Stale', 'Data exists; refresh before current decision', 'status/stale', 'status/stale-bg'],
    ['Requires Refresh', 'Recheck trusted source', 'status/warning', 'status/warning-bg'],
  ] as const;
  const freshness = freshnessSpecs.map(([state, meaning, fg, bg], i) => {
    const c = component(a, `State=${state}`, 1080 + (i % 2) * 500, 130 + Math.floor(i / 2) * 160, 470, 145, bg);
    stroke(c, fg);
    txt(c, 'Freshness state', state, 15, 15, 440, 14, fg, 'Semi Bold');
    txt(c, 'Freshness meaning', meaning, 15, 56, 440, 12, 'text/primary');
    txt(c, 'Source note', 'Historical report / no invented TTL', 15, 105, 440, 12, 'text/secondary');
    return c;
  });
  makeSet(a, 'Component / Analytics / Freshness', freshness, 1080, 130);
  const completenessSpecs = [
    ['Complete', 'Source coverage complete', 'status/success', 'status/success-bg'],
    ['Incomplete', 'Partial coverage ≠ zero activity', 'status/warning', 'status/warning-bg'],
    ['Unavailable', 'No trusted result; do not show zero', 'status/dependency', 'status/dependency-bg'],
  ] as const;
  const completeness = completenessSpecs.map(([state, meaning, fg, bg], i) => {
    const c = component(a, `State=${state}`, 1080 + i * 330, 476, 310, 170, bg);
    stroke(c, fg);
    txt(c, 'Completeness state', state, 14, 15, 282, 13, fg, 'Semi Bold');
    txt(c, 'Meaning', meaning, 14, 56, 282, 12, 'text/primary');
    txt(c, 'Decision note', state === 'Complete' ? 'Use within declared scope.' : 'Investigate coverage before conclusion.', 14, 115, 282, 12, 'text/secondary');
    return c;
  });
  makeSet(a, 'Component / Analytics / Completeness', completeness, 1080, 476);

  heading(a, 'Chart heading', 'HISTORICAL CHART / ACTUAL solid; gaps never become zero', 2130);
  const chartSpecs = [
    ['Valid Historical Data', 'ACTUAL / observed series', 'Observed 10:42 / complete'],
    ['Missing-data Gap', 'Missing period / unavailable observation', 'Observed 10:42 / gap'],
    ['Incomplete Data', 'Partial source coverage; totals may change', 'Observed 10:42 / incomplete'],
    ['Stale Data', 'Stale snapshot; refresh before current decision', 'Earlier observation / stale'],
  ] as const;
  const charts = chartSpecs.map(([state, annotation, source], i) => {
    const c = component(a, `State=${state}`, 2130 + (i % 2) * 500, 130 + Math.floor(i / 2) * 284, 470, 264);
    txt(c, 'Chart title', 'Historical orders / example', 14, 12, 442, 13, 'text/primary', 'Semi Bold');
    txt(c, 'Period and state', `Past periods / ${state}`, 14, 37, 442, 12, state === 'Stale Data' ? 'status/stale' : 'text/secondary');
    line(c, 'Y axis / observed values', 45, 70, 45, 194, 'chart/grid', 2);
    line(c, 'X axis / past periods', 45, 194, 440, 194, 'chart/grid', 2);
    txt(c, 'Y axis label', 'Value', 12, 72, 32, 11, 'text/secondary');
    txt(c, 'X axis label', 'Past periods →', 334, 201, 120, 11, 'text/secondary');
    const points = [[62, 168], [143, 142], [226, 151], [318, 103], [422, 112]] as const;
    for (let j = 0; j < points.length - 1; j++) {
      if (state === 'Missing-data Gap' && (j === 1 || j === 2)) continue;
      line(c, `ACTUAL / solid segment ${j + 1}`, points[j][0], points[j][1], points[j + 1][0], points[j + 1][1], 'chart/actual');
    }
    if (state === 'Missing-data Gap') {
      const gap = box(c, 'Missing observation / visible gap', 194, 83, 64, 86, 'surface/subtle', 'status/warning', 4);
      txt(gap, 'Gap label', 'MISSING', 6, 34, 52, 11, 'status/warning', 'Semi Bold');
    } else {
      for (let j = 1; j < points.length - 1; j++) join(c, `ACTUAL / continuous joint ${j}`, points[j][0], points[j][1]);
    }
    txt(c, 'Annotation', annotation, 54, 174, 365, 11, state === 'Stale Data' ? 'status/stale' : state === 'Incomplete Data' || state === 'Missing-data Gap' ? 'status/warning' : 'text/secondary');
    txt(c, 'Actual legend', 'ACTUAL ━ solid / observed only', 14, 225, 244, 11, 'chart/actual', 'Semi Bold');
    txt(c, 'Source and freshness', source, 259, 225, 196, 11, 'text/secondary');
    return c;
  });
  makeSet(a, 'Component / Analytics / Historical Chart', charts, 2130, 130);

  heading(a, 'Table heading', 'DATA TABLE / observed rows plus valid empty treatment', 3180);
  const table = component(a, 'Component / Analytics / Data Table', 3180, 130, 970, 430);
  txt(table, 'Table title', 'Historical order summary / example only', 16, 14, 938, 14, 'text/primary', 'Semi Bold');
  txt(table, 'Table context', 'Period: past month / source: report / observed 10:42', 16, 45, 938, 12, 'text/secondary');
  const header = box(table, 'Header row', 14, 79, 942, 42, 'surface/subtle', 'border/default', 4);
  ['Period', 'Orders (count)', 'Value (currency units)', 'Coverage'].forEach((value, i) => txt(header, `Column ${i + 1}`, value, 12 + i * 230, 13, 220, 12, 'text/primary', 'Semi Bold'));
  const rows = [
    ['Week A', '8', '420', 'Complete'],
    ['Week B', '10', '510', 'Complete'],
    ['Week C', '6', '310', 'Incomplete'],
  ] as const;
  rows.forEach((values, i) => {
    const row = box(table, `Observed row ${i + 1}`, 14, 129 + i * 51, 942, 44, 'surface/default', 'border/default', 4);
    values.forEach((value, j) => txt(row, `Cell ${j + 1}`, value, 12 + j * 230, 12, 220, 12, j === 3 && value === 'Incomplete' ? 'status/warning' : 'text/primary'));
  });
  const emptyTable = box(table, 'Valid empty table treatment', 14, 297, 942, 87, 'surface/subtle', 'border/default', 6);
  txt(emptyTable, 'Empty label', 'ALTERNATE VALID EMPTY STATE / query succeeded', 14, 13, 912, 12, 'status/info', 'Semi Bold');
  txt(emptyTable, 'Empty meaning', 'No records in the selected historical scope. This is not a source outage.', 14, 44, 912, 12, 'text/primary');
  txt(table, 'Table note', 'Missing cells use an explicit unavailable annotation, never an invented zero.', 16, 400, 938, 12, 'text/secondary');

  heading(a, 'Analytics states heading', 'ANALYTICS STATES / empty, partial, stale, unavailable, denied', 4230);
  const analyticsStates = [
    ['Valid Empty', 'Query succeeded; no records for this period.', 'Not a source failure.', 'status/info', 'status/info-bg'],
    ['Incomplete', 'Some observed data is present; coverage partial.', 'Do not claim a complete total or zero activity.', 'status/warning', 'status/warning-bg'],
    ['Stale', 'Historical snapshot exists but may be old.', 'Refresh before current decision.', 'status/stale', 'status/stale-bg'],
    ['Dependency Unavailable', 'Trusted report source unavailable.', 'No data; never render zero activity.', 'status/dependency', 'status/dependency-bg'],
    ['Permission Denied', 'Current principal lacks report access.', 'Request authorized access; do not expose data.', 'status/restricted', 'status/restricted-bg'],
  ] as const;
  analyticsStates.forEach(([state, meaning, next, fg, bg], i) => {
    const c = component(a, `Component / Analytics / ${state}`, 4230 + (i % 2) * 500, 130 + Math.floor(i / 2) * 190, 470, 173, bg);
    stroke(c, fg);
    txt(c, 'State name', state.toUpperCase(), 15, 14, 440, 13, fg, 'Semi Bold');
    txt(c, 'Meaning', meaning, 15, 55, 440, 12, 'text/primary');
    txt(c, 'Next or distinction', next, 15, 111, 440, 12, 'text/secondary');
  });

  heading(a, 'Relationship heading', 'ANALYTICS → FORECAST / conceptual boundary', 5280);
  const relation = box(a, 'DS / Analytics / Historical to Forecast Request', 5280, 130, 970, 242, 'surface/default', 'border/default');
  const historical = box(relation, 'Historical Analytics', 16, 49, 428, 118, 'surface/subtle', 'border/default', 6);
  txt(historical, 'Title', 'HISTORICAL ANALYTICS', 14, 14, 400, 13, 'chart/actual', 'Semi Bold');
  txt(historical, 'Meaning', 'Observed ACTUAL values only', 14, 51, 400, 13, 'text/primary');
  const request = box(relation, 'Request Forecast', 526, 49, 428, 118, 'status/pending-bg', 'status/pending', 6);
  txt(request, 'Title', 'REQUEST FORECAST / TARGET UX', 14, 14, 400, 13, 'status/pending', 'Semi Bold');
  txt(request, 'Meaning', 'Separate future prediction request', 14, 51, 400, 13, 'text/primary');
  txt(relation, 'Boundary arrow', '→', 466, 93, 36, 18, 'text/primary', 'Semi Bold');
  txt(relation, 'Boundary note', 'The Analytics result never contains a Predicted series. Forecast output requires separate eligibility and provenance.', 16, 190, 938, 12, 'text/secondary');

  // Forecast lane 1: request facts and the last-observed/future boundary.
  heading(f, 'Request heading', 'FORECAST REQUEST / conditional TARGET UX', 28);
  const requestSummary = component(f, 'Component / Forecast / Request Summary', 28, 130, 970, 212);
  txt(requestSummary, 'Target annotation', 'TARGET PRODUCT UX / request example, not a completed run', 16, 13, 938, 12, 'status/pending', 'Semi Bold');
  const requestFields = [
    ['TARGET', 'Configured sales series'], ['SCOPE', 'Authorized business'],
    ['CUTOFF', 'After last observed period'], ['HORIZON', 'Requested span / validate'],
  ] as const;
  requestFields.forEach(([label, value], i) => {
    const field = box(requestSummary, `Request field / ${label}`, 16 + (i % 2) * 475, 45 + Math.floor(i / 2) * 70, 455, 62, 'surface/subtle', 'border/default', 6);
    txt(field, 'Field label', label, 12, 8, 429, 11, 'text/secondary', 'Semi Bold');
    txt(field, 'Field value', value, 12, 30, 429, 13, 'text/primary');
  });
  txt(requestSummary, 'Eligibility', 'Eligibility: validate history, horizon, permission and model readiness before producing a result.', 16, 186, 938, 12, 'text/secondary');

  const target = component(f, 'Component / Forecast / Target', 28, 374, 310, 185);
  txt(target, 'Heading', 'TARGET', 14, 13, 282, 12, 'text/secondary', 'Semi Bold');
  txt(target, 'Value', 'Configured sales series', 14, 49, 282, 14, 'text/primary', 'Semi Bold');
  txt(target, 'Rule', 'Approved definition + unit required.', 14, 106, 282, 12, 'text/secondary');
  txt(target, 'Scope', 'No invented metric contract.', 14, 145, 282, 12, 'text/secondary');

  const cutoff = component(f, 'Component / Forecast / Cutoff', 358, 374, 310, 185);
  txt(cutoff, 'Heading', 'CUTOFF', 14, 13, 282, 12, 'text/secondary', 'Semi Bold');
  line(cutoff, 'CUTOFF / vertical boundary', 155, 42, 155, 118, 'border/interactive', 2);
  txt(cutoff, 'Historical side', 'ACTUAL / last observed', 14, 128, 141, 11, 'chart/actual', 'Semi Bold');
  txt(cutoff, 'Future side', 'Future starts after', 164, 128, 132, 11, 'chart/predicted', 'Semi Bold');
  txt(cutoff, 'Boundary rule', 'No predicted point before cutoff.', 14, 155, 282, 11, 'text/secondary');

  const horizon = component(f, 'Component / Forecast / Horizon', 688, 374, 310, 185);
  txt(horizon, 'Heading', 'HORIZON', 14, 13, 282, 12, 'text/secondary', 'Semi Bold');
  txt(horizon, 'Requested span', 'Requested future span', 14, 49, 282, 14, 'text/primary', 'Semi Bold');
  txt(horizon, 'Eligibility', 'Validate supported horizon.', 14, 106, 282, 12, 'status/pending');
  txt(horizon, 'Boundary', 'No default support promise.', 14, 145, 282, 12, 'text/secondary');
  txt(f, 'Request scope note', 'Request components describe inputs only; they do not trigger model training or imply a result.', 28, 590, 970, 12, 'text/secondary');

  // Lane 2: solid ACTUAL, explicit cutoff, dashed PREDICTED (illustrative target only).
  heading(f, 'Forecast chart heading', 'ACTUAL vs PREDICTED / structure + line style + labels', 1080);
  const forecastChart = component(f, 'Component / Forecast / Actual vs Predicted Chart', 1080, 130, 970, 420);
  txt(forecastChart, 'Target annotation', 'TARGET PRODUCT UX / illustrative series only; not produced in current state', 16, 13, 938, 12, 'status/pending', 'Semi Bold');
  txt(forecastChart, 'Chart title', 'Configured target / historical to future', 16, 43, 938, 14, 'text/primary', 'Semi Bold');
  line(forecastChart, 'X axis / past to future', 58, 305, 917, 305, 'chart/grid', 2);
  line(forecastChart, 'Y axis / target unit', 58, 89, 58, 305, 'chart/grid', 2);
  txt(forecastChart, 'Y axis label', 'Target unit', 18, 84, 97, 11, 'text/secondary');
  const historicalPoints = [[90, 270], [188, 239], [283, 251], [381, 198], [505, 211]] as const;
  for (let i = 0; i < historicalPoints.length - 1; i++) {
    line(forecastChart, `ACTUAL / solid segment ${i + 1}`, historicalPoints[i][0], historicalPoints[i][1], historicalPoints[i + 1][0], historicalPoints[i + 1][1], 'chart/actual');
  }
  for (let i = 1; i < historicalPoints.length - 1; i++) join(forecastChart, `ACTUAL / continuous joint ${i}`, historicalPoints[i][0], historicalPoints[i][1]);
  line(forecastChart, 'CUTOFF / vertical marker', 505, 90, 505, 305, 'border/interactive', 2);
  txt(forecastChart, 'Cutoff label', 'CUTOFF / last observed', 430, 68, 184, 11, 'text/primary', 'Semi Bold');
  for (let i = 0; i < 11; i++) {
    line(forecastChart, `PREDICTED / dash ${i + 1}`, 530 + i * 33, 205 - i * 5, 549 + i * 33, 202 - i * 5, 'chart/predicted');
  }
  txt(forecastChart, 'Past axis label', 'PAST / observed', 90, 316, 225, 12, 'chart/actual', 'Semi Bold');
  txt(forecastChart, 'Future axis label', 'FUTURE / predicted', 627, 316, 250, 12, 'chart/predicted', 'Semi Bold');
  txt(forecastChart, 'Actual legend', 'ACTUAL — solid line', 16, 359, 250, 12, 'chart/actual', 'Semi Bold');
  txt(forecastChart, 'Predicted legend', 'PREDICTED - dashed line', 290, 359, 280, 12, 'chart/predicted', 'Semi Bold');
  txt(forecastChart, 'Chart caveat', 'Missing history is a visible gap, not a zero point. No numeric forecast is claimed here.', 16, 392, 938, 12, 'text/secondary');

  const actualSeries = component(f, 'Component / Forecast / Actual Series', 1080, 581, 470, 157);
  txt(actualSeries, 'Series title', 'ACTUAL / historical observed', 15, 14, 438, 13, 'chart/actual', 'Semi Bold');
  line(actualSeries, 'ACTUAL / solid line', 16, 69, 438, 69, 'chart/actual');
  txt(actualSeries, 'Series meaning', 'Solid line / past side of cutoff', 15, 108, 438, 12, 'text/secondary');
  const predictedSeries = component(f, 'Component / Forecast / Predicted Series', 1580, 581, 470, 157, 'status/pending-bg');
  txt(predictedSeries, 'Series title', 'PREDICTED / TARGET PRODUCT UX', 15, 14, 438, 13, 'chart/predicted', 'Semi Bold');
  for (let i = 0; i < 11; i++) line(predictedSeries, `PREDICTED / dash ${i + 1}`, 16 + i * 39, 69, 37 + i * 39, 69, 'chart/predicted');
  txt(predictedSeries, 'Series meaning', 'Dashed line / future side of cutoff only', 15, 108, 438, 12, 'text/secondary');
  txt(f, 'Forecast chart scope', 'Line style, label and position preserve meaning in grayscale and with color-vision limitations.', 1080, 772, 970, 12, 'text/secondary');

  // Provenance and caveats are conditional on a real, eligible run.
  heading(f, 'Evidence heading', 'PROVENANCE + LIMITATIONS / no invented model evidence', 2130);
  const provenance = component(f, 'Component / Forecast / Provenance', 2130, 130, 470, 246);
  txt(provenance, 'Heading', 'PROVENANCE / when a real run exists', 15, 14, 438, 13, 'text/primary', 'Semi Bold');
  txt(provenance, 'Source', 'Data source: authorized historical series', 15, 50, 438, 12);
  txt(provenance, 'Run reference', 'Forecast run ref: supplied by execution', 15, 86, 438, 12);
  txt(provenance, 'Model reference', 'Model/artifact ref: show only if validated', 15, 122, 438, 12);
  txt(provenance, 'Cutoff', 'Cutoff: last observed historical point', 15, 158, 438, 12);
  txt(provenance, 'Time', 'Generated/observed time: from real run', 15, 194, 438, 12, 'text/secondary');
  const limitations = component(f, 'Component / Forecast / Limitations', 2630, 130, 470, 246, 'surface/subtle');
  txt(limitations, 'Heading', 'LIMITATIONS / usability caveats', 15, 14, 438, 13, 'text/primary', 'Semi Bold');
  txt(limitations, 'Coverage', 'Coverage limitation: disclose missing data.', 15, 50, 438, 12);
  txt(limitations, 'History', 'Insufficient history: eligibility may fail.', 15, 86, 438, 12);
  txt(limitations, 'Horizon', 'Unsupported horizon: request cannot proceed.', 15, 122, 438, 12);
  txt(limitations, 'Completeness', 'Incomplete history: recheck source coverage.', 15, 158, 438, 12);
  txt(limitations, 'Rule', 'Do not turn caveats into false precision.', 15, 194, 438, 12, 'text/secondary');

  const result = component(f, 'Component / Forecast / Result', 2130, 406, 970, 212, 'status/pending-bg');
  stroke(result, 'status/pending');
  txt(result, 'Target annotation', 'TARGET PRODUCT UX / conditional result specimen', 16, 14, 938, 12, 'status/pending', 'Semi Bold');
  txt(result, 'Result rule', 'Only after eligibility and a validated run: ACTUAL | CUTOFF | PREDICTED.', 16, 53, 938, 14, 'text/primary', 'Semi Bold');
  txt(result, 'Evidence rule', 'Attach source, run reference, cutoff, generated time and limitations from real evidence.', 16, 99, 938, 12, 'text/primary');
  txt(result, 'No fabrication', 'No predicted value, confidence claim, model version or completed run is invented in this component.', 16, 145, 938, 12, 'text/secondary');
  txt(result, 'Current state', 'CURRENT ENGINEERING STATE: MODEL_NOT_READY; this conditional result is not available now.', 16, 181, 938, 12, 'status/pending', 'Semi Bold');

  heading(f, 'Target composition heading', 'TARGET READY COMPOSITION / design example, not a screen', 3180);
  const targetComposition = box(f, 'DS / Forecast / TARGET Ready Composition', 3180, 130, 970, 664, 'surface/default', 'border/default');
  txt(targetComposition, 'Target banner', 'TARGET PRODUCT UX / M13 not currently ready', 16, 13, 938, 13, 'status/pending', 'Semi Bold');
  const targetStages = [
    ['FORECAST REQUEST', 'Target + scope + eligibility + requested horizon', 'status/pending', 'status/pending-bg'],
    ['ACTUAL HISTORICAL SERIES', 'Observed source / solid line / no invented gaps', 'chart/actual', 'surface/subtle'],
    ['CUTOFF', 'Last observed point | future begins after boundary', 'status/info', 'status/info-bg'],
    ['PREDICTED SERIES', 'Future-only dashed line / only after validated run', 'chart/predicted', 'status/pending-bg'],
    ['PROVENANCE', 'Real run, source, artifact and time when available', 'text/secondary', 'surface/subtle'],
    ['LIMITATIONS', 'Coverage, history and horizon caveats', 'status/warning', 'status/warning-bg'],
  ] as const;
  targetStages.forEach(([label, value, fg, bg], i) => {
    const stage = box(targetComposition, `Target stage / ${label}`, 16, 47 + i * 100, 938, 88, bg, fg, 6);
    txt(stage, 'Stage label', `${i + 1}. ${label}`, 13, 11, 910, 12, fg, 'Semi Bold');
    txt(stage, 'Stage meaning', value, 13, 45, 910, 12, 'text/primary');
  });
  txt(f, 'Target scope note', 'The composition demonstrates reusable components. It does not assert an available production forecast.', 3180, 814, 970, 12, 'text/secondary');

  // Current engineering state must never render a zero or invented prediction.
  heading(f, 'Current state heading', 'CURRENT ENGINEERING STATE / distinct from TARGET UX', 4230);
  const notReady = component(f, 'Component / Forecast / MODEL_NOT_READY', 4230, 130, 970, 331, 'status/model-not-ready-bg');
  stroke(notReady, 'status/model-not-ready');
  txt(notReady, 'Current banner', 'CURRENT: no validated model / MODEL_NOT_READY', 17, 17, 936, 14, 'status/model-not-ready', 'Semi Bold');
  txt(notReady, 'Artifact state', 'Validated forecast artifact is not ready.', 17, 67, 936, 14, 'text/primary', 'Semi Bold');
  txt(notReady, 'Prediction state', 'No prediction has been produced.', 17, 113, 936, 14, 'text/primary', 'Semi Bold');
  txt(notReady, 'Not zero', 'Do not display a zero forecast, empty predicted chart or fake run.', 17, 159, 936, 13, 'text/secondary');
  txt(notReady, 'Safe current action', 'Current safe path: inspect historical Analytics or wait for validated capability.', 17, 205, 936, 13, 'text/primary');
  txt(notReady, 'Target boundary', 'The TARGET chart and composition are design examples only; they are not current output.', 17, 251, 936, 12, 'status/pending');
  txt(notReady, 'Implementation boundary', 'No model/version, generated timestamp or predicted value is asserted.', 17, 289, 936, 12, 'text/secondary');

  heading(f, 'Forecast states heading', 'FORECAST AVAILABILITY / each failure has a distinct cause', 5280);
  const forecastStates = [
    ['Insufficient History', 'Available history is not long enough for eligibility.', 'Next: gather sufficient valid history.', 'status/warning', 'status/warning-bg'],
    ['Unsupported Horizon', 'Requested future span is not supported.', 'Next: choose an approved horizon.', 'status/restricted', 'status/restricted-bg'],
    ['Model Unavailable', 'Validated model dependency is unavailable.', 'No zero prediction; check availability.', 'status/dependency', 'status/dependency-bg'],
    ['Timeout', 'Request did not complete within its bound.', 'No confirmed result; use bounded recovery.', 'status/pending', 'status/pending-bg'],
    ['Incomplete History', 'Some required historical data is missing.', 'Check coverage; this is not merely a short history.', 'status/stale', 'status/stale-bg'],
    ['Permission Denied', 'Current principal is not authorized for this forecast.', 'Request authorized access; no result disclosed.', 'status/restricted', 'status/restricted-bg'],
  ] as const;
  forecastStates.forEach(([state, meaning, next, fg, bg], i) => {
    const c = component(f, `Component / Forecast / ${state}`, 5280 + (i % 2) * 500, 130 + Math.floor(i / 2) * 220, 470, 204, bg);
    stroke(c, fg);
    txt(c, 'State name', state.toUpperCase(), 15, 14, 440, 13, fg, 'Semi Bold');
    txt(c, 'Meaning', meaning, 15, 62, 440, 13, 'text/primary');
    txt(c, 'Safe next or distinction', next, 15, 123, 440, 12, 'text/secondary');
    txt(c, 'Result boundary', 'No predicted value is shown.', 15, 165, 440, 12, fg, 'Semi Bold');
  });
  txt(f, 'Forecast failure scope', 'Incomplete History ≠ Insufficient History. Unavailable ≠ zero. Permission Denied is authorization, not model failure.', 5280, 806, 970, 12, 'text/secondary');

  // ANALYTICS_FORECAST_COMPONENTS
  return [a, f];
}

export async function buildWebChat(page: PageNode): Promise<FrameNode[]> {
  const w = sectionAt(page, SECTIONS.webchat, 13, 800, 'Separate customer surface; simpler language, mobile-important controls and no internal traces.');
  w.resize(4250, 800);
  const heading = (name: string, value: string, x: number, y = 99): void => {
    txt(w, name, value, x, y, 970, 14, 'text/primary', 'Semi Bold');
  };
  const touch = (parent: ComponentNode | FrameNode, name: string, value: string, x: number, y: number, width: number, primary = false, focused = false): FrameNode => {
    const control = box(parent, name, x, y, width, 44, primary ? 'action/primary' : 'surface/default', focused ? 'focus/ring' : 'border/interactive', 6);
    control.strokeWeight = focused ? 2 : 1;
    const label = txt(control, 'Action label', value, 12, 2, width - 24, 13, primary ? 'text/inverse' : 'text/primary', 'Semi Bold');
    label.textAutoResize = 'NONE'; label.resize(width - 24, 40); label.textAlignVertical = 'CENTER';
    return control;
  };
  const makeSet = (name: string, variants: ComponentNode[], x: number, y: number): void => {
    const set = figma.combineAsVariants(variants, w);
    set.name = name; set.x = x; set.y = y;
  };

  heading('Messages heading', 'CUSTOMER MESSAGES / content and transport state only', 28);
  const customerMessage = component(w, 'Component / Web Chat / Customer Message', 28, 130, 390, 153, 'surface/selected');
  txt(customerMessage, 'Sender', 'You', 15, 13, 360, 12, 'text/secondary', 'Semi Bold');
  txt(customerMessage, 'Message content', 'Is the slate lamp available?', 15, 47, 360, 14, 'text/primary');
  txt(customerMessage, 'Timestamp and delivery', '10:41 · Sent', 15, 110, 360, 12, 'text/secondary');

  const businessReply = component(w, 'Component / Web Chat / Business Reply', 528, 130, 390, 153);
  txt(businessReply, 'Sender', 'Business', 15, 13, 360, 12, 'text/secondary', 'Semi Bold');
  txt(businessReply, 'Reply content', 'I can check that for you.', 15, 47, 360, 14, 'text/primary');
  txt(businessReply, 'Timestamp and delivery', '10:42 · Delivered', 15, 110, 360, 12, 'text/secondary');

  const clarification = component(w, 'Component / Web Chat / Clarification Request', 28, 312, 390, 258);
  txt(clarification, 'State label', 'ONE DETAIL NEEDED', 15, 13, 360, 12, 'status/info', 'Semi Bold');
  txt(clarification, 'Missing information in plain language', 'We need your preferred size to continue.', 15, 44, 360, 13, 'text/primary');
  txt(clarification, 'Customer question', 'Which size would you like?', 15, 86, 360, 14, 'text/primary', 'Semi Bold');
  const answer = box(clarification, 'Response input / focus', 14, 126, 362, 48, 'surface/default', 'focus/ring', 6);
  answer.strokeWeight = 2;
  txt(answer, 'Response placeholder', 'Type your size', 11, 13, 338, 13, 'text/secondary');
  touch(clarification, 'Send details action', 'Send details', 14, 191, 362, true);

  const processing = component(w, 'Component / Web Chat / Processing', 528, 312, 390, 210, 'status/pending-bg');
  stroke(processing, 'status/pending');
  txt(processing, 'State label', 'PROCESSING / awaiting result', 15, 15, 360, 13, 'status/pending', 'Semi Bold');
  txt(processing, 'Processing message', 'We are processing your request.', 15, 61, 360, 14, 'text/primary', 'Semi Bold');
  txt(processing, 'Update message', "We'll update you here when the result is available.", 15, 112, 360, 13, 'text/primary');
  txt(processing, 'Waiting helper', 'No further action is needed right now.', 15, 165, 360, 12, 'text/secondary');

  heading('Composer heading', 'COMPOSER / 44 px touch targets, message delivery only', 1080);
  const composerSpecs = [
    ['Ready', 'Write a message…', 'Send', 'Ready to send', 'surface/default', 'text/secondary'],
    ['Sending', 'Your message is sending…', 'Sending…', 'Please wait for delivery', 'status/pending-bg', 'status/pending'],
    ['Delivery Failed', 'Your message was not sent.', 'Retry message', 'Only the message is retried', 'status/error-bg', 'status/error'],
  ] as const;
  const composerVariants = composerSpecs.map(([state, draft, label, helper, bg, fg], i) => {
    const c = component(w, `State=${state}`, 1080 + i * 330, 130, 310, 222, bg);
    txt(c, 'Composer state', state, 14, 11, 282, 12, fg, 'Semi Bold');
    const input = box(c, 'Visible message input', 13, 40, 284, 65, 'surface/default', 'border/default', 6);
    txt(input, 'Input text', draft, 11, 16, 262, 13, 'text/primary');
    if (state === 'Sending') {
      const waiting = box(c, 'Sending status / unavailable action', 13, 119, 284, 44, 'surface/subtle', 'border/default', 6);
      txt(waiting, 'Action label', label, 12, 13, 260, 13, 'text/secondary', 'Semi Bold');
    } else {
      touch(c, 'Send action / focus', label, 13, 119, 284, state === 'Ready', state === 'Ready');
    }
    txt(c, 'Customer helper', helper, 14, 179, 282, 12, fg);
    return c;
  });
  makeSet('Component / Web Chat / Composer', composerVariants, 1080, 130);

  heading('Decision and result heading', 'ORDER REQUEST / explicit authorization and separate results', 1080, 365);
  const confirmation = component(w, 'Component / Web Chat / Confirmation Request', 1080, 396, 390, 320);
  txt(confirmation, 'State label', 'CONFIRMATION REQUIRED', 15, 13, 360, 12, 'status/pending', 'Semi Bold');
  txt(confirmation, 'Action summary', 'Place an order for this item?', 15, 45, 360, 14, 'text/primary', 'Semi Bold');
  txt(confirmation, 'Item details', 'Slate lamp · standard size', 15, 86, 360, 13, 'text/primary');
  txt(confirmation, 'Quantity', 'Quantity: 1', 15, 115, 360, 13, 'text/primary');
  txt(confirmation, 'Effect explanation', 'If you confirm, we will place this order.', 15, 150, 360, 12, 'text/secondary');
  touch(confirmation, 'Confirm order / focus', 'Confirm order', 14, 199, 362, true, true);
  touch(confirmation, 'Change details action', 'Change details', 14, 257, 362);

  const confirmed = component(w, 'Component / Web Chat / Confirmed Result', 1580, 396, 390, 320);
  txt(confirmed, 'State label', 'YOUR ORDER UPDATE', 15, 13, 360, 12, 'text/secondary', 'Semi Bold');
  const orderFact = box(confirmed, 'Order state separate fact', 13, 46, 364, 71, 'status/success-bg', 'status/success', 6);
  txt(orderFact, 'Order state label', 'ORDER', 11, 9, 340, 11, 'status/success', 'Semi Bold');
  txt(orderFact, 'Order state value', 'Order created', 11, 34, 340, 14, 'text/primary', 'Semi Bold');
  const reservationFact = box(confirmed, 'Reservation state separate fact', 13, 130, 364, 71, 'status/success-bg', 'status/success', 6);
  txt(reservationFact, 'Reservation state label', 'RESERVATION', 11, 9, 340, 11, 'status/success', 'Semi Bold');
  txt(reservationFact, 'Reservation state value', 'Item reserved', 11, 34, 340, 14, 'text/primary', 'Semi Bold');
  txt(confirmed, 'Order reference', 'Order #1042', 15, 220, 360, 13, 'text/primary', 'Semi Bold');
  txt(confirmed, 'Next step', "We'll update you about the next step here.", 15, 260, 360, 13, 'text/secondary');

  heading('Safety states heading', 'CUSTOMER STATES / known facts, human help and connection remain separate', 2130);
  const knownFailure = component(w, 'Component / Web Chat / Known Failure', 2130, 130, 390, 300, 'status/warning-bg');
  stroke(knownFailure, 'status/warning');
  txt(knownFailure, 'State label', 'ORDER CREATED / ITEM NOT RESERVED', 15, 13, 360, 12, 'status/warning', 'Semi Bold');
  txt(knownFailure, 'Known result', 'Your order was created, but the item was not reserved.', 15, 52, 360, 14, 'text/primary', 'Semi Bold');
  txt(knownFailure, 'Order reference', 'Order #1042 already exists.', 15, 111, 360, 12, 'text/secondary');
  txt(knownFailure, 'Duplicate warning', "Please don't place the same order again.", 15, 160, 360, 13, 'status/warning', 'Semi Bold');
  txt(knownFailure, 'Next step', "We'll help you with the next step.", 15, 202, 360, 13, 'text/primary');
  touch(knownFailure, 'Ask for help action / focus', 'Ask for help', 14, 246, 362, false, true);

  const waitingHuman = component(w, 'Component / Web Chat / Waiting Human', 2630, 130, 390, 249, 'status/waiting-human-bg');
  stroke(waitingHuman, 'status/waiting-human');
  txt(waitingHuman, 'State label', 'A PERSON IS REVIEWING THIS', 15, 13, 360, 12, 'status/waiting-human', 'Semi Bold');
  txt(waitingHuman, 'Customer message', 'A person is reviewing this.', 15, 53, 360, 14, 'text/primary', 'Semi Bold');
  txt(waitingHuman, 'Update message', "We'll update you here.", 15, 99, 360, 13, 'text/primary');
  txt(waitingHuman, 'Conversation helper', 'You can still send a message.', 15, 144, 360, 12, 'text/secondary');
  touch(waitingHuman, 'Write a message action', 'Write a message', 14, 191, 362);

  const pending = component(w, 'Component / Web Chat / Confirmation Pending', 2130, 459, 390, 282, 'status/pending-bg');
  stroke(pending, 'status/pending');
  txt(pending, 'State label', 'CONFIRMATION PENDING', 15, 13, 360, 12, 'status/pending', 'Semi Bold');
  txt(pending, 'Unknown result in plain language', 'Your request may have gone through, but we cannot confirm it yet.', 15, 50, 360, 13, 'text/primary', 'Semi Bold');
  txt(pending, 'Duplicate request warning', 'Please do not submit the same request again.', 15, 121, 360, 13, 'status/pending', 'Semi Bold');
  txt(pending, 'Update promise', 'We will update you when confirmation is available.', 15, 177, 360, 12, 'text/primary');
  touch(pending, 'Contact support action / focus', 'Contact support', 14, 227, 362, false, true);

  const delivery = component(w, 'Component / Web Chat / Delivery Failure', 2630, 410, 390, 331);
  txt(delivery, 'State label', 'MESSAGE DELIVERY ISSUE', 15, 12, 360, 12, 'status/error', 'Semi Bold');
  const messageFact = box(delivery, 'Message transport fact', 13, 41, 364, 67, 'status/error-bg', 'status/error', 6);
  txt(messageFact, 'Message label', 'MESSAGE', 11, 8, 340, 11, 'status/error', 'Semi Bold');
  txt(messageFact, 'Message value', 'Not delivered', 11, 31, 340, 13, 'text/primary', 'Semi Bold');
  const businessFact = box(delivery, 'Business result separate fact', 13, 121, 364, 67, 'status/success-bg', 'status/success', 6);
  txt(businessFact, 'Business label', 'BUSINESS RESULT', 11, 8, 340, 11, 'status/success', 'Semi Bold');
  txt(businessFact, 'Business value', 'Reservation remains confirmed', 11, 31, 340, 13, 'text/primary', 'Semi Bold');
  txt(delivery, 'Recovery scope', 'Only your message needs attention.', 15, 200, 360, 12, 'text/secondary');
  touch(delivery, 'Retry message action / focus', 'Retry message', 14, 231, 362, true, true);
  touch(delivery, 'Contact support action', 'Contact support', 14, 281, 362);

  heading('Composition heading', 'SMALL CUSTOMER-FACING COMPOSITIONS / not a full chat screen', 3180);
  const compositionSpecs = [
    { name: 'A / Clarification → Response', first: 'Which size would you like?', second: 'Customer: standard size', footer: 'Continue with the supplied detail.', firstFg: 'status/info', firstBg: 'status/info-bg', secondFg: 'text/primary', secondBg: 'surface/subtle' },
    { name: 'B / Confirmation → Confirm order', first: 'Slate lamp · quantity 1', second: 'Confirm order / Change details', footer: 'The customer authorizes a named order.', firstFg: 'status/pending', firstBg: 'status/pending-bg', secondFg: 'text/primary', secondBg: 'surface/subtle' },
    { name: 'C / Processing → Confirmed', first: 'We are processing your request.', second: 'Order created · item reserved', footer: 'Result appears only after confirmation.', firstFg: 'status/pending', firstBg: 'status/pending-bg', secondFg: 'status/success', secondBg: 'status/success-bg' },
    { name: 'D / Order Created + Reservation Failed', first: 'Order created / #1042', second: 'Item not reserved', footer: "Please don't place the same order again.", firstFg: 'status/success', firstBg: 'status/success-bg', secondFg: 'status/warning', secondBg: 'status/warning-bg' },
    { name: 'E / Confirmation Pending', first: 'Your request may have gone through.', second: 'Please do not submit it again.', footer: 'We will update you when we know.', firstFg: 'status/pending', firstBg: 'status/pending-bg', secondFg: 'text/primary', secondBg: 'surface/subtle' },
    { name: 'F / Confirmed + Message Not Delivered', first: 'Reservation remains confirmed', second: 'Message not delivered', footer: 'Retry message only; order stays confirmed.', firstFg: 'status/success', firstBg: 'status/success-bg', secondFg: 'status/error', secondBg: 'status/error-bg' },
  ] as const;
  compositionSpecs.forEach((spec, i) => {
    const c = box(w, `DS / Web Chat / Composition / ${spec.name}`, 3180 + (i % 2) * 500, 130 + Math.floor(i / 2) * 205, 470, 190, 'surface/default', 'border/default', 8);
    txt(c, 'Composition title', spec.name, 14, 10, 442, 13, 'text/primary', 'Semi Bold');
    const first = box(c, 'First customer-visible fact', 14, 38, 442, 48, spec.firstBg, spec.firstFg, 6);
    txt(first, 'First value', spec.first, 10, 14, 418, 12, 'text/primary', 'Semi Bold');
    const second = box(c, 'Second customer-visible fact', 14, 92, 442, 48, spec.secondBg, spec.secondFg, 6);
    txt(second, 'Second value', spec.second, 10, 14, 418, 12, 'text/primary', 'Semi Bold');
    txt(c, 'Composition footer', spec.footer, 14, 157, 442, 12, 'text/secondary');
  });
  txt(w, 'Mobile note', 'Examples use narrow cards, 44 px actions and stacked choices. Allow English, Russian and Kazakh labels to wrap.', 3180, 755, 970, 12, 'text/secondary');
  const [usage] = await buildUsage(page);
  const validation = sectionAt(page, SECTIONS.validation, 20, 360, 'Structural checks are run from plugin UI; manual visual, language and accessibility review remains required.');
  cards(validation, [
    ['DS / Validation / Structural', 'Named sections, variables, styles, components and semantic labels.'],
    ['DS / Validation / Manual', 'Inspect hierarchy, text overflow, contrast, keyboard behavior and state comprehension.'],
    ['DS / Validation / Scope', 'A passing report does not certify aesthetics, usability or WCAG conformance.'],
  ], 108, 3, 318, 120);
  return [w, usage, validation];
}
