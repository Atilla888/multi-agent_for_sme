import type { AnalyticsGranularity, AnalyticsMetric, AnalyticsPeriod, AnalyticsPoint, AnalyticsReport } from "../types";

const periodFacts = {
  "last-complete-month": { label: "September 2026", year: 2026, month: 9, days: 30, cutoff: "2026-10-01T00:00:00+05:00", observedAt: "2026-10-01T10:42:00+05:00", offset: 2 },
  "previous-complete-month": { label: "August 2026", year: 2026, month: 8, days: 31, cutoff: "2026-09-01T00:00:00+05:00", observedAt: "2026-09-01T10:42:00+05:00", offset: 1 },
} as const;

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function unitsFor(index: number, offset: number): number {
  return 3 + ((index * 3 + offset) % 7);
}

function metricValue(units: number, metric: AnalyticsMetric): number {
  return metric === "CONFIRMED_ORDER_UNITS" ? units : units * 15_500;
}

function buildDaily(period: AnalyticsPeriod, metric: AnalyticsMetric): AnalyticsPoint[] {
  const facts = periodFacts[period];
  return Array.from({ length: facts.days }, (_, index) => {
    const day = index + 1;
    const date = isoDate(facts.year, facts.month, day);
    return { period: date, label: date, value: metricValue(unitsFor(index, facts.offset), metric), currency: "KZT" };
  });
}

function buildWeekly(period: AnalyticsPeriod, metric: AnalyticsMetric): AnalyticsPoint[] {
  const facts = periodFacts[period];
  const daily = buildDaily(period, metric);
  const weeks: AnalyticsPoint[] = [];
  for (let start = 0; start < daily.length; start += 7) {
    const points = daily.slice(start, start + 7);
    const end = start + points.length;
    weeks.push({
      period: points[0]?.period ?? "",
      label: `${facts.label.slice(0, 3)} ${start + 1}-${end}`,
      value: points.reduce((total, point) => total + (point.value ?? 0), 0),
      currency: "KZT",
    });
  }
  return weeks;
}

function buildMonthly(period: AnalyticsPeriod, metric: AnalyticsMetric): AnalyticsPoint[] {
  const facts = periodFacts[period];
  return [{ period: isoDate(facts.year, facts.month, 1), label: facts.label, value: buildDaily(period, metric).reduce((total, point) => total + (point.value ?? 0), 0), currency: "KZT" }];
}

function buildSeries(period: AnalyticsPeriod, granularity: AnalyticsGranularity, metric: AnalyticsMetric): AnalyticsPoint[] {
  if (granularity === "DAY") return buildDaily(period, metric);
  if (granularity === "MONTH") return buildMonthly(period, metric);
  return buildWeekly(period, metric);
}

export function buildDemoAnalyticsReport(period: AnalyticsPeriod, granularity: AnalyticsGranularity, metric: AnalyticsMetric, options: { readonly incomplete?: boolean; readonly stale?: boolean } = {}): AnalyticsReport {
  const facts = periodFacts[period];
  const completeSeries = buildSeries(period, granularity, metric);
  const gapIndex = Math.floor(completeSeries.length / 2);
  const series = options.incomplete ? completeSeries.map((point, index) => index === gapIndex ? { ...point, value: null } : point) : completeSeries;
  return {
    targetDefinition: metric,
    metricLabel: metric === "CONFIRMED_ORDER_UNITS" ? "Units sold" : "Order value",
    unitLabel: metric === "CONFIRMED_ORDER_UNITS" ? "Units in confirmed orders" : "Value of confirmed orders, in KZT",
    granularity,
    period,
    periodLabel: facts.label,
    timezone: "Asia/Qyzylorda",
    includedStatuses: ["CONFIRMED"],
    eventTimestamp: "orders.created_at",
    currencyScope: "PER_CURRENCY",
    cutoff: facts.cutoff,
    observedAt: facts.observedAt,
    sourceLabel: "Sample report",
    freshness: options.stale ? "stale" : "current",
    completeness: options.incomplete ? "incomplete" : "complete",
    series,
  };
}
