import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import type { OverviewModel } from "./overview";

/** Overview: four numbers that matter today, the cases that need a person, and the latest orders. */
export function OverviewScreen({ model }: { readonly model: OverviewModel }) {
  return (
    <div className="page-stack overview">
      <PageHeader title="Overview" description="What needs your attention today, and where to go next." source="sample" />

      <section className="overview-kpis" aria-label="Today at a glance">
        {model.kpis.map((kpi) => (
          <Link className="card overview-kpi" href={kpi.href} key={kpi.label}>
            <span className="overview-kpi__label">{kpi.label}</span>
            <strong className="type-metric">{kpi.value}</strong>
            <span className="overview-kpi__note">{kpi.note}</span>
          </Link>
        ))}
      </section>

      <section className="card overview-panel" aria-labelledby="overview-attention-title">
        <header className="overview-panel__header">
          <h2 className="type-card-title" id="overview-attention-title">Needs review</h2>
          <Link className="button button--ghost" href="/escalations">Open all</Link>
        </header>
        {model.attention.length ? (
          <ul className="overview-attention">
            {model.attention.map((item) => (
              <li key={item.id}>
                <Link className="overview-attention__row" href={item.href}>
                  <span className={`overview-attention__icon overview-attention__icon--${item.state}`}><Icon name="alert" size={18} /></span>
                  <span className="overview-attention__text">
                    <strong>{item.title}</strong>
                    <span>{item.meta}</span>
                  </span>
                  <StatusBadge state={item.state} />
                  <Icon name="chevronRight" size={18} />
                </Link>
              </li>
            ))}
          </ul>
        ) : <p className="overview-empty">Nothing is waiting for a decision right now.</p>}
      </section>

      <section className="card overview-panel" aria-labelledby="overview-orders-title">
        <header className="overview-panel__header">
          <h2 className="type-card-title" id="overview-orders-title">Recent orders</h2>
          <Link className="button button--ghost" href="/orders">View all</Link>
        </header>
        <Table scrollLabel="Recent orders" className="overview-orders responsive-table">
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Stock reservation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {model.recentOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell data-label="Order"><Link className="overview-orders__id" href={order.href}>{order.id}</Link></TableCell>
                <TableCell data-label="Customer">{order.customer}</TableCell>
                <TableCell data-label="Order"><StatusBadge state={order.orderState} /></TableCell>
                <TableCell data-label="Reservation"><StatusBadge state={order.reservationState} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
