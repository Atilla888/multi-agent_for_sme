import type { AnalyticsPoint } from "../types";
import { useId } from "react";
import { useTranslations } from "next-intl";

/** What the chart needs to place a point: its period ("YYYY-MM-DD…") and value. */
interface ChartValue { readonly period: string; readonly value: number | null; }
interface PlotPoint<P extends ChartValue> { readonly x: number; readonly y: number; readonly point: P; }

function plotted<P extends ChartValue>(series: readonly P[]): PlotPoint<P>[] {
  const width = 620;
  const values = series.flatMap((point) => point.value === null ? [] : [point.value]);
  const max = Math.max(...values, 1);
  return series.map((point, index) => ({ x: series.length === 1 ? width / 2 : 48 + index * ((width - 96) / (series.length - 1)), y: point.value === null ? 0 : 202 - (point.value / max) * 150, point }));
}

export function chartSegments<P extends ChartValue>(series: readonly P[]): readonly (readonly [PlotPoint<P>, PlotPoint<P>])[] {
  const points = plotted(series);
  return points.slice(1).flatMap((point, index) => {
    const previous = points[index];
    return previous && previous.point.value !== null && point.point.value !== null ? [[previous, point] as const] : [];
  });
}

/** Line chart of recorded values. A missing period breaks the line instead of being drawn as zero. */
export function ActualChart({ series, metricLabel, connectObserved = true }: { readonly series: readonly AnalyticsPoint[]; readonly metricLabel: string; readonly connectObserved?: boolean }) {
  const t = useTranslations("analytics");
  const points = plotted(series);
  const chartId = useId();
  const label = t("chart.label", { metric: metricLabel });
  return <div className="analytics-chart" role="region" aria-label={label}>
    <div className="analytics-chart__legend"><span className="actual-line-sample" aria-hidden="true" /><strong>{t("chart.recorded")}</strong><span>{connectObserved ? t("chart.perPeriod") : t("chart.recordedOnly")}</span></div>
    <svg viewBox="0 0 620 250" role="img" aria-labelledby={`${chartId}-title ${chartId}-description`}>
      <title id={`${chartId}-title`}>{label}</title>
      <desc id={`${chartId}-description`}>{connectObserved ? t("chart.connectedDescription") : t("chart.plottedDescription")}</desc>
      {[52, 102, 152, 202].map((y) => <line key={y} x1="48" y1={y} x2="572" y2={y} className="analytics-chart__grid" />)}
      {connectObserved ? chartSegments(series).map(([start, end]) => <line key={`${start.point.period}-${end.point.period}`} x1={start.x} y1={start.y} x2={end.x} y2={end.y} className="analytics-chart__series" />) : null}
      {points.map(({ x, y, point }, index) => point.value === null
        ? <g key={point.period}><line x1={x} y1="52" x2={x} y2="202" className="analytics-chart__gap" /><text x={x} y="125" textAnchor="middle" className="analytics-chart__gap-label">{t("missing")}</text></g>
        : <g key={point.period}><circle cx={x} cy={y} r="4.5" className="analytics-chart__point" /><text x={x} y="232" textAnchor="middle" className="analytics-chart__axis-label">{series.length > 8 ? (index % 5 === 0 ? point.period.slice(8, 10) : "") : point.label}</text></g>)}
    </svg>
  </div>;
}
