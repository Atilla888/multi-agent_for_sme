export type WebChatActor =
  | "Customer"
  | "Sales Agent"
  | "Support Agent"
  | "Analytics Agent"
  | "Human Operator"
  | "System";

export type WebChatViewState =
  | "initial"
  | "active"
  | "clarification"
  | "confirmation"
  | "processing"
  | "confirmed"
  | "known-failure"
  | "waiting-human"
  | "confirmation-pending"
  | "delivery-failure"
  | "loading"
  | "unavailable";

export type MessageDeliveryState = "sent" | "delivered" | "pending" | "failed";

/** Who the customer sees as the writer: themselves, the business, or a team at the business. The screen words it. */
export type WebChatSender = "you" | "business" | "support" | "sales" | "team";

export interface WebChatMessage {
  readonly id: string;
  readonly actor: WebChatActor;
  readonly sender: WebChatSender;
  readonly body: string;
  readonly time: string;
  readonly delivery: MessageDeliveryState;
}

export interface WebChatScreenModel {
  readonly mode: "sample";
  readonly businessName: string;
  readonly state: WebChatViewState;
  readonly messages: readonly WebChatMessage[];
  readonly transportConfigured: false;
}
