import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, LoadingState, StateNotice, StatusBadge, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import type { AuditEventView, AuditScreenModel } from "../types";

function AuditDetail({ event }: { readonly event: AuditEventView }) {
  return <Card className="admin-detail-card" aria-labelledby="audit-detail-title"><CardHeader><div><p className="card__label">Selected entry</p><CardTitle id="audit-detail-title">{event.action}</CardTitle></div><StatusBadge state={event.badge} /></CardHeader><CardContent><dl className="admin-facts admin-facts--detail"><div><dt>Who</dt><dd><strong>{event.actor}</strong><span>{event.scope}</span></dd></div><div><dt>What</dt><dd><strong>{event.resource}</strong></dd></div><div><dt>Result</dt><dd><strong>{event.result}</strong><span>{event.safeSummary}</span></dd></div><div><dt>When</dt><dd><strong>{event.occurredAt}</strong></dd></div><div><dt>Reference</dt><dd><strong>{event.id}</strong><span>{event.correlationRef} · {event.provenance}</span></dd></div></dl></CardContent></Card>;
}

function AuditBoundary({ model }: { readonly model: AuditScreenModel }) {
  if (model.state === "loading") return <LoadingState label="Loading the activity log" lines={6} />;
  if (model.state === "restricted") return <StateNotice state="permission-denied" title="You don't have access to the activity log" description="Only owners and administrators can see it. Nothing about its contents is shown." />;
  if (model.state === "unavailable") return <StateNotice state="dependency-unavailable" title="The activity log can't be loaded right now" description="This does not mean nothing happened. Try again in a moment." />;
  if (model.state === "empty" || model.items.length === 0) return <StateNotice state="valid-empty" title="No matching entries" description="Nothing in the log matches this search." />;
  return <div className="admin-list-detail"><Table scrollLabel="Activity log" className="admin-table"><TableCaption className="sr-only">Important actions in your account.</TableCaption><TableHeader><TableRow><TableHead>When</TableHead><TableHead>Who</TableHead><TableHead>What</TableHead><TableHead>Result</TableHead><TableHead>Reference</TableHead></TableRow></TableHeader><TableBody>{model.items.map((event) => <TableRow key={event.id}><TableCell><strong>{event.occurredAt}</strong><span className="table-cell-note">{event.id}</span></TableCell><TableCell>{event.actor}<span className="table-cell-note">{event.scope}</span></TableCell><TableCell>{event.action}<span className="table-cell-note">{event.resource}</span></TableCell><TableCell><StatusBadge state={event.badge} /><span className="table-cell-note">{event.result}</span></TableCell><TableCell className="muted-copy">{event.correlationRef}</TableCell></TableRow>)}</TableBody></Table>{model.selected ? <AuditDetail event={model.selected} /> : null}</div>;
}

/** Activity log: who did what, when, and the result. */
export function AuditScreen({ model }: { readonly model: AuditScreenModel }) {
  return <div className="feature-page admin-screen audit-screen"><PageHeader title="Activity log" description="A record of important actions in your account: who did what, when, and the result." source="sample" />{model.state === "fixture" ? <form className="admin-filter" action="/audit" method="get"><input type="hidden" name="state" value="fixture" /><Input id="audit-search" name="q" label="Search the log" defaultValue={model.query} placeholder="Action, order or person" /><Button type="submit" variant="secondary">Search</Button></form> : null}<AuditBoundary model={model} /></div>;
}
