import type { ApiClient } from "./client";
import { ApiError } from "./client";
import { uuidPattern } from "@/services/auth/configuration";

export interface PrincipalDto { subject: string; kind: "USER"; role: "OWNER" | "OPERATOR" | "PLATFORM_ADMIN"; business_id: string; business_name: string | null; expires_at: string; }
export interface ProductDto { id: string; sku: string; name: string; unit_price: string; currency: string; active: boolean; version: number; }
export interface ProductPageDto { items: ProductDto[]; next_name: string | null; next_id: string | null; }
export interface InventoryDto { id: string; product_id: string; available_quantity: string; reserved_quantity: string; version: number; observed_at: string; }
export interface CustomerDto { id: string; display_name: string | null; version: number; }
export interface OrderItemDto { id: string; product_id: string; quantity: string; reserved_quantity: string; unit_price: string; version: number; }
export interface OrderDto { id: string; customer_id: string; status: "CREATED" | "CONFIRMED" | "NEEDS_ATTENTION"; currency: string; version: number; created_at: string; delivery_reference: string | null; items: OrderItemDto[]; }
export interface SalesDto { series: { period: string; currency: string; value: string }[]; target_definition: "CONFIRMED_ORDER_UNITS" | "CONFIRMED_ORDER_VALUE"; included_statuses: ["CONFIRMED"]; event_timestamp: "orders.created_at"; cutoff: string; as_of: string; granularity: "DAY" | "WEEK" | "MONTH"; currency_scope: "PER_CURRENCY"; product_id: string | null; }

function invalid(): never { throw new ApiError("Invalid backend read response.", 502, null); }
function object(value: unknown): Record<string, unknown> { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : invalid(); }
function string(value: unknown): string { return typeof value === "string" && value.length <= 5000 ? value : invalid(); }
function nullable(value: unknown): string | null { return value === null ? null : string(value); }
function uuid(value: unknown): string { const result = string(value); return uuidPattern.test(result) ? result : invalid(); }
function number(value: unknown): number { return typeof value === "number" && Number.isSafeInteger(value) && value >= 1 ? value : invalid(); }
function decimal(value: unknown): string { const result = string(value); return /^\d{1,14}(\.\d{1,4})?$/.test(result) ? result : invalid(); }
function date(value: unknown): string { const result = string(value); return Number.isFinite(Date.parse(result)) ? result : invalid(); }
function currency(value: unknown): string { const result = string(value); return /^[A-Z]{3}$/.test(result) ? result : invalid(); }
function list(value: unknown, limit = 50): unknown[] { return Array.isArray(value) && value.length <= limit ? value : invalid(); }
function literal<T extends string>(value: unknown, allowed: readonly T[]): T { return allowed.includes(value as T) ? value as T : invalid(); }

export function parsePrincipal(value: unknown): PrincipalDto {
  const v = object(value);
  return { subject: uuid(v.subject), kind: literal(v.kind, ["USER"]), role: literal(v.role, ["OWNER", "OPERATOR", "PLATFORM_ADMIN"]), business_id: uuid(v.business_id), business_name: nullable(v.business_name), expires_at: date(v.expires_at) };
}
export function parseProduct(value: unknown): ProductDto {
  const v = object(value);
  if (typeof v.active !== "boolean") invalid();
  return { id: uuid(v.id), sku: string(v.sku), name: string(v.name), unit_price: decimal(v.unit_price), currency: currency(v.currency), active: v.active, version: number(v.version) };
}
export function parseProducts(value: unknown): ProductPageDto {
  const v = object(value);
  const nextId = v.next_id === null ? null : uuid(v.next_id);
  const nextName = nullable(v.next_name);
  if ((nextId === null) !== (nextName === null)) invalid();
  return { items: list(v.items).map(parseProduct), next_id: nextId, next_name: nextName };
}
export function parseInventory(value: unknown): InventoryDto[] {
  return list(object(value).items).map(item => { const v = object(item); return { id: uuid(v.id), product_id: uuid(v.product_id), available_quantity: decimal(v.available_quantity), reserved_quantity: decimal(v.reserved_quantity), version: number(v.version), observed_at: date(v.observed_at) }; });
}
export function parseCustomer(value: unknown): CustomerDto { const v = object(value); return { id: uuid(v.id), display_name: nullable(v.display_name), version: number(v.version) }; }
export function parseOrder(value: unknown): OrderDto {
  const v = object(value);
  return { id: uuid(v.id), customer_id: uuid(v.customer_id), status: literal(v.status, ["CREATED", "CONFIRMED", "NEEDS_ATTENTION"]), currency: currency(v.currency), version: number(v.version), created_at: date(v.created_at), delivery_reference: nullable(v.delivery_reference), items: list(v.items, 1000).map(item => { const line = object(item); return { id: uuid(line.id), product_id: uuid(line.product_id), quantity: decimal(line.quantity), reserved_quantity: decimal(line.reserved_quantity), unit_price: decimal(line.unit_price), version: number(line.version) }; }) };
}
export function parseSales(value: unknown): SalesDto {
  const v = object(value);
  if (!Array.isArray(v.included_statuses) || v.included_statuses.length !== 1 || v.included_statuses[0] !== "CONFIRMED") invalid();
  return { series: list(v.series, 10000).map(item => { const p = object(item); return { period: date(p.period), currency: currency(p.currency), value: decimal(p.value) }; }), target_definition: literal(v.target_definition, ["CONFIRMED_ORDER_UNITS", "CONFIRMED_ORDER_VALUE"]), included_statuses: ["CONFIRMED"], event_timestamp: literal(v.event_timestamp, ["orders.created_at"]), cutoff: date(v.cutoff), as_of: date(v.as_of), granularity: literal(v.granularity, ["DAY", "WEEK", "MONTH"]), currency_scope: literal(v.currency_scope, ["PER_CURRENCY"]), product_id: v.product_id === null ? null : uuid(v.product_id) };
}

export function readApi(client: ApiClient) {
  return {
    me: async () => parsePrincipal(await client.request("/me")),
    products: async (query: URLSearchParams) => parseProducts(await client.request(`/products?${query}`)),
    product: async (id: string) => parseProduct(await client.request(`/products/${encodeURIComponent(id)}`)),
    inventory: async (ids: readonly string[]) => parseInventory(await client.request(`/inventory?${new URLSearchParams(ids.map(id => ["product_id", id]))}`)),
    customer: async (id: string) => parseCustomer(await client.request(`/customers/${encodeURIComponent(id)}`)),
    order: async (id: string) => parseOrder(await client.request(`/orders/${encodeURIComponent(id)}`)),
    sales: async (query: URLSearchParams) => parseSales(await client.request(`/analytics/sales?${query}`)),
  };
}
