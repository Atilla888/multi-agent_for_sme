import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { initials } from "@/components/layout/sessionDisplay";
import { Button, Card, CardContent, CardHeader, CardTitle, StateNotice, StatusBadge } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { BusinessBoundary, BusinessFixtureBanner } from "@/features/business";
import type { ProductState } from "@/types/states";
import type { OrderDetailModel, OrderDetailView } from "../types";

interface TimelineStep {
  readonly title: string;
  readonly detail: string;
  readonly state: ProductState;
}

function timeline(order: OrderDetailView): readonly TimelineStep[] {
  return [
    { title: "create_order", detail: order.createEvidence, state: order.orderState },
    { title: "reserve_inventory", detail: order.reservationEvidence, state: order.reservationState },
    { title: "Order delivery", detail: `${order.orderDelivery} · logistics only; unavailable is not “not shipped”.`, state: "not-available" },
    { title: "Message delivery", detail: `${order.messageDelivery} · communication never changes the Order or Reservation.`, state: order.messageDelivery.startsWith("Delivery failed") ? "message-delivery-failed" : "not-available" },
  ];
}

/** Order detail — Figma page 02 · Order Detail: main column (state, items, timeline) and side column (customer, next steps). */
export function OrderDetailScreen({ model }: { readonly model: OrderDetailModel }) {
  const order = model.order;
  return <div className="feature-page business-screen order-detail">
    <PageHeader eyebrow="Business / Orders / Detail" title={order?.id ?? "Order detail"} description="Authoritative Order facts and separate Reservation evidence." />
    <BusinessFixtureBanner family="Order detail" />
    <BusinessBoundary state={model.validationState} family="Order detail" emptyDescription="No matching Order exists in the deterministic fixture set.">{order ? <>
      <Link className="back-link" href="/orders"><Icon name="chevronLeft" size={16} />Back to orders</Link>
      <header className="order-detail__title">
        <h2 className="type-h1">Order #{order.id}</h2>
        <StatusBadge state={order.orderState} />
        <StatusBadge state={order.reservationState} />
        <p>{order.observedAt} · {order.channel} · version {order.version}</p>
      </header>
      {order.notice ? <StateNotice state={order.notice.state} title={order.notice.title} description={order.notice.description} /> : null}
      <div className="detail-layout">
        <div className="detail-layout__main">
          <Card>
            <CardHeader><CardTitle>Order and reservation</CardTitle></CardHeader>
            <CardContent className="state-pair">
              <div className="state-box">
                <div className="state-box__head"><span>Order state</span><StatusBadge state={order.orderState} /></div>
                <strong>{order.orderLabel}</strong>
                <p>{order.createEvidence}</p>
              </div>
              <div className="state-box">
                <div className="state-box__head"><span>Reservation state</span><StatusBadge state={order.reservationState} /></div>
                <strong>{order.reservationLabel}</strong>
                <p>{order.reservationEvidence}</p>
              </div>
              <p className="muted-copy state-pair__note">Creating an Order does not confirm inventory reservation. Reservation is a separate trusted effect with its own evidence.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Items</CardTitle></CardHeader>
            <CardContent>
              <ul className="order-items" aria-label={`Items for ${order.id}`}>
                {order.lines.map((line) => <li key={line.productId}>
                  <span className="order-items__icon"><Icon name="box" size={18} /></span>
                  <span className="order-items__text">
                    <strong>{line.product}</strong>
                    <span>{line.sku} · ordered {line.quantity} · reserved {line.reservedQuantity}</span>
                    <span><Link className="context-link" href={`/products?product=${line.productId}`}>Product</Link> · <Link className="context-link" href={`/inventory?product=${line.productId}`}>Inventory</Link></span>
                  </span>
                  <strong className="cell-number">{line.unitPrice}</strong>
                </li>)}
              </ul>
              <dl className="order-totals">
                <div><dt>Total</dt><dd>{order.total}</dd></div>
                <div><dt>Currency</dt><dd>{order.currency}</dd></div>
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>What happened</CardTitle></CardHeader>
            <CardContent>
              <ol className="timeline">
                {timeline(order).map((step) => <li key={step.title}>
                  <span className="timeline__dot" aria-hidden="true" />
                  <span className="timeline__text"><strong>{step.title}</strong><span>{step.detail}</span></span>
                  <StatusBadge state={step.state} />
                </li>)}
              </ol>
            </CardContent>
          </Card>
        </div>
        <aside className="detail-layout__side">
          <Card>
            <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
            <CardContent className="customer-card">
              <div className="customer-card__who">
                <span className="avatar-initials avatar-initials--soft" aria-hidden="true">{initials(order.customer.replace(" · demo", ""))}</span>
                <span><strong>{order.customer}</strong><span>{order.phone}</span></span>
              </div>
              <p className="muted-copy">North Shop · fixture scope</p>
              <Link className="button button--secondary" href={`/customers/${order.customerId}`}>Open customer</Link>
              <Link className="button button--secondary" href="/conversations/c-42">Open related Conversation</Link>
            </CardContent>
          </Card>
          <Card className="safe-step-card">
            <CardHeader><div><p className="section-kicker">Next safe step</p><CardTitle>{order.nextStep}</CardTitle></div></CardHeader>
            <CardContent className="next-steps">
              <p>{order.nextDetail}</p>
              {order.scenario === "e02" ? <Button disabled>Update order · restricted</Button> : null}
              {["outcome-unknown", "attention", "e02"].includes(order.scenario) ? <Link className="button button--primary" href={`/escalations?scenario=${order.scenario === "outcome-unknown" ? "outcome-unknown" : order.scenario === "e02" ? "e02" : "waiting-human"}`}>Open related Escalation</Link> : null}
            </CardContent>
          </Card>
        </aside>
      </div>
    </> : null}</BusinessBoundary>
  </div>;
}
