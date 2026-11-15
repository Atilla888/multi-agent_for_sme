import { ApiError } from "@/services/api/client";
import type { ConversationDetailDto, ConversationSummaryDto, CustomerDto, InventoryDto, OrderDto, ProductDto, ProductPageDto, SalesDto } from "@/services/api/reads";
import { readApi } from "@/services/api/reads";
import { uuidPattern } from "@/services/auth/configuration";

export type RealReadApi = ReturnType<typeof readApi>;
export type Query = Record<string, string | string[] | undefined>;
export function first(query: Query, key: string): string { const value = query[key]; return (Array.isArray(value) ? value[0] : value) ?? ""; }
function checkedId(id: string): string { if (!uuidPattern.test(id)) throw new ApiError("A valid resource reference is required.", 422, null); return id; }
export interface ProductsRead { readonly mode: "REAL"; readonly query: string; readonly products: ProductPageDto; readonly selected: ProductDto | null; }
export interface InventoryRead { readonly mode: "REAL"; readonly query: string; readonly products: readonly ProductDto[]; readonly items: readonly InventoryDto[]; }
export interface CustomerRead { readonly mode: "REAL"; readonly customer: CustomerDto; }
export interface OrderRead { readonly mode: "REAL"; readonly order: OrderDto; }
export interface ConversationsRead { readonly mode: "REAL"; readonly items: readonly ConversationSummaryDto[]; readonly selected: ConversationDetailDto | null; readonly status: string; }
export interface AnalyticsRead { readonly mode: "REAL"; readonly start: string; readonly end: string; readonly report: SalesDto; }

export async function loadProducts(api: RealReadApi, query: Query): Promise<ProductsRead> {
  const q = first(query, "q").trim();
  let products: ProductPageDto = { items: [], next_id: null, next_name: null };
  if (q) {
    const params = new URLSearchParams({ q, limit: "25" });
    if (first(query, "after_id")) { params.set("after_id", checkedId(first(query, "after_id"))); params.set("after_name", first(query, "after_name")); }
    products = await api.products(params);
  }
  const id = first(query, "product");
  const selected = id ? await api.product(checkedId(id)) : products.items[0] ?? null;
  return { mode: "REAL", query: q, products, selected };
}

export async function loadInventory(api: RealReadApi, query: Query): Promise<InventoryRead> {
  const q = first(query, "q").trim();
  const id = first(query, "product");
  const products = id ? [await api.product(checkedId(id))] : q ? (await api.products(new URLSearchParams({ q, limit: "25" }))).items : [];
  const items = products.length ? await api.inventory(products.map(product => product.id)) : [];
  if (items.length !== products.length || products.some(product => !items.some(item => item.product_id === product.id))) throw new ApiError("Inventory response is incomplete.", 502, null);
  return { mode: "REAL", query: q, products, items };
}

export async function loadCustomer(api: RealReadApi, id: string): Promise<CustomerRead> { return { mode: "REAL", customer: await api.customer(checkedId(id)) }; }
export async function loadOrder(api: RealReadApi, id: string): Promise<OrderRead> { return { mode: "REAL", order: await api.order(checkedId(id)) }; }

export async function loadAnalytics(api: RealReadApi, query: Query, now = new Date()): Promise<AnalyticsRead> {
  const endDefault = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const startDefault = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const start = first(query, "start") || startDefault.toISOString();
  const end = first(query, "end") || endDefault.toISOString();
  const params = new URLSearchParams({ start, end, granularity: first(query, "granularity") || "DAY", target: first(query, "metric") || "CONFIRMED_ORDER_UNITS" });
  if (first(query, "product")) params.set("product_id", checkedId(first(query, "product")));
  return { mode: "REAL", start, end, report: await api.sales(params) };
}

export async function loadConversations(api: RealReadApi, query: Query, selectedId?: string): Promise<ConversationsRead> {
  const status = ["OPEN", "ESCALATED", "CLOSED"].includes(first(query, "status")) ? first(query, "status") : "";
  const items = await api.conversations(status || undefined);
  const id = selectedId ?? items[0]?.id;
  const selected = id ? await api.conversation(checkedId(id)) : null;
  return { mode: "REAL", items, selected, status: status || "all" };
}
