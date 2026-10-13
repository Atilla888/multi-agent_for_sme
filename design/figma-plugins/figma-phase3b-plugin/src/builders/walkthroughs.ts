import { SECTION_LABELS } from '../constants';
import { panel, screen } from '../specs/phase3b-spec';
import type { SectionSpec } from '../types';

const flow = (title: string, nodes: string[], note: string) => screen(
  `3B / Scenario / ${title}`, title, 'Compact conceptual walkthrough; references existing screens without duplicating them.',
  'flow', 'Scenario walkthrough', [[{ ...panel('Flow nodes', ...nodes.map((node, index) => `${index + 1}. ${node}`)), kind: 'flow' }], [panel('Safety / result', note)]],
);

export const walkthroughs: SectionSpec = {
  key: 'walkthroughs', label: SECTION_LABELS.walkthroughs,
  intro: 'Six cross-surface checks, not duplicate screens. References: Conversation → Order; Order → Conversation; Conversation → Escalation; Escalation → Conversation / Order; Conversation → Agent Run (reference only); Analytics → Forecasts.',
  screens: [
    flow('1 Product Availability', ['Customer', 'Conversation', 'Sales', 'Product lookup', 'Inventory check', 'Availability confirmed'], 'Availability is confirmed only after inventory check.'),
    flow('2 Purchase Successful Reservation', ['Customer confirmation', 'create_order', 'Order created', 'reserve_inventory', 'Reservation confirmed', 'Customer result'], 'create_order and reserve_inventory are separate business effects.'),
    flow('3 Purchase Reservation Failure', ['create_order succeeds', 'Order exists', 'reserve_inventory fails', 'Reservation failed', 'Partial outcome', 'Human attention'], 'Do not present generic order success. The order exists but inventory is not reserved.'),
    flow('4 Support Sales Handoff', ['Support', 'Verified context', 'Sales-required mutation', 'Handoff', 'Sales continues'], 'Handoff does NOT transfer permissions. Sales rechecks authorization.'),
    flow('5 OUTCOME_UNKNOWN Escalation', ['Mutation attempted', 'Confirmation unavailable', 'OUTCOME_UNKNOWN', 'NO BLIND RETRY', 'Reconciliation required', 'Escalation', 'Human decision', 'Revalidation'], 'Effect may have committed. M12 Resume is TARGET only; revalidate before any safe continuation.'),
    flow('6 Analytics Forecast', ['Owner', 'Historical Analytics', 'ACTUAL values', 'Forecast request', 'MODEL_NOT_READY'], 'CURRENT: no prediction. TARGET future path: Forecast available → ACTUAL and PREDICTED shown separately.'),
  ],
};
