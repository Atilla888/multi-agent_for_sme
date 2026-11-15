import type { ContextFact, ConversationListItem, ConversationScenario, ConversationWorkspace } from "../types";

/** Sample conversations. Names are invented; what customers and agents wrote is shown as written. */
export const demoConversationItems: readonly ConversationListItem[] = [
  { id: "c-42", participant: "Amina S.", preview: "Is the Slate desk lamp available?", time: "10:42", channel: "Web Chat", handler: "Support Agent", state: "processing", unread: true },
  { id: "c-43", participant: "Mira K.", preview: "Please confirm what happened to my reservation.", time: "09:18", channel: "Telegram", handler: "Human Operator", state: "waiting-human", unread: false },
  { id: "c-44", participant: "Dana R.", preview: "I need help with the next step.", time: "Yesterday", channel: "WhatsApp", handler: "Sales Agent", state: "known-failure", unread: false },
] as const;

const baseFacts: readonly ContextFact[] = [
  { label: "customer", value: { record: "Amina S." }, source: "customerRecord", freshness: { key: "verified" } },
  { label: "business", value: { record: "North Shop" }, source: "yourAccount" },
  { label: "order", value: { key: "orderCreated", orderId: "ORD-1042" }, source: "orderRecord", freshness: { key: "seenAt", time: "10:40" } },
  { label: "reservation", value: { key: "notConfirmed" }, source: "stockRecords", freshness: { key: "needsRecheck" } },
  { label: "product", value: { record: "Desk Lamp · Slate" }, source: "catalog", freshness: { key: "seenAt", time: "10:39" } },
  { label: "stock", value: { key: "stockUnits", count: 8 }, source: "stockRecords", freshness: { key: "notLiveCount" } },
];

const defaultMessages = [
  { id: "m-1", actor: "Customer", time: "10:38", body: "Is the Slate desk lamp available?" },
  { id: "m-2", actor: "Support Agent", time: "10:39", body: "Yes, we have it. Our stock records showed 8 units when last checked, so I'd recommend ordering soon.", delivery: "fixture-observed" },
  { id: "m-3", actor: "System", time: "10:40", event: { key: "detailsChecked" } },
] as const satisfies ConversationWorkspace["messages"];

function scenarioMessages(scenario: ConversationScenario): ConversationWorkspace["messages"] {
  if (scenario === "handoff") return [...defaultMessages,
    { id: "m-4", actor: "System", time: "10:41", event: { key: "handedToSales" } },
    { id: "m-5", actor: "Sales Agent", time: "10:42", body: "Sales is now handling this conversation. Access is still checked before any action." }];
  if (scenario === "waiting-human") return [...defaultMessages,
    { id: "m-4", actor: "System", time: "10:41", event: { key: "handedToPerson" } },
    { id: "m-5", actor: "Human Operator", time: "10:42", body: "Reviewing now. No changes have been made to the order." }];
  if (scenario === "known-failure") return [...defaultMessages,
    { id: "m-4", actor: "System", time: "10:41", event: { key: "reservationFailed", orderId: "ORD-1042" } },
    { id: "m-5", actor: "Sales Agent", time: "10:42", body: "Check current stock and choose how to proceed. Do not place the same order again." }];
  if (scenario === "outcome-unknown") return [...defaultMessages,
    { id: "m-4", actor: "System", time: "10:41", event: { key: "reservationUnconfirmed" } },
    { id: "m-5", actor: "Support Agent", time: "10:42", body: "The stock records need to be checked before anything else. Do not try to reserve again." }];
  if (scenario === "delivery-failure") return [...defaultMessages,
    { id: "m-4", actor: "System", time: "10:41", event: { key: "orderComplete" } },
    { id: "m-5", actor: "Sales Agent", time: "10:42", body: "Your order is confirmed and the lamp is reserved for you.", delivery: "failed" }];
  return defaultMessages;
}

function scenarioFacts(scenario: ConversationScenario): readonly ContextFact[] {
  const reservation: Partial<Record<ConversationScenario, ContextFact>> = {
    "known-failure": { label: "reservation", value: { key: "notReserved" }, source: "stockRecords", freshness: { key: "confirmedResult" } },
    "delivery-failure": { label: "reservation", value: { key: "reserved" }, source: "stockRecords", freshness: { key: "confirmed" } },
  };
  const replacement = reservation[scenario];
  return replacement ? baseFacts.map((fact) => fact.label === "reservation" ? replacement : fact) : baseFacts;
}

export function demoConversationWorkspace(scenario: ConversationScenario = "default"): ConversationWorkspace {
  const stateByScenario: Record<ConversationScenario, ConversationWorkspace["state"]> = { default: "processing", handoff: "processing", "waiting-human": "waiting-human", "known-failure": "known-failure", "outcome-unknown": "outcome-unknown", "delivery-failure": "message-delivery-failed" };
  const handlerByScenario: Record<ConversationScenario, ConversationWorkspace["handler"]> = { default: "Support Agent", handoff: "Sales Agent", "waiting-human": "Human Operator", "known-failure": "Sales Agent", "outcome-unknown": "Support Agent", "delivery-failure": "Sales Agent" };
  const notices: Partial<Record<ConversationScenario, NonNullable<ConversationWorkspace["notice"]>>> = {
    handoff: { state: "processing", key: "handoff" },
    "waiting-human": { state: "waiting-human", key: "waitingHuman" },
    "known-failure": { state: "known-failure", key: "knownFailure" },
    "outcome-unknown": { state: "outcome-unknown", key: "outcomeUnknown" },
    "delivery-failure": { state: "message-delivery-failed", key: "deliveryFailure" },
  };
  return {
    id: "c-42", participant: "Amina S.", subject: "availabilityAndOrder", channel: "Web Chat", handler: handlerByScenario[scenario], state: stateByScenario[scenario], messages: scenarioMessages(scenario), notice: notices[scenario],
    facts: scenarioFacts(scenario),
    escalation: scenario === "waiting-human" || scenario === "outcome-unknown" ? { id: "ESC-204", status: scenario === "waiting-human" ? "waiting-human" : "outcome-unknown" } : undefined,
  };
}
