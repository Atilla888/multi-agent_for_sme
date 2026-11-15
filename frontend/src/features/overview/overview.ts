import { demoConversationItems } from "@/features/conversations/fixtures/demoConversations";
import { demoEscalationQueue } from "@/features/escalations/fixtures/demoEscalations";
import type { EscalationReason, EscalationSummary } from "@/features/escalations/types";
import { demoOrderItems } from "@/features/orders/fixtures/demoOrders";
import type { ProductState } from "@/types/states";

/** Which count a number on the Overview is. */
export type OverviewKpiKind = "openConversations" | "waitingHuman" | "orders" | "ordersToCheck";

export interface OverviewKpi {
  readonly kind: OverviewKpiKind;
  readonly value: number;
  readonly href: string;
}

/** A case that needs a person. The screen names the reason and the time in the reader's language. */
export interface OverviewAttentionItem {
  readonly id: string;
  readonly reason: EscalationReason;
  readonly orderId?: string;
  readonly participant: string;
  readonly time: EscalationSummary["time"];
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
      { kind: "openConversations", value: openConversations, href: "/conversations" },
      { kind: "waitingHuman", value: waitingHuman, href: "/escalations" },
      { kind: "orders", value: demoOrderItems.length, href: "/orders" },
      { kind: "ordersToCheck", value: ordersNeedingAttention.length, href: "/orders?status=attention" },
    ],
    attention: demoEscalationQueue.map((item) => ({
      id: item.id,
      reason: item.reasonKey,
      orderId: item.orderId,
      participant: item.participant,
      time: item.time,
      state: item.state,
      href: "/escalations",
    })),
    recentOrders: demoOrderItems.slice(0, 4).map((order) => ({
      id: order.id,
      customer: order.customer,
      orderState: order.orderState,
      reservationState: order.reservationState,
      href: `/orders/${order.id}`,
    })),
  };
}
