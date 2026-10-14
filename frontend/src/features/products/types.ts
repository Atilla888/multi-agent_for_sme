import type { BusinessValidationState } from "@/features/business";
import type { ProductState } from "@/types/states";
export interface ProductView { readonly id: string; readonly sku: string; readonly name: string; readonly variant: string; readonly price: string; readonly status: ProductState; readonly statusLabel: string; readonly version: number; readonly source: string; readonly observedAt: string; readonly inventorySummary: string; readonly relatedOrders: readonly string[]; }
export interface ProductsScreenModel { readonly mode: "LOCAL UI FIXTURE ONLY"; readonly validationState: BusinessValidationState; readonly items: readonly ProductView[]; readonly selected: ProductView | null; readonly query: string; readonly status: string; }
