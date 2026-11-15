import type { ProductState } from "@/types/states";

export type ConversationActor =
  | "Customer"
  | "Human Operator"
  | "Sales Agent"
  | "Support Agent"
  | "Analytics Agent"
  | "System";

/** Who is handling a conversation: an AI agent or a person on the team. */
export type ConversationHandler = Exclude<ConversationActor, "Customer" | "System">;

/** A sample clock time such as "10:42", or "Yesterday", which the screen translates. */
export type SampleTime = `${number}:${number}` | "Yesterday";

export interface ConversationListItem {
  readonly id: string;
  readonly participant: string;
  readonly preview: string;
  readonly time: SampleTime;
  readonly channel: string;
  readonly handler: ConversationHandler;
  readonly state: ProductState;
  readonly unread: boolean;
}

/** An event the app writes into the timeline. The screen words it in the reader's language. */
export type ConversationSystemEvent =
  | { readonly key: "detailsChecked" | "handedToSales" | "handedToPerson" | "reservationUnconfirmed" | "orderComplete" }
  | { readonly key: "reservationFailed"; readonly orderId: string };

/** A message a customer, an agent or a person wrote (shown as written), or a system event. */
export type ConversationMessage =
  | {
    readonly id: string;
    readonly actor: Exclude<ConversationActor, "System">;
    readonly time: string;
    readonly body: string;
    readonly delivery?: "fixture-observed" | "not-connected" | "failed";
  }
  | {
    readonly id: string;
    readonly actor: "System";
    readonly time: string;
    readonly event: ConversationSystemEvent;
  };

/** What a fact in the details panel is about. */
export type ContextFactLabel = "customer" | "business" | "order" | "reservation" | "product" | "stock";
/** Where a fact comes from. */
export type ContextFactSource = "customerRecord" | "yourAccount" | "orderRecord" | "stockRecords" | "catalog";
/** A fact's value: a name shown as written, or a status the screen words. */
export type ContextFactValue =
  | { readonly record: string }
  | { readonly key: "notConfirmed" | "notReserved" | "reserved" }
  | { readonly key: "orderCreated"; readonly orderId: string }
  | { readonly key: "stockUnits"; readonly count: number };
/** How current a fact is. */
export type ContextFactFreshness =
  | { readonly key: "verified" | "needsRecheck" | "notLiveCount" | "confirmedResult" | "confirmed" }
  | { readonly key: "seenAt"; readonly time: string };

export interface ContextFact {
  readonly label: ContextFactLabel;
  readonly value: ContextFactValue;
  readonly source: ContextFactSource;
  readonly freshness?: ContextFactFreshness;
}

/** The notice shown under the timeline for a scenario. */
export type ConversationNotice = "handoff" | "waitingHuman" | "knownFailure" | "outcomeUnknown" | "deliveryFailure";

export interface ConversationWorkspace {
  readonly id: string;
  readonly participant: string;
  readonly subject: "availabilityAndOrder";
  readonly channel: string;
  readonly handler: ConversationHandler;
  readonly state: ProductState;
  readonly messages: readonly ConversationMessage[];
  readonly notice?: {
    readonly state: ProductState;
    readonly key: ConversationNotice;
  };
  readonly facts: readonly ContextFact[];
  readonly escalation?: {
    readonly id: string;
    readonly status: ProductState;
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
  readonly mode: "sample";
  readonly items: readonly ConversationListItem[];
  readonly selected: ConversationWorkspace | null;
  readonly validationState: ConversationValidationState;
}
