import { SECTION_LABELS } from '../constants';
import { attention, panel, screen, unknownOutcome } from '../specs/phase3b-spec';
import type { SectionSpec } from '../types';

export const orders: SectionSpec = {
  key: 'orders', label: SECTION_LABELS.orders,
  intro: 'Order creation and inventory reservation are separate outcomes. No generic “Order SUCCESS” state hides a failed or unknown reservation.',
  screens: [
    screen('3B / Orders / List Revised', 'Orders', 'Scan two independent business states before opening an order.', 'staff', 'List / mixed outcomes', [
      [panel('Filters and search', 'Search order/customer/reference', 'Order: Created / Stale / Conflict', 'Reservation: Confirmed / Failed / OUTCOME_UNKNOWN')],
      [panel('Order rows', 'O-101  |  Order Created  |  Reservation Confirmed', 'O-102  |  Order Created  |  Reservation Failed', 'O-103  |  Order Created  |  Reservation OUTCOME_UNKNOWN', 'O-104  |  Needs human attention')],
    ], { actions: ['Open order detail'], references: ['Conversation'] }),
    screen('3B / Orders / Detail / Reservation Confirmed', 'Orders', 'Confirmed business effects are shown as separate facts.', 'staff', 'Order Created / Reservation Confirmed', [
      [panel('ORDER STATE', 'Created', 'Order reference: <order id>')],
      [panel('RESERVATION STATE', 'Confirmed', 'Reservation reference: <reservation id>'), panel('NEXT STEP', 'Inform customer; track delivery independently.')],
    ], { actions: ['Open Conversation'] }),
    screen('3B / Orders / Detail / Reservation Failed', 'Orders', 'A partial outcome must not be presented as full success.', 'staff', 'Order Created / Reservation Failed', [
      [panel('ORDER STATE', 'Created', 'Order exists; do not create a duplicate.')],
      [attention('RESERVATION STATE', 'Failed', 'Inventory is not reserved.'), attention('NEXT STEP', 'Review current inventory.', 'Choose an authorized recovery path.')],
    ], { actions: ['Open Escalation', 'Contact customer'] }),
    screen('3B / Orders / Detail / OUTCOME_UNKNOWN', 'Orders', 'Confirmation pending is not confirmed success or confirmed failure.', 'staff', 'Order Created / Reservation OUTCOME_UNKNOWN', [
      [panel('ORDER STATE', 'Created', 'Order reference: <order id>'), unknownOutcome('reserve_inventory / <operation reference>')],
      [attention('RESERVATION STATE', 'OUTCOME_UNKNOWN', 'Effect may have committed.'), panel('NEXT STEP', 'Reconcile against source of truth.', 'Do not retry reserve_inventory until outcome is known.')],
    ], { actions: ['Start reconciliation', 'Open Escalation'] }),
    screen('3B / Orders / Needs Human Attention', 'Orders', 'Operator sees why automation stopped and what is safe to decide.', 'staff', 'Needs human attention', [
      [panel('Confirmed', 'Order creation confirmed.'), attention('Unresolved', 'Reservation not confirmed or policy gate raised.')],
      [panel('Human path', 'Inspect linked Conversation and Escalation.', 'Record decision; revalidate before any new mutation.')],
    ], { references: ['Conversation', 'Escalation'], actions: ['Review linked case'] }),
    screen('3B / Orders / Stale or Conflict', 'Orders', 'A changed order requires fresh facts, not an outdated action.', 'staff', 'Stale / conflicting', [
      [attention('Conflict', 'Order detail changed since the previous proposal.', 'Do not apply a stale mutation.')],
      [panel('Next step', 'Refresh order and reservation state.', 'Resolve conflict with an authorized human decision.')],
    ], { actions: ['Refresh current state', 'Escalate conflict'] }),
    screen('3B / Orders / E02 Restricted', 'Orders', 'Restricted update_order behavior is explicit; unresolved policy is not invented.', 'staff', 'E02 / update_order restricted', [
      [attention('Requested change blocked', 'update_order cannot proceed automatically.', 'No successful mutation has been shown.')],
      [panel('Next step', 'Human / policy handling may be required.', 'E02 business policy is unresolved; do not imply an approved path.')],
    ], { actions: ['View restriction details', 'Request human review'], annotation: 'E02 restriction remains an open business-policy question.' }),
    screen('3B / Orders / Delivery Failure Independent', 'Orders', 'Business effect and customer communication have independent outcomes.', 'staff', 'Reservation Confirmed / Delivery Failed', [
      [panel('BUSINESS EFFECT', 'Reservation confirmed.', 'Do not run reserve_inventory again.')],
      [attention('COMMUNICATION', 'Customer message delivery failed.'), panel('NEXT STEP', 'Retry delivery or contact customer; preserve confirmed reservation.')],
    ], { actions: ['Retry message delivery', 'Contact customer'] }),
  ],
};
