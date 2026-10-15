"use client";

import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { staffNavigation } from "@/lib/navigation";
import { SidebarSection } from "./SidebarSection";
import { businessLabel, initials, roleLabel } from "./sessionDisplay";
import type { AuthenticatedSession } from "@/types/auth";

export function Sidebar({ session }: { readonly session?: AuthenticatedSession }) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__logo" aria-hidden="true">MA</span>
        <span className="sidebar__brand-text">
          <strong>Multi-Agent</strong>
          <span>Retail Ops Platform</span>
        </span>
      </div>

      <button className="business-context" type="button" disabled aria-describedby="business-context-note">
        <span className="business-context__text">
          <span>Business</span>
          <strong>{businessLabel(session)}</strong>
        </span>
        <Icon name="chevronRight" size={16} />
      </button>
      <p className="sr-only" id="business-context-note">
        Business context comes from the authorized backend session; switching is not available yet.
      </p>

      <nav aria-label="Staff workspace">
        <ul className="nav-list">
          {staffNavigation.map((area) => (
            <SidebarSection area={area} pathname={pathname} key={area.label} />
          ))}
        </ul>
      </nav>

      <div className="account-boundary">
        <span className="avatar-initials" aria-hidden="true">{session ? initials(session.displayName) : "?"}</span>
        <span className="account-boundary__text">
          <strong>{session?.displayName ?? "Keycloak not connected"}</strong>
          <span>{roleLabel(session)}</span>
        </span>
        {session ? (
          <form action="/api/auth/logout" method="post">
            <button className="sidebar__signout" type="submit" aria-label="Sign out" title="Sign out">
              <Icon name="logout" size={18} />
            </button>
          </form>
        ) : null}
      </div>
    </aside>
  );
}
