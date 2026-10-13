"use client";

import Link from "next/link";
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
      {item.access === "restricted" ? "Restricted · permissioned" : "Contextual · restricted"}
    </span>
  );
}

export function SidebarSection({ area, pathname }: SidebarSectionProps) {
  const areaActive =
    isRouteActive(pathname, area.href) ||
    Boolean(area.children?.some((item) => isRouteActive(pathname, item.href)));

  return (
    <li className="nav-area">
      <Link className={`nav-primary ${areaActive ? "nav-primary--active" : ""}`} href={area.href}>
        <span>{area.label}</span>
        {areaActive ? <span aria-hidden="true">•</span> : null}
      </Link>
      {area.children ? (
        <ul className="nav-nested">
          {area.children.map((item) => {
            const active = isRouteActive(pathname, item.href);
            const restricted = Boolean(item.access);
            return (
              <li key={item.href}>
                <Link
                  className={`nav-nested__link ${active ? "nav-nested__link--active" : ""} ${restricted ? "nav-nested__link--restricted" : ""}`}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                >
                  <span>└ {item.label}</span>
                  <AccessMarker item={item} />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </li>
  );
}
