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
      {item.access === "restricted" ? "Restricted · permissioned" : "Contextual · restricted"}
    </span>
  );
}

export function SidebarSection({ area, pathname }: SidebarSectionProps) {
  const childActive = Boolean(area.children?.some((item) => isRouteActive(pathname, item.href)));
  const areaCurrent = isRouteActive(pathname, area.href) && !childActive;
  const areaClass = areaCurrent ? "nav-primary--current" : childActive ? "nav-primary--active" : "";

  return (
    <li className="nav-area">
      <Link className={`nav-primary ${areaClass}`.trim()} href={area.href} title={area.label} aria-current={areaCurrent ? "page" : undefined}>
        {area.icon ? <Icon name={area.icon} /> : null}
        <span className="nav-label">{area.label}</span>
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
                  title={item.label}
                >
                  {item.icon ? <Icon name={item.icon} size={18} /> : null}
                  <span className="nav-label">{item.label}</span>
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
