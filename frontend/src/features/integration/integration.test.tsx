import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ApiError } from "@/services/api/client";
import { parseCustomer, parseInventory, parseOrder, parseProducts, parseSales } from "@/services/api/reads";
import { withLocale } from "@/test/intl";
import { loadInventory, loadProducts, type RealReadApi } from "./adapters";
import { ReadError, RealCustomerScreen, RealInventoryScreen, RealOrderScreen, RealProductsScreen, RealAnalyticsScreen } from "./components";

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
  it("drops the live report's About card but keeps its rules", () => {
    const report = parseSales({ series: [{ period: "2026-10-01T00:00:00Z", currency: "USD", value: "12.3400" }], target_definition: "CONFIRMED_ORDER_VALUE", included_statuses: ["CONFIRMED"], event_timestamp: "orders.created_at", cutoff: "2026-11-01T00:00:00Z", as_of: "2026-11-01T00:01:00Z", granularity: "DAY", currency_scope: "PER_CURRENCY", product_id: null });
    const markup = renderToStaticMarkup(<RealAnalyticsScreen model={{ mode: "REAL", start: "2026-10-01T00:00:00Z", end: report.cutoff, report }} />);
    expect(markup).not.toContain("About this report");
    expect(markup).toContain("Currencies are not converted or combined");
    expect(markup).toContain("Confirmed orders only");
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

describe("live reads in Russian and Kazakh", () => {
  const sales = (target: string, series: unknown[]) => parseSales({ series, target_definition: target, included_statuses: ["CONFIRMED"], event_timestamp: "orders.created_at", cutoff: "2026-11-01T00:00:00Z", as_of: "2026-11-01T00:01:00Z", granularity: "DAY", currency_scope: "PER_CURRENCY", product_id: null });
  const order = parseOrder({ id, customer_id: id, status: "CONFIRMED", currency: "KZT", version: 2, created_at: "2026-11-15T10:40:00Z", delivery_reference: null, items: [{ id, product_id: id, quantity: "1.0000", reserved_quantity: "1.0000", unit_price: "18500.0000", version: 1 }] });

  it("translates live products but keeps the record as it is", async () => {
    const model = await loadProducts(apiMock(), { q: "authorized" });
    const ru = withLocale("ru", () => renderToStaticMarkup(<RealProductsScreen model={model} />));
    const kk = withLocale("kk", () => renderToStaticMarkup(<RealProductsScreen model={model} />));
    expect(ru).toContain("Товары"); expect(ru).toContain("Поиск по названию товара или артикулу"); expect(ru).toContain("Версия каталога"); expect(ru).toContain("Проверить остаток"); expect(ru).toContain("Активен");
    expect(kk).toContain("Тауарлар"); expect(kk).toContain("Тауар атауы немесе артикул бойынша іздеу"); expect(kk).toContain("Каталог версиясы"); expect(kk).toContain("Қалдықты тексеру"); expect(kk).toContain("Белсенді");
    for (const markup of [ru, kk]) {
      expect(markup).toContain("12.3400 USD"); expect(markup).toContain("LOCAL-1");
      for (const english of ["Search by product name or SKU", "Catalog version", "Check stock", ">Product<", ">Price<", ">Active<", "Version 1", "Live data"]) expect(markup).not.toContain(english);
    }
  });

  it("translates live inventory, its empty state and its rule", async () => {
    const model = await loadInventory(apiMock(), { product: id });
    const ru = withLocale("ru", () => renderToStaticMarkup(<RealInventoryScreen model={model} />));
    const kk = withLocale("kk", () => renderToStaticMarkup(<RealInventoryScreen model={model} />));
    const emptyRu = withLocale("ru", () => renderToStaticMarkup(<RealInventoryScreen model={{ mode: "REAL", query: "", products: [], items: [] }} />));
    const emptyKk = withLocale("kk", () => renderToStaticMarkup(<RealInventoryScreen model={{ mode: "REAL", query: "", products: [], items: [] }} />));
    expect(ru).toContain("Склад"); expect(ru).toContain("В наличии"); expect(ru).toContain("Зарезервировано"); expect(ru).toContain("Наличие и резерв считаются отдельно");
    expect(kk).toContain("Қойма"); expect(kk).toContain("Қоймада бар"); expect(kk).toContain("Резервтелген"); expect(kk).toContain("бөлек есептеледі");
    expect(emptyRu).toContain("Найдите товар"); expect(emptyKk).toContain("Тауарды іздеңіз");
    for (const markup of [ru, kk, emptyRu, emptyKk]) for (const english of ["In stock", "Reserved", "Last recorded", "Open product", "not a live-stock promise", "Search for a product"]) expect(markup).not.toContain(english);
    expect(ru).toContain("0.0000"); expect(kk).toContain("2.0000");
  });

  it("translates the live customer and order", () => {
    const customer = { mode: "REAL", customer: parseCustomer({ id, display_name: null, version: 2 }) } as const;
    const ru = withLocale("ru", () => renderToStaticMarkup(<><RealCustomerScreen model={customer} /><RealOrderScreen model={{ mode: "REAL", order }} /></>));
    const kk = withLocale("kk", () => renderToStaticMarkup(<><RealCustomerScreen model={customer} /><RealOrderScreen model={{ mode: "REAL", order }} /></>));
    expect(ru).toContain("Имя не указано"); expect(ru).toContain("ID клиента"); expect(ru).toContain(`Заказ ${id}`); expect(ru).toContain("Изменять заказ запрещено правилами"); expect(ru).toContain("Пока нет"); expect(ru).toContain("К списку заказов");
    expect(kk).toContain("Аты көрсетілмеген"); expect(kk).toContain("Клиент ID"); expect(kk).toContain(`Тапсырыс ${id}`); expect(kk).toContain("Тапсырысты өзгертуге ережемен тыйым салынған"); expect(kk).toContain("Әзірге жоқ"); expect(kk).toContain("Тапсырыстар тізіміне оралу");
    for (const markup of [ru, kk]) {
      expect(markup).toContain("18500.0000 KZT");
      for (const english of ["Name not provided", "Customer ID", "Record version", `Order ${id}`, "blocked by policy", "Delivery reference", "None yet", "Back to orders", "Open customer", "Ordered"]) expect(markup).not.toContain(english);
    }
  });

  it("translates the live report, its rule and its empty state", () => {
    const report = sales("CONFIRMED_ORDER_UNITS", [{ period: "2026-10-01T00:00:00Z", currency: "KZT", value: "3.0000" }]);
    const full = { mode: "REAL", start: "2026-10-01T00:00:00Z", end: report.cutoff, report } as const;
    const empty = { ...full, report: sales("CONFIRMED_ORDER_VALUE", []) } as const;
    const ru = withLocale("ru", () => renderToStaticMarkup(<><RealAnalyticsScreen model={full} /><RealAnalyticsScreen model={empty} /></>));
    const kk = withLocale("kk", () => renderToStaticMarkup(<><RealAnalyticsScreen model={full} /><RealAnalyticsScreen model={empty} /></>));
    expect(ru).toContain("Отчёты"); expect(ru).toContain("Продано, шт. · KZT"); expect(ru).toContain("(в штуках)"); expect(ru).toContain("(по сумме)"); expect(ru).toContain("Валюты не конвертируются и не суммируются"); expect(ru).toContain("За этот период нет подтверждённых заказов"); expect(ru).toContain("По неделям");
    expect(kk).toContain("Есептер"); expect(kk).toContain("Сатылғаны, дана · KZT"); expect(kk).toContain("(дана есебімен)"); expect(kk).toContain("(сома бойынша)"); expect(kk).toContain("Валюталар айырбасталмайды"); expect(kk).toContain("Бұл кезеңде расталған тапсырыстар жоқ"); expect(kk).toContain("Апта бойынша");
    for (const markup of [ru, kk]) {
      expect(markup).toContain("2026-11-01T00:00:00Z");
      for (const english of ["Units sold", "Order value", "Confirmed orders only", "Currencies are not converted", "Update report", "Group by", "Open Forecasts", "No confirmed orders", "Only recorded periods are plotted;", ">Period<"]) expect(markup).not.toContain(english);
    }
  });

  it("translates read errors", () => {
    const ru = withLocale("ru", () => renderToStaticMarkup(<ReadError title="Analytics" error={new ApiError("unavailable", 503, "request-1")} />));
    const kk = withLocale("kk", () => renderToStaticMarkup(<ReadError title="Inbox" error={new ApiError("expired", 401, "request-2")} />));
    expect(ru).toContain("Отчёты"); expect(ru).toContain("Источник данных недоступен"); expect(ru).toContain("Код запроса: request-1");
    expect(kk).toContain("Кіріс хабарлар"); expect(kk).toContain("Сеансыңыз аяқталды"); expect(kk).toContain("Сұрау коды: request-2");
    for (const markup of [ru, kk]) for (const english of ["Backend source is unavailable", "Your session has ended", "Nothing is shown in place", "Reference:", "Reports", "Inbox"]) expect(markup).not.toContain(english);
  });
});
