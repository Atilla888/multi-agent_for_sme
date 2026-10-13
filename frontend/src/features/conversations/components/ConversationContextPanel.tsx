import Link from "next/link";
import { Badge, Card, CardContent, CardHeader, CardTitle, ContextHelper, StatusBadge } from "@/components/ui";
import type { ConversationWorkspace } from "../types";

export function ConversationContextPanel({ workspace }: { readonly workspace: ConversationWorkspace }) {
  return <aside className="conversation-context" aria-labelledby="context-title">
    <Card><CardHeader><div><p className="section-kicker">Verified context</p><CardTitle id="context-title">Case context</CardTitle></div><Badge tone="information">Demo fixture</Badge></CardHeader><CardContent><dl className="context-facts">{workspace.facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd><strong>{fact.value}</strong><span>{fact.source}</span><small>{fact.freshness}</small></dd></div>)}</dl></CardContent></Card>
    <Card><CardHeader><CardTitle>Handler and safety</CardTitle><StatusBadge state={workspace.state} /></CardHeader><CardContent className="context-stack"><p><strong>{workspace.handler}</strong> is the only active owner shown in this scenario.</p><ContextHelper>Visible context never grants backend access. Every future deep link must be reauthorized and refetched.</ContextHelper>{workspace.escalation ? <Link className="context-link" href={`/escalations?case=${workspace.escalation.id}`}>{workspace.escalation.label} · {workspace.escalation.id}</Link> : null}</CardContent></Card>
  </aside>;
}
