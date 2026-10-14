import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Card, CardContent, CardHeader, CardTitle, EmptyState, LoadingState, Select, StateNotice, StatusBadge, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { BusinessFixtureBanner } from "@/features/business";
import type { AnalyticsPoint, AnalyticsScreenModel } from "../types";
import { ActualChart } from "./ActualChart";

function formatValue(point: AnalyticsPoint, metric: AnalyticsScreenModel["metric"]): string {
  if (point.value === null) return "Unavailable";
  if (metric === "CONFIRMED_ORDER_VALUE") return `${new Intl.NumberFormat("en-US").format(point.value)} ${point.currency}`;
  return `${new Intl.NumberFormat("en-US").format(point.value)} units`;
}

function AnalyticsBoundary({ model }: { readonly model: AnalyticsScreenModel }) {
  if (model.state === "loading") return <section className="analytics-loading" aria-label="Loading historical report"><LoadingState label="Loading report definition" lines={4} /><LoadingState label="Loading historical observations" lines={6} /></section>;
  if (model.state === "empty") return <EmptyState title="Valid empty historical report" description="The deterministic query completed for this scope and period, but no qualifying confirmed-order records were found. This is not a source outage or a replacement zero." />;
  if (model.state === "restricted") return <StateNotice state="permission-denied" title="Analytics access is restricted" description="Protected metrics, chart values, and report rows are withheld. Visible navigation and fixture role labels do not grant backend access." />;
  if (model.state === "unavailable") return <StateNotice state="dependency-unavailable" title="Historical report source is unavailable" description="No trusted result is available. No chart, report rows, or substitute zero is shown while the source is unavailable." />;
  return model.report ? <AnalyticsResult model={model} /> : null;
}

function AnalyticsResult({ model }: { readonly model: AnalyticsScreenModel }) {
  const report = model.report!;
  const observed = report.series.filter((point) => point.value !== null);
  const total = observed.reduce((sum, point) => sum + (point.value ?? 0), 0);
  const totalPoint: AnalyticsPoint = { period: report.period, label: report.periodLabel, value: total, currency: "KZT" };
  const stateNotice = model.state === "incomplete"
    ? <StateNotice state="stale-conflict" title="Incomplete historical data" description="One observation is unavailable. The ACTUAL line has a visible gap and the summary is an observed subtotal, not a complete period total." />
    : model.state === "stale"
      ? <StateNotice state="stale-conflict" title="Stale historical snapshot" description="Observed values remain visible as historical facts. Refresh authoritative data before using them for a current operational decision." />
      : <StateNotice state="success" title="Valid historical result" description="Observed confirmed-order facts for the selected past period. No forecast or causal claim is included." />;
  return <>
    {stateNotice}
    <section className="analytics-metric-grid" aria-label="Historical report summary">
      <Card><CardHeader><CardTitle>{model.state === "incomplete" ? "Observed subtotal" : "Observed total"}</CardTitle><StatusBadge state={model.state === "incomplete" ? "stale-conflict" : "confirmed"} /></CardHeader><CardContent><p className="analytics-metric-value">{formatValue(totalPoint, model.metric)}</p><p>{report.metricLabel} · {report.includedStatuses.join(", ")} orders only</p></CardContent></Card>
      <Card><CardHeader><CardTitle>Completeness</CardTitle><StatusBadge state={report.completeness === "complete" ? "success" : "stale-conflict"} /></CardHeader><CardContent><p className="analytics-metric-value">{observed.length} / {report.series.length}</p><p>Observed intervals · missing is never converted to zero</p></CardContent></Card>
      <Card><CardHeader><CardTitle>Freshness</CardTitle><StatusBadge state={report.freshness === "current" ? "confirmed" : "stale-conflict"} /></CardHeader><CardContent><p className="analytics-metric-value">{report.freshness === "current" ? "Current fixture" : "Stale fixture"}</p><p>Observed {report.observedAt} · {report.timezone}</p></CardContent></Card>
    </section>
    <section className="analytics-visual-grid">
      <Card className="analytics-chart-card"><CardHeader><div><p className="section-kicker">Historical chart · ACTUAL only</p><CardTitle>{report.metricLabel}</CardTitle></div><StatusBadge state={report.completeness === "complete" ? "confirmed" : "stale-conflict"} /></CardHeader><CardContent><ActualChart series={report.series} metricLabel={report.metricLabel} /><p className="analytics-chart-note">{model.state === "incomplete" ? "The missing interval breaks the solid line; it is not plotted at zero." : "Every solid segment represents an observed historical interval."}</p></CardContent></Card>
      <Card className="analytics-provenance"><CardHeader><CardTitle>Report definition and provenance</CardTitle></CardHeader><CardContent><dl className="business-facts">
        <div><dt>Business</dt><dd><strong>North Shop</strong><span>Synthetic fixture scope</span></dd></div>
        <div><dt>Period</dt><dd><strong>{report.periodLabel}</strong><span>{report.timezone}</span></dd></div>
        <div><dt>Definition</dt><dd><strong>{report.targetDefinition}</strong><span>{report.unitLabel}</span></dd></div>
        <div><dt>Event source</dt><dd><strong>{report.eventTimestamp}</strong><span>{report.includedStatuses.join(", ")} only</span></dd></div>
        <div><dt>Cutoff</dt><dd><strong>{report.cutoff}</strong><span>{report.currencyScope}</span></dd></div>
        <div><dt>Source</dt><dd><strong>{report.sourceLabel}</strong><span>No public endpoint was called</span></dd></div>
      </dl></CardContent></Card>
    </section>
    <Table scrollLabel="Historical Analytics underlying values" className="analytics-table">
      <TableCaption>The same typed ACTUAL series used by the chart. Values are deterministic examples, not live business data.</TableCaption>
      <TableHeader><TableRow><TableHead>Interval</TableHead><TableHead>ACTUAL value</TableHead><TableHead>Observation</TableHead><TableHead>Source</TableHead></TableRow></TableHeader>
      <TableBody>{report.series.map((point) => <TableRow key={point.period}><TableCell><strong>{point.label}</strong><span className="table-cell-note">{report.granularity}</span></TableCell><TableCell className="quantity-cell">{formatValue(point, model.metric)}</TableCell><TableCell><StatusBadge state={point.value === null ? "stale-conflict" : "confirmed"} /><span className="table-cell-note">{point.value === null ? "Missing observation · not zero" : "Observed"}</span></TableCell><TableCell>Fixture report<span className="table-cell-note">{report.eventTimestamp}</span></TableCell></TableRow>)}</TableBody>
    </Table>
  </>;
}

