import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { customerApiContract, getCustomerFixtureScreen } from "@/features/customers";
import { getOrdersFixtureScreen, orderApiContract } from "@/features/orders";
import { getProductsFixtureScreen, productApiContract } from "@/features/products";
import { getInventoryFixtureScreen } from "./adapters/fixtureAdapter";
import { inventoryApiContract } from "./adapters/contracts";
import { InventoryScreen } from "./components/InventoryScreen";

describe("P5D Inventory and adapter safety", () => {
  it("renders observed quantity, source and reservation evidence", () => {
    const markup = renderToStaticMarkup(<InventoryScreen model={getInventoryFixtureScreen({ product: "prod-lamp" })} />);
    expect(markup).toContain("8.0000");
    expect(markup).toContain("Observed quantity is not a live-stock promise");
    expect(markup).toContain("Confirmed reservation R-1042");
  });

  it("keeps a known zero distinct from source unavailability", () => {
    const zero = renderToStaticMarkup(<InventoryScreen model={getInventoryFixtureScreen({ product: "prod-shelf" })} />);
    const unavailable = renderToStaticMarkup(<InventoryScreen model={getInventoryFixtureScreen({ state: "unavailable" })} />);
    expect(zero).toContain("0.0000");
    expect(zero).toContain("Known zero is a valid quantity");
    expect(unavailable).toContain("Do not reinterpret this as an empty result");
    expect(unavailable).not.toContain("0.0000");
  });

  it("keeps an unknown reservation separate and without blind retry", () => {
    const markup = renderToStaticMarkup(<InventoryScreen model={getInventoryFixtureScreen({ status: "outcome-unknown" })} />);
    expect(markup).toContain("The hold may have committed");
    expect(markup).toContain("no blind retry");
    expect(markup).not.toMatch(/<button[^>]*>[^<]*Retry/i);
  });

  it("keeps fixture adapters network-free and public endpoints absent", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    getCustomerFixtureScreen({}); getOrdersFixtureScreen({}); getProductsFixtureScreen({}); getInventoryFixtureScreen({});
    expect(fetchSpy).not.toHaveBeenCalled();
    expect([customerApiContract, orderApiContract, productApiContract, inventoryApiContract].every((contract) => contract.publicEndpoint === null)).toBe(true);
    vi.unstubAllGlobals();
  });
});
