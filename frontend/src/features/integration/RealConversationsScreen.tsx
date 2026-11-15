import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { initials } from "@/components/layout/sessionDisplay";
import { Avatar, Badge, ContextHelper, EmptyState, StatusBadge } from "@/components/ui";
import { avatarHue } from "@/components/ui/Avatar";
import type { ConversationMessageDto, ConversationSummaryDto } from "@/services/api/reads";
import type { ProductState } from "@/types/states";
import type { ConversationsRead } from "./adapters";

const channelLabel = { WHATSAPP: "WhatsApp", TELEGRAM: "Telegram", INSTAGRAM: "Instagram", WEB: "Web Chat" } as const;
const filters = [{ value: "all", label: "All" }, { value: "OPEN", label: "Open" }, { value: "ESCALATED", label: "Needs a person" }, { value: "CLOSED", label: "Closed" }] as const;

/** Plain-language state for a conversation, derived from its status and the latest agent run. */
export function conversationState(item: Pick<ConversationSummaryDto, "status" | "run_status" | "outcome">): ProductState {
  if (item.outcome === "OUTCOME_UNKNOWN") return "outcome-unknown";
  if (item.status === "ESCALATED" || item.run_status === "WAITING_HUMAN") return "waiting-human";
  if (item.run_status === "FAILED") return "known-failure";
  if (item.run_status === "RUNNING") return "processing";
  if (item.status === "CLOSED") return "confirmed";
  return "success";
}

function when(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return sameDay ? date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Almaty" }) : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Almaty" });
}

function handler(item: Pick<ConversationSummaryDto, "active_agent" | "status">): string {
  if (item.status === "ESCALATED") return "Human Operator";
  return item.active_agent ? `${item.active_agent} Agent` : "Waiting";
}

const messageStatus: Record<string, string> = { PENDING_DELIVERY: "Sent", DELIVERED: "Delivered", FAILED: "Not delivered", RECEIVED: "Received", PROCESSING: "Processing", PROCESSED: "Received", DELIVERY_UNKNOWN: "Delivery unknown" };

function agentName(item: Pick<ConversationSummaryDto, "active_agent">): string {
  return item.active_agent ? `${item.active_agent} Agent` : "Assistant";
}

/** One timeline entry: the customer's message, or the assistant's reply with its delivery state. */
function TimelineEntry({ message, customer, agent }: { readonly message: ConversationMessageDto; readonly customer: string; readonly agent: string }) {
  const inbound = message.direction === "INBOUND";
  const name = inbound ? customer : agent;
  return <article className={`timeline-entry ${inbound ? "message--customer" : "message--agent"}`} aria-label={`${inbound ? customer : "Assistant"} message`}>
    <Avatar variant={inbound ? "person" : "agent"} accessibleName={name} initials={initials(customer)} />
    <div className="timeline-entry__body">
      <header className="timeline-entry__who"><strong>{name}</strong>{inbound ? <span>Customer</span> : null}<time>{when(message.created_at)}</time></header>
      <p className="message-bubble">{message.body}</p>
      {!inbound ? <span className={`message__delivery-state${message.status === "FAILED" ? " message__delivery" : ""}`}>{messageStatus[message.status] ?? message.status}</span> : null}
    </div>
  </article>;
}

