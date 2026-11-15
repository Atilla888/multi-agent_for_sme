import Link from "next/link";
import { useTranslations } from "next-intl";
import { avatarHue } from "@/components/ui/Avatar";
import { PageHeader } from "@/components/layout/PageHeader";
import { initials } from "@/components/layout/sessionDisplay";
import { Button, Card, CardContent, CardHeader, CardTitle, StateNotice, StatusBadge } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { BusinessBoundary } from "@/features/business";
import type { ProductState } from "@/types/states";
import type { OrderDetailModel } from "../types";
import { useOrderWords } from "./useOrderWords";

interface TimelineStep {
  readonly id: string;
  readonly title: string;
  readonly detail: string;
  readonly state: ProductState;
}

/** Order detail: status, items and what happened on the left; customer and next step on the right. */
export function OrderDetailScreen({ model }: { readonly model: OrderDetailModel }) {
  const t = useTranslations("orders");
  const words = useOrderWords();
  const order = model.order;
  const scenario = order?.scenario ?? "confirmed";
  const createEvidence = order ? t(`scenarios.${scenario}.createEvidence`, { orderRef: order.refs.order ?? "", version: order.version }) : "";
  const reservationEvidence = order ? t(`scenarios.${scenario}.reservationEvidence`, { reservationRef: order.refs.reservation ?? "" }) : "";
  const timeline: readonly TimelineStep[] = order ? [
    { id: "created", title: t("detail.timeline.created"), detail: createEvidence, state: order.orderState },
    { id: "reserved", title: t("detail.timeline.reserved"), detail: reservationEvidence, state: order.reservationState },
    { id: "delivery", title: t("detail.timeline.delivery"), detail: t(`detail.delivery.${order.orderDelivery}`), state: "not-available" },
    { id: "message", title: t("detail.timeline.message"), detail: t(`detail.customerMessage.${order.messageDelivery}`), state: order.messageDelivery === "confirmationNotDelivered" ? "message-delivery-failed" : "not-available" },
  ] : [];
  return <div className="feature-page business-screen order-detail">
    <PageHeader title={order ? t("detail.titleWithId", { id: order.id }) : t("detail.title")} description={order ? `${t("detail.lastUpdatedToday", { time: order.observedAt.time })} · ${order.channel}` : undefined} source="sample" backHref="/orders" backLabel={t("title")} />
    <BusinessBoundary state={model.validationState} family="order" emptyDescription={t("detail.emptyDescription")}>{order ? <>
      <div className="order-detail__title">
        <StatusBadge state={order.orderState} />
        <StatusBadge state={order.reservationState} />
      </div>
      {order.notice ? <StateNotice state={order.notice.state} title={t(`scenarios.${scenario}.noticeTitle`)} description={t(`scenarios.${scenario}.noticeDescription`)} /> : null}
      <div className="detail-layout">
        <div className="detail-layout__main">
          <Card>
            <CardHeader><CardTitle>{t("detail.orderAndStock")}</CardTitle></CardHeader>
            <CardContent className="state-pair">
              <div className="state-box">
                <div className="state-box__head"><span>{t("columns.order")}</span><StatusBadge state={order.orderState} /></div>
                <strong>{words.orderLabel(order.orderLabel)}</strong>
                <p>{createEvidence}</p>
              </div>
              <div className="state-box">
                <div className="state-box__head"><span>{t("columns.reservation")}</span><StatusBadge state={order.reservationState} /></div>
                <strong>{words.reservationLabel(order.reservationLabel)}</strong>
                <p>{reservationEvidence}</p>
              </div>
              <p className="rule-note">{t("detail.ruleNote")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>{t("columns.items")}</CardTitle></CardHeader>
            <CardContent>
              <ul className="order-items" aria-label={t("detail.itemsIn", { id: order.id })}>
                {order.lines.map((line) => <li key={line.productId}>
                  <span className="order-items__icon"><Icon name="box" size={18} /></span>
                  <span className="order-items__text">
                    <strong>{line.product}</strong>
                    <span>{t("detail.lineFacts", { sku: line.sku, ordered: line.quantity, reserved: line.reservedQuantity })}</span>
                    <span><Link className="context-link" href={`/products?product=${line.productId}`}>{t("detail.productLink")}</Link> · <Link className="context-link" href={`/inventory?product=${line.productId}`}>{t("detail.stockLink")}</Link></span>
                  </span>
                  <strong className="cell-number">{line.unitPrice}</strong>
                </li>)}
              </ul>
              <dl className="order-totals">
                <div><dt>{t("columns.total")}</dt><dd>{order.total}</dd></div>
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>{t("detail.whatHappened")}</CardTitle></CardHeader>
            <CardContent>
              <ol className="timeline">
                {timeline.map((step) => <li key={step.id}>
                  <span className="timeline__dot" aria-hidden="true" />
                  <span className="timeline__text"><strong>{step.title}</strong><span>{step.detail}</span></span>
                  <StatusBadge state={step.state} />
                </li>)}
              </ol>
            </CardContent>
          </Card>
        </div>
        <aside className="detail-layout__side details-panel" aria-label={t("detail.detailsLabel")}>
          <section className="details-panel__group">
            <h3>{t("columns.customer")}</h3>
            <div className="customer-card__who">
              <span className={`avatar avatar--hue-${avatarHue(order.customer)}`} aria-hidden="true">{initials(order.customer)}</span>
              <span><strong>{order.customer}</strong><span>{order.phone}</span></span>
            </div>
            <div className="details-panel__links"><Link className="context-link" href={`/customers/${order.customerId}`}>{t("detail.openCustomer")}</Link><Link className="context-link" href="/conversations/c-42">{t("detail.openConversation")}</Link></div>
          </section>
          <section className="details-panel__group next-steps">
            <h3>{t("detail.nextStep")}</h3>
            <strong>{t(`scenarios.${scenario}.nextStep`)}</strong>
            <p>{t(`scenarios.${scenario}.nextDetail`, { reservationRef: order.refs.reservation ?? "" })}</p>
            {order.scenario === "e02" ? <><Button disabled>{t("detail.changeOrder")}</Button><p className="rule-note">{t("detail.changeBlockedNote")}</p></> : null}
            {["outcome-unknown", "attention", "e02"].includes(order.scenario) ? <Link className="button button--primary" href={`/escalations?scenario=${order.scenario === "outcome-unknown" ? "outcome-unknown" : order.scenario === "e02" ? "restricted" : "waiting-human"}`}>{t("detail.openReviewCase")}</Link> : null}
          </section>
        </aside>
      </div>
    </> : null}</BusinessBoundary>
  </div>;
}
