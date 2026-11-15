import Link from "next/link";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select, StateNotice, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { BusinessFactList } from "@/features/business";
import { ApiError } from "@/services/api/client";
import type { AnalyticsRead, CustomerRead, InventoryRead, OrderRead, ProductsRead } from "./adapters";
import { RealActualCharts } from "./RealActualCharts";

export { RealConversationsScreen } from "./RealConversationsScreen";

// Only Reports keeps a header line: it says what the figures count. The Live data tag covers the rest.
const descriptions: Record<string, string> = {
  Analytics: "Confirmed orders for a period, read from your business account.",
};

export function RealReadFrame({ title, children }: { readonly title: string; readonly children: ReactNode }) {
  return <div className="feature-page business-screen"><PageHeader title={title === "Analytics" ? "Reports" : title} description={descriptions[title]} source="live" />{children}</div>;
}

export function ReadError({ title, error }: { readonly title: string; readonly error: unknown }) {
  if (!(error instanceof ApiError)) throw error; // Preserve Next.js redirect signals.
  const state = error.kind === "unauthenticated" ? "permission-denied" : error.kind === "validation-error" ? "known-failure" : error.kind === "not-found" ? "permission-denied" : error.kind;
  const heading = error.status === 401 ? "Your session has ended" : error.status === 403 ? "You don't have access to this" : error.status === 404 ? "This record isn't available" : error.status === 409 ? "This record changed; please check it again" : error.status === 422 ? "Check the search or the reference" : "Backend source is unavailable";
  return <RealReadFrame title={title}><StateNotice state={state} title={heading} description="Nothing is shown in place of the missing data." />{error.requestId ? <p className="muted-copy">Reference: {error.requestId}</p> : null}</RealReadFrame>;
}

function Search({ action, query }: { readonly action: string; readonly query: string }) {
  return <form className="integration-read-search" action={action} method="get"><Input id="real-read-query" label="Search by product name or SKU" name="q" defaultValue={query} required maxLength={120} placeholder="Type part of a name or SKU" /><Button type="submit">Search</Button></form>;
}

export function RealProductsScreen({ model }: { readonly model: ProductsRead }) {
  const selected = model.selected;
  const cursor = model.products.next_id && model.products.next_name ? new URLSearchParams({ q: model.query, after_id: model.products.next_id, after_name: model.products.next_name }) : null;
  return <RealReadFrame title="Products"><Search action="/products" query={model.query} />
    {!model.products.items.length ? <StateNotice state="valid-empty" title={model.query ? "No products match" : "Search your catalog"} description={model.query ? "Try a different name or SKU." : "Results appear here. Stock levels are on the Inventory screen."} /> : <Table scrollLabel="Products" className="responsive-table"><TableCaption className="sr-only">Products matching your search.</TableCaption><TableHeader><TableRow><TableHead>Product</TableHead><TableHead>SKU</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead><span className="sr-only">Open</span></TableHead></TableRow></TableHeader><TableBody>{model.products.items.map(product => <TableRow key={product.id}><TableCell data-label="Product"><strong>{product.name}</strong></TableCell><TableCell data-label="SKU" className="cell-id">{product.sku}</TableCell><TableCell data-label="Price" className="cell-number">{product.unit_price} {product.currency}</TableCell><TableCell data-label="Status">{product.active ? "Active" : "Inactive"}<span className="table-cell-note">Version {product.version}</span></TableCell><TableCell data-label=""><Link className="context-link" href={`/products?${new URLSearchParams({ q: model.query, product: product.id })}`}>View</Link></TableCell></TableRow>)}</TableBody></Table>}
    {cursor ? <Link className="context-link" href={`/products?${cursor}`}>Next page</Link> : null}
    {selected ? <Card><CardHeader><CardTitle>{selected.name}</CardTitle></CardHeader><CardContent><BusinessFactList facts={[{ label: "Product ID", value: selected.id }, { label: "SKU", value: selected.sku }, { label: "Price", value: `${selected.unit_price} ${selected.currency}` }, { label: "Catalog version", value: String(selected.version) }]} /><Link className="context-link" href={`/inventory?product=${selected.id}`}>Check stock</Link></CardContent></Card> : null}
  </RealReadFrame>;
}

export function RealInventoryScreen({ model }: { readonly model: InventoryRead }) {
  return <RealReadFrame title="Inventory"><Search action="/inventory" query={model.query} />
    {!model.items.length ? <StateNotice state="valid-empty" title={model.query ? "No products match" : "Search for a product"} description="Stock levels appear here once you pick a product. Counts are as last recorded, not a live-stock promise." /> : <Table scrollLabel="Inventory" className="responsive-table"><TableCaption className="sr-only">Stock on hand and reserved units, with when each count was recorded.</TableCaption><TableHeader><TableRow><TableHead>Product</TableHead><TableHead>In stock</TableHead><TableHead>Reserved</TableHead><TableHead>Last recorded</TableHead><TableHead><span className="sr-only">Open</span></TableHead></TableRow></TableHeader><TableBody>{model.items.map(item => <TableRow key={item.id}><TableCell data-label="Product"><strong>{model.products.find(product => product.id === item.product_id)?.name}</strong><span className="table-cell-note cell-id">{item.product_id}</span></TableCell><TableCell data-label="In stock" className="quantity-cell">{item.available_quantity}</TableCell><TableCell data-label="Reserved" className="cell-number">{item.reserved_quantity}</TableCell><TableCell data-label="Last recorded">{item.observed_at}<span className="table-cell-note">Version {item.version}</span></TableCell><TableCell data-label=""><Link className="context-link" href={`/products?product=${item.product_id}`}>Open product</Link></TableCell></TableRow>)}</TableBody></Table>}
    <p className="rule-note">In stock and reserved are counted separately. A count is not a live-stock promise and does not reserve anything.</p>
  </RealReadFrame>;
}

