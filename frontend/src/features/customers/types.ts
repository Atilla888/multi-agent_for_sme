import type { ProductState } from "@/types/states";
import type { BusinessValidationState } from "@/features/business";

/** How far a contact channel's identity is checked; the screen words it in the viewer's language. */
export type IdentityCheck = "verified" | "notVerified" | "stale";
/** A contact channel (a channel name such as Web Chat) and how far its identity is checked. */
export interface ChannelIdentity { readonly channel: string; readonly check: IdentityCheck; }
/** A sample time; the screen words it ("Today 10:40", "Yesterday") in the viewer's language. */
export type CustomerTime = { readonly day: "today"; readonly time: string } | { readonly day: "yesterday" };

export interface CustomerListItem {
  readonly id: string; readonly businessId: "north-shop-demo"; readonly reference: string; readonly displayName: string;
  readonly identity: ChannelIdentity; readonly verificationState: ProductState; readonly conversations: number;
  readonly orders: number; readonly observedAt: CustomerTime;
}
/** Where a conversation stands: an own word, or the shared "Needs a person" status word. */
export type ConversationProgress = "supportHandling" | "needsReview" | Extract<ProductState, "waiting-human">;
/** A related conversation; `label` is its recorded topic. */
export interface CustomerConversation { readonly id: string; readonly label: string; readonly state: ConversationProgress; }
export type OrderProgress = "reserved" | "reservationNeedsChecking" | "notReserved";
/** A related order; `label` is the product ordered. */
export interface CustomerOrder { readonly id: string; readonly label: string; readonly state: OrderProgress; }
export interface CustomerDetailView extends CustomerListItem {
  readonly version: number; readonly channelIdentities: readonly ChannelIdentity[]; readonly relatedConversations: readonly CustomerConversation[];
  readonly relatedOrders: readonly CustomerOrder[]; readonly refreshNeeded: boolean;
}
export interface CustomerScreenModel { readonly mode: "sample"; readonly validationState: BusinessValidationState; readonly items: readonly CustomerListItem[]; readonly query: string; readonly status: string; }
export interface CustomerDetailModel { readonly mode: "sample"; readonly validationState: BusinessValidationState; readonly customer: CustomerDetailView | null; }
