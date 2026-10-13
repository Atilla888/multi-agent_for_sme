import type { ProductState } from "@/types/states";

export type ConversationActor =
  | "Customer"
  | "Human Operator"
  | "Sales Agent"
  | "Support Agent"
  | "Analytics Agent"
  | "System";

export interface ConversationListItem {
  readonly id: string;
  readonly participant: string;
  readonly preview: string;
  readonly time: string;
  readonly channel: string;
  readonly handler: string;
  readonly state: ProductState;
  readonly unread: boolean;
}
export interface ConversationMessage {
  readonly id: string;
  readonly actor: ConversationActor;
  readonly time: string;
  readonly body: string;
  readonly delivery?: "fixture-observed" | "not-connected" | "failed";
}

export interface ContextFact {
  readonly label: string;
  readonly value: string;
  readonly source: string;
  readonly freshness: string;
}

export interface ConversationWorkspace {
  readonly id: string;
  readonly participant: string;
  readonly subject: string;
  readonly channel: string;
  readonly handler: "Sales Agent" | "Support Agent" | "Analytics Agent" | "Human Operator";
  readonly state: ProductState;
  readonly messages: readonly ConversationMessage[];
  readonly notice?: {
    readonly state: ProductState;
    readonly title: string;
    readonly description: string;
  };
  readonly facts: readonly ContextFact[];
  readonly escalation?: {
    readonly id: string;
    readonly status: ProductState;
    readonly label: string;
  };
}

export type ConversationValidationState =
  | "default"
  | "loading"
  | "empty"
  | "restricted"
  | "m08-unavailable";

export type ConversationScenario =
  | "default"
  | "handoff"
  | "waiting-human"
  | "known-failure"
  | "outcome-unknown"
  | "delivery-failure";

export interface ConversationScreenModel {
  readonly mode: "LOCAL UI FIXTURE ONLY";
  readonly items: readonly ConversationListItem[];
  readonly selected: ConversationWorkspace | null;
  readonly validationState: ConversationValidationState;
}
