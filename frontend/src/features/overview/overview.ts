import { demoConversationItems } from "@/features/conversations/fixtures/demoConversations";
import { demoEscalationQueue } from "@/features/escalations/fixtures/demoEscalations";
import { demoOrderItems } from "@/features/orders/fixtures/demoOrders";
import type { ProductState } from "@/types/states";

export interface OverviewKpi {
  readonly label: string;
  readonly value: number;
  readonly note: string;
  readonly href: string;
}

export interface OverviewAttentionItem {
  readonly id: string;
  readonly title: string;
  readonly meta: string;
  readonly state: ProductState;
  readonly href: string;
}

export interface OverviewOrderRow {
  readonly id: string;
  readonly customer: string;
  readonly orderState: ProductState;
  readonly reservationState: ProductState;
  readonly href: string;
}

export interface OverviewModel {
  readonly mode: "LOCAL UI FIXTURE";
  readonly kpis: readonly OverviewKpi[];
  readonly attention: readonly OverviewAttentionItem[];
  readonly recentOrders: readonly OverviewOrderRow[];
}

const attentionStates: ReadonlySet<ProductState> = new Set(["waiting-human", "outcome-unknown", "known-failure", "stale-conflict"]);

/**
 * Overview (Figma page 02 · Overview). Every number is counted from the same local fixtures the
 * Conversations, Escalations and Orders screens use; nothing is invented for this page.
 */
export function getOverviewFixture(): OverviewModel {
  const openConversations = demoConversationItems.length;
  const waitingHuman = demoEscalationQueue.filter((item) => item.state === "waiting-human").length;
  const ordersNeedingAttention = demoOrderItems.filter((order) => attentionStates.has(order.orderState) || attentionStates.has(order.reservationState));

  return {
    mode: "LOCAL UI FIXTURE",
    kpis: [
      { label: "Open conversations", value: openConversations, note: `${demoConversationItems.filter((item) => item.unread).length} unread`, href: "/conversations" },
      { label: "Waiting for a human", value: waitingHuman, note: `${demoEscalationQueue.length} escalations in queue`, href: "/escalations" },
      { label: "Orders", value: demoOrderItems.length, note: "in the fixture list", href: "/orders" },
      { label: "Orders needing attention", value: ordersNeedingAttention.length, note: "reservation or review", href: "/orders" },
    ],
    attention: [
      ...demoEscalationQueue.map((item) => ({
        id: item.id,
        title: item.reason,
        meta: [item.orderId, item.participant, item.time].filter(Boolean).join(" · "),
        state: item.state,
        href: "/escalations",
      })),
    ],
    recentOrders: demoOrderItems.slice(0, 4).map((order) => ({
      id: order.id,
      customer: order.customer,
      orderState: order.orderState,
      reservationState: order.reservationState,
      href: `/orders/${order.id}`,
    })),
  };
}
