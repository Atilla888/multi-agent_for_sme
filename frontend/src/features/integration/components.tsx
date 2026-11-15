import Link from "next/link";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select, StateNotice, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { BusinessFactList } from "@/features/business";
import { ApiError } from "@/services/api/client";
import type { AnalyticsRead, CustomerRead, InventoryRead, OrderRead, ProductsRead } from "./adapters";
import { RealActualCharts } from "./RealActualCharts";

export { RealConversationsScreen } from "./RealConversationsScreen";

/** Which live screen is shown; picks its translated title ("Analytics" is titled Reports). */
export type ReadScreen = "Products" | "Inventory" | "Customer" | "Order" | "Analytics" | "Inbox";

export function RealReadFrame({ title, children }: { readonly title: ReadScreen; readonly children: ReactNode }) {
  const t = useTranslations("integration");
  return <div className="feature-page business-screen"><PageHeader title={t(`titles.${title}`)} source="live" />{children}</div>;
}

export function ReadError({ title, error }: { readonly title: ReadScreen; readonly error: unknown }) {
  if (!(error instanceof ApiError)) throw error; // Preserve Next.js redirect signals.
  return <ReadErrorNotice title={title} error={error} />;
}

function ReadErrorNotice({ title, error }: { readonly title: ReadScreen; readonly error: ApiError }) {
  const t = useTranslations("integration");
  const state = error.kind === "unauthenticated" ? "permission-denied" : error.kind === "validation-error" ? "known-failure" : error.kind === "not-found" ? "permission-denied" : error.kind;
  const heading = error.status === 401 ? t("error.sessionEnded") : error.status === 403 ? t("error.noAccess") : error.status === 404 ? t("error.notAvailable") : error.status === 409 ? t("error.changed") : error.status === 422 ? t("error.invalid") : t("error.unavailable");
  return <RealReadFrame title={title}><StateNotice state={state} title={heading} description={t("error.description")} />{error.requestId ? <p className="muted-copy">{t("error.reference", { id: error.requestId })}</p> : null}</RealReadFrame>;
}

function Search({ action, query }: { readonly action: string; readonly query: string }) {
  const t = useTranslations("integration");
  return <form className="integration-read-search" action={action} method="get"><Input id="real-read-query" label={t("search.label")} name="q" defaultValue={query} required maxLength={120} placeholder={t("search.placeholder")} /><Button type="submit">{t("search.submit")}</Button></form>;
}

export function RealProductsScreen({ model }: { readonly model: ProductsRead }) {
  const t = useTranslations("integration");
  const common = useTranslations("common");
  const selected = model.selected;
  const cursor = model.products.next_id && model.products.next_name ? new URLSearchParams({ q: model.query, after_id: model.products.next_id, after_name: model.products.next_name }) : null;
  return <RealReadFrame title="Products"><Search action="/products" query={model.query} />
    {!model.products.items.length ? <StateNotice state="valid-empty" title={model.query ? t("products.noMatch") : t("products.start")} description={model.query ? t("products.noMatchDescription") : t("products.startDescription")} /> : <Table scrollLabel={t("titles.Products")} className="responsive-table"><TableCaption className="sr-only">{t("products.caption")}</TableCaption><TableHeader><TableRow><TableHead>{t("columns.product")}</TableHead><TableHead>{t("columns.sku")}</TableHead><TableHead>{t("columns.price")}</TableHead><TableHead>{t("columns.status")}</TableHead><TableHead><span className="sr-only">{common("open")}</span></TableHead></TableRow></TableHeader><TableBody>{model.products.items.map(product => <TableRow key={product.id}><TableCell data-label={t("columns.product")}><strong>{product.name}</strong></TableCell><TableCell data-label={t("columns.sku")} className="cell-id">{product.sku}</TableCell><TableCell data-label={t("columns.price")} className="cell-number">{product.unit_price} {product.currency}</TableCell><TableCell data-label={t("columns.status")}>{product.active ? t("products.active") : t("products.inactive")}<span className="table-cell-note">{t("version", { version: String(product.version) })}</span></TableCell><TableCell data-label=""><Link className="context-link" href={`/products?${new URLSearchParams({ q: model.query, product: product.id })}`}>{common("view")}</Link></TableCell></TableRow>)}</TableBody></Table>}
    {cursor ? <Link className="context-link" href={`/products?${cursor}`}>{common("pagination.next")}</Link> : null}
    {selected ? <Card><CardHeader><CardTitle>{selected.name}</CardTitle></CardHeader><CardContent><BusinessFactList facts={[{ label: t("columns.productId"), value: selected.id }, { label: t("columns.sku"), value: selected.sku }, { label: t("columns.price"), value: `${selected.unit_price} ${selected.currency}` }, { label: t("catalogVersion"), value: String(selected.version) }]} /><Link className="context-link" href={`/inventory?product=${selected.id}`}>{t("products.checkStock")}</Link></CardContent></Card> : null}
  </RealReadFrame>;
}

