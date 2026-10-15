import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { demoConversationItems } from "@/features/conversations/fixtures/demoConversations";
import { demoEscalationQueue } from "@/features/escalations/fixtures/demoEscalations";
import { demoOrderItems } from "@/features/orders/fixtures/demoOrders";
import { getOverviewFixture } from "./overview";
import { OverviewScreen } from "./OverviewScreen";

describe("Overview (Figma page 02)", () => {
  const model = getOverviewFixture();

  it("counts KPIs from the shared fixtures instead of inventing numbers", () => {
    expect(model.kpis.map((kpi) => kpi.label)).toEqual(["Open conversations", "Waiting for a human", "Orders", "Orders needing attention"]);
    expect(model.kpis[0].value).toBe(demoConversationItems.length);
    expect(model.kpis[1].value).toBe(demoEscalationQueue.filter((item) => item.state === "waiting-human").length);
    expect(model.kpis[2].value).toBe(demoOrderItems.length);
  });

  it("labels the page as fixture data and links every row to its screen", () => {
    const markup = renderToStaticMarkup(<OverviewScreen model={model} />);
    expect(markup).toContain("LOCAL UI FIXTURE");
    expect(markup).toContain("Needs attention");
    expect(markup).toContain('href="/escalations"');
    expect(markup).toContain(`href="/orders/${demoOrderItems[0].id}"`);
    expect(markup).toContain('data-label="Reservation"');
  });
});
