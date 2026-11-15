import Link from "next/link";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, StatusBadge } from "@/components/ui";
import { BusinessBoundary, BusinessFactList } from "@/features/business";
import type { ConversationProgress, CustomerDetailModel } from "../types";
import { useCustomerWords } from "./useCustomerWords";

/** Customer detail: identity, their conversations and their orders. */
export function CustomerDetailScreen({ model }: { readonly model: CustomerDetailModel }) {
  const t = useTranslations("customers");
  const states = useTranslations("states");
  const words = useCustomerWords();
  const customer = model.customer;
  const conversationProgress = (progress: ConversationProgress) => progress === "waiting-human" ? states(`${progress}.label`) : t(`detail.conversationProgress.${progress}`);
  return <div className="feature-page business-screen">
    <PageHeader title={customer?.displayName ?? t("detail.title")} description={customer ? `${customer.reference} · ${words.identity(customer.identity)}` : undefined} source="sample" backHref="/customers" backLabel={t("title")} />
    <BusinessBoundary state={model.validationState} family="customer" emptyDescription={t("detail.emptyDescription")}>{customer ? <>
      <div className="entity-detail-heading"><span>{customer.observedAt.day === "today" ? t("detail.lastUpdated.today", { time: customer.observedAt.time }) : t("detail.lastUpdated.yesterday")}</span><StatusBadge state={customer.verificationState} /></div>
      <div className="detail-layout">
        <div className="detail-layout__main">
        <Card><CardHeader><CardTitle>{t("detail.conversations")}</CardTitle></CardHeader><CardContent><ul className="record-links">{customer.relatedConversations.map((item) => <li key={item.id}><Link href={`/conversations/${item.id}`}><strong>{item.label}</strong><span>{item.id} · {conversationProgress(item.state)}</span></Link></li>)}</ul></CardContent></Card>
        <Card><CardHeader><CardTitle>{t("detail.orders")}</CardTitle></CardHeader><CardContent>{customer.relatedOrders.length ? <ul className="record-links">{customer.relatedOrders.map((item) => <li key={item.id}><Link href={`/orders/${item.id}`}><strong>{item.id}</strong><span>{item.label} · {t(`detail.orderProgress.${item.state}`)}</span></Link></li>)}</ul> : <p className="muted-copy">{t("detail.noOrders")}</p>}</CardContent></Card>
        </div>
        <aside className="detail-layout__side details-panel" aria-label={t("detail.detailsLabel")}>
          <section className="details-panel__group"><h3>{t("detail.details")}</h3><BusinessFactList facts={[
            { label: t("detail.facts.name"), value: customer.displayName, note: t("detail.facts.nameNote") },
            { label: t("detail.facts.customerId"), value: customer.reference },
            { label: t("detail.facts.business"), value: "North Shop" },
            { label: t("detail.facts.contactChannels"), value: customer.channelIdentities.map((identity) => t(`detail.channelIdentity.${identity.check}`, { channel: identity.channel })).join(", "), note: t("detail.facts.contactChannelsNote") },
            { label: t("detail.facts.record"), value: t(customer.refreshNeeded ? "detail.record.refreshNeeded" : "detail.record.current", { version: customer.version }), note: words.time(customer.observedAt) },
          ]} /></section>
        </aside>
      </div>
    </> : null}</BusinessBoundary>
  </div>;
}
