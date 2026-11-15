"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { NavArea, NavItem } from "@/lib/navigation";
import { isRouteActive } from "@/lib/navigation";

interface SidebarSectionProps {
  readonly area: NavArea;
  readonly pathname: string;
}

function NavLink({ item, pathname, active }: { readonly item: NavItem; readonly pathname: string; readonly active?: boolean }) {
  const current = active ?? isRouteActive(pathname, item.href);
  return (
    <Link
      className={`nav-item ${current ? "nav-item--active" : ""}`.trim()}
      href={item.href}
      aria-current={current ? "page" : undefined}
      title={item.access ? `${item.label} · needs extra permission` : item.label}
    >
      {item.icon ? <Icon name={item.icon} size={15} /> : null}
      <span className="nav-label">{item.label}</span>
      {item.access ? <span className="nav-access-marker"><Icon name="lock" size={12} /><span className="sr-only">Needs extra permission</span></span> : null}
    </Link>
  );
}

/** One sidebar group: a small heading followed by its screens. */
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
