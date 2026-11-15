"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { avatarHue } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { staffNavigation } from "@/lib/navigation";
import { NavigationSearch } from "./NavigationSearch";
import { Preferences } from "./Preferences";
import { SidebarSection } from "./SidebarSection";
import { businessLabel, initials } from "./sessionDisplay";
import type { AuthenticatedSession } from "@/types/auth";

export function Sidebar({ session }: { readonly session?: AuthenticatedSession }) {
  const t = useTranslations("shell");
  const pathname = usePathname();
  const business = businessLabel(session, t("account.noActiveBusiness"));
  const roles = session ? session.roles.map((role) => t(`account.roles.${role}`)).join(" / ") : t("account.notSignedIn");

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="workspace-mark" aria-hidden="true">{business.charAt(0).toUpperCase()}</span>
        <strong className="sidebar__brand-text">{business}</strong>
      </div>

      <NavigationSearch />

      <nav aria-label={t("mainNav")}>
        <ul className="nav-list">
          {staffNavigation.map((area) => (
            <SidebarSection area={area} pathname={pathname} key={area.key} />
          ))}
        </ul>
      </nav>

      <Preferences className="preferences--sidebar" />

      <div className="account-boundary">
        <span className={`avatar avatar--hue-${avatarHue(session?.displayName ?? "?")}`} aria-hidden="true">{session ? initials(session.displayName) : "?"}</span>
        <span className="account-boundary__text">
          <strong>{session?.displayName ?? t("account.notSignedIn")}</strong>
          <span>{roles}</span>
        </span>
        {session ? (
          <form action="/api/auth/logout" method="post">
            <button className="sidebar__signout" type="submit" aria-label={t("account.signOut")} title={t("account.signOut")}>
              <Icon name="logout" size={15} />
            </button>
          </form>
        ) : null}
      </div>
    </aside>
  );
}
