import Link from "next/link";
import { Badge, StatusBadge } from "@/components/ui";
import { avatarHue } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { initials } from "@/components/layout/sessionDisplay";
import type { ConversationListItem } from "../types";

export function ConversationList({ items, selectedId }: { readonly items: readonly ConversationListItem[]; readonly selectedId?: string }) {
  return <aside className="conversation-list" aria-labelledby="conversation-list-title">
    <header className="conversation-list__header"><h2 id="conversation-list-title">Conversations</h2><span className="conversation-count" aria-label={`${items.length} conversations`}>{items.length}</span></header>
    <div className="toolbar-search" aria-disabled="true" title="Search is not available yet"><Icon name="search" size={14} /><input id="conversation-search" type="search" placeholder="Search by name or message" readOnly aria-label="Search conversations (not available yet)" /></div>
    <div className="conversation-filters" aria-label="Filter conversations"><span className="filter-chip filter-chip--active">All <span className="filter-chip__count">{items.length}</span></span><span className="filter-chip">Needs attention</span><span className="filter-chip">Unread</span></div>
    <nav aria-label="Conversation list"><ul className="conversation-items">{items.map((item) => {
      const selected = item.id === selectedId;
      return <li key={item.id}><Link className={`conversation-row ${selected ? "conversation-row--selected" : ""}`.trim()} href={`/conversations/${item.id}`} aria-current={selected ? "page" : undefined}>
        <span className={`avatar avatar--hue-${avatarHue(item.participant)} conversation-row__avatar`} aria-hidden="true">{initials(item.participant)}</span>
        <span className="conversation-row__top"><strong>{item.participant}</strong><time>{item.time}</time></span>
        <span className="conversation-row__preview">{item.preview}</span>
        <span className="conversation-row__meta"><Badge>{item.channel}</Badge><StatusBadge state={item.state} />{item.unread ? <span className="unread-label">Unread</span> : null}</span>
      </Link></li>;
    })}</ul></nav>
  </aside>;
}
