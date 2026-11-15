import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { escalations } from "@/i18n/messages/escalations";
import { withLocale } from "@/test/intl";
import { demoConversationItems } from "@/features/conversations/fixtures/demoConversations";
import { demoEscalationQueue } from "@/features/escalations/fixtures/demoEscalations";
import { demoOrderItems } from "@/features/orders/fixtures/demoOrders";
import { getOverviewFixture } from "./overview";
import { OverviewScreen } from "./OverviewScreen";

describe("Overview", () => {
  const model = getOverviewFixture();

  it("leads with what needs attention and drops the number cards", () => {
    const markup = renderToStaticMarkup(<OverviewScreen model={model} />);
    expect(markup).not.toContain("overview-kpi");
    expect(markup.indexOf("Needs review")).toBeLessThan(markup.indexOf("Recent orders"));
    expect(markup).toMatch(new RegExp(`Needs review <span class="overview-count">${model.attention.length}</span>`));
  });

  it("counts the numbers from the shared sample records instead of inventing them", () => {
    expect(model.kpis.map((kpi) => kpi.kind)).toEqual(["openConversations", "waitingHuman", "orders", "ordersToCheck"]);
    expect(model.kpis[0].value).toBe(demoConversationItems.length);
    expect(model.kpis[1].value).toBe(demoEscalationQueue.filter((item) => item.state === "waiting-human").length);
    expect(model.kpis[2].value).toBe(demoOrderItems.length);
  });

  it("labels the page as sample data and links every row to its screen", () => {
    const markup = renderToStaticMarkup(<OverviewScreen model={model} />);
    expect(markup).toContain("Sample data");
    expect(markup).toContain("Needs review");
    expect(markup).toContain('href="/escalations"');
    expect(markup).toContain(`href="/orders/${demoOrderItems[0].id}"`);
    expect(markup).toContain('data-label="Reservation"');
    expect(markup).not.toMatch(/fixture|OUTCOME_UNKNOWN/);
  });
});

describe("Overview in Russian and Kazakh", () => {
  const model = getOverviewFixture();
  const english = ["Needs review", "Open all", "Recent orders", "View all", ">Order<", ">Customer<", "Stock reservation", 'data-label="Reservation"', "Yesterday", "Order change is not allowed"];

  it("words the page in Russian and names each case as Needs review does", () => {
    const markup = withLocale("ru", () => renderToStaticMarkup(<OverviewScreen model={model} />));
    expect(markup).toContain("<h1>Обзор</h1>");
    expect(markup).toMatch(new RegExp(`Требует внимания <span class="overview-count">${model.attention.length}</span>`));
    expect(markup).toContain("Последние заказы");
    expect(markup).toContain('data-label="Резерв"');
    expect(markup).toContain(escalations.ru.reasons.orderChangeBlocked);
    expect(markup).toContain(`ORD-1090 · Dana R. · ${escalations.ru.yesterday}`);
    expect(markup).toContain("Amina S.");
    for (const text of english) expect(markup).not.toContain(text);
  });

  it("words the page in Kazakh", () => {
    const markup = withLocale("kk", () => renderToStaticMarkup(<OverviewScreen model={model} />));
    expect(markup).toContain("<h1>Шолу</h1>");
    expect(markup).toContain("Қарау керек");
    expect(markup).toContain("Барлығын ашу");
    expect(markup).toContain("Тауарды резервтеу");
    expect(markup).toContain(escalations.kk.reasons.reservationDecision);
    expect(markup).toContain(escalations.kk.yesterday);
    for (const text of english) expect(markup).not.toContain(text);
    expect(withLocale("kk", () => renderToStaticMarkup(<OverviewScreen model={{ ...model, attention: [] }} />))).toContain("Қазір шешім күтіп тұрған ештеңе жоқ.");
  });
});
