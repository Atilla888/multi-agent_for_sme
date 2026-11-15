import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
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
});
