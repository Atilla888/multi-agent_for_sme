import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { analyticsApiContract } from "./adapters/contracts";
import { analyticsFixtureAdapter, getAnalyticsFixtureScreen } from "./adapters/fixtureAdapter";
import { chartSegments } from "./components/ActualChart";
import { AnalyticsScreen } from "./components/AnalyticsScreen";

describe("Reports", () => {
  it("renders the report with its chart, figures and sample-data label", () => {
    const markup = renderToStaticMarkup(<AnalyticsScreen model={getAnalyticsFixtureScreen({})} />);
    expect(markup).toContain("Reports");
    expect(markup).toContain("Report figures");
    expect(markup).toContain("Sample data");
    expect(markup).toContain("North Shop");
    expect(markup).not.toMatch(/ACTUAL|fixture|P5F/);
  });

  it("renders total, coverage and freshness cards", () => {
    const markup = renderToStaticMarkup(<AnalyticsScreen model={getAnalyticsFixtureScreen({})} />);
    expect(markup).toContain("Total");
    expect(markup).toContain("Units sold");
    expect(markup).toContain("Data coverage");
    expect(markup).toContain("Last updated");
    expect(markup).toContain("Confirmed orders only");
  });

  it("applies only allowed period, measure and grouping", () => {
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

  it("keeps loading and empty distinct", () => {
    const loading = renderToStaticMarkup(<AnalyticsScreen model={getAnalyticsFixtureScreen({ state: "loading" })} />);
    const empty = renderToStaticMarkup(<AnalyticsScreen model={getAnalyticsFixtureScreen({ state: "empty" })} />);
    expect(loading).toContain("Loading figures");
    expect(loading).not.toContain("No confirmed orders in this period");
    expect(empty).toContain("No confirmed orders in this period");
    expect(empty).toContain("not a technical problem");
  });

  it("renders missing data as a gap and never as zero", () => {
    const model = getAnalyticsFixtureScreen({ state: "incomplete" });
    const markup = renderToStaticMarkup(<AnalyticsScreen model={model} />);
    expect(model.report?.series.some((point) => point.value === null)).toBe(true);
    expect(markup).toContain("Some data is missing");
    expect(markup).toContain("Missing");
    expect(markup).toContain("not counted as zero");
    expect(markup).toContain("Subtotal");
  });

  it("keeps out-of-date figures visible with a clear warning", () => {
    const model = getAnalyticsFixtureScreen({ state: "stale" });
    const markup = renderToStaticMarkup(<AnalyticsScreen model={model} />);
    expect(model.report?.freshness).toBe("stale");
    expect(markup).toContain("This report may be out of date");
    expect(markup).toContain("Refresh before using them");
    expect(markup).toContain("Report figures");
  });

  it("withholds all figures when the source is unavailable", () => {
    const model = getAnalyticsFixtureScreen({ state: "unavailable" });
    const markup = renderToStaticMarkup(<AnalyticsScreen model={model} />);
    expect(model.report).toBeNull();
    expect(markup).toContain("can&#x27;t be loaded right now");
    expect(markup).not.toContain("analytics-chart__series");
    expect(markup).not.toContain("Report figures");
  });

  it("withholds figures when the person has no access", () => {
    const markup = renderToStaticMarkup(<AnalyticsScreen model={getAnalyticsFixtureScreen({ state: "restricted" })} />);
    expect(markup).toContain("don&#x27;t have access to reports");
    expect(markup).not.toContain("analytics-chart__series");
  });

  it("drives the chart and table from one series", () => {
    const model = getAnalyticsFixtureScreen({ state: "incomplete" });
    const series = model.report?.series ?? [];
    const segments = chartSegments(series);
    const expectedSegments = series.slice(1).filter((point, index) => point.value !== null && series[index]?.value !== null).length;
    expect(segments).toHaveLength(expectedSegments);
    const markup = renderToStaticMarkup(<AnalyticsScreen model={model} />);
    for (const point of series.filter((item) => item.value !== null)) expect(markup).toContain(point.label);
  });

  it("has no fake API, forecast series, research metrics or unsupported KPI", () => {
    expect(analyticsApiContract.publicEndpoint).toBeNull();
    expect(String(analyticsFixtureAdapter.getReport)).not.toContain("fetch(");
    const markup = renderToStaticMarkup(<AnalyticsScreen model={getAnalyticsFixtureScreen({})} />);
    expect(markup).not.toContain("PREDICTED");
    expect(markup).not.toContain("Revenue");
    expect(markup).not.toMatch(/TSR|FER|H0|H1|SINGLE|STATIC|ADAPTIVE/);
  });
});
