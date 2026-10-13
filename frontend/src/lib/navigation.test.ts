import { describe, expect, it } from "vitest";
import {
  authenticationRoute,
  customerRoute,
  findNavigationLabel,
  isRouteActive,
  staffNavigation,
} from "./navigation";

describe("approved information architecture", () => {
  it("keeps exactly the six approved top-level areas", () => {
    expect(staffNavigation.map((area) => area.label)).toEqual([
      "Overview",
      "Conversations",
      "Business",
      "Knowledge",
      "Analytics",
      "Administration",
    ]);
  });

  it("keeps the approved nested destinations", () => {
    expect(staffNavigation.map((area) => [area.label, area.children?.map((item) => item.label) ?? []])).toEqual([
      ["Overview", []],
      ["Conversations", ["Escalations"]],
      ["Business", ["Customers", "Orders", "Products", "Inventory"]],
      ["Knowledge", ["Documents"]],
      ["Analytics", ["Forecasts"]],
      ["Administration", ["Integrations", "Settings", "Audit", "Agent Runs"]],
    ]);
  });

  it("marks Audit and Agent Runs as permissioned/contextual without disabling their routes", () => {
    const administration = staffNavigation.find((area) => area.label === "Administration");
    const audit = administration?.children?.find((item) => item.label === "Audit");
    const runs = administration?.children?.find((item) => item.label === "Agent Runs");

    expect(audit).toMatchObject({ href: "/audit", access: "restricted" });
    expect(runs).toMatchObject({ href: "/agent-runs", access: "contextual-restricted" });
  });

  it("keeps authentication and customer chat outside staff navigation", () => {
    const staffRoutes = staffNavigation.flatMap((area) => [area.href, ...(area.children?.map((item) => item.href) ?? [])]);
    expect(staffRoutes).not.toContain(authenticationRoute.href);
    expect(staffRoutes).not.toContain(customerRoute.href);
  });
});

describe("route matching", () => {
  it("matches detail routes without matching unrelated prefixes", () => {
    expect(isRouteActive("/orders/order-1", "/orders")).toBe(true);
    expect(isRouteActive("/orders-archive", "/orders")).toBe(false);
    expect(isRouteActive("/overview/extra", "/overview")).toBe(false);
  });

  it("returns the most specific approved label", () => {
    expect(findNavigationLabel("/forecasts")).toBe("Forecasts");
    expect(findNavigationLabel("/orders/order-1")).toBe("Orders");
  });
});
