"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { flatNavigation, isRouteActive, mobileTabs } from "@/lib/navigation";
import type { AuthenticatedSession } from "@/types/auth";

/** Mobile bottom tab bar (Figma, Mobile · 390): Home, Chats, Orders, Analytics and a More sheet. */
export function MobileTabBar({ session }: { readonly session?: AuthenticatedSession }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const tabActive = mobileTabs.some((tab) => isRouteActive(pathname, tab.href));

  return (
    <>
      {moreOpen ? (
        <div className="mobile-more" id="mobile-more-sheet">
          <nav aria-label="All staff screens">
            <ul>
              {flatNavigation().map((item) => {
                const active = isRouteActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link className={`mobile-more__link ${active ? "mobile-more__link--active" : ""}`} href={item.href} aria-current={active ? "page" : undefined} onClick={() => setMoreOpen(false)}>
                      {item.icon ? <Icon name={item.icon} /> : null}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          {session ? (
            <form action="/api/auth/logout" method="post">
              <button className="mobile-more__link" type="submit">
                <Icon name="logout" />
                <span>Sign out</span>
              </button>
            </form>
          ) : null}
        </div>
      ) : null}
      <nav className="mobile-tabbar" aria-label="Primary">
        {mobileTabs.map((tab) => {
          const active = isRouteActive(pathname, tab.href);
          return (
            <Link className={`mobile-tabbar__item ${active ? "mobile-tabbar__item--active" : ""}`} href={tab.href} key={tab.href} aria-current={active ? "page" : undefined} onClick={() => setMoreOpen(false)}>
              <Icon name={tab.icon} size={22} />
              <span>{tab.label}</span>
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
          <span>More</span>
        </button>
      </nav>
    </>
  );
}
