import type { ProductState } from "@/types/states";
import type { BusinessValidationState } from "@/features/business";

export interface CustomerListItem {
  readonly id: string; readonly businessId: "north-shop-demo"; readonly reference: string; readonly displayName: string;
  readonly identityContext: string; readonly verificationState: ProductState; readonly conversations: number;
  readonly orders: number; readonly observedAt: string;
}
export interface CustomerRelation { readonly id: string; readonly label: string; readonly state: string; }
export interface CustomerDetailView extends CustomerListItem {
  readonly version: number; readonly channelIdentities: readonly string[]; readonly relatedConversations: readonly CustomerRelation[];
  readonly relatedOrders: readonly CustomerRelation[]; readonly provenance: string;
}
export interface CustomerScreenModel { readonly mode: "LOCAL UI FIXTURE ONLY"; readonly validationState: BusinessValidationState; readonly items: readonly CustomerListItem[]; readonly query: string; readonly status: string; }
export interface CustomerDetailModel { readonly mode: "LOCAL UI FIXTURE ONLY"; readonly validationState: BusinessValidationState; readonly customer: CustomerDetailView | null; }
