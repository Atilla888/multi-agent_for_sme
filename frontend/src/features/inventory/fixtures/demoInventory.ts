import type { InventoryView } from "../types";

/**
 * Sample stock records. Quantities are whole units as last checked, not a live count. The counts,
 * check times and reservation notes are shown from the inventory messages (`copy`), so they read
 * naturally in every language.
 */
export const demoInventory: readonly InventoryView[] = [
  { id: "inv-lamp", productId: "prod-lamp", product: "Desk Lamp / Slate", sku: "SKU-LAMP-42", state: "confirmed", version: 12, copy: "lamp", relatedOrder: "ORD-1042" },
  { id: "inv-shelf", productId: "prod-shelf", product: "Wall Shelf / Oak", sku: "SKU-SHELF-07", state: "known-failure", version: 5, copy: "shelf", relatedOrder: null },
  { id: "inv-chair", productId: "prod-chair", product: "Work Chair / Graphite", sku: "SKU-CHAIR-11", state: "stale-conflict", version: 3, copy: "chair", relatedOrder: null },
  { id: "inv-unknown", productId: "prod-lamp", product: "Desk Lamp / Slate", sku: "SKU-LAMP-42", state: "outcome-unknown", version: 12, copy: "unconfirmed", relatedOrder: "ORD-1044" },
] as const;
