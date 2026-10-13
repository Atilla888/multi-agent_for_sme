import type { EscalationDetail, EscalationScenario, EscalationSummary } from "../types";

export const demoEscalationQueue: readonly EscalationSummary[] = [
  { id: "ESC-204", conversationId: "c-42", orderId: "ORD-1042", participant: "Amina S.", reason: "Reservation result requires review", time: "10:42", state: "waiting-human" },
  { id: "ESC-205", conversationId: "c-43", participant: "Mira K.", reason: "Authorization changed", time: "09:18", state: "restricted" },
  { id: "ESC-206", conversationId: "c-44", orderId: "ORD-1090", participant: "Dana R.", reason: "Known reservation failure", time: "Yesterday", state: "known-failure" },
] as const;

const base = {
  id: "ESC-204", conversationId: "c-42", orderId: "ORD-1042", participant: "Amina S.", reason: "Reservation result requires review", time: "10:42",
} as const;

export function demoEscalationDetail(scenario: EscalationScenario): EscalationDetail {
  const selectedBase = scenario === "restricted"
    ? { id: "ESC-205", conversationId: "c-43", participant: "Mira K.", reason: "Authorization changed", time: "09:18" }
    : scenario === "known-failure"
      ? { id: "ESC-206", conversationId: "c-44", orderId: "ORD-1090", participant: "Dana R.", reason: "Known reservation failure", time: "Yesterday" }
      : base;
  if (scenario === "outcome-unknown") return { ...base, state: "outcome-unknown", handler: "Unassigned · human reconciliation required", safetyLabel: "No blind retry", m12Target: false, sections: [
    { title: "Why automation stopped", lines: ["The reservation mutation returned OUTCOME_UNKNOWN."] },
    { title: "Confirmed facts", lines: ["Order ORD-1042 exists.", "The request reached the mutation boundary."] },
    { title: "Uncertain effect", lines: ["The reservation effect may have committed.", "Confirmation is unavailable."] },
    { title: "Constraints", lines: ["Do not retry the mutation blindly.", "Do not infer failure from missing confirmation."] },
    { title: "Next safe step", lines: ["Reconcile against authoritative reservation state before continuation."] },
    { title: "Human decision", lines: ["Review only. No reconciliation command endpoint exists in the current backend."] },
  ] };
  if (scenario === "known-failure") return { ...selectedBase, state: "known-failure", handler: "Human Operator", safetyLabel: "Known result · authorized recovery", m12Target: false, sections: [
    { title: "Why automation stopped", lines: ["Inventory reservation failed with a known result."] },
    { title: "Confirmed facts", lines: ["Order ORD-1042 exists.", "Inventory is not reserved."] },
    { title: "Uncertain effect", lines: ["None for the reservation outcome; the failure is known."] },
    { title: "Constraints", lines: ["Do not place the same order again.", "E02 keeps update_order restricted."] },
    { title: "Next safe step", lines: ["Review current inventory and choose an authorized recovery path."] },
    { title: "Human decision", lines: ["Decision controls are unavailable because no public command contract exists."] },
  ] };
  if (scenario === "restricted") return { ...selectedBase, state: "restricted", handler: "Human Operator", safetyLabel: "E02 restricted", m12Target: false, sections: [
    { title: "Why automation stopped", lines: ["The requested order change is outside the current supported scope."] },
    { title: "Confirmed facts", lines: ["update_order did not execute.", "No changed order may be claimed."] },
    { title: "Uncertain effect", lines: ["None; the restricted mutation did not run."] },
    { title: "Constraints", lines: ["Frontend visibility does not grant mutation authority."] },
    { title: "Next safe step", lines: ["Use an authorized external process if the business requires a change."] },
    { title: "Human decision", lines: ["No approval action is available in P5C."] },
  ] };
  if (scenario === "resume-target") return { ...base, state: "target-only", handler: "Human Operator", safetyLabel: "M12 TARGET / NOT STARTED", m12Target: true, sections: [
    { title: "Why automation stopped", lines: ["A prior run is waiting for a durable human decision."] },
    { title: "Confirmed facts", lines: ["The decision context is a local visual fixture."] },
    { title: "Uncertain effect", lines: ["Fresh authoritative state has not been revalidated."] },
    { title: "Constraints", lines: ["Recheck principal, business scope, authorization, state, revision, and unresolved effects.", "Never replay completed work."] },
    { title: "Next safe step", lines: ["Implement and verify M12 durable Resume before enabling this path."] },
    { title: "Human decision", lines: ["Resume control remains disabled and TARGET-only."] },
  ] };
  if (scenario === "resolved") return { ...base, state: "confirmed", handler: "Human Operator", safetyLabel: "Resolved fixture history", m12Target: false, sections: [
    { title: "Why automation stopped", lines: ["The case previously required human review."] },
    { title: "Confirmed facts", lines: ["The fixture escalation is resolved."] },
    { title: "Uncertain effect", lines: ["No unresolved effect is represented in this fixture."] },
    { title: "Constraints", lines: ["Resolved escalation is not the same as a closed conversation."] },
    { title: "Next safe step", lines: ["Retain the decision evidence as read-only history."] },
    { title: "Human decision", lines: ["No action is available in this read-only state."] },
  ] };
  return { ...base, state: "waiting-human", handler: "Unassigned", safetyLabel: "Automation stopped", m12Target: false, sections: [
    { title: "Why automation stopped", lines: ["The scenario requires a human owner before it can continue."] },
    { title: "Confirmed facts", lines: ["Conversation c-42 and order ORD-1042 are related in this fixture.", "Support was the previous active specialist."] },
    { title: "Uncertain effect", lines: ["No decision has been recorded."] },
    { title: "Constraints", lines: ["Assignment and decision endpoints are not available.", "Visible UI does not grant backend permission."] },
    { title: "Next safe step", lines: ["Assign an authorized operator when a verified backend contract exists."] },
    { title: "Human decision", lines: ["Read-only fixture. No fake assignment or resume is performed."] },
  ] };
}
