import type { OrderDetailView, OrderListItem, OrderScenario, OrderTime } from "../types";

const today = (time: string): OrderTime => ({ day: "today", time });

/** Sample orders. Each one shows a different situation a shop can run into. */
export const demoOrderItems: readonly OrderListItem[] = [
  { id: "ORD-1042", customerId: "cust-1042", customer: "Amina S.", phone: "+7 701 ••• 42 10", channel: "Instagram", items: "Desk Lamp / Slate × 1", total: "₸ 24 900", orderLabel: "created", orderState: "confirmed", reservationLabel: "reserved", reservationState: "confirmed", updated: today("10:43"), attention: null, scenario: "confirmed" },
  { id: "ORD-1043", customerId: "cust-1043", customer: "Bekzat T.", phone: "+7 702 ••• 18 33", channel: "Web Chat", items: "Desk Lamp / Slate × 1", total: "₸ 24 900", orderLabel: "created", orderState: "confirmed", reservationLabel: "notReserved", reservationState: "known-failure", updated: today("10:43"), attention: "checkStock", scenario: "failed" },
  { id: "ORD-1044", customerId: "cust-1042", customer: "Amina S.", phone: "+7 701 ••• 42 10", channel: "WhatsApp", items: "Desk Lamp / Slate × 1", total: "₸ 24 900", orderLabel: "created", orderState: "confirmed", reservationLabel: "outcome-unknown", reservationState: "outcome-unknown", updated: today("10:43"), attention: "checkBeforeRetrying", scenario: "outcome-unknown" },
  { id: "ORD-1045", customerId: "cust-1043", customer: "Bekzat T.", phone: "+7 702 ••• 18 33", channel: "Telegram", items: "Desk Lamp / Slate × 1", total: "₸ 24 900", orderLabel: "waiting-human", orderState: "waiting-human", reservationLabel: "notReserved", reservationState: "known-failure", updated: today("10:47"), attention: "needsDecision", scenario: "attention" },
  { id: "ORD-1046", customerId: "cust-1042", customer: "Amina S.", phone: "+7 701 ••• 42 10", channel: "Instagram", items: "Desk Lamp / Slate × 1", total: "₸ 24 900", orderLabel: "stale-conflict", orderState: "stale-conflict", reservationLabel: "reservedOlder", reservationState: "confirmed", updated: today("10:43"), attention: "refresh", scenario: "stale" },
  { id: "ORD-1047", customerId: "cust-1042", customer: "Amina S.", phone: "+7 701 ••• 42 10", channel: "WhatsApp", items: "Desk Lamp / Slate × 1", total: "₸ 24 900", orderLabel: "created", orderState: "confirmed", reservationLabel: "reserved", reservationState: "confirmed", updated: today("10:43"), attention: "changesBlocked", scenario: "e02" },
] as const;

/** Facts behind each scenario; the screen words the explanations from the scenario itself. */
const scenarioFacts: Record<OrderScenario, Pick<OrderDetailView, "refs" | "orderDelivery" | "messageDelivery" | "notice">> = {
  confirmed: { refs: { order: "CO-1042", reservation: "R-1042" }, orderDelivery: "noUpdate", messageDelivery: "confirmationNotDelivered", notice: { state: "confirmed" } },
  failed: { refs: {}, orderDelivery: "noUpdate", messageDelivery: "noneSent", notice: { state: "known-failure" } },
  "outcome-unknown": { refs: { reservation: "RI-1044" }, orderDelivery: "noUpdate", messageDelivery: "noneSent", notice: { state: "outcome-unknown" } },
  attention: { refs: {}, orderDelivery: "noUpdate", messageDelivery: "noneSent", notice: { state: "waiting-human" } },
  stale: { refs: {}, orderDelivery: "noUpdate", messageDelivery: "noneSent", notice: { state: "stale-conflict" } },
  e02: { refs: {}, orderDelivery: "noUpdate", messageDelivery: "noneSent", notice: { state: "restricted" } },
};

export function demoOrderDetail(id: string, override?: OrderScenario): OrderDetailView | null {
  const row = demoOrderItems.find((item) => item.id === id); if (!row) return null; const scenario = override ?? row.scenario; const source = demoOrderItems.find((item) => item.scenario === scenario) ?? row;
  return { ...source, id: row.id, customerId: row.customerId, customer: row.customer, scenario, version: 7, observedAt: today("10:43"), currency: "KZT", lines: [{ productId: "prod-lamp", product: "Desk Lamp / Slate", sku: "SKU-LAMP-42", quantity: "1", reservedQuantity: scenario === "confirmed" || scenario === "e02" || scenario === "stale" ? "1" : "0", unitPrice: "24,900 KZT" }], ...scenarioFacts[scenario] };
}
