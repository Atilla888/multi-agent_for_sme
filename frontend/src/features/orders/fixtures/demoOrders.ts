import type { OrderDetailView, OrderListItem, OrderScenario } from "../types";

/** Sample orders. Each one shows a different situation a shop can run into. */
export const demoOrderItems: readonly OrderListItem[] = [
  { id: "ORD-1042", customerId: "cust-1042", customer: "Amina S.", phone: "+7 701 ••• 42 10", channel: "Instagram", items: "Desk Lamp / Slate × 1", total: "₸ 24 900", orderLabel: "Created", orderState: "confirmed", reservationLabel: "Reserved", reservationState: "confirmed", updated: "Today 10:43", attention: "None", scenario: "confirmed" },
  { id: "ORD-1043", customerId: "cust-1043", customer: "Bekzat T.", phone: "+7 702 ••• 18 33", channel: "Web Chat", items: "Desk Lamp / Slate × 1", total: "₸ 24 900", orderLabel: "Created", orderState: "confirmed", reservationLabel: "Not reserved", reservationState: "known-failure", updated: "Today 10:43", attention: "Check stock", scenario: "failed" },
  { id: "ORD-1044", customerId: "cust-1042", customer: "Amina S.", phone: "+7 701 ••• 42 10", channel: "WhatsApp", items: "Desk Lamp / Slate × 1", total: "₸ 24 900", orderLabel: "Created", orderState: "confirmed", reservationLabel: "Needs checking", reservationState: "outcome-unknown", updated: "Today 10:43", attention: "Check before retrying", scenario: "outcome-unknown" },
  { id: "ORD-1045", customerId: "cust-1043", customer: "Bekzat T.", phone: "+7 702 ••• 18 33", channel: "Telegram", items: "Desk Lamp / Slate × 1", total: "₸ 24 900", orderLabel: "Needs a person", orderState: "waiting-human", reservationLabel: "Not reserved", reservationState: "known-failure", updated: "Today 10:47", attention: "Needs a decision", scenario: "attention" },
  { id: "ORD-1046", customerId: "cust-1042", customer: "Amina S.", phone: "+7 701 ••• 42 10", channel: "Instagram", items: "Desk Lamp / Slate × 1", total: "₸ 24 900", orderLabel: "May be out of date", orderState: "stale-conflict", reservationLabel: "Reserved (older record)", reservationState: "confirmed", updated: "Today 10:43", attention: "Refresh", scenario: "stale" },
  { id: "ORD-1047", customerId: "cust-1042", customer: "Amina S.", phone: "+7 701 ••• 42 10", channel: "WhatsApp", items: "Desk Lamp / Slate × 1", total: "₸ 24 900", orderLabel: "Created", orderState: "confirmed", reservationLabel: "Reserved", reservationState: "confirmed", updated: "Today 10:43", attention: "Changes blocked", scenario: "e02" },
] as const;

const scenarioCopy: Record<OrderScenario, Pick<OrderDetailView, "createEvidence" | "reservationEvidence" | "orderDelivery" | "messageDelivery" | "notice" | "nextStep" | "nextDetail">> = {
  confirmed: {
    createEvidence: "Order created (ref CO-1042)",
    reservationEvidence: "Stock reserved (ref R-1042)",
    orderDelivery: "No delivery update yet",
    messageDelivery: "Confirmation message to the customer was not delivered",
    notice: { state: "confirmed", title: "Order created and stock reserved", description: "The confirmation message to the customer did not go through. Resend the message only; the order and the reservation are already done." },
    nextStep: "Nothing to fix on the order",
    nextDetail: "If the customer asks about delivery, check the delivery status first. A created order does not mean it has shipped.",
  },
  failed: {
    createEvidence: "Order created",
    reservationEvidence: "Stock could not be reserved",
    orderDelivery: "No delivery update yet",
    messageDelivery: "No message sent yet",
    notice: { state: "known-failure", title: "Stock was not reserved", description: "The order exists, but no stock is held for it. This result is clear, so there is nothing to double-check; decide what to do next." },
    nextStep: "Check current stock",
    nextDetail: "Look at what is in stock now and choose what to do. Do not create the same order again.",
  },
  "outcome-unknown": {
    createEvidence: "Order created",
    reservationEvidence: "Reservation sent (ref RI-1044), no confirmation received",
    orderDelivery: "No delivery update yet",
    messageDelivery: "No message sent yet",
    notice: { state: "outcome-unknown", title: "Reservation needs checking", description: "The reservation may have gone through, but no confirmation came back. Check the stock records before doing anything else, and do not try to reserve again." },
    nextStep: "Check the stock records",
    nextDetail: "Look up reference RI-1044 in the stock records. There is no retry button on purpose: reserving again could hold the stock twice.",
  },
  attention: {
    createEvidence: "Order created",
    reservationEvidence: "Stock could not be reserved",
    orderDelivery: "No delivery update yet",
    messageDelivery: "No message sent yet",
    notice: { state: "waiting-human", title: "A person needs to decide", description: "The result is clear, but what to do next is a judgment call for your team." },
    nextStep: "Open the review case",
    nextDetail: "Review the order and current stock. Deciding does not change anything by itself.",
  },
  stale: {
    createEvidence: "Order version 7 was seen; a newer version may exist",
    reservationEvidence: "Stock was reserved when last seen; check it is still current",
    orderDelivery: "No delivery update yet",
    messageDelivery: "No message sent yet",
    notice: { state: "stale-conflict", title: "This order may be out of date", description: "A newer version may exist. Refresh before making any decision based on it." },
    nextStep: "Refresh and check again",
    nextDetail: "Compare with the current order and stock records. Do not repeat an earlier change.",
  },
  e02: {
    createEvidence: "Order created; no changes have been made",
    reservationEvidence: "Stock remains reserved",
    orderDelivery: "No delivery update yet",
    messageDelivery: "No message sent yet",
    notice: { state: "restricted", title: "Order changes are blocked", description: "Editing orders is switched off by policy. Nothing was changed. This is not a problem with the order or the stock." },
    nextStep: "Ask for a manual change",
    nextDetail: "If the order must change, use your usual manual process. Nothing on this screen can override the policy.",
  },
};

export function demoOrderDetail(id: string, override?: OrderScenario): OrderDetailView | null {
  const row = demoOrderItems.find((item) => item.id === id); if (!row) return null; const scenario = override ?? row.scenario; const source = demoOrderItems.find((item) => item.scenario === scenario) ?? row;
  return { ...source, id: row.id, customerId: row.customerId, customer: row.customer, scenario, version: 7, observedAt: "Last updated today at 10:43", currency: "KZT", lines: [{ productId: "prod-lamp", product: "Desk Lamp / Slate", sku: "SKU-LAMP-42", quantity: "1", reservedQuantity: scenario === "confirmed" || scenario === "e02" || scenario === "stale" ? "1" : "0", unitPrice: "24,900 KZT" }], ...scenarioCopy[scenario] };
}