/** Inbox backed by the live conversation API: WhatsApp and other connected channels. */
export function RealConversationsScreen({ model }: { readonly model: ConversationsRead }) {
  const selected = model.selected;
  const customerName = (item: ConversationSummaryDto) => item.customer_name ?? "Customer";
  const lastMessage = selected?.messages[selected.messages.length - 1];
  return <div className="feature-page">
    <PageHeader title="Inbox" source="live" />
    <div className="conversation-layout">
      <aside className="conversation-list" aria-labelledby="conversation-list-title">
        <header className="conversation-list__header"><h2 id="conversation-list-title">Conversations</h2><span className="conversation-count">{model.items.length}</span></header>
        <nav className="filter-chips conversation-filters" aria-label="Filter conversations">{filters.map((filter) => <Link key={filter.value} className={`filter-chip ${model.status === filter.value ? "filter-chip--active" : ""}`} href={filter.value === "all" ? "/conversations" : `/conversations?status=${filter.value}`} aria-current={model.status === filter.value ? "true" : undefined}>{filter.label}</Link>)}</nav>
        {model.items.length ? <nav aria-label="Conversation list"><ul className="conversation-items">{model.items.map((item) => {
          const active = item.id === selected?.conversation.id;
          return <li key={item.id}><Link className={`conversation-row ${active ? "conversation-row--selected" : ""}`.trim()} href={`/conversations/${item.id}`} aria-current={active ? "page" : undefined}>
            <span className={`avatar avatar--hue-${avatarHue(customerName(item))} conversation-row__avatar`} aria-hidden="true">{initials(customerName(item))}</span>
            <span className="conversation-row__top"><strong>{customerName(item)}</strong><time>{when(item.last_at ?? item.updated_at)}</time></span>
            <span className="conversation-row__preview">{item.last_message ?? "No messages yet"}</span>
            <span className="conversation-row__meta"><Badge>{item.channel ? channelLabel[item.channel] : "Channel"}</Badge><span className="conversation-row__handler">{handler(item)}</span><StatusBadge state={conversationState(item)} /></span>
          </Link></li>;
        })}</ul></nav> : <EmptyState title="No conversations yet" description="Messages from connected channels will appear here as customers write in." />}
      </aside>
      {selected ? <>
        <section className="conversation-workspace" aria-labelledby="conversation-title">
          <header className="conversation-workspace__header">
            <span className={`avatar avatar--hue-${avatarHue(customerName(selected.conversation))}`} aria-hidden="true">{initials(customerName(selected.conversation))}</span>
            <div><h2 id="conversation-title">{customerName(selected.conversation)}</h2><p>{selected.conversation.channel ? channelLabel[selected.conversation.channel] : "Connected channel"} · {selected.messages.length} messages</p></div>
            <StatusBadge state={conversationState(selected.conversation)} />
          </header>
          <div className="message-thread" aria-label="Messages">{selected.messages.map((message) => <TimelineEntry key={message.id} message={message} customer={customerName(selected.conversation)} agent={agentName(selected.conversation)} />)}</div>
          <div className="conversation-composer"><p className="muted-copy">Replies are sent by the assistant on the customer&apos;s channel. Replying from here is not available yet.</p></div>
        </section>
        <aside className="conversation-context details-panel" aria-labelledby="context-title">
          <section className="details-panel__group">
            <h3 id="context-title">Details</h3>
            <dl className="details-grid">
              <div><dt>Status</dt><dd><StatusBadge state={conversationState(selected.conversation)} /></dd></div>
              <div><dt>Handled by</dt><dd className="details-grid__inline"><Avatar variant={selected.conversation.status === "ESCALATED" ? "person" : "agent"} accessibleName={handler(selected.conversation)} initials="HO" />{handler(selected.conversation)}</dd></div>
              <div><dt>Channel</dt><dd><Badge>{selected.conversation.channel ? channelLabel[selected.conversation.channel] : "Unknown"}</Badge></dd></div>
              <div><dt>Customer</dt><dd><span className="details-grid__value">{customerName(selected.conversation)}</span><Link className="context-link" href={`/customers/${selected.conversation.customer_id}`}>Open customer</Link></dd></div>
              <div><dt>Last message</dt><dd><span className="details-grid__value">{when(selected.conversation.last_at)}</span>{lastMessage ? <span className="details-grid__source">{messageStatus[lastMessage.status] ?? lastMessage.status}</span> : null}</dd></div>
            </dl>
          </section>
          <section className="details-panel__group">
            <h3>Runs</h3>
            {selected.runs.length ? <ul className="run-list">{selected.runs.slice(0, 5).map((run) => <li key={run.id} className="run-list__row">
              <span className="details-grid__inline"><Avatar variant="agent" accessibleName={run.active_agent ? `${run.active_agent} Agent` : "Assistant"} initials="" />{run.active_agent ? `${run.active_agent} Agent` : "Assistant"}</span>
              <span className="run-list__meta"><StatusBadge state={conversationState({ status: "OPEN", run_status: run.status, outcome: run.outcome })} /><time>{when(run.created_at)}</time>{run.handoff_count ? <span>handed over once</span> : null}</span>
            </li>)}</ul> : <p className="muted-copy">No assistant activity yet.</p>}
          </section>
          <ContextHelper>The assistant only proposes; the system checks every step before anything changes.</ContextHelper>
        </aside>
      </> : <section className="conversation-workspace"><EmptyState title="Select a conversation" description="Pick one from the list to read it." /></section>}
    </div>
  </div>;
}
