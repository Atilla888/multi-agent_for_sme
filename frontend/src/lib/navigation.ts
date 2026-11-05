import type { IconName } from "@/components/ui/Icon";

export type NavigationAccess = "standard" | "restricted" | "contextual-restricted";

export interface NavItem {
  readonly label: string;
  readonly href: string;
  /** Screens that need an extra permission show a lock in the sidebar; the route itself stays reachable. */
  readonly access?: NavigationAccess;
  readonly icon?: IconName;
}

export interface NavArea extends NavItem {
  readonly children?: readonly NavItem[];
}

/**
 * Staff sidebar. Labels are written for shop owners and operators, not engineers: the route
 * names stay the same, only the words people see changed.
 */
export const staffNavigation: readonly NavArea[] = [
  { label: "Overview", href: "/overview", icon: "home" },
  {
    label: "Conversations",
    href: "/conversations",
    icon: "inbox",
    children: [
      { label: "Inbox", href: "/conversations", icon: "inbox" },
      { label: "Needs review", href: "/escalations", icon: "alert" },
    ],
  },
  {
    label: "Business",
    href: "/customers",
    icon: "package",
    children: [
      { label: "Customers", href: "/customers", icon: "users" },
      { label: "Orders", href: "/orders", icon: "package" },
      { label: "Products", href: "/products", icon: "tag" },
      { label: "Inventory", href: "/inventory", icon: "box" },
    ],
  },
  {
    label: "Insights",
    href: "/analytics",
    icon: "chart",
    children: [
      { label: "Reports", href: "/analytics", icon: "chart" },
      { label: "Forecasts", href: "/forecasts", icon: "trend" },
      { label: "Documents", href: "/documents", icon: "book" },
    ],
  },
  {
    label: "Administration",
    href: "/integrations",
    icon: "settings",
    children: [
      { label: "Channels", href: "/integrations", icon: "plug" },
      { label: "Settings", href: "/settings", icon: "settings" },
      { label: "Activity log", href: "/audit", access: "restricted", icon: "shield" },
      { label: "AI activity", href: "/agent-runs", access: "contextual-restricted", icon: "bot" },
    ],
  },
] as const;

/** Mobile bottom tab bar: the four screens people open most, plus a More sheet with the rest. */
export const mobileTabs: readonly (NavItem & { readonly icon: IconName })[] = [
  { label: "Home", href: "/overview", icon: "home" },
  { label: "Inbox", href: "/conversations", icon: "inbox" },
  { label: "Orders", href: "/orders", icon: "package" },
  { label: "Reports", href: "/analytics", icon: "chart" },
] as const;

/** Every staff destination once, in navigation order; used by header search and the mobile More sheet. */
export function flatNavigation(): readonly NavItem[] {
  return staffNavigation.flatMap((area) => {
    const children = area.children ?? [];
    // A group whose own link is one of its children (Business → Customers) is listed by its children only.
    return children.some((item) => item.href === area.href) ? children : [area, ...children];
  });
}

export const customerRoute = { label: "Customer Web Chat", href: "/chat" } as const;
export const authenticationRoute = { label: "Sign in", href: "/login" } as const;

export function isRouteActive(pathname: string, href: string): boolean {
  if (href === "/overview") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findNavigationLabel(pathname: string): string {
  const candidates = staffNavigation.flatMap((area) => [...(area.children ?? []), area]);
  return (
    candidates
      .filter((item) => isRouteActive(pathname, item.href))
      .sort((a, b) => b.href.length - a.href.length)[0]?.label ?? "Workspace"
  );
}

/** Breadcrumb trail for the header, e.g. "/orders/ORD-1" → ["Business", "Orders"]. */
export function findNavigationTrail(pathname: string): readonly string[] {
  for (const area of staffNavigation) {
    const child = [...(area.children ?? [])]
      .sort((a, b) => b.href.length - a.href.length)
      .find((item) => isRouteActive(pathname, item.href));
    if (child) return child.label === area.label ? [area.label] : [area.label, child.label];
    if (isRouteActive(pathname, area.href)) return [area.label];
  }
  return ["Workspace"];
}
