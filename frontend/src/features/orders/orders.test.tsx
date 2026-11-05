import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getOrderDetailFixture, getOrdersFixtureScreen } from "./adapters/fixtureAdapter";
import { OrderDetailScreen } from "./components/OrderDetailScreen";
import { OrdersScreen } from "./components/OrdersScreen";

describe("Orders", () => {
  it("shows order status and stock reservation as separate columns", () => {
    const markup = renderToStaticMarkup(<OrdersScreen model={getOrdersFixtureScreen({})} />);
    expect(markup).toContain("Order status");
    expect(markup).toContain("Stock reservation");
    expect(markup).toContain("Needs checking");
    expect(markup).not.toMatch(/OUTCOME_UNKNOWN|fixture|E02/);
  });

  it("explains a clear reservation failure without asking for a recheck", () => {
    const markup = renderToStaticMarkup(<OrderDetailScreen model={getOrderDetailFixture("ORD-1043", {})} />);
    expect(markup).toContain("Stock was not reserved");
    expect(markup).toContain("Check current stock");
    expect(markup).toContain("nothing to double-check");
  });

  it("asks for a check and offers no retry button when the reservation outcome is unknown", () => {
    const markup = renderToStaticMarkup(<OrderDetailScreen model={getOrderDetailFixture("ORD-1044", {})} />);
    expect(markup).toContain("may have gone through");
    expect(markup).toContain("Check the stock records");
    expect(markup).toContain("do not try to reserve again");
    expect(markup).not.toMatch(/<button[^>]*>[^<]*Retry/i);
  });

  it("shows blocked order changes as a disabled control with nothing changed", () => {
    const markup = renderToStaticMarkup(<OrderDetailScreen model={getOrderDetailFixture("ORD-1047", {})} />);
    expect(markup).toContain("Order changes are blocked");
    expect(markup).toMatch(/<button[^>]*disabled[^>]*><span>Change order<\/span><\/button>/);
    expect(markup).toContain("Nothing was changed");
  });

  it("keeps delivery and customer messages separate from the order itself", () => {
    const markup = renderToStaticMarkup(<OrderDetailScreen model={getOrderDetailFixture("ORD-1042", {})} />);
    expect(markup).toContain("Delivery");
    expect(markup).toContain("Customer message");
    expect(markup).toContain("Messages never change the order or the reservation");
  });
});
