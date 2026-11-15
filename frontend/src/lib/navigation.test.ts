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
import { shell } from "@/i18n/messages/shell";
import { findNavigationTrailKeys } from "./navigation";

describe("staff navigation", () => {
  it("keeps five groups with plain-language labels", () => {
    expect(staffNavigation.map((area) => area.label)).toEqual([
      "Overview",
      "Conversations",
      "Business",
      "Insights",
      "Administration",
    ]);
  });

  it("keeps every approved route under a plain-language label", () => {
    expect(staffNavigation.map((area) => [area.label, area.children?.map((item) => [item.label, item.href]) ?? []])).toEqual([
      ["Overview", []],
      ["Conversations", [["Inbox", "/conversations"], ["Needs review", "/escalations"]]],
      ["Business", [["Customers", "/customers"], ["Orders", "/orders"], ["Products", "/products"], ["Inventory", "/inventory"]]],
      ["Insights", [["Reports", "/analytics"], ["Forecasts", "/forecasts"], ["Documents", "/documents"]]],
      ["Administration", [["Channels", "/integrations"], ["Settings", "/settings"], ["Activity log", "/audit"], ["AI activity", "/agent-runs"]]],
    ]);
  });

  it("marks the activity log and AI activity as permissioned without disabling their routes", () => {
    const administration = staffNavigation.find((area) => area.label === "Administration");
    const audit = administration?.children?.find((item) => item.href === "/audit");
    const runs = administration?.children?.find((item) => item.href === "/agent-runs");

    expect(audit).toMatchObject({ label: "Activity log", access: "restricted" });
    expect(runs).toMatchObject({ label: "AI activity", access: "contextual-restricted" });
  });

  it("keeps sign-in and customer chat outside staff navigation", () => {
    const staffRoutes = staffNavigation.flatMap((area) => [area.href, ...(area.children?.map((item) => item.href) ?? [])]);
    expect(staffRoutes).not.toContain(authenticationRoute.href);
    expect(staffRoutes).not.toContain(customerRoute.href);
  });

  it("uses no internal jargon in any label", () => {
    for (const item of flatNavigation()) expect(item.label).not.toMatch(/agent run|audit|integration|escalation|analytics/i);
  });
});

describe("route matching", () => {
  it("matches detail routes without matching unrelated prefixes", () => {
    expect(isRouteActive("/orders/order-1", "/orders")).toBe(true);
    expect(isRouteActive("/orders-archive", "/orders")).toBe(false);
    expect(isRouteActive("/overview/extra", "/overview")).toBe(false);
  });

  it("returns the most specific label", () => {
    expect(findNavigationLabel("/forecasts")).toBe("Forecasts");
    expect(findNavigationLabel("/orders/order-1")).toBe("Orders");
    expect(findNavigationLabel("/conversations")).toBe("Inbox");
  });
});

describe("shell navigation", () => {
  it("gives every staff destination an icon for the tablet icon rail", () => {
    const items = staffNavigation.flatMap((area) => [area, ...(area.children ?? [])]);
    expect(items.every((item) => Boolean(item.icon))).toBe(true);
  });

  it("uses the four most-used screens as mobile tabs", () => {
    expect(mobileTabs.map((tab) => [tab.label, tab.href])).toEqual([
      ["Home", "/overview"],
      ["Inbox", "/conversations"],
      ["Orders", "/orders"],
      ["Reports", "/analytics"],
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
    expect(matchNavigation("needs")?.href).toBe("/escalations");
    expect(matchNavigation("activity")?.href).toBe("/audit");
    expect(matchNavigation("   ")).toBeUndefined();
    expect(matchNavigation("payroll")).toBeUndefined();
  });
});

describe("header trail", () => {
  it("names the group and the screen", () => {
    expect(findNavigationTrail("/orders/ORD-1042")).toEqual(["Business", "Orders"]);
    expect(findNavigationTrail("/escalations")).toEqual(["Conversations", "Needs review"]);
    expect(findNavigationTrail("/conversations")).toEqual(["Conversations", "Inbox"]);
    expect(findNavigationTrail("/forecasts")).toEqual(["Insights", "Forecasts"]);
  });
});

describe("translated navigation", () => {
  it("keeps every English label identical to its message, so search and translations agree", () => {
    for (const item of [...staffNavigation, ...flatNavigation(), ...mobileTabs]) expect(shell.en.nav[item.key]).toBe(item.label);
  });

  it("gives the header trail as translation keys", () => {
    expect(findNavigationTrailKeys("/orders/ORD-1042")).toEqual(["business", "orders"]);
    expect(findNavigationTrailKeys("/unknown")).toEqual(["workspace"]);
  });

  it("matches header search against translated labels", () => {
    const russian = (item: { readonly key: keyof typeof shell.ru.nav }) => shell.ru.nav[item.key];
    expect(matchNavigation("заказ", flatNavigation(), russian)?.href).toBe("/orders");
    expect(matchNavigation("склад", flatNavigation(), russian)?.href).toBe("/inventory");
  });
});

