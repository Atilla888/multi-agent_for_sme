import type { ProductState } from "@/types/states";

export type EscalationScenario = "waiting-human" | "outcome-unknown" | "known-failure" | "restricted" | "resume-target" | "resolved";

/** Why a case was opened; the screen words it under escalations.reasons. */
export type EscalationReason = "reservationDecision" | "orderChangeBlocked" | "stockNotReserved";

export interface EscalationSummary {
  readonly id: string;
  readonly conversationId: string;
  readonly orderId?: string;
  readonly participant: string;
  readonly reasonKey: EscalationReason;
  /** The same reason in English, for screens that do not translate it yet. Needs review uses reasonKey. */
  readonly reason: string;
  /** A sample clock time such as "10:42", or "Yesterday", which the screen translates. */
  readonly time: `${number}:${number}` | "Yesterday";
  readonly state: ProductState;
}

/** The six questions every review case answers, in this order. */
export type DecisionSectionId = "why-it-stopped" | "what-we-know" | "what-is-uncertain" | "what-not-to-do" | "next-step" | "your-decision";

/** One line under a question; the screen words it under escalations.lines. */
export type DecisionLine =
  | { readonly key: PlainDecisionLine }
  | { readonly key: "orderExists"; readonly orderId: string }
  | { readonly key: "checkStockRecords"; readonly reference: string }
  | { readonly key: "belongsToCase"; readonly conversationId: string; readonly orderId: string };

export type PlainDecisionLine =
  | "noConfirmation" | "requestSent" | "mayBeReserved" | "dontReserveAgain" | "dontAssumeFailed" | "reviewOnly"
  | "stockNotReserved" | "noStockHeld" | "resultClear" | "dontRepeatOrder" | "changesBlocked" | "checkCurrentStock" | "decisionsUnavailable"
  | "changeNotAllowed" | "orderNotChanged" | "dontReportChanged" | "changeDidNotRun" | "notAccessOrStock" | "useManualProcess" | "nothingToApprove"
  | "workPaused" | "pausedPreview" | "notRechecked" | "neverRepeat" | "resumeLater" | "resumeOff"
  | "neededPerson" | "caseResolved" | "nothingOutstanding" | "resolvedKeepsConversation" | "keepHistory" | "noActionNeeded"
  | "needsOwner" | "supportHandled" | "noDecisionYet" | "accessCheckedSeparately" | "assignSomeone" | "assigningUnavailable";

export interface DecisionSection {
  readonly id: DecisionSectionId;
  readonly lines: readonly DecisionLine[];
}

export interface EscalationDetail extends EscalationSummary {
  /** Who has the case: nobody yet, or a person on the team. */
  readonly handler: "nobody" | "humanOperator";
  /** A short word for where the case stands, under escalations.situations. */
  readonly situation: "checkBeforeRetry" | "clearResult" | "blockedByPolicy" | "paused" | "resolved" | "automationStopped";
  readonly sections: readonly DecisionSection[];
  /** True when the case shows the planned "resume automatically" option, which is not built yet. */
  readonly m12Target: boolean;
}

export interface EscalationsScreenModel {
  readonly mode: "sample";
  readonly queue: readonly EscalationSummary[];
  readonly selected: EscalationDetail;
}
