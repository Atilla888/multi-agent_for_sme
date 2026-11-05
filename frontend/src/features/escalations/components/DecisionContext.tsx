import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, ContextHelper, StateNotice, StatusBadge } from "@/components/ui";
import type { EscalationDetail } from "../types";

/** One review case: what happened, what is known, what is uncertain, and what to do. */
export function DecisionContext({ detail }: { readonly detail: EscalationDetail }) {
  return <section className="decision-context" aria-labelledby="decision-context-title"><header className="decision-context__header"><div><p className="section-kicker">Case {detail.id}</p><h2 id="decision-context-title">{detail.reason}</h2><p>{detail.participant}{detail.orderId ? ` · Order ${detail.orderId}` : ""} · {detail.time}</p></div><StatusBadge state={detail.state} /><dl className="workspace-metadata"><div><dt>Conversation</dt><dd><Link className="context-link" href={`/conversations/${detail.conversationId}`}>Open conversation</Link></dd></div><div><dt>Handled by</dt><dd>{detail.handler}</dd></div><div><dt>Situation</dt><dd>{detail.safetyLabel}</dd></div></dl></header>
    {detail.state === "outcome-unknown" ? <StateNotice state="outcome-unknown" title="Check the stock records before anything else" description="The reservation may have gone through, but no confirmation came back. Checking first avoids reserving the same stock twice." /> : null}
    {detail.state === "waiting-human" ? <StateNotice state="waiting-human" title="Waiting for a person" description="Automatic handling stopped. Nothing continues until someone on your team decides." /> : null}
    {detail.m12Target ? <StateNotice state="target-only" title="Resuming automatically is not available yet" description="This case can be reviewed, but the option to resume the automated work is still planned." /> : null}
    <ol className="decision-sections">{detail.sections.map((section, index) => <li key={section.title}><Card className={`decision-step decision-step--${section.title.toLowerCase().replaceAll(" ", "-")}`}><CardHeader><span className="decision-step__number" aria-hidden="true">{index + 1}</span><CardTitle>{section.title}</CardTitle></CardHeader><CardContent><ul>{section.lines.map((line) => <li key={line}>{line}</li>)}</ul></CardContent></Card></li>)}</ol>
    <footer className="decision-actions"><ContextHelper>Assigning and recording decisions from this screen are not available yet. Use your team’s usual process for now.</ContextHelper><div className="decision-actions__buttons"><Button disabled variant="secondary">Assign to someone</Button><Button disabled>{detail.m12Target ? "Resume automatically" : "Record decision"}</Button></div></footer>
  </section>;
}
