import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
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
    expect(model.kpis.map((kpi) => kpi.label)).toEqual(["Open conversations", "Waiting for a person", "Orders", "Orders to check"]);
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
