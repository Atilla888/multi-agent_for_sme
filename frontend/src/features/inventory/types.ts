import type { BusinessValidationState } from "@/features/business";
import type { inventory } from "@/i18n/messages/inventory";
import type { ProductState } from "@/types/states";
/** Which sample stock record's display text to show (counts, checks, notes), from the inventory messages under `records`. */
export type InventoryCopy = keyof typeof inventory.en.records;
export interface InventoryView { readonly id: string; readonly productId: string; readonly product: string; readonly sku: string; readonly state: ProductState; readonly version: number; readonly copy: InventoryCopy; readonly relatedOrder: string | null; }
export interface InventoryScreenModel { readonly mode: "sample"; readonly validationState: BusinessValidationState; readonly items: readonly InventoryView[]; readonly selected: InventoryView | null; readonly query: string; readonly status: string; }
