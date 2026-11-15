import { BUSINESS_FIXTURE_MODE, parseBusinessValidationState } from "@/features/business";
import { demoInventory } from "../fixtures/demoInventory";
import type { InventoryDataAdapter } from "./contracts";
import type { InventoryScreenModel } from "../types";
export const inventoryFixtureAdapter: InventoryDataAdapter = { list(query, status) { const needle = query.trim().toLocaleLowerCase(); return demoInventory.filter((item) => (!needle || `${item.product} ${item.sku}`.toLocaleLowerCase().includes(needle)) && (status === "all" || item.state === status)); }, detail(productId) { return demoInventory.find((item) => item.productId === productId) ?? null; } };
function first(value: string | string[] | undefined): string { return Array.isArray(value) ? value[0] ?? "" : value ?? ""; }
export function getInventoryFixtureScreen(query: Record<string, string | string[] | undefined>): InventoryScreenModel {
  const validationState = parseBusinessValidationState(query.state); const search = first(query.q); const status = first(query.status) || "all"; const productId = first(query.product);
  const items = validationState === "default" ? inventoryFixtureAdapter.list(search, status) : [];
  const selected = validationState !== "default" ? null : productId ? items.find((item) => item.productId === productId) ?? inventoryFixtureAdapter.detail(productId) : items[0] ?? null;
  return { mode: BUSINESS_FIXTURE_MODE, validationState: validationState === "default" && items.length === 0 ? "empty" : validationState, items, selected, query: search, status };
}
