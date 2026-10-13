"use client";

import { usePathname } from "next/navigation";
import { staffNavigation } from "@/lib/navigation";
import { SidebarSection } from "./SidebarSection";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <strong>Diplom / Operations</strong>
        <span>Staff workspace</span>
      </div>

      <button className="business-context" type="button" disabled aria-describedby="business-context-note">
        <span>Business switch</span>
        <strong>No active business</strong>
      </button>
      <p className="sr-only" id="business-context-note">
        Business context will come from an authorized backend session.
      </p>

      <nav aria-label="Staff workspace">
        <ul className="nav-list">
          {staffNavigation.map((area) => (
            <SidebarSection area={area} pathname={pathname} key={area.label} />
          ))}
        </ul>
      </nav>

      <div className="account-boundary">
        <strong>Account / session</strong>
        <span>Keycloak not connected</span>
      </div>
    </aside>
  );
}
