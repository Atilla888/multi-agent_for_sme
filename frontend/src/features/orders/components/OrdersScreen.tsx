import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { BusinessBoundary, BusinessFixtureBanner, EntityToolbar } from "@/features/business";
import { demoOrderItems } from "../fixtures/demoOrders";
import type { OrderListItem, OrdersScreenModel } from "../types";

const options = [
  { value: "all", label: "All" },
  { value: "attention", label: "Needs attention" },
  { value: "confirmed", label: "Reserved" },
  { value: "failed", label: "Failed" },
  { value: "outcome-unknown", label: "OUTCOME_UNKNOWN" },
  { value: "stale", label: "Stale / conflict" },
  { value: "e02", label: "E02 restricted" },
] as const;

const counts: Record<string, number> = Object.fromEntries(
  options.map((option) => [option.value, option.value === "all" ? demoOrderItems.length : demoOrderItems.filter((item) => item.scenario === option.value).length]),
);

/** CSV of the rows currently shown, built in the page itself (no export endpoint is called). */
function csvHref(items: readonly OrderListItem[]): string {
  const header = ["Order", "Customer", "Channel", "Items", "Total", "Order state", "Reservation state", "Updated"];
  const rows = items.map((item) => [item.id, item.customer, item.channel, item.items, item.total, item.orderLabel, item.reservationLabel, item.updated]);
  const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
  return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
}

/** Orders list — Figma page 02 · Orders: toolbar with chips, full table, pagination footer. */
export function OrdersScreen({ model }: { readonly model: OrdersScreenModel }) {
  return <div className="feature-page business-screen">
    <PageHeader eyebrow="Business / Orders" title="Orders" description="Order state and reservation state are separate facts; each has its own badge." />
    <BusinessFixtureBanner family="Orders" />
    <section className="card list-card" aria-label="Orders list">
      <EntityToolbar
        action="/orders"
        query={model.query}
        searchLabel="Search orders"
        searchPlaceholder="Search by order or customer"
        status={model.status}
        statusLabel="Filter orders by state"
        options={options}
        counts={counts}
        actions={<a className="button button--secondary" href={csvHref(model.items)} download="orders.csv"><Icon name="filter" size={16} />Export CSV</a>}
      />
      <BusinessBoundary state={model.validationState} family="Orders" emptyDescription="No fixture Orders match this filter. This is not an inaccessible-record or source-outage result.">
        <Table scrollLabel="Order fixture records" className="responsive-table">
          <TableCaption className="sr-only">Mixed Order and Reservation fixture states.</TableCaption>
          <TableHeader><TableRow>
            <TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead className="col-secondary">Channel</TableHead><TableHead className="col-secondary">Items</TableHead><TableHead>Total</TableHead><TableHead>Order state</TableHead><TableHead>Reservation state</TableHead><TableHead className="col-secondary">Updated</TableHead>
          </TableRow></TableHeader>
          <TableBody>{model.items.map((order) => <TableRow key={order.id}>
            <TableCell data-label="Order"><Link className="row-link" href={`/orders/${order.id}`}>#{order.id}</Link></TableCell>
            <TableCell data-label="Customer"><strong className="cell-primary">{order.customer}</strong><span className="table-cell-note">{order.phone}</span></TableCell>
            <TableCell data-label="Channel" className="col-secondary">{order.channel}</TableCell>
            <TableCell data-label="Items" className="col-secondary">{order.items}</TableCell>
            <TableCell data-label="Total" className="cell-number">{order.total}</TableCell>
            <TableCell data-label="Order state"><StatusBadge state={order.orderState} /><span className="table-cell-note">{order.orderLabel}</span></TableCell>
            <TableCell data-label="Reservation state"><StatusBadge state={order.reservationState} /><span className="table-cell-note">{order.reservationLabel}</span></TableCell>
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