export function RealInventoryScreen({ model }: { readonly model: InventoryRead }) {
  const t = useTranslations("integration");
  const common = useTranslations("common");
  return <RealReadFrame title="Inventory"><Search action="/inventory" query={model.query} />
    {!model.items.length ? <StateNotice state="valid-empty" title={model.query ? t("products.noMatch") : t("inventory.start")} description={t("inventory.description")} /> : <Table scrollLabel={t("titles.Inventory")} className="responsive-table"><TableCaption className="sr-only">{t("inventory.caption")}</TableCaption><TableHeader><TableRow><TableHead>{t("columns.product")}</TableHead><TableHead>{t("columns.inStock")}</TableHead><TableHead>{t("columns.reserved")}</TableHead><TableHead>{t("inventory.lastRecorded")}</TableHead><TableHead><span className="sr-only">{common("open")}</span></TableHead></TableRow></TableHeader><TableBody>{model.items.map(item => <TableRow key={item.id}><TableCell data-label={t("columns.product")}><strong>{model.products.find(product => product.id === item.product_id)?.name}</strong><span className="table-cell-note cell-id">{item.product_id}</span></TableCell><TableCell data-label={t("columns.inStock")} className="quantity-cell">{item.available_quantity}</TableCell><TableCell data-label={t("columns.reserved")} className="cell-number">{item.reserved_quantity}</TableCell><TableCell data-label={t("inventory.lastRecorded")}>{item.observed_at}<span className="table-cell-note">{t("version", { version: String(item.version) })}</span></TableCell><TableCell data-label=""><Link className="context-link" href={`/products?product=${item.product_id}`}>{t("inventory.openProduct")}</Link></TableCell></TableRow>)}</TableBody></Table>}
    <p className="rule-note">{t("inventory.rule")}</p>
  </RealReadFrame>;
}

export function RealCustomerScreen({ model }: { readonly model: CustomerRead }) {
  const t = useTranslations("integration");
  return <RealReadFrame title="Customer"><Card><CardHeader><CardTitle>{model.customer.display_name ?? t("customer.noName")}</CardTitle></CardHeader><CardContent><BusinessFactList facts={[{ label: t("columns.customerId"), value: model.customer.id }, { label: t("customer.recordVersion"), value: String(model.customer.version) }]} /><p className="muted-copy">{t("customer.notHereYet")}</p><Link className="context-link" href="/customers">{t("customer.back")}</Link></CardContent></Card></RealReadFrame>;
}

