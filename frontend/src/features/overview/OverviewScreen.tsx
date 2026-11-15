import Link from "next/link";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import type { OverviewModel } from "./overview";

/** Overview: what needs a person first, then the latest orders. Counts live in the section titles. */
export function OverviewScreen({ model }: { readonly model: OverviewModel }) {
  const t = useTranslations("overview");
  const cases = useTranslations("escalations");
  return (
    <div className="page-stack overview">
      <PageHeader title={t("title")} source="sample" />

      <section className="card overview-panel" aria-labelledby="overview-attention-title">
        <header className="overview-panel__header">
          <h2 className="type-card-title" id="overview-attention-title">{t("needsReview")} <span className="overview-count">{model.attention.length}</span></h2>
          <Link className="context-link" href="/escalations">{t("openAll")}</Link>
        </header>
        {model.attention.length ? (
          <ul className="overview-attention">
            {model.attention.map((item) => (
              <li key={item.id}>
                <Link className="overview-attention__row" href={item.href}>
                  <span className="overview-attention__text">
                    <strong>{cases(`reasons.${item.reason}`)}</strong>
                    <span>{[item.orderId, item.participant, item.time === "Yesterday" ? cases("yesterday") : item.time].filter(Boolean).join(" · ")}</span>
                  </span>
                  <StatusBadge state={item.state} />
                  <Icon name="chevronRight" size={14} />
                </Link>
              </li>
            ))}
          </ul>
        ) : <p className="overview-empty">{t("nothingWaiting")}</p>}
      </section>

      <section className="card overview-panel" aria-labelledby="overview-orders-title">
        <header className="overview-panel__header">
          <h2 className="type-card-title" id="overview-orders-title">{t("recentOrders")} <span className="overview-count">{model.recentOrders.length}</span></h2>
          <Link className="context-link" href="/orders">{t("viewAll")}</Link>
        </header>
        <Table scrollLabel={t("recentOrders")} className="overview-orders responsive-table">
          <TableHeader>
            <TableRow>
              <TableHead>{t("columns.order")}</TableHead>
              <TableHead>{t("columns.customer")}</TableHead>
              <TableHead>{t("columns.status")}</TableHead>
              <TableHead>{t("columns.reservation")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {model.recentOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell data-label={t("columns.order")}><Link className="overview-orders__id cell-id" href={order.href}>{order.id}</Link></TableCell>
                <TableCell data-label={t("columns.customer")}>{order.customer}</TableCell>
                <TableCell data-label={t("columns.order")}><StatusBadge state={order.orderState} /></TableCell>
                <TableCell data-label={t("reservation")}><StatusBadge state={order.reservationState} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
