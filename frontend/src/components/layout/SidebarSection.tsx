"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { NavArea, NavItem } from "@/lib/navigation";
import { isRouteActive } from "@/lib/navigation";

interface SidebarSectionProps {
  readonly area: NavArea;
  readonly pathname: string;
}

function AccessMarker({ item }: { readonly item: NavItem }) {
  if (!item.access) return null;
  return (
    <span className="nav-access-marker">
      {item.access === "restricted" ? "Restricted" : "Contextual"}
    </span>
  );
}

function NavLink({ item, pathname, active }: { readonly item: NavItem; readonly pathname: string; readonly active?: boolean }) {
  const current = active ?? isRouteActive(pathname, item.href);
  return (
    <Link
      className={`nav-item ${current ? "nav-item--active" : ""} ${item.access ? "nav-item--restricted" : ""}`.replace(/\s+/g, " ").trim()}
      href={item.href}
      aria-current={current ? "page" : undefined}
      title={item.label}
    >
      {item.icon ? <Icon name={item.icon} /> : null}
      <span className="nav-label">{item.label}</span>
      <AccessMarker item={item} />
    </Link>
  );
}

/**
 * One area of the approved IA. Areas with children render as a Figma sidebar section:
 * an uppercase heading followed by flat NavItems. The area's own route is listed first
 * when it is not already one of its children (Conversations, Analytics).
 */
export function SidebarSection({ area, pathname }: SidebarSectionProps) {
  if (!area.children) {
    return (
      <li className="nav-area">
        <NavLink item={area} pathname={pathname} />
      </li>
    );
  }

  const children = area.children;
  const items = children.some((item) => item.href === area.href) ? children : [area, ...children];
  const anyChildActive = children.some((item) => isRouteActive(pathname, item.href));

  return (
    <li className="nav-area nav-section">
      <p className="nav-section__label">{area.label}</p>
      <ul className="nav-nested">
        {items.map((item) => (
          <li key={item.href}>
            <NavLink
              item={item}
              pathname={pathname}
              active={item === area ? isRouteActive(pathname, area.href) && !anyChildActive : undefined}
            />
          </li>
        ))}
      </ul>
    </li>
  );
}
