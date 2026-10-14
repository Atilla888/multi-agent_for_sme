import type { ProductView } from "../types";
export const demoProducts: readonly ProductView[] = [
  { id: "prod-lamp", sku: "SKU-LAMP-42", name: "Desk Lamp", variant: "Slate / standard", price: "24,900 KZT", status: "confirmed", statusLabel: "Active catalog record", version: 6, source: "Product catalog · North Shop fixture", observedAt: "Observed 10:38", inventorySummary: "8 observed · current fixture observation", relatedOrders: ["ORD-1042", "ORD-1043", "ORD-1044"] },
  { id: "prod-chair", sku: "SKU-CHAIR-11", name: "Work Chair", variant: "Graphite / ergonomic", price: "89,000 KZT", status: "stale-conflict", statusLabel: "Catalog fact stale", version: 3, source: "Product catalog · North Shop fixture", observedAt: "Observed yesterday", inventorySummary: "Inventory must be refreshed separately", relatedOrders: [] },
  { id: "prod-shelf", sku: "SKU-SHELF-07", name: "Wall Shelf", variant: "Oak / 80 cm", price: "31,500 KZT", status: "confirmed", statusLabel: "Active catalog record", version: 2, source: "Product catalog · North Shop fixture", observedAt: "Observed 10:35", inventorySummary: "0 confirmed · known zero fixture", relatedOrders: ["ORD-1046"] },
] as const;
