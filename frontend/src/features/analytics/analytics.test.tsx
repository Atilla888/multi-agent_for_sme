import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { analyticsApiContract } from "./adapters/contracts";
import { analyticsFixtureAdapter, getAnalyticsFixtureScreen } from "./adapters/fixtureAdapter";
import { chartSegments } from "./components/ActualChart";
import { AnalyticsScreen } from "./components/AnalyticsScreen";

describe("P5F Analytics", () => {
  it("renders the approved historical ACTUAL workspace", () => {
    const markup = renderToStaticMarkup(<AnalyticsScreen model={getAnalyticsFixtureScreen({})} />);
    expect(markup).toContain("Historical ACTUAL only");
    expect(markup).toContain("Valid historical result");
    expect(markup).toContain("Historical chart · ACTUAL only");
    expect(markup).toContain("Historical Analytics underlying values");
    expect(markup).toContain("LOCAL UI FIXTURE ONLY");
    expect(markup).toContain("North Shop");
  });

  it("renders supported metric, completeness, and freshness cards", () => {
    const markup = renderToStaticMarkup(<AnalyticsScreen model={getAnalyticsFixtureScreen({})} />);
    expect(markup).toContain("Observed total");
    expect(markup).toContain("Confirmed order units");
    expect(markup).toContain("Completeness");
    expect(markup).toContain("Freshness");
    expect(markup).toContain("CONFIRMED orders only");
  });

  it("applies only allowed period, metric, and granularity filters", () => {
    const model = getAnalyticsFixtureScreen({ period: "previous-complete-month", metric: "CONFIRMED_ORDER_VALUE", granularity: "MONTH" });
    expect(model.period).toBe("previous-complete-month");
    expect(model.metric).toBe("CONFIRMED_ORDER_VALUE");
    expect(model.granularity).toBe("MONTH");
    expect(model.report?.periodLabel).toBe("August 2026");
    expect(model.report?.series).toHaveLength(1);
    const invalid = getAnalyticsFixtureScreen({ period: "future", metric: "REVENUE", granularity: "HOUR" });
    expect(invalid.metric).toBe("CONFIRMED_ORDER_UNITS");
    expect(invalid.granularity).toBe("WEEK");
    expect(invalid.period).toBe("last-complete-month");
  });

  it("keeps loading and valid-empty states distinct", () => {
    const loading = renderToStaticMarkup(<AnalyticsScreen model={getAnalyticsFixtureScreen({ state: "loading" })} />);
    const empty = renderToStaticMarkup(<AnalyticsScreen model={getAnalyticsFixtureScreen({ state: "empty" })} />);
    expect(loading).toContain("Loading historical observations");
    expect(loading).not.toContain("Valid empty historical report");
    expect(empty).toContain("Valid empty historical report");
    expect(empty).toContain("not a source outage or a replacement zero");
  });

  it("renders incomplete data as a gap and never as zero", () => {
    const model = getAnalyticsFixtureScreen({ state: "incomplete" });
    const markup = renderToStaticMarkup(<AnalyticsScreen model={model} />);
    expect(model.report?.series.some((point) => point.value === null)).toBe(true);
    expect(markup).toContain("Incomplete historical data");
    expect(markup).toContain("Missing");
    expect(markup).toContain("Unavailable");
    expect(markup).toContain("Missing observation · not zero");
    expect(markup).toContain("Observed subtotal");
  });

  it("keeps stale observations visible with a clear warning", () => {
    const model = getAnalyticsFixtureScreen({ state: "stale" });
    const markup = renderToStaticMarkup(<AnalyticsScreen model={model} />);
    expect(model.report?.freshness).toBe("stale");
    expect(markup).toContain("Stale historical snapshot");
    expect(markup).toContain("Refresh authoritative data");
    expect(markup).toContain("ACTUAL value");
  });

  it("withholds all report values when the dependency is unavailable", () => {
    const model = getAnalyticsFixtureScreen({ state: "unavailable" });
    const markup = renderToStaticMarkup(<AnalyticsScreen model={model} />);
    expect(model.report).toBeNull();
    expect(markup).toContain("Historical report source is unavailable");
    expect(markup).not.toContain("analytics-chart__series");
    expect(markup).not.toContain("ACTUAL value");
  });

  it("withholds protected report data in the restricted state", () => {
    const markup = renderToStaticMarkup(<AnalyticsScreen model={getAnalyticsFixtureScreen({ state: "restricted" })} />);
    expect(markup).toContain("Analytics access is restricted");
    expect(markup).toContain("do not grant backend access");
    expect(markup).not.toContain("Deterministic P5F fixture shaped to get_sales_report");
    expect(markup).not.toContain("analytics-chart__series");
  });

  it("drives the chart and table from one typed series", () => {
    const model = getAnalyticsFixtureScreen({ state: "incomplete" });
    const series = model.report?.series ?? [];
    const segments = chartSegments(series);
    const expectedSegments = series.slice(1).filter((point, index) => point.value !== null && series[index]?.value !== null).length;
    expect(segments).toHaveLength(expectedSegments);
    const markup = renderToStaticMarkup(<AnalyticsScreen model={model} />);
    for (const point of series.filter((item) => item.value !== null)) expect(markup).toContain(point.label);
  });

  it("has no fake API, forecast series, research metrics, or unsupported KPI", () => {
    expect(analyticsApiContract.publicEndpoint).toBeNull();
    expect(String(analyticsFixtureAdapter.getReport)).not.toContain("fetch(");
    const markup = renderToStaticMarkup(<AnalyticsScreen model={getAnalyticsFixtureScreen({})} />);
    expect(markup).not.toContain("PREDICTED / ");
    expect(markup).not.toContain("Revenue");
    expect(markup).not.toMatch(/TSR|FER|H0|H1|SINGLE|STATIC|ADAPTIVE/);
  });
});
