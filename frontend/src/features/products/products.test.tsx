import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { withLocale } from "@/test/intl";
import { getProductsFixtureScreen } from "./adapters/fixtureAdapter";
import { ProductsScreen } from "./components/ProductsScreen";

describe("Products", () => {
  it("shows catalog facts and points to Inventory for stock", () => {
    const markup = renderToStaticMarkup(<ProductsScreen model={getProductsFixtureScreen({ product: "prod-lamp" })} />);
    expect(markup).toContain("SKU-LAMP-42");
    expect(markup).toContain("24,900 KZT");
    expect(markup).toContain("not the same as stock on hand");
    expect(markup).toContain("/inventory?product=prod-lamp");
  });

  it("supports search and status filtering", () => {
    const model = getProductsFixtureScreen({ q: "chair", status: "stale-conflict" });
    expect(model.items).toHaveLength(1);
    expect(model.items[0]?.sku).toBe("SKU-CHAIR-11");
  });

  it("shows no sample values when the source is unavailable", () => {
    const markup = renderToStaticMarkup(<ProductsScreen model={getProductsFixtureScreen({ state: "unavailable" })} />);
    expect(markup).toContain("can&#x27;t be loaded right now");
    expect(markup).not.toContain("24,900 KZT");
  });

  it("speaks Russian and Kazakh but keeps product names, SKUs and prices", () => {
    const ru = withLocale("ru", () => renderToStaticMarkup(<ProductsScreen model={getProductsFixtureScreen({ product: "prod-lamp" })} />));
    const kk = withLocale("kk", () => renderToStaticMarkup(<ProductsScreen model={getProductsFixtureScreen({ product: "prod-lamp" })} />));
    expect(ru).toContain("Товары"); expect(ru).toContain("Выбранный товар"); expect(ru).toContain("Артикул / вариант"); expect(ru).toContain("8 шт. в наличии на момент проверки"); expect(ru).toContain("Обновлено сегодня в 10:38"); expect(ru).toContain("Заказ ORD-1042"); expect(ru).toContain("Может быть устаревшим"); expect(ru).toContain("Пример данных");
    expect(kk).toContain("Тауарлар"); expect(kk).toContain("Таңдалған тауар"); expect(kk).toContain("Артикул / нұсқасы"); expect(kk).toContain("Соңғы тексеруде қоймада 8 дана болды"); expect(kk).toContain("Бүгін 10:38-де жаңартылды"); expect(kk).toContain("Тапсырыс ORD-1042"); expect(kk).toContain("Ескірген болуы мүмкін"); expect(kk).toContain("Үлгі деректер");
    for (const markup of [ru, kk]) {
      expect(markup).toContain("Desk Lamp"); expect(markup).toContain("SKU-LAMP-42"); expect(markup).toContain("Slate / standard"); expect(markup).toContain("24,900 KZT");
      for (const english of ["Your catalog", "Search products", "Selected product", "Catalog version", "not the same as stock on hand", "in stock when last checked", "Updated today", "Check stock", "Order ORD-1042", ">Variant<", ">All<", "May be out of date"]) expect(markup).not.toContain(english);
    }
  });
});