export function AnalyticsScreen({ model }: { readonly model: AnalyticsScreenModel }) {
  return <div className="feature-page business-screen analytics-screen">
    <PageHeader eyebrow="Analytics / Historical report" title="Analytics" description="Inspect authorized historical confirmed-order facts with explicit metric, period, completeness, freshness, and provenance." />
    <BusinessFixtureBanner family="Analytics" />
    <StateNotice state="pending" title="Historical ACTUAL only" description="This workspace contains observed past values. Forecasts is a separate capability and no predicted series appears in this report." />
    <form className="analytics-controls" action="/analytics" method="get">
      <Select id="analytics-period" name="period" label="Historical period" defaultValue={model.period} description="Complete past periods in the deterministic fixture."><option value="last-complete-month">Last complete month</option><option value="previous-complete-month">Previous complete month</option></Select>
      <Select id="analytics-metric" name="metric" label="Metric" defaultValue={model.metric} description="Only backend-evidenced definitions are available."><option value="CONFIRMED_ORDER_UNITS">Confirmed order units</option><option value="CONFIRMED_ORDER_VALUE">Confirmed order value</option></Select>
      <Select id="analytics-granularity" name="granularity" label="Granularity" defaultValue={model.granularity} description="DAY, WEEK, or MONTH contract values."><option value="DAY">Day</option><option value="WEEK">Week</option><option value="MONTH">Month</option></Select>
      <Button type="submit">Apply report view</Button>
    </form>
    <p className="analytics-control-note">This updates deterministic fixture data only. No live report endpoint exists and no server request is claimed.</p>
    <AnalyticsBoundary model={model} />
    <Card className="analytics-forecast-link"><CardHeader><div><p className="section-kicker">Need future values?</p><CardTitle>Forecasts remains separate</CardTitle></div></CardHeader><CardContent><p>Historical Analytics never contains a PREDICTED series. Forecast eligibility and authorization are checked separately.</p><Link className="context-link" href="/forecasts">Open Forecasts →</Link></CardContent></Card>
  </div>;
}
