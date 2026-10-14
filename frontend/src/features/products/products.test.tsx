import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getProductsFixtureScreen } from "./adapters/fixtureAdapter";
import { ProductsScreen } from "./components/ProductsScreen";

describe("P5D Products", () => {
  it("renders approved catalog facts and a separate Inventory link", () => {
    const markup = renderToStaticMarkup(<ProductsScreen model={getProductsFixtureScreen({ product: "prod-lamp" })} />);
    expect(markup).toContain("SKU-LAMP-42");
    expect(markup).toContain("24,900 KZT");
    expect(markup).toContain("Product exists ≠ Inventory available");
    expect(markup).toContain("/inventory?product=prod-lamp");
  });

  it("supports local fixture search and catalog-state filtering", () => {
    const model = getProductsFixtureScreen({ q: "chair", status: "stale-conflict" });
    expect(model.items).toHaveLength(1);
    expect(model.items[0]?.sku).toBe("SKU-CHAIR-11");
  });

  it("does not show fixture values when the source is unavailable", () => {
    const markup = renderToStaticMarkup(<ProductsScreen model={getProductsFixtureScreen({ state: "unavailable" })} />);
    expect(markup).toContain("Dependency unavailable");
    expect(markup).not.toContain("24,900 KZT");
  });
});
