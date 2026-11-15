"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { avatarHue } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { findNavigationTrail } from "@/lib/navigation";
import type { AuthenticatedSession } from "@/types/auth";
import { businessLabel, initials } from "./sessionDisplay";

export function TopBar({ session }: { readonly session?: AuthenticatedSession }) {
  const pathname = usePathname();
  const trail = findNavigationTrail(pathname);

  return (
    <header className="topbar">
      <div className="topbar__lead">
        <nav className="topbar__trail" aria-label="You are here">
          {trail.map((part, index) => (
            <span key={part}>
              {index > 0 ? <span className="topbar__trail-sep" aria-hidden="true">›</span> : null}
              <span className={index === trail.length - 1 ? "topbar__trail-current" : undefined}>{part}</span>
            </span>
          ))}
        </nav>
        <p className="topbar__business">{businessLabel(session)}</p>
      </div>
      <div className="topbar__actions">
        <Link className="icon-button icon-button--ghost" href="/escalations" aria-label="Cases that need review" title="Needs review">
          <Icon name="bell" size={16} />
        </Link>
        <span className={`avatar avatar--hue-${avatarHue(session?.displayName ?? "?")} topbar__avatar`} aria-hidden="true">{session ? initials(session.displayName) : "?"}</span>
      </div>
    </header>
  );
}
