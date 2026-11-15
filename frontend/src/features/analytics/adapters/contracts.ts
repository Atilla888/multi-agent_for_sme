import type { AnalyticsGranularity, AnalyticsMetric, AnalyticsPeriod, AnalyticsReport, AnalyticsViewState } from "../types";

export interface AnalyticsReportRequest {
  readonly metric: AnalyticsMetric;
  readonly granularity: AnalyticsGranularity;
  readonly period: AnalyticsPeriod;
  readonly state: AnalyticsViewState;
}

export interface AnalyticsDataAdapter {
  getReport(request: AnalyticsReportRequest): AnalyticsReport | null;
}

export const analyticsApiContract = {
  publicEndpoint: null,
  mode: "LOCAL UI FIXTURE ONLY",
  internalEvidence: "get_sales_report tool contract",
  supportedMetrics: ["CONFIRMED_ORDER_UNITS", "CONFIRMED_ORDER_VALUE"],
  supportedGranularities: ["DAY", "WEEK", "MONTH"],
} as const;
