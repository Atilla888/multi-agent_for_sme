import Link from "next/link";
import { SearchInput, StatusBadge } from "@/components/ui";
import type { ConversationListItem } from "../types";

export function ConversationList({ items, selectedId }: { readonly items: readonly ConversationListItem[]; readonly selectedId?: string }) {
  return <aside className="conversation-list" aria-labelledby="conversation-list-title">
    <header className="conversation-list__header"><div><p className="section-kicker">Inbox</p><h2 id="conversation-list-title">Conversations</h2></div><span className="conversation-count" aria-label={`${items.length} conversations`}>{items.length}</span></header>
    <SearchInput id="conversation-search" label="Search conversations" placeholder="Name or message" readOnly description="Fixture view; live search is unavailable." />
    <div className="conversation-filters" aria-label="Conversation filters"><span className="conversation-filter conversation-filter--active">All</span><span className="conversation-filter">Attention</span><span className="conversation-filter">Waiting Human</span></div>
    <nav aria-label="Conversation list"><ul className="conversation-items">{items.map((item) => { const selected = item.id === selectedId; return <li key={item.id}><Link className={`conversation-row ${selected ? "conversation-row--selected" : ""}`.trim()} href={`/conversations/${item.id}`} aria-current={selected ? "page" : undefined}><span className="conversation-row__top"><strong>{item.participant}</strong><time>{item.time}</time></span><span className="conversation-row__preview">{item.preview}</span><span className="conversation-row__meta"><span>{item.channel}</span><span>{item.handler}</span></span><span className="conversation-row__status"><StatusBadge state={item.state} />{item.unread ? <span className="unread-label">Unread</span> : <span>Read</span>}</span></Link></li>; })}</ul></nav>
  </aside>;
}
