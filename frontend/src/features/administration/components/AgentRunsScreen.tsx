import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, LoadingState, StateNotice, StatusBadge } from "@/components/ui";
import type { AgentRunView, AgentRunsScreenModel } from "../types";

function RunList({ model }: { readonly model: AgentRunsScreenModel }) {
  return <aside className="agent-run-list" aria-label="AI runs"><div className="admin-panel-heading"><h2>Runs</h2></div>{model.items.map((run) => <Link className={`agent-run-row ${model.selected?.id === run.id ? "agent-run-row--active" : ""}`} href={`/agent-runs?state=fixture&run=${run.id}`} key={run.id}><span><strong>{run.role}</strong><small>{run.id}</small></span><StatusBadge state={run.status} /><small>{run.startedAt}</small></Link>)}</aside>;
}

function RunDetail({ run }: { readonly run: AgentRunView }) {
  return <section className="agent-run-detail" aria-labelledby="agent-run-detail-title"><header className="admin-panel-heading"><div><p className="card__label">Run {run.id}</p><h2 id="agent-run-detail-title">{run.role}</h2><p>Started {run.startedAt}</p></div><StatusBadge state={run.status} /></header><div className="agent-run-summary-grid"><Card><CardHeader><CardTitle>Who handled it</CardTitle></CardHeader><CardContent><dl className="admin-facts"><div><dt>Agent</dt><dd><strong>{run.role}</strong></dd></div><div><dt>Now with</dt><dd><strong>{run.currentHandler}</strong><span>{run.previousHandler ? `Before that: ${run.previousHandler}` : "Handled from the start"}</span></dd></div><div><dt>Tool used</dt><dd><strong>{run.toolName}</strong><span>Only the name of the tool is shown, never its inputs.</span></dd></div><div><dt>Status</dt><dd><strong>{run.statusLabel}</strong><span>{run.stopReason}</span></dd></div></dl></CardContent></Card><Card><CardHeader><CardTitle>Model</CardTitle></CardHeader><CardContent><dl className="admin-facts"><div><dt>Provider</dt><dd><strong>{run.modelProvider}</strong><span>{run.modelStatus}</span></dd></div><div><dt>Response time</dt><dd><strong>{run.latency}</strong></dd></div><div><dt>Usage</dt><dd><strong>{run.usage}</strong></dd></div></dl></CardContent></Card></div><ol className="agent-run-timeline" aria-label="Steps">{run.steps.map((step) => <li key={step.id}><div className="agent-run-step-marker" aria-hidden="true" /><div className="agent-run-step-content"><header><span>{step.phase}</span><StatusBadge state={step.status} /></header><h3>{step.title}</h3><p>{step.safeSummary}</p>{step.reference ? <small>Reference: {step.reference}</small> : null}</div></li>)}</ol><StateNotice state="target-only" title="Resuming paused runs is not available yet" description="This is a read-only record. Nothing here can replay or change what the agent did." /></section>;
}

function AgentRunsBoundary({ model }: { readonly model: AgentRunsScreenModel }) {
  if (model.state === "loading") return <LoadingState label="Loading AI activity" lines={6} />;
  if (model.state === "restricted") return <StateNotice state="permission-denied" title="You don't have access to AI activity" description="Only owners and administrators can see it. Nothing about its contents is shown." />;
  if (model.state === "unavailable") return <StateNotice state="dependency-unavailable" title="AI activity can't be loaded right now" description="No outcome is guessed while the record is unavailable." />;
  if (model.state === "empty" || !model.selected) return <StateNotice state="valid-empty" title="No AI activity yet" description="Runs will appear here once the agents start handling conversations." />;
  return <div className="agent-runs-layout"><RunList model={model} /><RunDetail run={model.selected} /></div>;
}

/** AI activity: what the agents did, step by step, in plain terms. */
export function AgentRunsScreen({ model }: { readonly model: AgentRunsScreenModel }) {
  return <div className="feature-page admin-screen agent-runs-screen"><PageHeader title="AI activity" description="What the AI agents did, step by step. Agents can only propose; the system checks and carries out just what is allowed." source="sample" /><AgentRunsBoundary model={model} /></div>;
}
