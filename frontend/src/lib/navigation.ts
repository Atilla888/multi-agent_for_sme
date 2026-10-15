import type { IconName } from "@/components/ui/Icon";

export type NavigationAccess = "standard" | "restricted" | "contextual-restricted";

export interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly access?: NavigationAccess;
  readonly icon?: IconName;
}

export interface NavArea extends NavItem {
  readonly children?: readonly NavItem[];
}

export const staffNavigation: readonly NavArea[] = [
  { label: "Overview", href: "/overview", icon: "home" },
  {
    label: "Conversations",
    href: "/conversations",
    icon: "message",
    children: [{ label: "Escalations", href: "/escalations", icon: "alert" }],
  },
  {
    label: "Business",
    href: "/customers",
    icon: "package",
    children: [
      { label: "Customers", href: "/customers", icon: "users" },
      { label: "Orders", href: "/orders", icon: "package" },
      { label: "Products", href: "/products", icon: "box" },
      { label: "Inventory", href: "/inventory", icon: "box" },
    ],
  },
  {
    label: "Knowledge",
    href: "/documents",
    icon: "book",
    children: [{ label: "Documents", href: "/documents", icon: "book" }],
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: "chart",
    children: [{ label: "Forecasts", href: "/forecasts", icon: "trend" }],
  },
  {
    label: "Administration",
    href: "/integrations",
    icon: "settings",
    children: [
      { label: "Integrations", href: "/integrations", icon: "plug" },
      { label: "Settings", href: "/settings", icon: "settings" },
      { label: "Audit", href: "/audit", access: "restricted", icon: "shield" },
      {
        label: "Agent Runs",
        href: "/agent-runs",
        access: "contextual-restricted",
        icon: "bot",
      },
    ],
  },
] as const;

/** Mobile bottom tab bar (Figma, Mobile · 390): Home, Chats, Orders, Analytics, More. */
export const mobileTabs: readonly (NavItem & { readonly icon: IconName })[] = [
  { label: "Home", href: "/overview", icon: "home" },
  { label: "Chats", href: "/conversations", icon: "message" },
  { label: "Orders", href: "/orders", icon: "package" },
  { label: "Analytics", href: "/analytics", icon: "chart" },
] as const;

/** Every staff destination once, in navigation order; used by header search and the mobile More sheet. */
export function flatNavigation(): readonly NavItem[] {
  return staffNavigation.flatMap((area) => {
    const children = area.children ?? [];
    // A grouping area whose link is one of its children (Business → Customers) is listed by its children only.
    return children.some((item) => item.href === area.href) ? children : [area, ...children];
  });
}

export const customerRoute = { label: "Customer Web Chat", href: "/chat" } as const;
export const authenticationRoute = { label: "Authentication", href: "/login" } as const;

export function isRouteActive(pathname: string, href: string): boolean {
  if (href === "/overview") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findNavigationLabel(pathname: string): string {
  const candidates = staffNavigation.flatMap((area) => [area, ...(area.children ?? [])]);
  return (
    candidates
      .filter((item) => isRouteActive(pathname, item.href))
      .sort((a, b) => b.href.length - a.href.length)[0]?.label ?? "Staff Workspace"
  );
}
