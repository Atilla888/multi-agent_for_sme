import type { OrderDetailView, OrderListItem, OrderScenario } from "../types";
export interface OrderDataAdapter { list(query: string, status: string): readonly OrderListItem[]; detail(id: string, scenario?: OrderScenario): OrderDetailView | null; }
export const orderApiContract = { publicEndpoint: null, mode: "UNAVAILABLE", internalEvidence: "Order/OrderItem domain models, get_order, create_order and reserve_inventory internal contracts", updateOrder: "RESTRICTED_E02" } as const;
