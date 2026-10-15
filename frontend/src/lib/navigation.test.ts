import { describe, expect, it } from "vitest";
import {
  authenticationRoute,
  customerRoute,
  findNavigationLabel,
  findNavigationTrail,
  flatNavigation,
  isRouteActive,
  mobileTabs,
  staffNavigation,
} from "./navigation";
import { matchNavigation } from "@/components/layout/NavigationSearch";

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

describe("lab 3 Figma shell navigation", () => {
  it("gives every staff destination an icon for the tablet icon rail", () => {
    const items = staffNavigation.flatMap((area) => [area, ...(area.children ?? [])]);
    expect(items.every((item) => Boolean(item.icon))).toBe(true);
  });

  it("uses the Figma mobile tabs in order", () => {
    expect(mobileTabs.map((tab) => [tab.label, tab.href])).toEqual([
      ["Home", "/overview"],
      ["Chats", "/conversations"],
      ["Orders", "/orders"],
      ["Analytics", "/analytics"],
    ]);
  });

  it("lists every screen once for search and the More sheet", () => {
    const hrefs = flatNavigation().map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(flatNavigation().map((item) => item.label)).toContain("Customers");
    expect(flatNavigation().map((item) => item.label)).not.toContain("Business");
  });

  it("matches header search by exact label, then prefix, then substring", () => {
    expect(matchNavigation("orders")?.href).toBe("/orders");
    expect(matchNavigation("esc")?.href).toBe("/escalations");
    expect(matchNavigation("runs")?.href).toBe("/agent-runs");
    expect(matchNavigation("   ")).toBeUndefined();
    expect(matchNavigation("payroll")).toBeUndefined();
  });
});

describe("header breadcrumb", () => {
  it("names the area and screen like the Figma header", () => {
    expect(findNavigationTrail("/orders/ORD-1042")).toEqual(["Business", "Orders"]);
    expect(findNavigationTrail("/escalations")).toEqual(["Conversations", "Escalations"]);
    expect(findNavigationTrail("/conversations")).toEqual(["Conversations"]);
    expect(findNavigationTrail("/forecasts")).toEqual(["Analytics", "Forecasts"]);
  });
});
