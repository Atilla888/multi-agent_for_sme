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
  readonly mode: "sample";
  readonly kpis: readonly OverviewKpi[];
  readonly attention: readonly OverviewAttentionItem[];
  readonly recentOrders: readonly OverviewOrderRow[];
}

const attentionStates: ReadonlySet<ProductState> = new Set(["waiting-human", "outcome-unknown", "known-failure", "stale-conflict"]);

/**
 * Every number on the Overview is counted from the same sample records the Inbox, Needs review
 * and Orders screens show; nothing is invented for this page.
 */
export function getOverviewFixture(): OverviewModel {
  const openConversations = demoConversationItems.length;
  const waitingHuman = demoEscalationQueue.filter((item) => item.state === "waiting-human").length;
  const ordersNeedingAttention = demoOrderItems.filter((order) => attentionStates.has(order.orderState) || attentionStates.has(order.reservationState));

  return {
    mode: "sample",
    kpis: [
      { label: "Open conversations", value: openConversations, note: `${demoConversationItems.filter((item) => item.unread).length} unread`, href: "/conversations" },
      { label: "Waiting for a person", value: waitingHuman, note: `${demoEscalationQueue.length} cases in review`, href: "/escalations" },
      { label: "Orders", value: demoOrderItems.length, note: "in total", href: "/orders" },
      { label: "Orders to check", value: ordersNeedingAttention.length, note: "stock or review needed", href: "/orders?status=attention" },
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
