import { buildDemoAnalyticsReport } from "../fixtures/demoAnalytics";
import type { AnalyticsGranularity, AnalyticsMetric, AnalyticsPeriod, AnalyticsScreenModel, AnalyticsViewState } from "../types";
import type { AnalyticsDataAdapter, AnalyticsReportRequest } from "./contracts";

const metrics: readonly AnalyticsMetric[] = ["CONFIRMED_ORDER_UNITS", "CONFIRMED_ORDER_VALUE"];
const granularities: readonly AnalyticsGranularity[] = ["DAY", "WEEK", "MONTH"];
const periods: readonly AnalyticsPeriod[] = ["last-complete-month", "previous-complete-month"];
const states: readonly AnalyticsViewState[] = ["default", "loading", "empty", "incomplete", "stale", "unavailable", "restricted"];

function first(value: string | string[] | undefined): string { return Array.isArray(value) ? value[0] ?? "" : value ?? ""; }
function allowed<T extends string>(value: string, values: readonly T[], fallback: T): T { return values.includes(value as T) ? value as T : fallback; }

export const analyticsFixtureAdapter: AnalyticsDataAdapter = {
  getReport(request: AnalyticsReportRequest) {
    if (["loading", "empty", "unavailable", "restricted"].includes(request.state)) return null;
    return buildDemoAnalyticsReport(request.period, request.granularity, request.metric, { incomplete: request.state === "incomplete", stale: request.state === "stale" });
  },
};

export function getAnalyticsFixtureScreen(query: Record<string, string | string[] | undefined>): AnalyticsScreenModel {
  const metric = allowed(first(query.metric), metrics, "CONFIRMED_ORDER_UNITS");
  const granularity = allowed(first(query.granularity), granularities, "WEEK");
  const period = allowed(first(query.period), periods, "last-complete-month");
  const state = allowed(first(query.state), states, "default");
  return { mode: "sample", state, report: analyticsFixtureAdapter.getReport({ metric, granularity, period, state }), metric, granularity, period };
}
