"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { findNavigationLabel, findNavigationTrail } from "@/lib/navigation";
import type { AuthenticatedSession } from "@/types/auth";
import { NavigationSearch } from "./NavigationSearch";
import { businessLabel, headerDate, initials } from "./sessionDisplay";

export function TopBar({ session }: { readonly session?: AuthenticatedSession }) {
  const pathname = usePathname();
  const title = findNavigationLabel(pathname);
  const business = businessLabel(session);

  return (
    <header className="topbar">
      <div className="topbar__heading">
        <p className="topbar__breadcrumb" suppressHydrationWarning>
          {pathname === "/overview" ? `${headerDate()} · ${business}` : findNavigationTrail(pathname).join(" / ")}
        </p>
        <p className="topbar__title">{title}</p>
      </div>
      <NavigationSearch />
      <div className="topbar__context" aria-label="Current context">
        <span className="business-chip" title={session ? "Signed in with Keycloak" : "Session not connected"}>
          <span className="business-chip__dot" aria-hidden="true" />
          {business}
        </span>
        <Link className="icon-button icon-button--ghost" href="/escalations" aria-label="Escalations needing attention" title="Escalations">
          <Icon name="bell" />
        </Link>
        <span className="avatar-initials topbar__avatar" aria-hidden="true">{session ? initials(session.displayName) : "?"}</span>
      </div>
    </header>
  );
}
