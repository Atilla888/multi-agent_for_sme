import type { ProductView } from "../types";

/** Sample catalog. When each product was updated and its stock summary are text, shown from the products messages (`copy`). */
export const demoProducts: readonly ProductView[] = [
  { id: "prod-lamp", sku: "SKU-LAMP-42", name: "Desk Lamp", variant: "Slate / standard", price: "24,900 KZT", status: "confirmed", version: 6, copy: "lamp", relatedOrders: ["ORD-1042", "ORD-1043", "ORD-1044"] },
  { id: "prod-chair", sku: "SKU-CHAIR-11", name: "Work Chair", variant: "Graphite / ergonomic", price: "89,000 KZT", status: "stale-conflict", version: 3, copy: "chair", relatedOrders: [] },
  { id: "prod-shelf", sku: "SKU-SHELF-07", name: "Wall Shelf", variant: "Oak / 80 cm", price: "31,500 KZT", status: "confirmed", version: 2, copy: "shelf", relatedOrders: ["ORD-1046"] },
] as const;
