import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/PageHeader";
import { initials } from "@/components/layout/sessionDisplay";
import { Avatar, Badge, ContextHelper, EmptyState, StatusBadge } from "@/components/ui";
import { avatarHue } from "@/components/ui/Avatar";
import { intlLocale } from "@/i18n/locales";
import type { ConversationMessageDto, ConversationSummaryDto } from "@/services/api/reads";
import type { ProductState } from "@/types/states";
import type { ConversationsRead } from "./adapters";

const channelLabel = { WHATSAPP: "WhatsApp", TELEGRAM: "Telegram", INSTAGRAM: "Instagram", WEB: "Web Chat" } as const;
const filters = ["all", "OPEN", "ESCALATED", "CLOSED"] as const;
const messageStatuses = ["PENDING_DELIVERY", "DELIVERED", "FAILED", "RECEIVED", "PROCESSING", "PROCESSED", "DELIVERY_UNKNOWN"] as const;

/** Plain-language state for a conversation, derived from its status and the latest agent run. */
export function conversationState(item: Pick<ConversationSummaryDto, "status" | "run_status" | "outcome">): ProductState {
  if (item.outcome === "OUTCOME_UNKNOWN") return "outcome-unknown";
  if (item.status === "ESCALATED" || item.run_status === "WAITING_HUMAN") return "waiting-human";
  if (item.run_status === "FAILED") return "known-failure";
  if (item.run_status === "RUNNING") return "processing";
  if (item.status === "CLOSED") return "confirmed";
  return "success";
}

/** Time today, otherwise day and month, in the business time zone and the chosen language. */
function when(value: string | null, locale: string): string {
  if (!value) return "";
  const date = new Date(value);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return sameDay ? date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Almaty" }) : date.toLocaleDateString(locale, { day: "numeric", month: "short", timeZone: "Asia/Almaty" });
}

type InboxTranslator = ReturnType<typeof useTranslations<"integration">>;

function agentName(t: InboxTranslator, agent: ConversationSummaryDto["active_agent"]): string {
  return agent ? t("inbox.agent", { agent }) : t("inbox.assistant");
}

function handler(t: InboxTranslator, item: Pick<ConversationSummaryDto, "active_agent" | "status">): string {
  if (item.status === "ESCALATED") return t("inbox.humanOperator");
  return item.active_agent ? t("inbox.agent", { agent: item.active_agent }) : t("inbox.waiting");
}

function deliveryState(t: InboxTranslator, status: string): string {
  const known = messageStatuses.find((candidate) => candidate === status);
  return known ? t(`inbox.messageStatus.${known}`) : status;
}

/** One timeline entry: the customer's message, or the assistant's reply with its delivery state. */
function TimelineEntry({ message, customer, agent }: { readonly message: ConversationMessageDto; readonly customer: string; readonly agent: string }) {
  const t = useTranslations("integration");
  const locale = intlLocale(useLocale());
  const inbound = message.direction === "INBOUND";
  const name = inbound ? customer : agent;
  return <article className={`timeline-entry ${inbound ? "message--customer" : "message--agent"}`} aria-label={inbound ? t("inbox.customerMessage", { name: customer }) : t("inbox.assistantMessage")}>
    <Avatar variant={inbound ? "person" : "agent"} accessibleName={name} initials={initials(customer)} />
    <div className="timeline-entry__body">
      <header className="timeline-entry__who"><strong>{name}</strong>{inbound ? <span>{t("inbox.customer")}</span> : null}<time>{when(message.created_at, locale)}</time></header>
      <p className="message-bubble">{message.body}</p>
      {!inbound ? <span className={`message__delivery-state${message.status === "FAILED" ? " message__delivery" : ""}`}>{deliveryState(t, message.status)}</span> : null}
    </div>
  </article>;
}

