import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { withLocale } from "@/test/intl";
import { customerApiContract, getCustomerFixtureScreen } from "@/features/customers";
import { getOrdersFixtureScreen, orderApiContract } from "@/features/orders";
import { getProductsFixtureScreen, productApiContract } from "@/features/products";
import { getInventoryFixtureScreen } from "./adapters/fixtureAdapter";
import { inventoryApiContract } from "./adapters/contracts";
import { InventoryScreen } from "./components/InventoryScreen";

describe("Inventory", () => {
  it("shows the count, when it was checked, and the reservation", () => {
    const markup = renderToStaticMarkup(<InventoryScreen model={getInventoryFixtureScreen({ product: "prod-lamp" })} />);
    expect(markup).toContain("Checked today 10:41");
    expect(markup).toContain("not a live count");
    expect(markup).toContain("ref R-1042");
  });

  it("keeps a confirmed zero distinct from an unavailable source", () => {
    const zero = renderToStaticMarkup(<InventoryScreen model={getInventoryFixtureScreen({ product: "prod-shelf" })} />);
    const unavailable = renderToStaticMarkup(<InventoryScreen model={getInventoryFixtureScreen({ state: "unavailable" })} />);
    expect(zero).toContain("Out of stock");
    expect(zero).toContain("Zero is a confirmed count");
    expect(unavailable).toContain("does not mean there are no records");
    expect(unavailable).not.toContain("Zero is a confirmed count");
  });

  it("asks for a check and offers no retry when a reservation outcome is unknown", () => {
    const markup = renderToStaticMarkup(<InventoryScreen model={getInventoryFixtureScreen({ status: "outcome-unknown" })} />);
    expect(markup).toContain("may have gone through");
    expect(markup).toContain("check before reserving again");
    expect(markup).not.toMatch(/<button[^>]*>[^<]*Retry/i);
  });

  it("keeps sample adapters network-free and public endpoints absent", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    getCustomerFixtureScreen({}); getOrdersFixtureScreen({}); getProductsFixtureScreen({}); getInventoryFixtureScreen({});
    expect(fetchSpy).not.toHaveBeenCalled();
    expect([customerApiContract, orderApiContract, productApiContract, inventoryApiContract].every((contract) => contract.publicEndpoint === null)).toBe(true);
    vi.unstubAllGlobals();
  });

  it("speaks Russian and Kazakh but keeps product names, SKUs and references", () => {
    const render = () => renderToStaticMarkup(<><InventoryScreen model={getInventoryFixtureScreen({ product: "prod-lamp" })} /><InventoryScreen model={getInventoryFixtureScreen({ status: "outcome-unknown" })} /></>);
    const ru = withLocale("ru", render);
    const kk = withLocale("kk", render);
    expect(ru).toContain("Склад"); expect(ru).toContain("Проверено сегодня в 10:41"); expect(ru).toContain("1 шт. зарезервирована для ORD-1042 (номер R-1042)"); expect(ru).toContain("Проверьте, прежде чем резервировать снова"); expect(ru).toContain("Возможно, ещё 1"); expect(ru).toContain("Нужна новая проверка"); expect(ru).toContain("Обновить остаток");
    expect(kk).toContain("Қойма"); expect(kk).toContain("Бүгін 10:41-де тексерілді"); expect(kk).toContain("ORD-1042 үшін 1 дана резервтелген (нөмірі R-1042)"); expect(kk).toContain("Қайта резервтемес бұрын тексеріңіз"); expect(kk).toContain("Мүмкін, тағы 1"); expect(kk).toContain("Қайта тексеру керек"); expect(kk).toContain("Қалдықты жаңарту");
    for (const markup of [ru, kk]) {
      expect(markup).toContain("Desk Lamp / Slate"); expect(markup).toContain("SKU-LAMP-42"); expect(markup).toContain("RI-1044");
      for (const english of ["Stock on hand", "Search inventory", "Checked today", "not a live count", "ref R-1042", "Check before reserving again", "may have gone through", "Possibly 1 more", "Stock records", "Needs a fresh check", "Refresh count", "Out of stock", ">Reserved<", ">Source<", ">Note<"]) expect(markup).not.toContain(english);
    }
  });
});
