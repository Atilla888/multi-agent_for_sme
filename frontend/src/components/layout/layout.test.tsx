import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { AuthenticatedSession } from "@/types/auth";
import { withLocale } from "@/test/intl";

vi.mock("next/navigation", () => ({
  usePathname: () => "/orders",
  useRouter: () => ({ push() {}, replace() {}, prefetch() {} }),
}));

import { PageHeader } from "./PageHeader";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MobileTabBar } from "./MobileTabBar";
import { Preferences } from "./Preferences";

const session: AuthenticatedSession = { subject: "s-1", displayName: "Aruzhan Kassym", roles: ["OWNER"], activeBusinessId: "b-1", expiresAt: "", businessName: "North Shop" };

describe("shell", () => {
  it("shows the workspace mark and no counts or shortcut hints", () => {
    const markup = renderToStaticMarkup(<Sidebar session={session} />);
    expect(markup).toContain("North Shop");
    expect(markup).toMatch(/class="workspace-mark"[^>]*>N</);
    expect(markup).not.toContain("⌘K");
    expect(markup).not.toContain("nav-count");
  });

  it("keeps the Go to search in the sidebar and the current user at the bottom", () => {
    const markup = renderToStaticMarkup(<Sidebar session={session} />);
    expect(markup).toContain('placeholder="Go to…"');
    expect(markup).toMatch(/class="avatar avatar--hue-[0-5]"[^>]*>AK</);
    expect(markup.indexOf("Aruzhan Kassym")).toBeGreaterThan(markup.indexOf("Go to…"));
  });

  it("keeps the top bar to the trail and quick actions", () => {
    const markup = renderToStaticMarkup(<TopBar session={session} />);
    expect(markup).toContain("Orders");
    expect(markup).not.toContain('placeholder="Go to…"');
  });

  it("puts title, data tag and actions on one header row and omits an absent description", () => {
    const bare = renderToStaticMarkup(<PageHeader title="Orders" source="sample" />);
    expect(bare).toContain("Sample data");
    expect(bare).not.toContain("page-header__description");
    const described = renderToStaticMarkup(<PageHeader title="Forecasts" description="The model is not ready yet." />);
    expect(described).toContain('class="page-header__description"');
  });

  it("speaks Russian and Kazakh when chosen", () => {
    const russian = withLocale("ru", () => renderToStaticMarkup(<Sidebar session={session} />));
    expect(russian).toContain("Заказы");
    expect(russian).toContain('placeholder="Перейти…"');
    expect(russian).toContain("Владелец");
    expect(russian).toContain('aria-label="Выйти"');
    expect(russian).not.toContain(">Orders<");
    const kazakh = withLocale("kk", () => renderToStaticMarkup(<TopBar session={session} />));
    expect(kazakh).toContain("Бизнес");
    expect(kazakh).toContain("Тапсырыстар");
    expect(withLocale("kk", () => renderToStaticMarkup(<MobileTabBar session={session} />))).toContain("Басты бет");
    expect(withLocale("ru", () => renderToStaticMarkup(<PageHeader title="Заказы" source="sample" />))).toContain("Пример данных");
  });
});

describe("preferences", () => {
  it("offers the three languages by their own names and marks the current one", () => {
    const markup = withLocale("kk", () => renderToStaticMarkup(<Preferences />));
    expect(markup).toMatch(/<option value="en"[^>]*>English</);
    expect(markup).toMatch(/<option value="ru"[^>]*>Русский</);
    expect(markup).toMatch(/<option value="kk"[^>]*selected=""[^>]*>Қазақша</);
    expect(markup).toContain('aria-label="Тіл"');
  });

  it("offers System, Light and Dark, with System pressed by default", () => {
    const markup = renderToStaticMarkup(<Preferences />);
    for (const choice of ["System", "Light", "Dark"]) expect(markup).toContain(`aria-label="${choice}"`);
    expect(markup).toMatch(/aria-pressed="true"[^>]*aria-label="System"|aria-label="System"[^>]*aria-pressed="true"/);
  });

  it("lives in the sidebar and the mobile More sheet", () => {
    expect(renderToStaticMarkup(<Sidebar session={session} />)).toContain('class="preferences');
  });
});

