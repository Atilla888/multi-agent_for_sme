import type { ProductView } from "../types";
export interface ProductDataAdapter { list(query: string, status: string): readonly ProductView[]; detail(id: string): ProductView | null; }
export const productApiContract = { publicEndpoint: null, mode: "UNAVAILABLE", internalEvidence: "Product model plus internal find_products/get_product query contracts" } as const;
