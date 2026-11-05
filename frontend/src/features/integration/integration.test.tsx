import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ApiError } from "@/services/api/client";
import { parseInventory, parseProducts, parseSales } from "@/services/api/reads";
import { loadInventory, loadProducts, type RealReadApi } from "./adapters";
import { ReadError, RealInventoryScreen, RealProductsScreen, RealAnalyticsScreen } from "./components";

const id = "00000000-0000-4000-8000-000000000001";
const products = parseProducts({ items: [{ id, sku: "LOCAL-1", name: "Long authorized product name for an integration engineering sample", unit_price: "12.3400", currency: "USD", active: true, version: 1 }], next_id: null, next_name: null });
const inventory = parseInventory({ items: [{ id, product_id: id, available_quantity: "0.0000", reserved_quantity: "2.0000", version: 1, observed_at: "2026-10-14T12:00:00Z" }] });
function apiMock() { return { products: vi.fn().mockResolvedValue(products), product: vi.fn().mockResolvedValue(products.items[0]), inventory: vi.fn().mockResolvedValue(inventory) } as unknown as RealReadApi; }

describe("live reads", () => {
  it("does not fabricate an unrestricted catalog list when the query is absent", async () => {
    const api = apiMock();
    const model = await loadProducts(api, {});
    expect(model.mode).toBe("REAL");
    expect(model.products.items).toEqual([]);
    expect(api.products).not.toHaveBeenCalled();
  });
  it("labels live product results as live data", async () => {
    const model = await loadProducts(apiMock(), { q: "authorized" });
    const markup = renderToStaticMarkup(<RealProductsScreen model={model} />);
    expect(markup).toContain("Live data");
    expect(markup).toContain("12.3400 USD");
    expect(markup).not.toContain("Sample data");
  });
  it("shows a zero count and reserved units independently", async () => {
    const model = await loadInventory(apiMock(), { product: id });
    const markup = renderToStaticMarkup(<RealInventoryScreen model={model} />);
    expect(markup).toContain("0.0000"); expect(markup).toContain("2.0000");
    expect(markup).toContain("not a live-stock promise");
    expect(markup).not.toContain('>Pending<');
  });
  it("rejects incomplete inventory instead of inventing zero", async () => {
    const api = apiMock(); vi.mocked(api.inventory).mockResolvedValue([]);
    await expect(loadInventory(api, { product: id })).rejects.toBeInstanceOf(ApiError);
  });
  it("preserves Next.js redirect errors and maps an unavailable backend distinctly", () => {
    expect(() => ReadError({ title: "Products", error: new Error("NEXT_REDIRECT") })).toThrow();
    const markup = renderToStaticMarkup(<ReadError title="Products" error={new ApiError("unavailable", 503, "request-1")} />);
    expect(markup).toContain("Backend source is unavailable");
    expect(markup).not.toContain("12.3400");
  });
  it("keeps currencies separate and never invents missing periods or a forecast", () => {
    const report = parseSales({ series: [{ period: "2026-10-01T00:00:00Z", currency: "USD", value: "12.3400" }, { period: "2026-10-01T00:00:00Z", currency: "KZT", value: "100.0000" }], target_definition: "CONFIRMED_ORDER_VALUE", included_statuses: ["CONFIRMED"], event_timestamp: "orders.created_at", cutoff: "2026-11-01T00:00:00Z", as_of: "2026-11-01T00:01:00Z", granularity: "DAY", currency_scope: "PER_CURRENCY", product_id: null });
    const markup = renderToStaticMarkup(<RealAnalyticsScreen model={{ mode: "REAL", start: "2026-10-01T00:00:00Z", end: report.cutoff, report }} />);
    expect(markup).toContain("12.3400"); expect(markup).toContain("100.0000");
    expect(markup).toContain("Currencies are not converted or combined");
    expect(markup).not.toContain("112.34");
    expect(markup).not.toContain("PREDICTED");
    expect(markup).toContain("Order value / USD chart");
    expect(markup).toContain("Order value / KZT chart");
    expect(markup).not.toContain('class="analytics-chart__series"');
  });
});
