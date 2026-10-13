import type { ConversationListItem, ConversationScenario, ConversationWorkspace } from "../types";

export const demoConversationItems: readonly ConversationListItem[] = [
  { id: "c-42", participant: "Amina S.", preview: "Is the Slate desk lamp available?", time: "10:42", channel: "Web Chat · demo context", handler: "Support Agent", state: "processing", unread: true },
  { id: "c-43", participant: "Mira K.", preview: "Please confirm what happened to my reservation.", time: "09:18", channel: "Channel unavailable", handler: "Human Operator", state: "waiting-human", unread: false },
  { id: "c-44", participant: "Dana R.", preview: "I need help with the next safe step.", time: "Yesterday", channel: "Channel unavailable", handler: "Sales Agent", state: "known-failure", unread: false },
] as const;

const baseFacts = [
  { label: "Customer", value: "Amina S. · fixture identity", source: "Demo fixture", freshness: "Not live" },
  { label: "Current business", value: "North Shop", source: "Demo fixture", freshness: "Not an authorized session" },
  { label: "Order state", value: "Created · ORD-1042", source: "Scenario evidence", freshness: "Observed at 10:40" },
  { label: "Reservation state", value: "Not yet confirmed", source: "Scenario evidence", freshness: "Recheck required" },
  { label: "Product", value: "Desk Lamp · Slate", source: "Verified scenario context", freshness: "Observed at 10:39" },
  { label: "Inventory", value: "Observed: 8 units", source: "Inventory observation", freshness: "Not a live-stock promise" },
] as const;

const defaultMessages = [
  { id: "m-1", actor: "Customer", time: "10:38", body: "Is the Slate desk lamp available?" },
  { id: "m-2", actor: "Support Agent", time: "10:39", body: "The product exists. I found an inventory observation of 8 units, but that observation is not a promise of live stock.", delivery: "fixture-observed" },
  { id: "m-3", actor: "System", time: "10:40", body: "Verified Product and Inventory context recorded for this demonstration. No live channel delivery occurred." },
] as const satisfies ConversationWorkspace["messages"];

function scenarioMessages(scenario: ConversationScenario): ConversationWorkspace["messages"] {
  if (scenario === "handoff") return [...defaultMessages,
    { id: "m-4", actor: "System", time: "10:41", body: "Support proposed a handoff to Sales. Verified customer and order context was carried forward; permissions did not transfer." },
    { id: "m-5", actor: "Sales Agent", time: "10:42", body: "Sales is now the active handler for this fixture scenario. Authorization must still be checked before any action." }];
  if (scenario === "waiting-human") return [...defaultMessages,
    { id: "m-4", actor: "System", time: "10:41", body: "Automation stopped. Human review is required before the scenario can continue." },
    { id: "m-5", actor: "Human Operator", time: "10:42", body: "Review pending. No business mutation has been requested." }];
  if (scenario === "known-failure") return [...defaultMessages,
    { id: "m-4", actor: "System", time: "10:41", body: "Order ORD-1042 exists. Inventory reservation failed; inventory is not reserved." },
    { id: "m-5", actor: "Sales Agent", time: "10:42", body: "Review current inventory and choose an authorized recovery path. Do not place the same order again." }];
  if (scenario === "outcome-unknown") return [...defaultMessages,
    { id: "m-4", actor: "System", time: "10:41", body: "OUTCOME_UNKNOWN: the reservation effect may have committed, but confirmation is unavailable." },
    { id: "m-5", actor: "Support Agent", time: "10:42", body: "Reconciliation against authoritative reservation state is required. Do not retry the mutation blindly." }];
  if (scenario === "delivery-failure") return [...defaultMessages,
    { id: "m-4", actor: "System", time: "10:41", body: "Reservation confirmed. The business effect remains confirmed." },
    { id: "m-5", actor: "Sales Agent", time: "10:42", body: "The customer message was not delivered. Retry communication only; do not replay reserve_inventory.", delivery: "failed" }];
  return defaultMessages;
}
export function demoConversationWorkspace(scenario: ConversationScenario = "default"): ConversationWorkspace {
  const stateByScenario: Record<ConversationScenario, ConversationWorkspace["state"]> = { default: "processing", handoff: "processing", "waiting-human": "waiting-human", "known-failure": "known-failure", "outcome-unknown": "outcome-unknown", "delivery-failure": "message-delivery-failed" };
  const handlerByScenario: Record<ConversationScenario, ConversationWorkspace["handler"]> = { default: "Support Agent", handoff: "Sales Agent", "waiting-human": "Human Operator", "known-failure": "Sales Agent", "outcome-unknown": "Support Agent", "delivery-failure": "Sales Agent" };
  const notices: Partial<Record<ConversationScenario, NonNullable<ConversationWorkspace["notice"]>>> = {
    handoff: { state: "processing", title: "Support to Sales handoff", description: "Context is preserved, but authorization does not transfer. This is a local fixture event, not live adaptive orchestration." },
    "waiting-human": { state: "waiting-human", title: "Waiting for human review", description: "Automation stopped. A human decision or assignment is pending." },
    "known-failure": { state: "known-failure", title: "Reservation failed — result known", description: "The order exists and inventory is not reserved. Review current facts and choose an authorized recovery." },
    "outcome-unknown": { state: "outcome-unknown", title: "Reservation outcome is unknown", description: "The effect may have committed. Confirmation is unavailable. Reconcile authoritative reservation state before continuation; no blind mutation retry." },
    "delivery-failure": { state: "message-delivery-failed", title: "Message delivery failed", description: "The reservation remains confirmed. Retry communication only; never replay the confirmed business effect." },
  };
  return {
    id: "c-42", participant: "Amina S.", subject: "Product availability and order context", channel: "Web Chat · demonstration only", handler: handlerByScenario[scenario], state: stateByScenario[scenario], messages: scenarioMessages(scenario), notice: notices[scenario],
    facts: scenario === "known-failure" ? baseFacts.map((fact) => fact.label === "Reservation state" ? { ...fact, value: "Failed · inventory not reserved", freshness: "Known result" } : fact) : scenario === "delivery-failure" ? baseFacts.map((fact) => fact.label === "Reservation state" ? { ...fact, value: "Confirmed", freshness: "Business effect confirmed" } : fact) : baseFacts,
    escalation: scenario === "waiting-human" || scenario === "outcome-unknown" ? { id: "ESC-204", status: scenario === "waiting-human" ? "waiting-human" : "outcome-unknown", label: "Open escalation fixture" } : undefined,
  };
}