/** Inbox backed by the live conversation API: WhatsApp and other connected channels. */
export function RealConversationsScreen({ model }: { readonly model: ConversationsRead }) {
  const t = useTranslations("integration");
  const states = useTranslations("states");
  const locale = intlLocale(useLocale());
  const selected = model.selected;
  const customerName = (item: ConversationSummaryDto) => item.customer_name ?? t("inbox.customer");
  const filterLabel = (filter: (typeof filters)[number]) => filter === "ESCALATED" ? states("waiting-human.label") : t(`inbox.filters.${filter}`);
  const lastMessage = selected?.messages[selected.messages.length - 1];
  return <div className="feature-page">
    <PageHeader title={t("titles.Inbox")} source="live" />
    <div className="conversation-layout">
      <aside className="conversation-list" aria-labelledby="conversation-list-title">
        <header className="conversation-list__header"><h2 id="conversation-list-title">{t("inbox.conversations")}</h2><span className="conversation-count">{model.items.length}</span></header>
        <nav className="filter-chips conversation-filters" aria-label={t("inbox.filterLabel")}>{filters.map((filter) => <Link key={filter} className={`filter-chip ${model.status === filter ? "filter-chip--active" : ""}`} href={filter === "all" ? "/conversations" : `/conversations?status=${filter}`} aria-current={model.status === filter ? "true" : undefined}>{filterLabel(filter)}</Link>)}</nav>
        {model.items.length ? <nav aria-label={t("inbox.listLabel")}><ul className="conversation-items">{model.items.map((item) => {
          const active = item.id === selected?.conversation.id;
          return <li key={item.id}><Link className={`conversation-row ${active ? "conversation-row--selected" : ""}`.trim()} href={`/conversations/${item.id}`} aria-current={active ? "page" : undefined}>
            <span className={`avatar avatar--hue-${avatarHue(customerName(item))} conversation-row__avatar`} aria-hidden="true">{initials(customerName(item))}</span>
            <span className="conversation-row__top"><strong>{customerName(item)}</strong><time>{when(item.last_at ?? item.updated_at, locale)}</time></span>
            <span className="conversation-row__preview">{item.last_message ?? t("inbox.noMessages")}</span>
            <span className="conversation-row__meta"><Badge>{item.channel ? channelLabel[item.channel] : t("inbox.channel")}</Badge><span className="conversation-row__handler">{handler(t, item)}</span><StatusBadge state={conversationState(item)} /></span>
          </Link></li>;
        })}</ul></nav> : <EmptyState title={t("inbox.empty")} description={t("inbox.emptyDescription")} />}
      </aside>
      {selected ? <>
        <section className="conversation-workspace" aria-labelledby="conversation-title">
          <header className="conversation-workspace__header">
            <span className={`avatar avatar--hue-${avatarHue(customerName(selected.conversation))}`} aria-hidden="true">{initials(customerName(selected.conversation))}</span>
            <div><h2 id="conversation-title">{customerName(selected.conversation)}</h2><p>{selected.conversation.channel ? channelLabel[selected.conversation.channel] : t("inbox.connectedChannel")} · {t("inbox.messageCount", { count: selected.messages.length })}</p></div>
            <StatusBadge state={conversationState(selected.conversation)} />
          </header>
          <div className="message-thread" aria-label={t("inbox.messages")}>{selected.messages.map((message) => <TimelineEntry key={message.id} message={message} customer={customerName(selected.conversation)} agent={agentName(t, selected.conversation.active_agent)} />)}</div>
          <div className="conversation-composer"><p className="muted-copy">{t("inbox.composerNote")}</p></div>
        </section>
        <aside className="conversation-context details-panel" aria-labelledby="context-title">
          <section className="details-panel__group">
            <h3 id="context-title">{t("inbox.details")}</h3>
            <dl className="details-grid">
              <div><dt>{t("columns.status")}</dt><dd><StatusBadge state={conversationState(selected.conversation)} /></dd></div>
              <div><dt>{t("inbox.handledBy")}</dt><dd className="details-grid__inline"><Avatar variant={selected.conversation.status === "ESCALATED" ? "person" : "agent"} accessibleName={handler(t, selected.conversation)} colorKey="Human Operator" initials={initials(t("inbox.humanOperator"))} />{handler(t, selected.conversation)}</dd></div>
              <div><dt>{t("inbox.channel")}</dt><dd><Badge>{selected.conversation.channel ? channelLabel[selected.conversation.channel] : t("inbox.unknownChannel")}</Badge></dd></div>
              <div><dt>{t("inbox.customer")}</dt><dd><span className="details-grid__value">{customerName(selected.conversation)}</span><Link className="context-link" href={`/customers/${selected.conversation.customer_id}`}>{t("openCustomer")}</Link></dd></div>
              <div><dt>{t("inbox.lastMessage")}</dt><dd><span className="details-grid__value">{when(selected.conversation.last_at, locale)}</span>{lastMessage ? <span className="details-grid__source">{deliveryState(t, lastMessage.status)}</span> : null}</dd></div>
            </dl>
          </section>
          <section className="details-panel__group">
            <h3>{t("inbox.runs")}</h3>
            {selected.runs.length ? <ul className="run-list">{selected.runs.slice(0, 5).map((run) => <li key={run.id} className="run-list__row">
              <span className="details-grid__inline"><Avatar variant="agent" accessibleName={agentName(t, run.active_agent)} initials="" />{agentName(t, run.active_agent)}</span>
              <span className="run-list__meta"><StatusBadge state={conversationState({ status: "OPEN", run_status: run.status, outcome: run.outcome })} /><time>{when(run.created_at, locale)}</time>{run.handoff_count ? <span>{t("inbox.handedOverOnce")}</span> : null}</span>
            </li>)}</ul> : <p className="muted-copy">{t("inbox.noRuns")}</p>}
          </section>
          <ContextHelper>{t("inbox.helper")}</ContextHelper>
        </aside>
      </> : <section className="conversation-workspace"><EmptyState title={t("inbox.select")} description={t("inbox.selectDescription")} /></section>}
    </div>
  </div>;
}
