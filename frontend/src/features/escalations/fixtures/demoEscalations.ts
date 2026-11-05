import type { EscalationDetail, EscalationScenario, EscalationSummary } from "../types";

/** Sample review cases. */
export const demoEscalationQueue: readonly EscalationSummary[] = [
  { id: "ESC-204", conversationId: "c-42", orderId: "ORD-1042", participant: "Amina S.", reason: "Stock reservation needs a decision", time: "10:42", state: "waiting-human" },
  { id: "ESC-205", conversationId: "c-43", participant: "Mira K.", reason: "Order change is not allowed", time: "09:18", state: "restricted" },
  { id: "ESC-206", conversationId: "c-44", orderId: "ORD-1090", participant: "Dana R.", reason: "Stock could not be reserved", time: "Yesterday", state: "known-failure" },
] as const;

const base = {
  id: "ESC-204", conversationId: "c-42", orderId: "ORD-1042", participant: "Amina S.", reason: "Stock reservation needs a decision", time: "10:42",
} as const;

export function demoEscalationDetail(scenario: EscalationScenario): EscalationDetail {
  const selectedBase = scenario === "restricted"
    ? { id: "ESC-205", conversationId: "c-43", participant: "Mira K.", reason: "Order change is not allowed", time: "09:18" }
    : scenario === "known-failure"
      ? { id: "ESC-206", conversationId: "c-44", orderId: "ORD-1090", participant: "Dana R.", reason: "Stock could not be reserved", time: "Yesterday" }
      : base;
  if (scenario === "outcome-unknown") return { ...base, state: "outcome-unknown", handler: "Nobody yet", safetyLabel: "Check before retrying", m12Target: false, sections: [
    { title: "Why it stopped", lines: ["The stock reservation did not return a confirmation."] },
    { title: "What we know", lines: ["Order ORD-1042 exists.", "The reservation request was sent."] },
    { title: "What is uncertain", lines: ["The stock may or may not be reserved."] },
    { title: "What not to do", lines: ["Do not reserve again until the records are checked.", "Do not assume it failed just because there is no confirmation."] },
    { title: "Next step", lines: ["Check the stock records for reference RI-1044."] },
    { title: "Your decision", lines: ["Review only for now. Reconciling from this screen is not available yet."] },
  ] };
  if (scenario === "known-failure") return { ...selectedBase, state: "known-failure", handler: "Human Operator", safetyLabel: "Clear result", m12Target: false, sections: [
    { title: "Why it stopped", lines: ["Stock could not be reserved."] },
    { title: "What we know", lines: ["Order ORD-1042 exists.", "No stock is held for it."] },
    { title: "What is uncertain", lines: ["Nothing. The result is clear."] },
    { title: "What not to do", lines: ["Do not place the same order again.", "Order changes are blocked by policy."] },
    { title: "Next step", lines: ["Check current stock and choose how to proceed."] },
    { title: "Your decision", lines: ["Decision actions are not available from this screen yet."] },
  ] };
  if (scenario === "restricted") return { ...selectedBase, state: "restricted", handler: "Human Operator", safetyLabel: "Blocked by policy", m12Target: false, sections: [
    { title: "Why it stopped", lines: ["The requested order change is not allowed by policy."] },
    { title: "What we know", lines: ["The order was not changed.", "Nothing on the order should be reported as changed."] },
    { title: "What is uncertain", lines: ["Nothing. The change did not run."] },
    { title: "What not to do", lines: ["Do not treat this as an access problem or a stock problem."] },
    { title: "Next step", lines: ["Use your usual manual process if the order must change."] },
    { title: "Your decision", lines: ["Nothing can be approved from this screen."] },
  ] };
  if (scenario === "resume-target") return { ...base, state: "target-only", handler: "Human Operator", safetyLabel: "Paused", m12Target: true, sections: [
    { title: "Why it stopped", lines: ["Earlier automated work is paused, waiting for a decision."] },
    { title: "What we know", lines: ["This case shows how a paused case will look."] },
    { title: "What is uncertain", lines: ["Current details have not been re-checked."] },
    { title: "What not to do", lines: ["Never repeat work that was already completed."] },
    { title: "Next step", lines: ["Resuming will be available once it is built and tested."] },
    { title: "Your decision", lines: ["Resume stays switched off for now."] },
  ] };
  if (scenario === "resolved") return { ...base, state: "confirmed", handler: "Human Operator", safetyLabel: "Resolved", m12Target: false, sections: [
    { title: "Why it stopped", lines: ["The case needed a person earlier."] },
    { title: "What we know", lines: ["The case is resolved."] },
    { title: "What is uncertain", lines: ["Nothing outstanding."] },
    { title: "What not to do", lines: ["A resolved case does not close the conversation."] },
    { title: "Next step", lines: ["Keep the decision as read-only history."] },
    { title: "Your decision", lines: ["No action is needed."] },
  ] };
  return { ...base, state: "waiting-human", handler: "Nobody yet", safetyLabel: "Automatic handling stopped", m12Target: false, sections: [
    { title: "Why it stopped", lines: ["A person needs to take ownership before it can continue."] },
    { title: "What we know", lines: ["Conversation c-42 and order ORD-1042 belong to this case.", "Support handled it before it stopped."] },
    { title: "What is uncertain", lines: ["No decision has been recorded yet."] },
    { title: "What not to do", lines: ["Do not act on what is visible here alone; access is checked separately."] },
    { title: "Next step", lines: ["Assign someone on the team."] },
    { title: "Your decision", lines: ["Assigning and deciding from this screen are not available yet."] },
  ] };
}
