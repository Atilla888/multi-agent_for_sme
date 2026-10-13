import { SECTION_LABELS } from '../constants';
import { attention, panel, screen, unknownOutcome } from '../specs/phase3b-spec';
import type { SectionSpec } from '../types';

export const escalations: SectionSpec = {
  key: 'escalations', label: SECTION_LABELS.escalations,
  intro: 'Reviewed operator states. Existing manual 03B work is preserved; these are clearly labelled revised variants.',
  screens: [
    screen('3B / Escalations / Queue Revised', 'Escalations', 'Triage only: status, owner and safe next destination; full investigation lives in Decision Context.', 'staff', 'Waiting / Assigned / Awaiting Decision', [
      [panel('Queue filters', 'Waiting assignment  |  Assigned  |  Awaiting decision', 'Stale state  |  Authorization changed  |  Resume pending — TARGET M12', 'OUTCOME_UNKNOWN  |  Reconciliation required  |  Resolved  |  Closed'), panel('Queue rows', 'Case E-104  ·  Waiting assignment  ·  Needs owner', 'Case E-105  ·  Assigned  ·  Decision pending', 'Case E-106  ·  OUTCOME_UNKNOWN  ·  Reconciliation required', 'Case E-107  ·  Resume pending — TARGET M12  ·  Revalidation required')],
      [panel('Selected case preview', 'Reason: reservation confirmation unavailable', 'Confirmed: order exists', 'Next: open Decision Context for reconciliation'), panel('Cross-screen references', 'Conversation → Escalation', 'Escalation → Conversation', 'Escalation → Order')],
    ], { actions: ['Open decision context'] }),
    screen('3B / Escalations / Decision Context', 'Escalations', 'Reservation uncertainty example. Read top to bottom before a human decision.', 'staff', 'Awaiting Decision / Reconciliation Required', [[
      attention('WHY AUTOMATION STOPPED', 'reserve_inventory confirmation is unavailable.', 'Automation paused to avoid repeating a mutation whose effect may already exist.'),
      panel('CONFIRMED FACTS', 'Example order ORD-1042 exists.', 'create_order — CONFIRMED.', 'Inventory last observed at 10:42; this snapshot does not prove reservation state.'),
      attention('UNCERTAIN EFFECT', 'reserve_inventory — OUTCOME_UNKNOWN.', 'Confirmation unavailable; effect may already have committed.', 'Neither confirmed success nor known failure.', 'Operation: <operation reference>'),
      attention('CONSTRAINTS', 'Do not retry reservation before reconciliation.', 'No blind retry or automatic mutation replay.', 'Recheck current authorization before any continuation.'),
      panel('NEXT SAFE STEP', 'Reconcile the authoritative reservation state.', 'Record the result → then choose a safe continuation.', 'If still uncertain, keep the escalation pending.'),
      panel('HUMAN DECISION', 'Decide on the proposed continuation only after reconciliation.', 'Record the decision; revalidation is required before a controlled resume request.'),
    ]], { actions: ['After reconciliation: approve proposed continuation', 'Reject proposed continuation', 'Request clarification', 'Revalidate → Resume request (TARGET M12)', 'Close escalation'], annotation: 'TARGET M12 — Resume is a controlled request after human decision and revalidation. No mutation replay.', references: ['Conversation', 'Order', 'Agent Run (reference only)'] }),
    screen('3B / Escalations / OUTCOME_UNKNOWN', 'Escalations', 'Unknown mutation outcome is neither success nor confirmed failure.', 'staff', 'OUTCOME_UNKNOWN / Reconciliation Required', [
      [unknownOutcome('reserve_inventory / <operation reference>'), panel('Known context', 'Customer confirmation: recorded.', 'Order: created.', 'Reservation: not confirmed.')],
      [attention('Required operator path', 'Check source-of-truth state using operation/context reference.', 'Document reconciliation result.', 'Do not issue a blind retry.'), panel('Next safe outcome', 'If confirmed: communicate without repeating mutation.', 'If failed: decide a new authorized action.', 'If still unknown: keep pending and escalate.')],
    ], { actions: ['Start reconciliation', 'Open linked Order'] }),
    screen('3B / Escalations / Stale', 'Escalations', 'State changed after the escalation was opened.', 'staff', 'Stale', [
      [attention('Stale context', 'The linked order or inventory state may have changed.', 'The original proposal is not a confirmed business effect.')],
      [panel('Recovery', 'Refresh source facts.', 'Compare old and current state.', 'Require a new human decision when conflict remains.')],
    ], { actions: ['Refresh context', 'Record conflict'] }),
    screen('3B / Escalations / Authorization Changed', 'Escalations', 'A role or permission change blocks automatic continuation.', 'staff', 'Authorization Changed', [
      [attention('Permission gate', 'Previous access must not be reused.', 'Support → Sales handoff does not transfer permissions.')],
      [panel('Next decision', 'Recheck current actor permissions.', 'Route to an authorized human or policy path.')],
    ], { actions: ['Check authorization', 'Route to authorized staff'] }),
    screen('3B / Escalations / E02 Update Restricted', 'Escalations', 'Separate update_order restriction; unrelated to an uncertain reservation outcome.', 'staff', 'E02 — UPDATE RESTRICTED', [[
      attention('WHY AUTOMATION STOPPED', 'Requested order update cannot proceed automatically.', 'E02 restricts update_order; no update is shown as completed.'),
      panel('CONFIRMED FACTS', 'The existing order remains available for review.', 'No successful update_order effect is claimed.'),
      attention('CONSTRAINTS', 'update_order mutation remains restricted.', 'Do not treat this as reservation OUTCOME_UNKNOWN.'),
      panel('NEXT SAFE STEP', 'Route to human/policy handling.', 'The unresolved E02 business policy is not invented here.'),
    ]], { actions: ['Open linked Order', 'Request human/policy review'] }),
    screen('3B / Escalations / Resume Pending', 'Escalations', 'Resume is a target concept, not an automatic rerun of a mutation.', 'staff', 'Resume Pending', [
      [panel('Safe sequence', 'Human decision → Revalidation → Safe resume request.', 'Recheck current facts, permission and operation outcome.')],
      [attention('No mutation replay', 'Resume does not mean create_order or reserve_inventory runs again.', 'Reconciliation is mandatory when outcome is unknown.')],
    ], { actions: ['Record human decision', 'Revalidate → Resume request (TARGET M12)'], annotation: 'TARGET UX — M12 durable resume is not currently implemented. No mutation replay.' }),
    screen('3B / Escalations / Resolved and Closed', 'Escalations', 'Terminal handling remains explicit and auditable.', 'staff', 'Resolved / Closed', [
      [panel('Resolved', 'Human decision recorded.', 'Business effect verified or safely abandoned.', 'Customer communication tracked separately.')],
      [panel('Closed', 'No pending reconciliation or decision.', 'Read-only history and linked Conversation / Order remain available.')],
    ], { references: ['Conversation', 'Order'] }),
  ],
};
