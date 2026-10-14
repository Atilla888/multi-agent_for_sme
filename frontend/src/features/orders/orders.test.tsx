import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getOrderDetailFixture, getOrdersFixtureScreen } from "./adapters/fixtureAdapter";
import { OrderDetailScreen } from "./components/OrderDetailScreen";
import { OrdersScreen } from "./components/OrdersScreen";

describe("P5D Orders safety states", () => {
  it("renders Order State and Reservation State independently", () => {
    const markup = renderToStaticMarkup(<OrdersScreen model={getOrdersFixtureScreen({})} />);
    expect(markup).toContain("Order state");
    expect(markup).toContain("Reservation state");
    expect(markup).toContain("OUTCOME_UNKNOWN");
  });

  it("keeps a known reservation failure out of reconciliation semantics", () => {
    const markup = renderToStaticMarkup(<OrderDetailScreen model={getOrderDetailFixture("ORD-1043", {})} />);
    expect(markup).toContain("Order exists, but inventory is not reserved");
    expect(markup).toContain("Review current inventory");
    expect(markup).toContain("does not require reconciliation by default");
  });

  it("requires reconciliation and exposes no blind retry control for OUTCOME_UNKNOWN", () => {
    const markup = renderToStaticMarkup(<OrderDetailScreen model={getOrderDetailFixture("ORD-1044", {})} />);
    expect(markup).toContain("The reservation may have committed");
    expect(markup).toContain("Reconcile authoritative state");
    expect(markup).toContain("no blind mutation retry");
    expect(markup).not.toMatch(/<button[^>]*>[^<]*Retry/i);
  });

  it("renders E02 as a disabled policy restriction with no successful update", () => {
    const markup = renderToStaticMarkup(<OrderDetailScreen model={getOrderDetailFixture("ORD-1047", {})} />);
    expect(markup).toContain("E02 · automatic Order update restricted");
    expect(markup).toMatch(/<button[^>]*disabled[^>]*><span>Update order · restricted<\/span><\/button>/);
    expect(markup).toContain("No update executed");
  });

  it("keeps Order Delivery and Message Delivery separate", () => {
    const markup = renderToStaticMarkup(<OrderDetailScreen model={getOrderDetailFixture("ORD-1042", {})} />);
    expect(markup).toContain("Order delivery");
    expect(markup).toContain("Message delivery");
    expect(markup).toContain("communication only");
  });
});
