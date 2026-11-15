import type { IconName } from "@/components/ui/Icon";
import type { shell } from "@/i18n/messages/shell";

export type NavigationAccess = "standard" | "restricted" | "contextual-restricted";

/** Translation key under shell.nav; the English label stays here for search and tests. */
export type NavKey = keyof typeof shell.en.nav;

export interface NavItem {
  readonly key: NavKey;
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
  { key: "overview", label: "Overview", href: "/overview", icon: "home" },
  {
    key: "conversations",
    label: "Conversations",
    href: "/conversations",
    icon: "inbox",
    children: [
      { key: "inbox", label: "Inbox", href: "/conversations", icon: "inbox" },
      { key: "needsReview", label: "Needs review", href: "/escalations", icon: "alert" },
    ],
  },
  {
    key: "business",
    label: "Business",
    href: "/customers",
    icon: "package",
    children: [
      { key: "customers", label: "Customers", href: "/customers", icon: "users" },
      { key: "orders", label: "Orders", href: "/orders", icon: "package" },
      { key: "products", label: "Products", href: "/products", icon: "tag" },
      { key: "inventory", label: "Inventory", href: "/inventory", icon: "box" },
    ],
  },
  {
    key: "insights",
    label: "Insights",
    href: "/analytics",
    icon: "chart",
    children: [
      { key: "reports", label: "Reports", href: "/analytics", icon: "chart" },
      { key: "forecasts", label: "Forecasts", href: "/forecasts", icon: "trend" },
      { key: "documents", label: "Documents", href: "/documents", icon: "book" },
    ],
  },
  {
    key: "administration",
    label: "Administration",
    href: "/integrations",
    icon: "settings",
    children: [
      { key: "channels", label: "Channels", href: "/integrations", icon: "plug" },
      { key: "settings", label: "Settings", href: "/settings", icon: "settings" },
      { key: "activityLog", label: "Activity log", href: "/audit", access: "restricted", icon: "shield" },
      { key: "aiActivity", label: "AI activity", href: "/agent-runs", access: "contextual-restricted", icon: "bot" },
    ],
  },
] as const;

/** Mobile bottom tab bar: the four screens people open most, plus a More sheet with the rest. */
export const mobileTabs: readonly (NavItem & { readonly icon: IconName })[] = [
  { key: "home", label: "Home", href: "/overview", icon: "home" },
  { key: "inbox", label: "Inbox", href: "/conversations", icon: "inbox" },
  { key: "orders", label: "Orders", href: "/orders", icon: "package" },
  { key: "reports", label: "Reports", href: "/analytics", icon: "chart" },
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

/** Breadcrumb trail as translation keys, e.g. "/orders/ORD-1" → ["business", "orders"]. */
export function findNavigationTrailKeys(pathname: string): readonly NavKey[] {
  for (const area of staffNavigation) {
    const child = [...(area.children ?? [])]
      .sort((a, b) => b.href.length - a.href.length)
      .find((item) => isRouteActive(pathname, item.href));
    if (child) return child.key === area.key ? [area.key] : [area.key, child.key];
    if (isRouteActive(pathname, area.href)) return [area.key];
  }
  return ["workspace"];
}

/** Breadcrumb trail for the header in English, e.g. "/orders/ORD-1" → ["Business", "Orders"]. */
export function findNavigationTrail(pathname: string): readonly string[] {
  const labels = new Map(staffNavigation.flatMap((area) => [area, ...(area.children ?? [])]).map((item) => [item.key, item.label] as const));
  return findNavigationTrailKeys(pathname).map((key) => labels.get(key) ?? "Workspace");
}
