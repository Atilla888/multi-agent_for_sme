import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, LoadingState, StateNotice, StatusBadge } from "@/components/ui";
import { BusinessFixtureBanner } from "@/features/business";
import type { AgentRunView, AgentRunsScreenModel } from "../types";

function RunList({ model }: { readonly model: AgentRunsScreenModel }) {
  return <aside className="agent-run-list" aria-label="Restricted agent run fixtures"><div className="admin-panel-heading"><p className="card__label">Authorized fixture index</p><h2>Agent runs</h2></div>{model.items.map((run) => <Link className={`agent-run-row ${model.selected?.id === run.id ? "agent-run-row--active" : ""}`} href={`/agent-runs?state=fixture&run=${run.id}`} key={run.id}><span><strong>{run.id}</strong><small>{run.role}</small></span><StatusBadge state={run.status} /><small>{run.startedAt}</small></Link>)}</aside>;
}

function RunDetail({ run }: { readonly run: AgentRunView }) {
  return <section className="agent-run-detail" aria-labelledby="agent-run-detail-title"><header className="admin-panel-heading"><div><p className="card__label">Safe execution-lifecycle summary</p><h2 id="agent-run-detail-title">{run.id}</h2><p>{run.correlationRef}</p></div><StatusBadge state={run.status} /></header><div className="agent-run-summary-grid"><Card><CardHeader><CardTitle>Ownership and stop state</CardTitle></CardHeader><CardContent><dl className="admin-facts"><div><dt>Specialist</dt><dd><strong>{run.role}</strong><span>Bounded specialist role</span></dd></div><div><dt>Current handler</dt><dd><strong>{run.currentHandler}</strong><span>{run.previousHandler ? `Previous: ${run.previousHandler}` : "No previous handler"}</span></dd></div><div><dt>Tool activity</dt><dd><strong>{run.toolName}</strong><span>Safe canonical name only; arguments are withheld.</span></dd></div><div><dt>Status</dt><dd><strong>{run.statusLabel}</strong><span>{run.stopReason}</span></dd></div></dl></CardContent></Card><Card><CardHeader><CardTitle>Safe provider metadata</CardTitle></CardHeader><CardContent><dl className="admin-facts"><div><dt>Provider</dt><dd><strong>{run.modelProvider}</strong><span>{run.modelStatus}</span></dd></div><div><dt>Latency</dt><dd><strong>{run.latency}</strong><span>No estimate is invented.</span></dd></div><div><dt>Usage</dt><dd><strong>{run.usage}</strong><span>No token value is fabricated.</span></dd></div></dl></CardContent></Card></div><ol className="agent-run-timeline" aria-label="Audited system activity">{run.steps.map((step) => <li key={step.id}><div className="agent-run-step-marker" aria-hidden="true" /><div className="agent-run-step-content"><header><span>{step.phase}</span><StatusBadge state={step.status} /></header><h3>{step.title}</h3><p>{step.safeSummary}</p>{step.reference ? <small>Safe reference: {step.reference}</small> : null}</div></li>)}</ol><StateNotice state="target-only" title="Durable Resume is not available" description="M12 remains TARGET / NOT STARTED. This read-only summary offers no replay, mutation, or policy-bypass control." /></section>;
}

function AgentRunsBoundary({ model }: { readonly model: AgentRunsScreenModel }) {
  if (model.state === "loading") return <LoadingState label="Loading authorized run summaries" lines={6} />;
  if (model.state === "restricted") return <StateNotice state="permission-denied" title="Agent Runs access is restricted" description="Run existence, model metadata, tools, and related business facts remain concealed without independent backend authorization." />;
  if (model.state === "unavailable") return <StateNotice state="dependency-unavailable" title="Run evidence is unavailable" description="No model explanation fills a delayed or unavailable trace, and no final outcome is inferred." />;
  if (model.state === "empty" || !model.selected) return <StateNotice state="valid-empty" title="No authorized fixture runs" description="No run is available in this fixture scope. This does not reveal inaccessible execution records." />;
  return <div className="agent-runs-layout"><RunList model={model} /><RunDetail run={model.selected} /></div>;
}

export function AgentRunsScreen({ model }: { readonly model: AgentRunsScreenModel }) {
  return <div className="feature-page admin-screen agent-runs-screen"><PageHeader eyebrow="Administration / Agent Runs" title="Agent Runs" description="Inspect contextual, authorized lifecycle evidence while keeping model proposals separate from trusted effects." /><BusinessFixtureBanner family="Agent Runs" /><StateNotice state="restricted" title="Contextual / restricted" description="Run summaries are not customer content and not a universal Operator destination. Safe lifecycle metadata never replaces Audit evidence or backend authorization." /><AgentRunsBoundary model={model} /></div>;
}