export function RealCustomerScreen({ model }: { readonly model: CustomerRead }) {
  return <RealReadFrame title="Customer"><Card><CardHeader><CardTitle>{model.customer.display_name ?? "Name not provided"}</CardTitle></CardHeader><CardContent><BusinessFactList facts={[{ label: "Customer ID", value: model.customer.id }, { label: "Record version", value: String(model.customer.version) }]} /><p className="muted-copy">This customer’s orders and conversations are not available on this screen yet.</p><Link className="context-link" href="/customers">Back to customers</Link></CardContent></Card></RealReadFrame>;
}

export function RealOrderScreen({ model }: { readonly model: OrderRead }) {
  const order = model.order;
  return <RealReadFrame title="Order"><StateNotice state="restricted" title="Order changes are blocked by policy" description="The order and its stock reservation are shown separately. Nothing can be changed from here." /><Card><CardHeader><CardTitle>Order {order.id}</CardTitle></CardHeader><CardContent><BusinessFactList facts={[{ label: "Status", value: order.status }, { label: "Customer ID", value: order.customer_id }, { label: "Created", value: order.created_at, note: `Version ${order.version}` }, { label: "Delivery reference", value: order.delivery_reference ?? "None yet", note: "A reference is not a delivery status." }]} /></CardContent></Card><Table scrollLabel="Order items" className="responsive-table"><TableCaption className="sr-only">Items on this order, with how many are reserved.</TableCaption><TableHeader><TableRow><TableHead>Product ID</TableHead><TableHead>Ordered</TableHead><TableHead>Reserved</TableHead><TableHead>Price</TableHead></TableRow></TableHeader><TableBody>{order.items.map(item => <TableRow key={item.id}><TableCell data-label="Product ID" className="cell-id">{item.product_id}</TableCell><TableCell data-label="Ordered" className="cell-number">{item.quantity}</TableCell><TableCell data-label="Reserved" className="cell-number">{item.reserved_quantity}</TableCell><TableCell data-label="Price" className="cell-number">{item.unit_price} {order.currency}</TableCell></TableRow>)}</TableBody></Table><div className="related-actions"><Link className="context-link" href={`/customers/${order.customer_id}`}>Open customer</Link><Link className="context-link" href="/orders">Back to orders</Link></div></RealReadFrame>;
}

export function RealAnalyticsScreen({ model }: { readonly model: AnalyticsRead }) {
  const report = model.report;
  const measure = report.target_definition === "CONFIRMED_ORDER_UNITS" ? "Units sold" : "Order value";
  return <RealReadFrame title="Analytics"><form className="integration-analytics-controls" action="/analytics" method="get"><Input id="analytics-start" label="From (UTC)" name="start" defaultValue={model.start} required /><Input id="analytics-end" label="To (UTC)" name="end" defaultValue={model.end} required /><Select id="real-granularity" label="Group by" name="granularity" defaultValue={report.granularity}><option value="DAY">Day</option><option value="WEEK">Week</option><option value="MONTH">Month</option></Select><Select id="real-metric" label="Measure" name="metric" defaultValue={report.target_definition}><option value="CONFIRMED_ORDER_UNITS">Units sold</option><option value="CONFIRMED_ORDER_VALUE">Order value</option></Select><Button type="submit">Update report</Button></form>{report.series.length ? <RealActualCharts report={report} /> : null}<Card><CardHeader><CardTitle>About this report</CardTitle></CardHeader><CardContent><BusinessFactList facts={[{ label: "Measure", value: measure, note: "Confirmed orders only, counted by the date the order was created. Not delivered or paid revenue." }, { label: "Currencies", value: "Shown separately", note: "Currencies are not converted or combined." }, { label: "Up to", value: report.cutoff }, { label: "Taken at", value: report.as_of }]} /></CardContent></Card>{report.series.length ? <Table scrollLabel="Report figures" className="responsive-table"><TableCaption className="sr-only">Exact figures per period and currency. Missing periods are not filled in.</TableCaption><TableHeader><TableRow><TableHead>Period</TableHead><TableHead>Currency</TableHead><TableHead>Value</TableHead></TableRow></TableHeader><TableBody>{report.series.map(point => <TableRow key={`${point.period}-${point.currency}`}><TableCell data-label="Period">{point.period}</TableCell><TableCell data-label="Currency">{point.currency}</TableCell><TableCell data-label="Value" className="cell-number">{point.value}</TableCell></TableRow>)}</TableBody></Table> : <StateNotice state="valid-empty" title="No confirmed orders in this period" description="The report ran, but there were no confirmed orders for this period. This is not a technical problem." />}<Link className="context-link" href="/forecasts">Open Forecasts</Link></RealReadFrame>;
}
