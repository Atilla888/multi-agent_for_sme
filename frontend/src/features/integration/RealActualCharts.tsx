import { ActualChart } from "@/features/analytics/components/ActualChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { SalesDto } from "@/services/api/reads";

export function RealActualCharts({ report }: { readonly report: SalesDto }) {
  const currencies = [...new Set(report.series.map(point => point.currency))];
  return <div className="analytics-visual-grid">{currencies.map(currency => <Card key={currency}><CardHeader><CardTitle>ACTUAL · {currency}</CardTitle></CardHeader><CardContent><ActualChart metricLabel={`${report.target_definition === "CONFIRMED_ORDER_UNITS" ? "Confirmed-order units" : "Confirmed-order value"} / ${currency}`} connectObserved={false} series={report.series.filter(point => point.currency === currency).map(point => ({ period: point.period, label: point.period.slice(0, 10), currency, value: Number(point.value) }))} /><p className="muted-copy">Only returned observations are plotted. Omitted periods are not inferred. The table preserves exact decimal values.</p></CardContent></Card>)}</div>;
}
