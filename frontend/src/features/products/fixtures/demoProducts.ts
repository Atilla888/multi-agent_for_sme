import type { ProductView } from "../types";

/** Sample catalog. */
export const demoProducts: readonly ProductView[] = [
  { id: "prod-lamp", sku: "SKU-LAMP-42", name: "Desk Lamp", variant: "Slate / standard", price: "24,900 KZT", status: "confirmed", statusLabel: "Active", version: 6, source: "Product catalog", observedAt: "Updated today 10:38", inventorySummary: "8 in stock when last checked", relatedOrders: ["ORD-1042", "ORD-1043", "ORD-1044"] },
  { id: "prod-chair", sku: "SKU-CHAIR-11", name: "Work Chair", variant: "Graphite / ergonomic", price: "89,000 KZT", status: "stale-conflict", statusLabel: "May be out of date", version: 3, source: "Product catalog", observedAt: "Updated yesterday", inventorySummary: "Stock needs a fresh check", relatedOrders: [] },
  { id: "prod-shelf", sku: "SKU-SHELF-07", name: "Wall Shelf", variant: "Oak / 80 cm", price: "31,500 KZT", status: "confirmed", statusLabel: "Active", version: 2, source: "Product catalog", observedAt: "Updated today 10:35", inventorySummary: "0 in stock (confirmed)", relatedOrders: ["ORD-1046"] },
] as const;
