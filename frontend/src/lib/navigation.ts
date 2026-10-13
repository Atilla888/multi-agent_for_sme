export type NavigationAccess = "standard" | "restricted" | "contextual-restricted";

export interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly access?: NavigationAccess;
}

export interface NavArea extends NavItem {
  readonly children?: readonly NavItem[];
}

export const staffNavigation: readonly NavArea[] = [
  { label: "Overview", href: "/overview" },
  {
    label: "Conversations",
    href: "/conversations",
    children: [{ label: "Escalations", href: "/escalations" }],
  },
  {
    label: "Business",
    href: "/customers",
    children: [
      { label: "Customers", href: "/customers" },
      { label: "Orders", href: "/orders" },
      { label: "Products", href: "/products" },
      { label: "Inventory", href: "/inventory" },
    ],
  },
  {
    label: "Knowledge",
    href: "/documents",
    children: [{ label: "Documents", href: "/documents" }],
  },
  {
    label: "Analytics",
    href: "/analytics",
    children: [{ label: "Forecasts", href: "/forecasts" }],
  },
  {
    label: "Administration",
    href: "/integrations",
    children: [
      { label: "Integrations", href: "/integrations" },
      { label: "Settings", href: "/settings" },
      { label: "Audit", href: "/audit", access: "restricted" },
      {
        label: "Agent Runs",
        href: "/agent-runs",
        access: "contextual-restricted",
      },
    ],
  },
] as const;

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
