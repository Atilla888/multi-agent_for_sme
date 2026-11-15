import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Card, CardContent, CardHeader, CardTitle, EmptyState, LoadingState, Select, StateNotice, StatusBadge, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { periodName, reportDate, reportMonth, reportValue } from "../reportText";
import type { AnalyticsPoint, AnalyticsScreenModel } from "../types";
import { ActualChart } from "./ActualChart";

function AnalyticsBoundary({ model }: { readonly model: AnalyticsScreenModel }) {
  const t = useTranslations("analytics");
  if (model.state === "loading") return <section className="analytics-loading" aria-label={t("states.loading")}><LoadingState label={t("states.loading")} lines={4} /><LoadingState label={t("states.loadingFigures")} lines={6} /></section>;
  if (model.state === "empty") return <EmptyState title={t("states.empty.title")} description={t("states.empty.description")} />;
  if (model.state === "restricted") return <StateNotice state="permission-denied" title={t("states.restricted")} description={t("states.askForAccess")} />;
  if (model.state === "unavailable") return <StateNotice state="dependency-unavailable" title={t("states.unavailable.title")} description={t("states.unavailable.description")} />;
  return model.report ? <AnalyticsResult model={model} /> : null;
}

function AnalyticsResult({ model }: { readonly model: AnalyticsScreenModel }) {
  const t = useTranslations("analytics");
  const locale = useLocale();
  const report = model.report!;
  const metricLabel = t(`metrics.${report.targetDefinition}`);
  const periodLabel = reportMonth(locale, report.periodStart);
  const series: AnalyticsPoint[] = report.series.map((point) => ({ period: point.period, label: periodName(t, locale, point, report.granularity), value: point.value, currency: point.currency }));
  const observed = series.filter((point) => point.value !== null);
  const total = observed.reduce((sum, point) => sum + (point.value ?? 0), 0);
  const stateNotice = model.state === "incomplete"
    ? <StateNotice state="stale-conflict" title={t("states.incomplete.title")} description={t("states.incomplete.description")} />
    : model.state === "stale"
      ? <StateNotice state="stale-conflict" title={t("states.stale.title")} description={t("states.stale.description")} />
      : null;
  return <>
    {stateNotice}
    <section className="analytics-metric-grid" aria-label={t("summary.label")}>
      <Card><CardHeader><CardTitle>{model.state === "incomplete" ? t("summary.subtotal") : t("summary.total")}</CardTitle><StatusBadge state={model.state === "incomplete" ? "stale-conflict" : "confirmed"} /></CardHeader><CardContent><p className="analytics-metric-value">{reportValue(t, locale, total, model.metric, "KZT")}</p><p>{metricLabel} · {periodLabel}</p></CardContent></Card>
      <Card><CardHeader><CardTitle>{t("summary.coverage")}</CardTitle><StatusBadge state={report.completeness === "complete" ? "success" : "stale-conflict"} /></CardHeader><CardContent><p className="analytics-metric-value">{observed.length} / {series.length}</p><p>{t("summary.coverageNote")}</p></CardContent></Card>
      <Card><CardHeader><CardTitle>{t("summary.lastUpdated")}</CardTitle><StatusBadge state={report.freshness === "current" ? "confirmed" : "stale-conflict"} /></CardHeader><CardContent><p className="analytics-metric-value">{report.freshness === "current" ? t("summary.upToDate") : t("summary.outOfDate")}</p><p>{t("summary.taken", { date: reportDate(t, report.observedAt.slice(0, 10)), timezone: report.timezone })}</p></CardContent></Card>
    </section>
    <section className="analytics-visual-grid">
      <Card className="analytics-chart-card"><CardHeader><div><p className="section-kicker">{t(`groupedBy.${report.granularity}`)}</p><CardTitle>{metricLabel}</CardTitle></div><StatusBadge state={report.completeness === "complete" ? "confirmed" : "stale-conflict"} /></CardHeader><CardContent><ActualChart series={series} metricLabel={metricLabel} /><p className="analytics-chart-note">{model.state === "incomplete" ? t("chart.gapNote") : t("chart.pointNote")}</p><p className="rule-note">{t("chart.rules", { shop: report.business, source: t("chart.sampleSource"), cutoff: reportDate(t, report.cutoff.slice(0, 10)) })}</p></CardContent></Card>
    </section>
    <Table scrollLabel={t("table.label")} className="analytics-table">
      <TableCaption className="sr-only">{t("table.caption")}</TableCaption>
      <TableHeader><TableRow><TableHead>{t("table.period")}</TableHead><TableHead>{t("table.value")}</TableHead><TableHead>{t("table.status")}</TableHead></TableRow></TableHeader>
      <TableBody>{series.map((point) => <TableRow key={point.period}><TableCell><strong>{point.label}</strong></TableCell><TableCell className="quantity-cell">{reportValue(t, locale, point.value, model.metric, point.currency)}</TableCell><TableCell><StatusBadge state={point.value === null ? "stale-conflict" : "confirmed"} /><span className="table-cell-note">{point.value === null ? t("table.missing") : t("table.recorded")}</span></TableCell></TableRow>)}</TableBody>
    </Table>
  </>;
}

/** Reports: confirmed orders for a past period. Predictions live on the Forecasts screen. */
export function AnalyticsScreen({ model }: { readonly model: AnalyticsScreenModel }) {
  const t = useTranslations("analytics");
  return <div className="feature-page business-screen analytics-screen">
    <PageHeader title={t("title")} source="sample" />
    <form className="analytics-controls" action="/analytics" method="get">
      <Select id="analytics-period" name="period" label={t("controls.period")} defaultValue={model.period}><option value="last-complete-month">{t("periods.last-complete-month")}</option><option value="previous-complete-month">{t("periods.previous-complete-month")}</option></Select>
      <Select id="analytics-metric" name="metric" label={t("controls.measure")} defaultValue={model.metric}><option value="CONFIRMED_ORDER_UNITS">{t("metrics.CONFIRMED_ORDER_UNITS")}</option><option value="CONFIRMED_ORDER_VALUE">{t("metrics.CONFIRMED_ORDER_VALUE")}</option></Select>
      <Select id="analytics-granularity" name="granularity" label={t("controls.groupBy")} defaultValue={model.granularity}><option value="DAY">{t("granularity.DAY")}</option><option value="WEEK">{t("granularity.WEEK")}</option><option value="MONTH">{t("granularity.MONTH")}</option></Select>
      <Button type="submit">{t("controls.update")}</Button>
    </form>
    <AnalyticsBoundary model={model} />
    <p className="rule-note">{t("footer")} <Link className="context-link" href="/forecasts">{t("openForecasts")}</Link></p>
  </div>;
}
