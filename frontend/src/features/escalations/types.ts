import type { ProductState } from "@/types/states";

export type EscalationScenario = "waiting-human" | "outcome-unknown" | "known-failure" | "restricted" | "resume-target" | "resolved";

export interface EscalationSummary {
  readonly id: string;
  readonly conversationId: string;
  readonly orderId?: string;
  readonly participant: string;
  readonly reason: string;
  readonly time: string;
  readonly state: ProductState;
}

/** The six questions every review case answers, in this order. */
export type DecisionSectionTitle = "Why it stopped" | "What we know" | "What is uncertain" | "What not to do" | "Next step" | "Your decision";

export interface DecisionSection {
  readonly title: DecisionSectionTitle;
  readonly lines: readonly string[];
}

export interface EscalationDetail extends EscalationSummary {
  readonly handler: string;
  readonly safetyLabel: string;
  readonly sections: readonly DecisionSection[];
  /** True when the case shows the planned "resume automatically" option, which is not built yet. */
  readonly m12Target: boolean;
}

export interface EscalationsScreenModel {
  readonly mode: "sample";
  readonly queue: readonly EscalationSummary[];
  readonly selected: EscalationDetail;
}
