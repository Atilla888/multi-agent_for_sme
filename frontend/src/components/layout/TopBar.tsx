"use client";

import { usePathname } from "next/navigation";
import { findNavigationLabel } from "@/lib/navigation";
import type { AuthenticatedSession } from "@/types/auth";
import { NavigationSearch } from "./NavigationSearch";

export function TopBar({ session }: { readonly session?: AuthenticatedSession }) {
  const pathname = usePathname();
  const title = findNavigationLabel(pathname);

  return (
    <header className="topbar">
      <div className="topbar__heading">
        <p className="topbar__breadcrumb">Staff Workspace / {title}</p>
        <p className="topbar__title">{title}</p>
      </div>
      <NavigationSearch />
      <div className="topbar__context" aria-label="Current context">
        <span>
          <small>Current business</small>
          <strong>{session?.businessName ?? session?.activeBusinessId ?? "Not selected"}</strong>
        </span>
        <span className="session-boundary">{session ? "Authenticated · Keycloak" : "Session not connected"}</span>
      </div>
    </header>
  );
}
