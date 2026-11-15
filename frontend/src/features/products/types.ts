import type { BusinessValidationState } from "@/features/business";
import type { products } from "@/i18n/messages/products";
import type { ProductState } from "@/types/states";
/** Which sample product's explanatory text to show, from the products messages under `records`. */
export type ProductCopy = keyof typeof products.en.records;
export interface ProductView { readonly id: string; readonly sku: string; readonly name: string; readonly variant: string; readonly price: string; readonly status: ProductState; readonly version: number; readonly copy: ProductCopy; readonly relatedOrders: readonly string[]; }
export interface ProductsScreenModel { readonly mode: "sample"; readonly validationState: BusinessValidationState; readonly items: readonly ProductView[]; readonly selected: ProductView | null; readonly query: string; readonly status: string; }
