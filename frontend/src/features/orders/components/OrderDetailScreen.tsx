import Link from "next/link";
import { avatarHue } from "@/components/ui/Avatar";
import { PageHeader } from "@/components/layout/PageHeader";
import { initials } from "@/components/layout/sessionDisplay";
import { Button, Card, CardContent, CardHeader, CardTitle, StateNotice, StatusBadge } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { BusinessBoundary } from "@/features/business";
import type { ProductState } from "@/types/states";
import type { OrderDetailModel, OrderDetailView } from "../types";

interface TimelineStep {
  readonly title: string;
  readonly detail: string;
  readonly state: ProductState;
}

function timeline(order: OrderDetailView): readonly TimelineStep[] {
  return [
    { title: "Order created", detail: order.createEvidence, state: order.orderState },
    { title: "Stock reserved", detail: order.reservationEvidence, state: order.reservationState },
    { title: "Delivery", detail: `${order.orderDelivery}. No update does not mean it has not shipped.`, state: "not-available" },
    { title: "Customer message", detail: `${order.messageDelivery}. Messages never change the order or the reservation.`, state: order.messageDelivery.startsWith("Confirmation message") ? "message-delivery-failed" : "not-available" },
  ];
}

/** Order detail: status, items and what happened on the left; customer and next step on the right. */
export function OrderDetailScreen({ model }: { readonly model: OrderDetailModel }) {
  const order = model.order;
  return <div className="feature-page business-screen order-detail">
    <PageHeader title={order ? `Order ${order.id}` : "Order"} description={order ? `${order.observedAt} · ${order.channel}` : undefined} source="sample" backHref="/orders" backLabel="Orders" />
    <BusinessBoundary state={model.validationState} family="Order" emptyDescription="There is no order with this number.">{order ? <>
      <div className="order-detail__title">
        <StatusBadge state={order.orderState} />
        <StatusBadge state={order.reservationState} />
      </div>
      {order.notice ? <StateNotice state={order.notice.state} title={order.notice.title} description={order.notice.description} /> : null}
      <div className="detail-layout">
        <div className="detail-layout__main">
          <Card>
            <CardHeader><CardTitle>Order and stock</CardTitle></CardHeader>
            <CardContent className="state-pair">
              <div className="state-box">
                <div className="state-box__head"><span>Order</span><StatusBadge state={order.orderState} /></div>
                <strong>{order.orderLabel}</strong>
                <p>{order.createEvidence}</p>
              </div>
              <div className="state-box">
                <div className="state-box__head"><span>Stock reservation</span><StatusBadge state={order.reservationState} /></div>
                <strong>{order.reservationLabel}</strong>
                <p>{order.reservationEvidence}</p>
              </div>
              <p className="rule-note">Creating an order and reserving stock are two separate steps. One can succeed while the other does not.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Items</CardTitle></CardHeader>
            <CardContent>
              <ul className="order-items" aria-label={`Items in ${order.id}`}>
                {order.lines.map((line) => <li key={line.productId}>
                  <span className="order-items__icon"><Icon name="box" size={18} /></span>
                  <span className="order-items__text">
                    <strong>{line.product}</strong>
                    <span>{line.sku} · {line.quantity} ordered · {line.reservedQuantity} reserved</span>
                    <span><Link className="context-link" href={`/products?product=${line.productId}`}>Product</Link> · <Link className="context-link" href={`/inventory?product=${line.productId}`}>Stock</Link></span>
                  </span>
                  <strong className="cell-number">{line.unitPrice}</strong>
                </li>)}
              </ul>
              <dl className="order-totals">
                <div><dt>Total</dt><dd>{order.total}</dd></div>
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
        <aside className="detail-layout__side details-panel" aria-label="Order details">
          <section className="details-panel__group">
            <h3>Customer</h3>
            <div className="customer-card__who">
              <span className={`avatar avatar--hue-${avatarHue(order.customer)}`} aria-hidden="true">{initials(order.customer)}</span>
              <span><strong>{order.customer}</strong><span>{order.phone}</span></span>
            </div>
            <div className="details-panel__links"><Link className="context-link" href={`/customers/${order.customerId}`}>Open customer</Link><Link className="context-link" href="/conversations/c-42">Open conversation</Link></div>
          </section>
          <section className="details-panel__group next-steps">
            <h3>Next step</h3>
            <strong>{order.nextStep}</strong>
            <p>{order.nextDetail}</p>
            {order.scenario === "e02" ? <><Button disabled>Change order</Button><p className="rule-note">Changing orders is switched off by policy.</p></> : null}
            {["outcome-unknown", "attention", "e02"].includes(order.scenario) ? <Link className="button button--primary" href={`/escalations?scenario=${order.scenario === "outcome-unknown" ? "outcome-unknown" : order.scenario === "e02" ? "restricted" : "waiting-human"}`}>Open review case</Link> : null}
          </section>
        </aside>
      </div>
    </> : null}</BusinessBoundary>
  </div>;
}
