"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { avatarHue } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { findNavigationTrailKeys } from "@/lib/navigation";
import type { AuthenticatedSession } from "@/types/auth";
import { businessLabel, initials } from "./sessionDisplay";

export function TopBar({ session }: { readonly session?: AuthenticatedSession }) {
  const t = useTranslations("shell");
  const pathname = usePathname();
  const trail = findNavigationTrailKeys(pathname).map((key) => t(`nav.${key}`));

  return (
    <header className="topbar">
      <div className="topbar__lead">
        <nav className="topbar__trail" aria-label={t("youAreHere")}>
          {trail.map((part, index) => (
            <span key={part}>
              {index > 0 ? <span className="topbar__trail-sep" aria-hidden="true">›</span> : null}
              <span className={index === trail.length - 1 ? "topbar__trail-current" : undefined}>{part}</span>
            </span>
          ))}
        </nav>
        <p className="topbar__business">{businessLabel(session, t("account.noActiveBusiness"))}</p>
      </div>
      <div className="topbar__actions">
        <Link className="icon-button icon-button--ghost" href="/escalations" aria-label={t("needsReviewLink")} title={t("nav.needsReview")}>
          <Icon name="bell" size={16} />
        </Link>
        <span className={`avatar avatar--hue-${avatarHue(session?.displayName ?? "?")} topbar__avatar`} aria-hidden="true">{session ? initials(session.displayName) : "?"}</span>
      </div>
    </header>
  );
}
