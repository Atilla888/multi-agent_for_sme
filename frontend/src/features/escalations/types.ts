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
export interface DecisionSection {
  readonly title: "Why automation stopped" | "Confirmed facts" | "Uncertain effect" | "Constraints" | "Next safe step" | "Human decision";
  readonly lines: readonly string[];
}

export interface EscalationDetail extends EscalationSummary {
  readonly handler: string;
  readonly safetyLabel: string;
  readonly sections: readonly DecisionSection[];
  readonly m12Target: boolean;
}

export interface EscalationsScreenModel {
  readonly mode: "LOCAL UI FIXTURE ONLY";
  readonly queue: readonly EscalationSummary[];
  readonly selected: EscalationDetail;
}
