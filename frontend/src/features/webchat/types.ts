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

export interface WebChatMessage {
  readonly id: string;
  readonly actor: WebChatActor;
  readonly customerLabel: string;
  readonly body: string;
  readonly time: string;
  readonly delivery: MessageDeliveryState;
}

export interface WebChatScreenModel {
  readonly mode: "LOCAL UI FIXTURE ONLY";
  readonly businessName: string;
  readonly state: WebChatViewState;
  readonly messages: readonly WebChatMessage[];
  readonly transportConfigured: false;
}
