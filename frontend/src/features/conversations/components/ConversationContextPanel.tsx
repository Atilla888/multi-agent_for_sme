import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, ContextHelper, StatusBadge } from "@/components/ui";
import type { ConversationWorkspace } from "../types";

export function ConversationContextPanel({ workspace }: { readonly workspace: ConversationWorkspace }) {
  return <aside className="conversation-context" aria-labelledby="context-title">
    <Card><CardHeader><CardTitle id="context-title">Details</CardTitle></CardHeader><CardContent><dl className="context-facts">{workspace.facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd><strong>{fact.value}</strong><span>{fact.source}</span>{fact.freshness ? <small>{fact.freshness}</small> : null}</dd></div>)}</dl></CardContent></Card>
    <Card><CardHeader><CardTitle>Who is handling this</CardTitle><StatusBadge state={workspace.state} /></CardHeader><CardContent className="context-stack"><p><strong>{workspace.handler}</strong> is handling this conversation.</p><ContextHelper>Access is checked on every action, not by what is visible here.</ContextHelper>{workspace.escalation ? <Link className="context-link" href={`/escalations?case=${workspace.escalation.id}`}>{workspace.escalation.label} {workspace.escalation.id}</Link> : null}</CardContent></Card>
  </aside>;
}
