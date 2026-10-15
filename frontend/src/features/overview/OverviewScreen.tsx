import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import type { OverviewModel } from "./overview";

/** Overview layout from Figma page 02: KPI grid, Needs attention list, Recent orders. */
export function OverviewScreen({ model }: { readonly model: OverviewModel }) {
  return (
    <div className="page-stack overview">
      <div className="fixture-banner" role="note">
        <strong>{model.mode}</strong>
        <span>Counts come from the same local fixtures as Conversations, Escalations and Orders · no backend summary is called.</span>
      </div>

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
          <h2 className="type-card-title" id="overview-attention-title">Needs attention</h2>
          <span className="badge badge--warning">{model.attention.length} open</span>
        </header>
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
              <TableHead>Order state</TableHead>
              <TableHead>Reservation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {model.recentOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell data-label="Order"><Link className="overview-orders__id" href={order.href}>#{order.id}</Link></TableCell>
                <TableCell data-label="Customer">{order.customer}</TableCell>
                <TableCell data-label="Order state"><StatusBadge state={order.orderState} /></TableCell>
                <TableCell data-label="Reservation"><StatusBadge state={order.reservationState} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
