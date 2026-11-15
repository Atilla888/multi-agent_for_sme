"use client";

import { usePathname } from "next/navigation";
import { avatarHue } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { staffNavigation } from "@/lib/navigation";
import { NavigationSearch } from "./NavigationSearch";
import { SidebarSection } from "./SidebarSection";
import { businessLabel, initials, roleLabel } from "./sessionDisplay";
import type { AuthenticatedSession } from "@/types/auth";

export function Sidebar({ session }: { readonly session?: AuthenticatedSession }) {
  const pathname = usePathname();
  const business = businessLabel(session);

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="workspace-mark" aria-hidden="true">{business.charAt(0).toUpperCase()}</span>
        <strong className="sidebar__brand-text">{business}</strong>
      </div>

      <NavigationSearch />

      <nav aria-label="Main">
        <ul className="nav-list">
          {staffNavigation.map((area) => (
            <SidebarSection area={area} pathname={pathname} key={area.label} />
          ))}
        </ul>
      </nav>

      <div className="account-boundary">
        <span className={`avatar avatar--hue-${avatarHue(session?.displayName ?? "?")}`} aria-hidden="true">{session ? initials(session.displayName) : "?"}</span>
        <span className="account-boundary__text">
          <strong>{session?.displayName ?? "Not signed in"}</strong>
          <span>{roleLabel(session)}</span>
        </span>
        {session ? (
          <form action="/api/auth/logout" method="post">
            <button className="sidebar__signout" type="submit" aria-label="Sign out" title="Sign out">
              <Icon name="logout" size={15} />
            </button>
          </form>
        ) : null}
      </div>
    </aside>
  );
}
