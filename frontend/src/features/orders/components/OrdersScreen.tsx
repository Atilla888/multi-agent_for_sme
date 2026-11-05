import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { BusinessBoundary, EntityToolbar } from "@/features/business";
import { demoOrderItems } from "../fixtures/demoOrders";
import type { OrderListItem, OrdersScreenModel } from "../types";

const options = [
  { value: "all", label: "All" },
  { value: "attention", label: "Needs a person" },
  { value: "confirmed", label: "Reserved" },
  { value: "failed", label: "Not reserved" },
  { value: "outcome-unknown", label: "Needs checking" },
  { value: "stale", label: "Out of date" },
  { value: "e02", label: "Changes blocked" },
] as const;

const counts: Record<string, number> = Object.fromEntries(
  options.map((option) => [option.value, option.value === "all" ? demoOrderItems.length : demoOrderItems.filter((item) => item.scenario === option.value).length]),
);

/** CSV of the rows currently shown, built in the page itself. */
function csvHref(items: readonly OrderListItem[]): string {
  const header = ["Order", "Customer", "Channel", "Items", "Total", "Order status", "Stock reservation", "Updated"];
  const rows = items.map((item) => [item.id, item.customer, item.channel, item.items, item.total, item.orderLabel, item.reservationLabel, item.updated]);
  const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
  return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
}

/** Orders list: toolbar with filters, the table, and a footer with the count. */
export function OrdersScreen({ model }: { readonly model: OrdersScreenModel }) {
  return <div className="feature-page business-screen">
    <PageHeader title="Orders" description="Every order shows two separate things: whether it was created, and whether stock was reserved for it." source="sample" />
    <section className="card list-card" aria-label="Orders list">
      <EntityToolbar
        action="/orders"
        query={model.query}
        searchLabel="Search orders"
        searchPlaceholder="Order number or customer"
        status={model.status}
        statusLabel="Filter orders"
        options={options}
        counts={counts}
        actions={<a className="button button--secondary" href={csvHref(model.items)} download="orders.csv"><Icon name="download" size={16} />Export</a>}
      />
      <BusinessBoundary state={model.validationState} family="Orders" emptyDescription="No orders match this search or filter.">
        <Table scrollLabel="Orders" className="responsive-table">
          <TableCaption className="sr-only">Orders with their order status and stock reservation status.</TableCaption>
          <TableHeader><TableRow>
            <TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead className="col-secondary">Channel</TableHead><TableHead className="col-secondary">Items</TableHead><TableHead>Total</TableHead><TableHead>Order status</TableHead><TableHead>Stock reservation</TableHead><TableHead className="col-secondary">Updated</TableHead>
          </TableRow></TableHeader>
          <TableBody>{model.items.map((order) => <TableRow key={order.id}>
            <TableCell data-label="Order"><Link className="row-link" href={`/orders/${order.id}`}>{order.id}</Link></TableCell>
            <TableCell data-label="Customer"><strong className="cell-primary">{order.customer}</strong><span className="table-cell-note">{order.phone}</span></TableCell>
            <TableCell data-label="Channel" className="col-secondary">{order.channel}</TableCell>
            <TableCell data-label="Items" className="col-secondary">{order.items}</TableCell>
            <TableCell data-label="Total" className="cell-number">{order.total}</TableCell>
            <TableCell data-label="Order status"><StatusBadge state={order.orderState} /></TableCell>
            <TableCell data-label="Stock reservation"><StatusBadge state={order.reservationState} /><span className="table-cell-note">{order.reservationLabel}</span></TableCell>
            <TableCell data-label="Updated" className="col-secondary"><span className="table-cell-note">{order.updated}</span>{order.attention !== "None" ? <span className="table-cell-note">{order.attention}</span> : null}</TableCell>
          </TableRow>)}</TableBody>
        </Table>
        <footer className="list-card__footer">
          <span>Showing {model.items.length} of {demoOrderItems.length} orders</span>
          <span className="list-card__pager"><button className="button button--secondary" type="button" disabled>Previous</button><button className="button button--secondary" type="button" disabled>Next</button></span>
        </footer>
      </BusinessBoundary>
    </section>
  </div>;
}
