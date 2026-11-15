import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
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
});
