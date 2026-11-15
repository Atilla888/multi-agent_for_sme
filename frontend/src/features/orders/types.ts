import type { BusinessValidationState } from "@/features/business";
import type { ProductState } from "@/types/states";
export type OrderScenario = "confirmed" | "failed" | "outcome-unknown" | "attention" | "stale" | "e02";
/** Words under Order status: "created", or a shared status word (translated by `states`). */
export type OrderLabel = "created" | Extract<ProductState, "waiting-human" | "stale-conflict">;
/** Words under Stock reservation: an orders word, or the shared "Needs checking" status word. */
export type ReservationLabel = "reserved" | "notReserved" | "reservedOlder" | Extract<ProductState, "outcome-unknown">;
/** Short "what to do" note on a list row; null when nothing is needed. */
export type OrderAttention = "checkStock" | "checkBeforeRetrying" | "needsDecision" | "refresh" | "changesBlocked";
/** A sample time of day; the screen words it ("Today 10:43") in the viewer's language. */
export interface OrderTime { readonly day: "today"; readonly time: string; }
export interface OrderListItem { readonly id: string; readonly customerId: string; readonly customer: string; readonly phone: string; readonly channel: string; readonly items: string; readonly total: string; readonly orderLabel: OrderLabel; readonly orderState: ProductState; readonly reservationLabel: ReservationLabel; readonly reservationState: ProductState; readonly updated: OrderTime; readonly attention: OrderAttention | null; readonly scenario: OrderScenario; }
export interface OrderLineView { readonly productId: string; readonly product: string; readonly sku: string; readonly quantity: string; readonly reservedQuantity: string; readonly unitPrice: string; }
/** Record references quoted in the explanations for a scenario, e.g. CO-1042. */
export interface OrderReferences { readonly order?: string; readonly reservation?: string; }
/**
 * One order with what happened to it. The explanations (evidence, notice, next step) are worded
 * by the screen from `scenario`; the model carries only the facts and references they quote.
 */
export interface OrderDetailView extends OrderListItem { readonly version: number; readonly observedAt: OrderTime; readonly currency: "KZT"; readonly lines: readonly OrderLineView[]; readonly refs: OrderReferences; readonly orderDelivery: "noUpdate"; readonly messageDelivery: "confirmationNotDelivered" | "noneSent"; readonly notice: { readonly state: ProductState } | null; }
export interface OrdersScreenModel { readonly mode: "sample"; readonly validationState: BusinessValidationState; readonly items: readonly OrderListItem[]; readonly query: string; readonly status: string; }
export interface OrderDetailModel { readonly mode: "sample"; readonly validationState: BusinessValidationState; readonly order: OrderDetailView | null; }
