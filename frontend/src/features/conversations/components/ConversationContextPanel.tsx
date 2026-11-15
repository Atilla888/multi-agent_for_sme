import Link from "next/link";
import { Avatar, Badge, ContextHelper, StatusBadge } from "@/components/ui";
import type { ConversationWorkspace } from "../types";
import { isAgent } from "../agents";

/** The details panel: who and how first, then the order and stock facts with their source. */
export function ConversationContextPanel({ workspace }: { readonly workspace: ConversationWorkspace }) {
  return <aside className="conversation-context details-panel" aria-labelledby="context-title">
    <section className="details-panel__group">
      <h3 id="context-title">Details</h3>
      <dl className="details-grid">
        <div><dt>Status</dt><dd><StatusBadge state={workspace.state} /></dd></div>
        <div><dt>Handled by</dt><dd className="details-grid__inline"><Avatar variant={isAgent(workspace.handler) ? "agent" : "person"} accessibleName={workspace.handler} initials="HO" />{workspace.handler}</dd></div>
        <div><dt>Channel</dt><dd><Badge>{workspace.channel}</Badge></dd></div>
      </dl>
      {workspace.escalation ? <Link className="context-link" href={`/escalations?case=${workspace.escalation.id}`}>{workspace.escalation.label} {workspace.escalation.id}</Link> : null}
    </section>
    <section className="details-panel__group">
      <h3>Records</h3>
      <dl className="details-grid">{workspace.facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd><span className="details-grid__value">{fact.value}</span><span className="details-grid__source">{[fact.source, fact.freshness].filter(Boolean).join(" · ")}</span></dd></div>)}</dl>
    </section>
    <ContextHelper>Access is checked on every action, not by what is visible here.</ContextHelper>
  </aside>;
}
