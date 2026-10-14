import type { AnalyticsPoint } from "../types";

interface PlotPoint { readonly x: number; readonly y: number; readonly point: AnalyticsPoint; }

function plotted(series: readonly AnalyticsPoint[]): PlotPoint[] {
  const width = 620;
  const values = series.flatMap((point) => point.value === null ? [] : [point.value]);
  const max = Math.max(...values, 1);
  return series.map((point, index) => ({ x: series.length === 1 ? width / 2 : 48 + index * ((width - 96) / (series.length - 1)), y: point.value === null ? 0 : 202 - (point.value / max) * 150, point }));
}

export function chartSegments(series: readonly AnalyticsPoint[]): readonly (readonly [PlotPoint, PlotPoint])[] {
  const points = plotted(series);
  return points.slice(1).flatMap((point, index) => {
    const previous = points[index];
    return previous && previous.point.value !== null && point.point.value !== null ? [[previous, point] as const] : [];
  });
}

export function ActualChart({ series, metricLabel }: { readonly series: readonly AnalyticsPoint[]; readonly metricLabel: string }) {
  const points = plotted(series);
  return <div className="analytics-chart" role="region" aria-label={`${metricLabel} ACTUAL historical chart`}>
    <div className="analytics-chart__legend"><span className="actual-line-sample" aria-hidden="true" /><strong>ACTUAL</strong><span>solid / observed historical values</span></div>
    <svg viewBox="0 0 620 250" role="img" aria-labelledby="actual-chart-title actual-chart-description">
      <title id="actual-chart-title">{metricLabel} historical ACTUAL series</title>
      <desc id="actual-chart-description">Solid line segments connect observed values. Missing observations are labelled and break the line instead of becoming zero.</desc>
      {[52, 102, 152, 202].map((y) => <line key={y} x1="48" y1={y} x2="572" y2={y} className="analytics-chart__grid" />)}
      {chartSegments(series).map(([start, end]) => <line key={`${start.point.period}-${end.point.period}`} x1={start.x} y1={start.y} x2={end.x} y2={end.y} className="analytics-chart__series" />)}
      {points.map(({ x, y, point }, index) => point.value === null
        ? <g key={point.period}><line x1={x} y1="52" x2={x} y2="202" className="analytics-chart__gap" /><text x={x} y="125" textAnchor="middle" className="analytics-chart__gap-label">Missing</text></g>
        : <g key={point.period}><circle cx={x} cy={y} r="5" className="analytics-chart__point" /><text x={x} y="232" textAnchor="middle" className="analytics-chart__axis-label">{series.length > 8 ? (index % 5 === 0 ? point.label.slice(-2) : "") : point.label}</text></g>)}
    </svg>
  </div>;
}
