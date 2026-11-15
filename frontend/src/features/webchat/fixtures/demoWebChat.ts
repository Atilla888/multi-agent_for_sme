import type { WebChatMessage, WebChatScreenModel, WebChatViewState } from "../types";

const customerRequest: WebChatMessage = {
  id: "fixture-message-customer-1",
  actor: "Customer",
  sender: "you",
  body: "I would like one Desk Lamp in Slate.",
  time: "10:41",
  delivery: "sent",
};

const supportReply: WebChatMessage = {
  id: "fixture-message-support-1",
  actor: "Support Agent",
  sender: "support",
  body: "I can help with your request.",
  time: "10:42",
  delivery: "delivered",
};

const stateReplies: Partial<Record<WebChatViewState, WebChatMessage>> = {
  clarification: { ...supportReply, id: "fixture-message-clarification", body: "Which size would you like?" },
  confirmation: { ...supportReply, id: "fixture-message-confirmation", actor: "Sales Agent", sender: "sales", body: "Please review the details before placing your order." },
  processing: { ...supportReply, id: "fixture-message-processing", actor: "System", sender: "business", body: "We are checking your request.", delivery: "pending" },
  confirmed: { ...supportReply, id: "fixture-message-confirmed", actor: "Sales Agent", sender: "sales", body: "Your order update is ready." },
  "known-failure": { ...supportReply, id: "fixture-message-known-failure", actor: "Sales Agent", sender: "sales", body: "There is an update about your order." },
  "waiting-human": { ...supportReply, id: "fixture-message-waiting-human", actor: "Human Operator", sender: "team", body: "A person will review your request.", delivery: "pending" },
  "confirmation-pending": { ...supportReply, id: "fixture-message-confirmation-pending", actor: "System", sender: "business", body: "We are checking whether your request went through.", delivery: "pending" },
  "delivery-failure": { ...supportReply, id: "fixture-message-delivery-failure", actor: "System", sender: "business", body: "Your order was created and the item was reserved.", delivery: "failed" },
};

export function buildDemoWebChat(state: WebChatViewState): WebChatScreenModel {
  const messages = state === "initial" || state === "loading" || state === "unavailable"
    ? []
    : [customerRequest, stateReplies[state] ?? supportReply];

  return { mode: "sample", businessName: "North Shop", state, messages, transportConfigured: false };
}