export function RealOrderScreen({ model }: { readonly model: OrderRead }) {
  const t = useTranslations("integration");
  const order = model.order;
  return <RealReadFrame title="Order"><StateNotice state="restricted" title={t("order.blocked")} description={t("order.blockedDescription")} /><Card><CardHeader><CardTitle>{t("order.title", { id: order.id })}</CardTitle></CardHeader><CardContent><BusinessFactList facts={[{ label: t("columns.status"), value: order.status }, { label: t("columns.customerId"), value: order.customer_id }, { label: t("order.created"), value: order.created_at, note: t("version", { version: String(order.version) }) }, { label: t("order.deliveryReference"), value: order.delivery_reference ?? t("order.noneYet"), note: t("order.referenceNote") }]} /></CardContent></Card><Table scrollLabel={t("order.items")} className="responsive-table"><TableCaption className="sr-only">{t("order.itemsCaption")}</TableCaption><TableHeader><TableRow><TableHead>{t("columns.productId")}</TableHead><TableHead>{t("order.ordered")}</TableHead><TableHead>{t("columns.reserved")}</TableHead><TableHead>{t("columns.price")}</TableHead></TableRow></TableHeader><TableBody>{order.items.map(item => <TableRow key={item.id}><TableCell data-label={t("columns.productId")} className="cell-id">{item.product_id}</TableCell><TableCell data-label={t("order.ordered")} className="cell-number">{item.quantity}</TableCell><TableCell data-label={t("columns.reserved")} className="cell-number">{item.reserved_quantity}</TableCell><TableCell data-label={t("columns.price")} className="cell-number">{item.unit_price} {order.currency}</TableCell></TableRow>)}</TableBody></Table><div className="related-actions"><Link className="context-link" href={`/customers/${order.customer_id}`}>{t("openCustomer")}</Link><Link className="context-link" href="/orders">{t("order.back")}</Link></div></RealReadFrame>;
}

export function RealAnalyticsScreen({ model }: { readonly model: AnalyticsRead }) {
  const t = useTranslations("integration");
  const report = model.report;
  const units = report.target_definition === "CONFIRMED_ORDER_UNITS";
  return <RealReadFrame title="Analytics"><form className="integration-analytics-controls" action="/analytics" method="get"><Input id="analytics-start" label={t("analytics.from")} name="start" defaultValue={model.start} required /><Input id="analytics-end" label={t("analytics.to")} name="end" defaultValue={model.end} required /><Select id="real-granularity" label={t("analytics.groupBy")} name="granularity" defaultValue={report.granularity}><option value="DAY">{t("analytics.day")}</option><option value="WEEK">{t("analytics.week")}</option><option value="MONTH">{t("analytics.month")}</option></Select><Select id="real-metric" label={t("analytics.measure")} name="metric" defaultValue={report.target_definition}><option value="CONFIRMED_ORDER_UNITS">{t("analytics.unitsSold")}</option><option value="CONFIRMED_ORDER_VALUE">{t("analytics.orderValue")}</option></Select><Button type="submit">{t("analytics.update")}</Button></form>{report.series.length ? <RealActualCharts report={report} /> : null}<p className="rule-note">{t("analytics.rule", { metric: units ? "units" : "value", cutoff: report.cutoff, asOf: report.as_of })}</p>{report.series.length ? <Table scrollLabel={t("analytics.figures")} className="responsive-table"><TableCaption className="sr-only">{t("analytics.figuresCaption")}</TableCaption><TableHeader><TableRow><TableHead>{t("analytics.period")}</TableHead><TableHead>{t("analytics.currency")}</TableHead><TableHead>{t("analytics.value")}</TableHead></TableRow></TableHeader><TableBody>{report.series.map(point => <TableRow key={`${point.period}-${point.currency}`}><TableCell data-label={t("analytics.period")}>{point.period}</TableCell><TableCell data-label={t("analytics.currency")}>{point.currency}</TableCell><TableCell data-label={t("analytics.value")} className="cell-number">{point.value}</TableCell></TableRow>)}</TableBody></Table> : <StateNotice state="valid-empty" title={t("analytics.empty")} description={t("analytics.emptyDescription")} />}<Link className="context-link" href="/forecasts">{t("analytics.openForecasts")}</Link></RealReadFrame>;
}
