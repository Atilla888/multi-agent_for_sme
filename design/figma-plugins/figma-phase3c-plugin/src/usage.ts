import { SECTIONS } from './constants';
import { box, component, note, section, stroke, txt, type SemanticName } from './figma-utils';

// Only the exact 15 — Usage Examples section is owned by the build-usage action.
export async function buildUsage(page: PageNode): Promise<FrameNode[]> {
  const usage = section(page, SECTIONS.usage, 80, 12890, 650,
    'Six small component compositions: business truth, uncertainty, data readiness and explicit customer action.');
  usage.resize(3090, 650);
  const specimen = (name: string, column: number, row: number): ComponentNode => {
    const c = component(usage, `DS / Usage / ${name}`, 28 + column * 1022, 118 + row * 251, 990, 230);
    txt(c, 'Specimen title', name.toUpperCase(), 14, 11, 960, 14, 'text/primary', 'Semi Bold');
    return c;
  };
  const fact = (parent: ComponentNode, name: string, label: string, value: string, x: number, width: number,
    fg: SemanticName, bg: SemanticName): void => {
    const f = box(parent, name, x, 45, width, 98, bg, fg, 6);
    txt(f, 'Fact label', label, 11, 10, width - 22, 12, fg, 'Semi Bold');
    txt(f, 'Fact value', value, 11, 43, width - 22, 15, 'text/primary', 'Semi Bold');
  };
  const action = (parent: FrameNode, name: string, value: string, y: number, primary: boolean): void => {
    const b = box(parent, name, 12, y, 366, 44, primary ? 'action/primary' : 'action/secondary',
      primary ? 'border/interactive' : 'border/default', 6);
    if (primary) { stroke(b, 'focus/ring'); b.strokeWeight = 2; }
    const label = txt(b, 'Action label', value, 11, 2, 344, 13, primary ? 'text/inverse' : 'text/primary', 'Semi Bold');
    label.textAutoResize = 'NONE'; label.resize(344, 40); label.textAlignVertical = 'CENTER';
  };

  const order = specimen('Order + Reservation', 0, 0);
  fact(order, 'Order state / business entity', 'ORDER STATE', 'Created', 14, 300, 'status/success', 'status/success-bg');
  fact(order, 'Reservation state / known failure', 'RESERVATION STATE', 'Failed (known)', 330, 300, 'status/warning', 'status/warning-bg');
  fact(order, 'Safe recovery / authorized', 'NEXT SAFE STEP', 'Review current inventory', 646, 330, 'status/info', 'status/info-bg');
  txt(order, 'Recovery continuation', 'Choose an authorized recovery', 657, 162, 306, 13, 'text/primary', 'Semi Bold');
  txt(order, 'Independent state rule', 'Order exists ≠ reservation succeeded.', 14, 185, 610, 12, 'text/secondary');

  const unknown = specimen('OUTCOME_UNKNOWN', 1, 0);
  fact(unknown, 'Business effect / uncertain', 'BUSINESS EFFECT', 'OUTCOME_UNKNOWN', 14, 300, 'status/unknown', 'status/unknown-bg');
  fact(unknown, 'Authoritative reconciliation', 'RECONCILIATION', 'Required', 330, 300, 'status/pending', 'status/pending-bg');
  fact(unknown, 'Mutation safety', 'NEXT', 'Do not retry mutation', 646, 330, 'status/warning', 'status/warning-bg');
  txt(unknown, 'Uncertain effect explanation', 'Effect may have committed. Confirmation unavailable.', 14, 166, 950, 13, 'text/primary');
  txt(unknown, 'Known failure distinction', 'Unknown effect ≠ known failure; reconcile authoritative state first.', 14, 194, 950, 12, 'text/secondary');

  const delivery = specimen('Confirmed + Delivery Failed', 2, 0);
  fact(delivery, 'Confirmed business effect', 'BUSINESS EFFECT', 'Reservation confirmed', 14, 300, 'status/success', 'status/success-bg');
  fact(delivery, 'Failed message transport', 'COMMUNICATION', 'Message delivery failed', 330, 300, 'status/error', 'status/error-bg');
  fact(delivery, 'Recovery scope', 'NEXT', 'Retry communication only', 646, 330, 'status/info', 'status/info-bg');
  txt(delivery, 'No replay rule', 'Do NOT replay reserve_inventory.', 14, 173, 950, 13, 'text/primary', 'Semi Bold');

  const chart = specimen('Actual + Predicted', 0, 1);
  txt(chart, 'Target UX label', 'TARGET PRODUCT UX · illustrative, no current forecast', 14, 36, 960, 12, 'status/info', 'Semi Bold');
  const plot = box(chart, 'Analytics / Forecast miniature', 14, 65, 660, 150, 'surface/subtle', 'border/default', 6);
  txt(plot, 'Actual legend', 'ACTUAL · solid historical', 14, 10, 290, 12, 'chart/actual', 'Semi Bold');
  txt(plot, 'Predicted legend', 'PREDICTED · dashed future', 348, 10, 290, 12, 'chart/predicted', 'Semi Bold');
  const solid = box(plot, 'ACTUAL / solid historical line', 16, 90, 284, 4, 'chart/actual', 'chart/actual', 0);
  solid.strokes = [];
  const cutoff = box(plot, 'CUTOFF / last observed boundary', 313, 48, 3, 70, 'border/strong', 'border/strong', 0);
  cutoff.strokes = [];
  for (let i = 0; i < 6; i++) {
    const dash = box(plot, `PREDICTED / dash ${i + 1}`, 333 + i * 49, 90, 29, 4, 'chart/predicted', 'chart/predicted', 0);
    dash.strokes = [];
  }
  txt(plot, 'Cutoff label', 'CUTOFF', 276, 120, 90, 12, 'text/secondary', 'Semi Bold');
  const chartMeaning = box(chart, 'Source and time boundary', 690, 65, 286, 150, 'surface/default', 'border/default', 6);
  txt(chartMeaning, 'Source label', 'ACTUAL → CUTOFF → PREDICTED', 12, 15, 260, 12, 'text/primary', 'Semi Bold');
  txt(chartMeaning, 'Forecast disclaimer', 'Future values are a target UX example, not an available forecast.', 12, 61, 260, 13, 'text/secondary');

  const readiness = specimen('Forecast Readiness', 1, 1);
  const current = box(readiness, 'Current engineering state', 14, 45, 470, 170, 'status/model-not-ready-bg', 'status/model-not-ready', 6);
  txt(current, 'State category', 'CURRENT ENGINEERING STATE', 12, 11, 442, 12, 'status/model-not-ready', 'Semi Bold');
  txt(current, 'Capability value', 'MODEL_NOT_READY', 12, 47, 442, 16, 'text/primary', 'Semi Bold');
  txt(current, 'No result message', 'No prediction produced.', 12, 91, 442, 13, 'text/primary');
  txt(current, 'Not a data point', 'Not zero, an empty result or a server error.', 12, 128, 442, 12, 'text/secondary');
  const target = box(readiness, 'Target product UX', 500, 45, 476, 170, 'status/info-bg', 'status/info', 6);
  txt(target, 'Target category', 'TARGET PRODUCT UX', 12, 11, 448, 12, 'status/info', 'Semi Bold');
  txt(target, 'Target composition', 'Forecast result composition', 12, 47, 448, 15, 'text/primary', 'Semi Bold');
  txt(target, 'Target sequence', 'Actual → Cutoff → Predicted', 12, 95, 448, 13, 'text/primary');
  txt(target, 'Availability note', 'Illustrative only; not a current prediction.', 12, 130, 448, 12, 'text/secondary');

  const customer = specimen('Customer Confirmation', 2, 1);
  const narrow = box(customer, 'Mobile-width customer confirmation', 14, 35, 390, 190, 'surface/default', 'border/default', 6);
  txt(narrow, 'Order summary', 'Order summary', 12, 8, 366, 14, 'text/primary', 'Semi Bold');
  txt(narrow, 'Item', 'Item: Slate lamp', 12, 38, 366, 13, 'text/primary');
  txt(narrow, 'Quantity', 'Quantity: 1', 12, 64, 366, 13, 'text/primary');
  action(narrow, 'Primary / confirm order', 'Confirm order', 96, true);
  action(narrow, 'Secondary / change details', 'Change details', 142, false);
  const customerNote = box(customer, 'Customer action hierarchy note', 420, 35, 556, 190, 'surface/subtle', 'border/default', 6);
  txt(customerNote, 'Business action explanation', 'Confirm order names the business action the customer authorizes.', 14, 19, 528, 14, 'text/primary', 'Semi Bold');
  txt(customerNote, 'Action hierarchy explanation', 'Change details remains secondary. Both actions have 44 px targets.', 14, 92, 528, 13, 'text/secondary');
  txt(customerNote, 'Localization guidance', 'Labels may wrap in EN / RU / KZ.', 14, 148, 528, 12, 'text/secondary');

  note(usage, 'Component-sized examples only. Review meaning, wrapping and focus; no full product screens or new behavior.', 614, 3030);
  return [usage];
}
