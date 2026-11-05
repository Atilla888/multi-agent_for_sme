import { ActualChart } from "@/features/analytics/components/ActualChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { SalesDto } from "@/services/api/reads";

export function RealActualCharts({ report }: { readonly report: SalesDto }) {
  const currencies = [...new Set(report.series.map(point => point.currency))];
  const measure = report.target_definition === "CONFIRMED_ORDER_UNITS" ? "Units sold" : "Order value";
  return <div className="analytics-visual-grid">{currencies.map(currency => <Card key={currency}><CardHeader><CardTitle>{measure} · {currency}</CardTitle></CardHeader><CardContent><ActualChart metricLabel={`${measure} / ${currency}`} connectObserved={false} series={report.series.filter(point => point.currency === currency).map(point => ({ period: point.period, label: point.period.slice(0, 10), currency, value: Number(point.value) }))} /><p className="muted-copy">Only recorded periods are plotted; gaps are not filled in. The table below has the exact figures.</p></CardContent></Card>)}</div>;
}
