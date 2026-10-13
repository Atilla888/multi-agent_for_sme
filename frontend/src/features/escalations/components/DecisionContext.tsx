import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, ContextHelper, StateNotice, StatusBadge } from "@/components/ui";
import type { EscalationDetail } from "../types";

export function DecisionContext({ detail }: { readonly detail: EscalationDetail }) {
  return <section className="decision-context" aria-labelledby="decision-context-title"><header className="decision-context__header"><div><p className="section-kicker">Decision context</p><h2 id="decision-context-title">{detail.id} · {detail.participant}</h2><p>{detail.reason}</p></div><StatusBadge state={detail.state} /><dl className="workspace-metadata"><div><dt>Related conversation</dt><dd><Link className="context-link" href={`/conversations/${detail.conversationId}`}>{detail.conversationId}</Link></dd></div><div><dt>Current handler</dt><dd>{detail.handler}</dd></div><div><dt>Safety</dt><dd>{detail.safetyLabel}</dd></div></dl></header>
    {detail.state === "outcome-unknown" ? <StateNotice state="outcome-unknown" title="Reconciliation required before continuation" description="The mutation may have committed and confirmation is unavailable. Reconcile authoritative reservation state; no blind retry." /> : null}
    {detail.state === "waiting-human" ? <StateNotice state="waiting-human" title="WAITING_HUMAN" description="Automation stopped. A human owner or decision is pending; no work is resumed automatically." /> : null}
    {detail.m12Target ? <StateNotice state="target-only" title="M12 durable Resume · TARGET / NOT STARTED" description="This approved visual state has no current backend call, persistence, or successful transition." /> : null}
    <div className="decision-sections">{detail.sections.map((section) => <Card key={section.title}><CardHeader><CardTitle>{section.title}</CardTitle></CardHeader><CardContent><ul>{section.lines.map((line) => <li key={line}>{line}</li>)}</ul></CardContent></Card>)}</div>
    <footer className="decision-actions"><ContextHelper>Backend authorization remains decisive. P5C exposes no business mutation, assignment, reconciliation, or Resume command.</ContextHelper><div className="decision-actions__buttons"><Button disabled variant="secondary">Assign operator</Button><Button disabled>{detail.m12Target ? "Request controlled Resume · TARGET" : "Record decision"}</Button></div></footer>
  </section>;
}
