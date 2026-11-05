import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { initials } from "@/components/layout/sessionDisplay";
import { Badge, Card, CardContent, CardHeader, CardTitle, EmptyState, StatusBadge } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { agentTone } from "@/features/conversations/agentTone";
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

function Message({ message, customer }: { readonly message: ConversationMessageDto; readonly customer: string }) {
  const inbound = message.direction === "INBOUND";
  return <article className={`message ${inbound ? "message--customer" : "message--sales-agent"}`} aria-label={`${inbound ? customer : "Assistant"} message`}>
    <span className="avatar" role="img" aria-label={inbound ? customer : "Assistant"}>{inbound ? initials(customer) : "AI"}</span>
    <div className="message__body"><header>{inbound ? <strong>{customer}</strong> : <Badge tone="sales">Assistant</Badge>}<time>{when(message.created_at)}</time></header><p>{message.body}</p>{message.status === "FAILED" ? <span className="message__delivery">Not delivered</span> : null}</div>
  </article>;
}

/** Inbox backed by the live conversation API: WhatsApp and other connected channels. */
export function RealConversationsScreen({ model }: { readonly model: ConversationsRead }) {
  const selected = model.selected;
  const customerName = (item: ConversationSummaryDto) => item.customer_name ?? "Customer";
  return <div className="feature-page">
    <PageHeader title="Inbox" description="Customer conversations from connected channels. The assistant answers first; anything it cannot settle is marked for a person." source="live" />
    <div className="conversation-layout">
      <aside className="conversation-list" aria-labelledby="conversation-list-title">
        <header className="conversation-list__header"><h2 id="conversation-list-title">Conversations</h2><span className="conversation-count">{model.items.length}</span></header>
        <nav className="filter-chips conversation-filters" aria-label="Filter conversations">{filters.map((filter) => <Link key={filter.value} className={`filter-chip ${model.status === filter.value ? "filter-chip--active" : ""}`} href={filter.value === "all" ? "/conversations" : `/conversations?status=${filter.value}`} aria-current={model.status === filter.value ? "true" : undefined}>{filter.label}</Link>)}</nav>
        {model.items.length ? <nav aria-label="Conversation list"><ul className="conversation-items">{model.items.map((item) => { const active = item.id === selected?.conversation.id; return <li key={item.id}><Link className={`conversation-row ${active ? "conversation-row--selected" : ""}`} href={`/conversations/${item.id}`} aria-current={active ? "page" : undefined}><span className="avatar-initials avatar-initials--soft conversation-row__avatar" aria-hidden="true">{initials(customerName(item))}</span><span className="conversation-row__top"><strong>{customerName(item)}</strong><time>{when(item.last_at ?? item.updated_at)}</time></span><span className="conversation-row__preview">{item.last_message ?? "No messages yet"}</span><span className="conversation-row__meta"><span>{item.channel ? channelLabel[item.channel] : "Channel"}</span><Badge tone={agentTone(handler(item))}>{handler(item)}</Badge></span><span className="conversation-row__status"><StatusBadge state={conversationState(item)} /></span></Link></li>; })}</ul></nav> : <EmptyState title="No conversations yet" description="Messages from connected channels will appear here as customers write in." />}
      </aside>
      {selected ? <>
        <section className="conversation-workspace" aria-labelledby="conversation-title">
          <header className="conversation-workspace__header"><div><h2 id="conversation-title">{customerName(selected.conversation)}</h2><p>{selected.conversation.channel ? channelLabel[selected.conversation.channel] : "Connected channel"} · {selected.messages.length} messages</p></div><StatusBadge state={conversationState(selected.conversation)} /><dl className="workspace-metadata"><div><dt>Channel</dt><dd>{selected.conversation.channel ? channelLabel[selected.conversation.channel] : "Unknown"}</dd></div><div><dt>Handled by</dt><dd><Badge tone={agentTone(handler(selected.conversation))}>{handler(selected.conversation)}</Badge></dd></div></dl></header>
          <div className="message-thread" aria-label="Messages">{selected.messages.map((message) => <Message key={message.id} message={message} customer={customerName(selected.conversation)} />)}</div>
          <div className="conversation-composer"><p className="muted-copy">Replies are sent by the assistant on the customer&apos;s channel. Replying from here is not available yet.</p></div>
        </section>
        <aside className="conversation-context" aria-labelledby="context-title">
          <Card><CardHeader><CardTitle id="context-title">Details</CardTitle></CardHeader><CardContent><dl className="context-facts">
            <div><dt>Customer</dt><dd><strong>{customerName(selected.conversation)}</strong><span><Link className="context-link" href={`/customers/${selected.conversation.customer_id}`}>Open customer</Link></span></dd></div>
            <div><dt>Status</dt><dd><strong>{selected.conversation.status === "ESCALATED" ? "Needs a person" : selected.conversation.status === "CLOSED" ? "Closed" : "Open"}</strong></dd></div>
            <div><dt>Last message</dt><dd><strong>{when(selected.conversation.last_at)}</strong><span>{selected.messages.length ? messageStatus[selected.messages[selected.messages.length - 1].status] ?? selected.messages[selected.messages.length - 1].status : ""}</span></dd></div>
          </dl></CardContent></Card>
          <Card><CardHeader><CardTitle>What the assistant did</CardTitle></CardHeader><CardContent><ul className="record-links">{selected.runs.length ? selected.runs.slice(0, 5).map((run) => <li key={run.id}><span className="record-links__row"><strong>{run.active_agent ? `${run.active_agent} Agent` : "Assistant"}</strong><span><StatusBadge state={conversationState({ status: "OPEN", run_status: run.status, outcome: run.outcome })} /> {when(run.created_at)}{run.handoff_count ? " · handed over once" : ""}</span></span></li>) : <li><span className="muted-copy">No assistant activity yet.</span></li>}</ul><p className="muted-copy"><Icon name="info" size={14} /> The assistant only proposes; the system checks every step before anything changes.</p></CardContent></Card>
        </aside>
      </> : <section className="conversation-workspace"><EmptyState title="Select a conversation" description="Pick one from the list to read it." /></section>}
    </div>
  </div>;
}
