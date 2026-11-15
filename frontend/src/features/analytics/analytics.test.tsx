import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { withLocale } from "@/test/intl";
import { analyticsApiContract } from "./adapters/contracts";
import { analyticsFixtureAdapter, getAnalyticsFixtureScreen } from "./adapters/fixtureAdapter";
import { chartSegments } from "./components/ActualChart";
import { AnalyticsScreen } from "./components/AnalyticsScreen";

describe("Reports", () => {
  it("drops decorative report cards but keeps the rules", () => {
    const markup = renderToStaticMarkup(<AnalyticsScreen model={getAnalyticsFixtureScreen({})} />);
    expect(markup).not.toContain("About this report");
    expect(markup).not.toContain("Looking ahead");
    expect(markup).toContain("Confirmed orders only");
    expect(markup).toContain('class="rule-note"');
  });
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
    expect(model.report?.series).toHaveLength(1);
    expect(renderToStaticMarkup(<AnalyticsScreen model={model} />)).toContain("<strong>August 2026</strong>");
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
    expect(series.map((point) => point.value === null)).toEqual([false, false, true, false, false]);
    for (const label of ["Sep 1-7", "Sep 8-14", "Sep 22-28", "Sep 29-30"]) expect(markup).toContain(`<strong>${label}</strong>`);
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

describe("Reports in Russian and Kazakh", () => {
  const render = (locale: "ru" | "kk", query: Record<string, string> = {}) => withLocale(locale, () => renderToStaticMarkup(<AnalyticsScreen model={getAnalyticsFixtureScreen(query)} />));
  const english = ["Units sold", "Order value", "Total", "Data coverage", "Last updated", "Up to date", "Report figures", "Last month", "Group by", "Update report", "Recorded", "confirmed orders per period", " units", "Sep ", "September", "Confirmed orders only", "Sample report", "Open Forecasts", " chart\""];

  it("words the report, its chart and its figures in Russian", () => {
    const markup = render("ru");
    expect(markup).toContain("<h1>Отчёты</h1>");
    expect(markup).toContain("Итого");
    expect(markup).toContain("Продано, шт. · сентябрь 2026 г.");
    expect(markup).toContain('aria-label="График: Продано, шт."');
    expect(markup).toContain("<strong>Факт</strong>");
    expect(markup).toContain("<strong>1–7 сент.</strong>");
    expect(markup).toContain("42 шт.");
    expect(markup).toContain("Получено 01.10.2026 · Asia/Qyzylorda");
    expect(markup).toContain("North Shop · Пример отчёта · до 01.10.2026");
    expect(markup).toContain("Открыть прогнозы");
    for (const text of english) expect(markup).not.toContain(text);
  });

  it("words the report in Kazakh, with Kazakh number and date formats", () => {
    const markup = render("kk", { metric: "CONFIRMED_ORDER_VALUE", granularity: "DAY" });
    expect(markup).toContain("<h1>Есептер</h1>");
    expect(markup).toContain("Тапсырыстар сомасы · 2026 ж. қыркүйек");
    expect(markup).toContain("Күн бойынша");
    expect(markup).toContain("<strong>01.09.2026</strong>");
    expect(markup).toMatch(/77\s500 KZT/);
    expect(markup).toContain("<strong>Нақты</strong>");
    expect(markup).toContain("Есеп сандары");
    for (const text of english) expect(markup).not.toContain(text);
    expect(markup).not.toContain("2026-09-01</strong>");
  });

  it("words missing, out-of-date and withheld reports", () => {
    const incomplete = render("ru", { state: "incomplete" });
    expect(incomplete).toContain("Часть данных отсутствует");
    expect(incomplete).toContain("Промежуточный итог");
    expect(incomplete).toContain("Нет данных · не считается нулём");
    expect(incomplete).not.toContain("Missing");
    expect(render("kk", { state: "stale" })).toContain("Есеп ескірген болуы мүмкін");
    expect(render("kk", { state: "empty" })).toContain("Бұл кезеңде расталған тапсырыстар жоқ");
    expect(render("ru", { state: "restricted" })).toContain("У вас нет доступа к отчётам");
    expect(render("kk", { state: "loading" })).toContain('aria-label="Есеп жүктелуде"');
  });
});
