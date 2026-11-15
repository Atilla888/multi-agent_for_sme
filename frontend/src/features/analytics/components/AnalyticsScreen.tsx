import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Card, CardContent, CardHeader, CardTitle, EmptyState, LoadingState, Select, StateNotice, StatusBadge, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import type { AnalyticsPoint, AnalyticsScreenModel } from "../types";
import { ActualChart } from "./ActualChart";

function formatValue(point: AnalyticsPoint, metric: AnalyticsScreenModel["metric"]): string {
  if (point.value === null) return "Missing";
  if (metric === "CONFIRMED_ORDER_VALUE") return `${new Intl.NumberFormat("en-US").format(point.value)} ${point.currency}`;
  return `${new Intl.NumberFormat("en-US").format(point.value)} units`;
}

const groupLabel = { DAY: "day", WEEK: "week", MONTH: "month" } as const;

function AnalyticsBoundary({ model }: { readonly model: AnalyticsScreenModel }) {
  if (model.state === "loading") return <section className="analytics-loading" aria-label="Loading report"><LoadingState label="Loading report" lines={4} /><LoadingState label="Loading figures" lines={6} /></section>;
  if (model.state === "empty") return <EmptyState title="No confirmed orders in this period" description="The report ran, but there were no confirmed orders for this period. This is not a technical problem." />;
  if (model.state === "restricted") return <StateNotice state="permission-denied" title="You don't have access to reports" description="Ask an owner or administrator if you need this." />;
  if (model.state === "unavailable") return <StateNotice state="dependency-unavailable" title="Reports can't be loaded right now" description="We could not load the report. No figures are shown so nothing is guessed." />;
  return model.report ? <AnalyticsResult model={model} /> : null;
}

function AnalyticsResult({ model }: { readonly model: AnalyticsScreenModel }) {
  const report = model.report!;
  const observed = report.series.filter((point) => point.value !== null);
  const total = observed.reduce((sum, point) => sum + (point.value ?? 0), 0);
  const totalPoint: AnalyticsPoint = { period: report.period, label: report.periodLabel, value: total, currency: "KZT" };
  const stateNotice = model.state === "incomplete"
    ? <StateNotice state="stale-conflict" title="Some data is missing" description="One period has no data, so the chart has a gap and the total is a subtotal of what we have." />
    : model.state === "stale"
      ? <StateNotice state="stale-conflict" title="This report may be out of date" description="The figures were correct when they were taken. Refresh before using them for today's decisions." />
      : null;
  return <>
    {stateNotice}
    <section className="analytics-metric-grid" aria-label="Report summary">
      <Card><CardHeader><CardTitle>{model.state === "incomplete" ? "Subtotal" : "Total"}</CardTitle><StatusBadge state={model.state === "incomplete" ? "stale-conflict" : "confirmed"} /></CardHeader><CardContent><p className="analytics-metric-value">{formatValue(totalPoint, model.metric)}</p><p>{report.metricLabel} · {report.periodLabel}</p></CardContent></Card>
      <Card><CardHeader><CardTitle>Data coverage</CardTitle><StatusBadge state={report.completeness === "complete" ? "success" : "stale-conflict"} /></CardHeader><CardContent><p className="analytics-metric-value">{observed.length} / {report.series.length}</p><p>Periods with data. A missing period is never counted as zero.</p></CardContent></Card>
      <Card><CardHeader><CardTitle>Last updated</CardTitle><StatusBadge state={report.freshness === "current" ? "confirmed" : "stale-conflict"} /></CardHeader><CardContent><p className="analytics-metric-value">{report.freshness === "current" ? "Up to date" : "Out of date"}</p><p>Taken {report.observedAt.slice(0, 10)} · {report.timezone}</p></CardContent></Card>
    </section>
    <section className="analytics-visual-grid">
      <Card className="analytics-chart-card"><CardHeader><div><p className="section-kicker">By {groupLabel[report.granularity]}</p><CardTitle>{report.metricLabel}</CardTitle></div><StatusBadge state={report.completeness === "complete" ? "confirmed" : "stale-conflict"} /></CardHeader><CardContent><ActualChart series={report.series} metricLabel={report.metricLabel} /><p className="analytics-chart-note">{model.state === "incomplete" ? "The missing period breaks the line; it is not drawn as zero." : "Each point is the confirmed orders recorded in that period."}</p><p className="rule-note">Confirmed orders only, counted by the date the order was created. Each currency is shown separately. North Shop · {report.sourceLabel} · up to {report.cutoff.slice(0, 10)}</p></CardContent></Card>
    </section>
    <Table scrollLabel="Report figures" className="analytics-table">
      <TableCaption className="sr-only">The figures behind the chart.</TableCaption>
      <TableHeader><TableRow><TableHead>Period</TableHead><TableHead>Value</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
      <TableBody>{report.series.map((point) => <TableRow key={point.period}><TableCell><strong>{point.label}</strong></TableCell><TableCell className="quantity-cell">{formatValue(point, model.metric)}</TableCell><TableCell><StatusBadge state={point.value === null ? "stale-conflict" : "confirmed"} /><span className="table-cell-note">{point.value === null ? "Missing · not counted as zero" : "Recorded"}</span></TableCell></TableRow>)}</TableBody>
    </Table>
  </>;
}

/** Reports: confirmed orders for a past period. Predictions live on the Forecasts screen. */
export function AnalyticsScreen({ model }: { readonly model: AnalyticsScreenModel }) {
  return <div className="feature-page business-screen analytics-screen">
    <PageHeader title="Reports" source="sample" />
    <form className="analytics-controls" action="/analytics" method="get">
      <Select id="analytics-period" name="period" label="Period" defaultValue={model.period}><option value="last-complete-month">Last month</option><option value="previous-complete-month">The month before</option></Select>
      <Select id="analytics-metric" name="metric" label="Measure" defaultValue={model.metric}><option value="CONFIRMED_ORDER_UNITS">Units sold</option><option value="CONFIRMED_ORDER_VALUE">Order value</option></Select>
      <Select id="analytics-granularity" name="granularity" label="Group by" defaultValue={model.granularity}><option value="DAY">Day</option><option value="WEEK">Week</option><option value="MONTH">Month</option></Select>
      <Button type="submit">Update report</Button>
    </form>
    <AnalyticsBoundary model={model} />
    <p className="rule-note">Reports show only what was recorded, never predictions. <Link className="context-link" href="/forecasts">Open Forecasts</Link></p>
  </div>;
}
