export type AnalyticsMetric = "CONFIRMED_ORDER_UNITS" | "CONFIRMED_ORDER_VALUE";
export type AnalyticsGranularity = "DAY" | "WEEK" | "MONTH";
export type AnalyticsPeriod = "last-complete-month" | "previous-complete-month";
export type AnalyticsViewState = "default" | "loading" | "empty" | "incomplete" | "stale" | "unavailable" | "restricted";

/** One period of a report: its first and last day ("YYYY-MM-DD") and the recorded value, or null when missing. */
export interface ReportPoint {
  readonly period: string;
  readonly periodEnd: string;
  readonly value: number | null;
  readonly currency: string;
}

/** A point ready to draw, with the period named in the reader's language. */
export interface AnalyticsPoint {
  readonly period: string;
  readonly label: string;
  readonly value: number | null;
  readonly currency: string;
}

export interface AnalyticsReport {
  readonly targetDefinition: AnalyticsMetric;
  readonly granularity: AnalyticsGranularity;
  readonly period: AnalyticsPeriod;
  /** First day of the reported month, "YYYY-MM-DD". */
  readonly periodStart: string;
  readonly business: string;
  readonly timezone: "Asia/Qyzylorda";
  readonly includedStatuses: readonly ["CONFIRMED"];
  readonly eventTimestamp: "orders.created_at";
  readonly currencyScope: "PER_CURRENCY";
  readonly cutoff: string;
  readonly observedAt: string;
  readonly freshness: "current" | "stale";
  readonly completeness: "complete" | "incomplete";
  readonly series: readonly ReportPoint[];
}

export interface AnalyticsScreenModel {
  readonly mode: "sample";
  readonly state: AnalyticsViewState;
  readonly report: AnalyticsReport | null;
  readonly metric: AnalyticsMetric;
  readonly granularity: AnalyticsGranularity;
  readonly period: AnalyticsPeriod;
}
