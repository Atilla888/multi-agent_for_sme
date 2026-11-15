"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { flatNavigation, isRouteActive, mobileTabs } from "@/lib/navigation";
import type { AuthenticatedSession } from "@/types/auth";
import { Preferences } from "./Preferences";

/** Mobile bottom tab bar: Home, Inbox, Orders, Reports and a More sheet with every other screen. */
export function MobileTabBar({ session }: { readonly session?: AuthenticatedSession }) {
  const t = useTranslations("shell");
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const tabActive = mobileTabs.some((tab) => isRouteActive(pathname, tab.href));

  return (
    <>
      {moreOpen ? (
        <>
          <button className="mobile-more__scrim" type="button" aria-label={t("closeMenu")} onClick={() => setMoreOpen(false)} />
          <div className="mobile-more" id="mobile-more-sheet">
            <span className="mobile-more__grip" aria-hidden="true" />
            <nav aria-label={t("allScreens")}>
              <ul>
                {flatNavigation().map((item) => {
                  const active = isRouteActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link className={`mobile-more__link ${active ? "mobile-more__link--active" : ""}`} href={item.href} aria-current={active ? "page" : undefined} onClick={() => setMoreOpen(false)}>
                        {item.icon ? <Icon name={item.icon} /> : null}
                        <span>{t(`nav.${item.key}`)}</span>
                        {item.access ? <Icon name="lock" size={14} className="mobile-more__lock" /> : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <Preferences className="preferences--sheet" />
            {session ? (
              <form action="/api/auth/logout" method="post">
                <button className="mobile-more__link" type="submit">
                  <Icon name="logout" />
                  <span>{t("account.signOut")}</span>
                </button>
              </form>
            ) : null}
          </div>
        </>
      ) : null}
      <nav className="mobile-tabbar" aria-label={t("primaryNav")}>
        {mobileTabs.map((tab) => {
          const active = isRouteActive(pathname, tab.href);
          return (
            <Link className={`mobile-tabbar__item ${active ? "mobile-tabbar__item--active" : ""}`} href={tab.href} key={tab.href} aria-current={active ? "page" : undefined} onClick={() => setMoreOpen(false)}>
              <Icon name={tab.icon} size={22} />
              <span>{t(`nav.${tab.key}`)}</span>
            </Link>
          );
        })}
        <button
          className={`mobile-tabbar__item ${moreOpen || !tabActive ? "mobile-tabbar__item--active" : ""}`}
          type="button"
          aria-expanded={moreOpen}
          aria-controls="mobile-more-sheet"
          onClick={() => setMoreOpen((open) => !open)}
        >
          <Icon name={moreOpen ? "x" : "more"} size={22} />
          <span>{t("more")}</span>
        </button>
      </nav>
    </>
  );
}
