import type { ConversationListItem, ConversationScenario, ConversationWorkspace } from "../types";

/** Sample conversations. Names are invented. */
export const demoConversationItems: readonly ConversationListItem[] = [
  { id: "c-42", participant: "Amina S.", preview: "Is the Slate desk lamp available?", time: "10:42", channel: "Web Chat", handler: "Support Agent", state: "processing", unread: true },
  { id: "c-43", participant: "Mira K.", preview: "Please confirm what happened to my reservation.", time: "09:18", channel: "Telegram", handler: "Human Operator", state: "waiting-human", unread: false },
  { id: "c-44", participant: "Dana R.", preview: "I need help with the next step.", time: "Yesterday", channel: "WhatsApp", handler: "Sales Agent", state: "known-failure", unread: false },
] as const;

const baseFacts = [
  { label: "Customer", value: "Amina S.", source: "Customer record", freshness: "Verified" },
  { label: "Business", value: "North Shop", source: "Your account", freshness: "" },
  { label: "Order", value: "Created · ORD-1042", source: "Order record", freshness: "Seen at 10:40" },
  { label: "Reservation", value: "Not confirmed yet", source: "Stock records", freshness: "Needs a recheck" },
  { label: "Product", value: "Desk Lamp · Slate", source: "Catalog", freshness: "Seen at 10:39" },
  { label: "Stock", value: "8 units when last checked", source: "Stock records", freshness: "Not a live count" },
] as const;

const defaultMessages = [
  { id: "m-1", actor: "Customer", time: "10:38", body: "Is the Slate desk lamp available?" },
  { id: "m-2", actor: "Support Agent", time: "10:39", body: "Yes, we have it. Our stock records showed 8 units when last checked, so I'd recommend ordering soon.", delivery: "fixture-observed" },
  { id: "m-3", actor: "System", time: "10:40", body: "Product and stock details were checked for this conversation." },
] as const satisfies ConversationWorkspace["messages"];

function scenarioMessages(scenario: ConversationScenario): ConversationWorkspace["messages"] {
  if (scenario === "handoff") return [...defaultMessages,
    { id: "m-4", actor: "System", time: "10:41", body: "Support handed this conversation to Sales. The customer and order details were carried over; access rights were not." },
    { id: "m-5", actor: "Sales Agent", time: "10:42", body: "Sales is now handling this conversation. Access is still checked before any action." }];
  if (scenario === "waiting-human") return [...defaultMessages,
    { id: "m-4", actor: "System", time: "10:41", body: "Automatic handling stopped. A person needs to review this before it can continue." },
    { id: "m-5", actor: "Human Operator", time: "10:42", body: "Reviewing now. No changes have been made to the order." }];
  if (scenario === "known-failure") return [...defaultMessages,
    { id: "m-4", actor: "System", time: "10:41", body: "Order ORD-1042 exists. Stock could not be reserved for it." },
    { id: "m-5", actor: "Sales Agent", time: "10:42", body: "Check current stock and choose how to proceed. Do not place the same order again." }];
  if (scenario === "outcome-unknown") return [...defaultMessages,
    { id: "m-4", actor: "System", time: "10:41", body: "The stock reservation may have gone through, but no confirmation came back." },
    { id: "m-5", actor: "Support Agent", time: "10:42", body: "The stock records need to be checked before anything else. Do not try to reserve again." }];
  if (scenario === "delivery-failure") return [...defaultMessages,
    { id: "m-4", actor: "System", time: "10:41", body: "Stock reserved. The order is complete." },
    { id: "m-5", actor: "Sales Agent", time: "10:42", body: "Your order is confirmed and the lamp is reserved for you.", delivery: "failed" }];
  return defaultMessages;
}

export function demoConversationWorkspace(scenario: ConversationScenario = "default"): ConversationWorkspace {
  const stateByScenario: Record<ConversationScenario, ConversationWorkspace["state"]> = { default: "processing", handoff: "processing", "waiting-human": "waiting-human", "known-failure": "known-failure", "outcome-unknown": "outcome-unknown", "delivery-failure": "message-delivery-failed" };
  const handlerByScenario: Record<ConversationScenario, ConversationWorkspace["handler"]> = { default: "Support Agent", handoff: "Sales Agent", "waiting-human": "Human Operator", "known-failure": "Sales Agent", "outcome-unknown": "Support Agent", "delivery-failure": "Sales Agent" };
  const notices: Partial<Record<ConversationScenario, NonNullable<ConversationWorkspace["notice"]>>> = {
    handoff: { state: "processing", title: "Handed over from Support to Sales", description: "The conversation details were carried over. Access rights stay the same; they do not transfer with the handover." },
    "waiting-human": { state: "waiting-human", title: "Waiting for a person", description: "Automatic handling stopped. Someone on your team needs to decide." },
    "known-failure": { state: "known-failure", title: "Stock was not reserved", description: "The order exists but no stock is held for it. Check current stock and choose what to do next." },
    "outcome-unknown": { state: "outcome-unknown", title: "Reservation needs checking", description: "The reservation may have gone through, but no confirmation came back. Check the stock records before doing anything else, and do not try to reserve again." },
    "delivery-failure": { state: "message-delivery-failed", title: "Message not delivered", description: "The stock reservation is done. Resend the message only; the reservation itself must not be repeated." },
  };
  return {
    id: "c-42", participant: "Amina S.", subject: "Product availability and order", channel: "Web Chat", handler: handlerByScenario[scenario], state: stateByScenario[scenario], messages: scenarioMessages(scenario), notice: notices[scenario],
    facts: scenario === "known-failure" ? baseFacts.map((fact) => fact.label === "Reservation" ? { ...fact, value: "Not reserved", freshness: "Confirmed result" } : fact) : scenario === "delivery-failure" ? baseFacts.map((fact) => fact.label === "Reservation" ? { ...fact, value: "Reserved", freshness: "Confirmed" } : fact) : baseFacts,
    escalation: scenario === "waiting-human" || scenario === "outcome-unknown" ? { id: "ESC-204", status: scenario === "waiting-human" ? "waiting-human" : "outcome-unknown", label: "Open review case" } : undefined,
  };
}
