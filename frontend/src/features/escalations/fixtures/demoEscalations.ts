import { escalations } from "@/i18n/messages/escalations";
import type { DecisionLine, DecisionSection, DecisionSectionId, EscalationDetail, EscalationScenario, EscalationSummary, PlainDecisionLine } from "../types";

/** A review case with its reason worded in English too, for screens that do not translate it yet. */
function summary(item: Omit<EscalationSummary, "reason">): EscalationSummary {
  return { ...item, reason: escalations.en.reasons[item.reasonKey] };
}

/** Sample review cases. */
export const demoEscalationQueue: readonly EscalationSummary[] = [
  summary({ id: "ESC-204", conversationId: "c-42", orderId: "ORD-1042", participant: "Amina S.", reasonKey: "reservationDecision", time: "10:42", state: "waiting-human" }),
  summary({ id: "ESC-205", conversationId: "c-43", participant: "Mira K.", reasonKey: "orderChangeBlocked", time: "09:18", state: "restricted" }),
  summary({ id: "ESC-206", conversationId: "c-44", orderId: "ORD-1090", participant: "Dana R.", reasonKey: "stockNotReserved", time: "Yesterday", state: "known-failure" }),
];

const sectionOrder: readonly DecisionSectionId[] = ["why-it-stopped", "what-we-know", "what-is-uncertain", "what-not-to-do", "next-step", "your-decision"];

/** The six questions in order; a plain key stands for a line without values. */
function sections(...answers: readonly (readonly (PlainDecisionLine | DecisionLine)[])[]): readonly DecisionSection[] {
  return sectionOrder.map((id, index) => ({ id, lines: (answers[index] ?? []).map((line) => typeof line === "string" ? { key: line } : line) }));
}

const base = {
  id: "ESC-204", conversationId: "c-42", orderId: "ORD-1042", participant: "Amina S.", reasonKey: "reservationDecision", time: "10:42",
} as const;

export function demoEscalationDetail(scenario: EscalationScenario): EscalationDetail {
  const selectedBase = scenario === "restricted"
    ? { id: "ESC-205", conversationId: "c-43", participant: "Mira K.", reasonKey: "orderChangeBlocked", time: "09:18" } as const
    : scenario === "known-failure"
      ? { id: "ESC-206", conversationId: "c-44", orderId: "ORD-1090", participant: "Dana R.", reasonKey: "stockNotReserved", time: "Yesterday" } as const
      : base;
  if (scenario === "outcome-unknown") return { ...summary({ ...base, state: "outcome-unknown" }), handler: "nobody", situation: "checkBeforeRetry", m12Target: false, sections: sections(
    ["noConfirmation"],
    [{ key: "orderExists", orderId: "ORD-1042" }, "requestSent"],
    ["mayBeReserved"],
    ["dontReserveAgain", "dontAssumeFailed"],
    [{ key: "checkStockRecords", reference: "RI-1044" }],
    ["reviewOnly"],
  ) };
  if (scenario === "known-failure") return { ...summary({ ...selectedBase, state: "known-failure" }), handler: "humanOperator", situation: "clearResult", m12Target: false, sections: sections(
    ["stockNotReserved"],
    [{ key: "orderExists", orderId: "ORD-1042" }, "noStockHeld"],
    ["resultClear"],
    ["dontRepeatOrder", "changesBlocked"],
    ["checkCurrentStock"],
    ["decisionsUnavailable"],
  ) };
  if (scenario === "restricted") return { ...summary({ ...selectedBase, state: "restricted" }), handler: "humanOperator", situation: "blockedByPolicy", m12Target: false, sections: sections(
    ["changeNotAllowed"],
    ["orderNotChanged", "dontReportChanged"],
    ["changeDidNotRun"],
    ["notAccessOrStock"],
    ["useManualProcess"],
    ["nothingToApprove"],
  ) };
  if (scenario === "resume-target") return { ...summary({ ...base, state: "target-only" }), handler: "humanOperator", situation: "paused", m12Target: true, sections: sections(
    ["workPaused"],
    ["pausedPreview"],
    ["notRechecked"],
    ["neverRepeat"],
    ["resumeLater"],
    ["resumeOff"],
  ) };
  if (scenario === "resolved") return { ...summary({ ...base, state: "confirmed" }), handler: "humanOperator", situation: "resolved", m12Target: false, sections: sections(
    ["neededPerson"],
    ["caseResolved"],
    ["nothingOutstanding"],
    ["resolvedKeepsConversation"],
    ["keepHistory"],
    ["noActionNeeded"],
  ) };
  return { ...summary({ ...base, state: "waiting-human" }), handler: "nobody", situation: "automationStopped", m12Target: false, sections: sections(
    ["needsOwner"],
    [{ key: "belongsToCase", conversationId: "c-42", orderId: "ORD-1042" }, "supportHandled"],
    ["noDecisionYet"],
    ["accessCheckedSeparately"],
    ["assignSomeone"],
    ["assigningUnavailable"],
  ) };
}
