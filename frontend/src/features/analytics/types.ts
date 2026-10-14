export type AnalyticsMetric = "CONFIRMED_ORDER_UNITS" | "CONFIRMED_ORDER_VALUE";
export type AnalyticsGranularity = "DAY" | "WEEK" | "MONTH";
export type AnalyticsPeriod = "last-complete-month" | "previous-complete-month";
export type AnalyticsViewState = "default" | "loading" | "empty" | "incomplete" | "stale" | "unavailable" | "restricted";

export interface AnalyticsPoint {
  readonly period: string;
  readonly label: string;
  readonly value: number | null;
  readonly currency: string;
}

export interface AnalyticsReport {
  readonly targetDefinition: AnalyticsMetric;
  readonly metricLabel: string;
  readonly unitLabel: string;
  readonly granularity: AnalyticsGranularity;
  readonly period: AnalyticsPeriod;
  readonly periodLabel: string;
  readonly timezone: "Asia/Qyzylorda";
  readonly includedStatuses: readonly ["CONFIRMED"];
  readonly eventTimestamp: "orders.created_at";
  readonly currencyScope: "PER_CURRENCY";
  readonly cutoff: string;
  readonly observedAt: string;
  readonly sourceLabel: string;
  readonly freshness: "current" | "stale";
  readonly completeness: "complete" | "incomplete";
  readonly series: readonly AnalyticsPoint[];
}

export interface AnalyticsScreenModel {
  readonly mode: "LOCAL UI FIXTURE ONLY";
  readonly state: AnalyticsViewState;
  readonly report: AnalyticsReport | null;
  readonly metric: AnalyticsMetric;
  readonly granularity: AnalyticsGranularity;
  readonly period: AnalyticsPeriod;
}
