import Link from "next/link";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { BusinessBoundary, EntityToolbar } from "@/features/business";
import { demoOrderItems } from "../fixtures/demoOrders";
import type { OrdersScreenModel } from "../types";
import { useOrderWords } from "./useOrderWords";

const filterValues = ["all", "attention", "confirmed", "failed", "outcome-unknown", "stale", "e02"] as const;

const counts: Record<string, number> = Object.fromEntries(
  filterValues.map((value) => [value, value === "all" ? demoOrderItems.length : demoOrderItems.filter((item) => item.scenario === value).length]),
);

/** CSV of the rows currently shown, built in the page itself. Column names are in the viewer's language; cells are the records. */
function csvHref(header: readonly string[], rows: readonly (readonly string[])[]): string {
  const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
  return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
}

/** Orders list: toolbar with filters, the table, and a footer with the count. */
export function OrdersScreen({ model }: { readonly model: OrdersScreenModel }) {
  const t = useTranslations("orders");
  const states = useTranslations("states");
  const words = useOrderWords();
  const options = [
    { value: "all", label: t("filters.all") },
    { value: "attention", label: states("waiting-human.label") },
    { value: "confirmed", label: t("filters.reserved") },
    { value: "failed", label: t("filters.notReserved") },
    { value: "outcome-unknown", label: states("outcome-unknown.label") },
    { value: "stale", label: t("filters.outOfDate") },
    { value: "e02", label: t("filters.changesBlocked") },
  ] satisfies { value: (typeof filterValues)[number]; label: string }[];
  const columns = {
    order: t("columns.order"), customer: t("columns.customer"), channel: t("columns.channel"), items: t("columns.items"),
    total: t("columns.total"), orderStatus: t("columns.orderStatus"), reservation: t("columns.reservation"), updated: t("columns.updated"),
  };
  const csvHeader = [columns.order, columns.customer, columns.channel, columns.items, columns.total, columns.orderStatus, columns.reservation, columns.updated];
  const csvRows = model.items.map((item) => [item.id, item.customer, item.channel, item.items, item.total, words.orderLabel(item.orderLabel), words.reservationLabel(item.reservationLabel), words.time(item.updated)]);
  return <div className="feature-page business-screen">
    <PageHeader title={t("title")} description={t("description")} source="sample" />
    <section className="card list-card" aria-label={t("listLabel")}>
      <EntityToolbar
        action="/orders"
        query={model.query}
        searchLabel={t("searchLabel")}
        searchPlaceholder={t("searchPlaceholder")}
        status={model.status}
        statusLabel={t("filterLabel")}
        options={options}
        counts={counts}
        actions={<a className="button button--secondary" href={csvHref(csvHeader, csvRows)} download="orders.csv"><Icon name="download" size={16} />{t("export")}</a>}
      />
      <BusinessBoundary state={model.validationState} family="orders" emptyDescription={t("emptyDescription")}>
        <Table scrollLabel={t("title")} className="responsive-table">
          <TableCaption className="sr-only">{t("caption")}</TableCaption>
          <TableHeader><TableRow>
            <TableHead>{columns.order}</TableHead><TableHead>{columns.customer}</TableHead><TableHead className="col-secondary">{columns.channel}</TableHead><TableHead className="col-secondary">{columns.items}</TableHead><TableHead>{columns.total}</TableHead><TableHead>{columns.orderStatus}</TableHead><TableHead>{columns.reservation}</TableHead><TableHead className="col-secondary">{columns.updated}</TableHead>
          </TableRow></TableHeader>
          <TableBody>{model.items.map((order) => <TableRow key={order.id}>
            <TableCell data-label={columns.order}><Link className="row-link cell-id" href={`/orders/${order.id}`}>{order.id}</Link></TableCell>
            <TableCell data-label={columns.customer}><strong className="cell-primary">{order.customer}</strong><span className="table-cell-note">{order.phone}</span></TableCell>
            <TableCell data-label={columns.channel} className="col-secondary">{order.channel}</TableCell>
            <TableCell data-label={columns.items} className="col-secondary">{order.items}</TableCell>
            <TableCell data-label={columns.total} className="cell-number">{order.total}</TableCell>
            <TableCell data-label={columns.orderStatus}><StatusBadge state={order.orderState} /></TableCell>
            <TableCell data-label={columns.reservation}><StatusBadge state={order.reservationState} /><span className="table-cell-note">{words.reservationLabel(order.reservationLabel)}</span></TableCell>
            <TableCell data-label={columns.updated} className="col-secondary"><span className="table-cell-note">{words.time(order.updated)}</span>{order.attention ? <span className="table-cell-note">{t(`attention.${order.attention}`)}</span> : null}</TableCell>
          </TableRow>)}</TableBody>
        </Table>
        <footer className="list-card__footer">
          <span>{t("showing", { shown: model.items.length, total: demoOrderItems.length })}</span>
          <span className="list-card__pager"><button className="button button--secondary" type="button" disabled>{t("previous")}</button><button className="button button--secondary" type="button" disabled>{t("next")}</button></span>
        </footer>
      </BusinessBoundary>
    </section>
  </div>;
}
