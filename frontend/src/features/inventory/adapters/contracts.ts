import type { InventoryView } from "../types";
export interface InventoryDataAdapter { list(query: string, status: string): readonly InventoryView[]; detail(productId: string): InventoryView | null; }
export const inventoryApiContract = { publicEndpoint: null, mode: "UNAVAILABLE", internalEvidence: "Inventory model and internal check_inventory contract", refresh: "UNAVAILABLE" } as const;
