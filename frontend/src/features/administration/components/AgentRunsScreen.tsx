import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, LoadingState, StateNotice, StatusBadge } from "@/components/ui";
import type { AgentRunHandler, AgentRunView, AgentRunsScreenModel } from "../types";
import { formatSeconds, formatWhen } from "./format";

/** An agent or a person on the team, in the chosen language. */
function useHandlerName(): (handler: AgentRunHandler) => string {
  const t = useTranslations("administration.runs");
  return (handler) => handler === "human-operator" ? t("humanOperator") : t(`roles.${handler}`);
}

function RunList({ model }: { readonly model: AgentRunsScreenModel }) {
  const t = useTranslations("administration.runs");
  const locale = useLocale();
  return <aside className="agent-run-list" aria-label={t("listLabel")}><div className="admin-panel-heading"><h2>{t("listHeading")}</h2></div>{model.items.map((run) => <Link className={`agent-run-row ${model.selected?.id === run.id ? "agent-run-row--active" : ""}`} href={`/agent-runs?state=fixture&run=${run.id}`} key={run.id}><span><strong>{t(`roles.${run.role}`)}</strong><small>{run.id}</small></span><StatusBadge state={run.status} /><small>{formatWhen(run.startedAt, locale)}</small></Link>)}</aside>;
}

function RunDetail({ run }: { readonly run: AgentRunView }) {
  const t = useTranslations("administration.runs");
  const admin = useTranslations("administration");
  const states = useTranslations("states");
  const locale = useLocale();
  const handlerName = useHandlerName();
  const role = t(`roles.${run.role}`);
  const outcome = run.outcome === "completed" ? t("completed") : states(`${run.outcome}.label`);
  const latency = run.latencyMs === null ? t("notRecorded") : formatSeconds(run.latencyMs, locale);
  const usage = run.usageTokens === null ? t("notRecorded") : t("tokens", { count: run.usageTokens });
  return <section className="agent-run-detail" aria-labelledby="agent-run-detail-title"><header className="admin-panel-heading"><div><p className="card__label">{t("run", { id: run.id })}</p><h2 id="agent-run-detail-title">{role}</h2><p>{t("started", { time: formatWhen(run.startedAt, locale) })}</p></div><StatusBadge state={run.status} /></header><div className="agent-run-summary-grid"><Card><CardHeader><CardTitle>{t("whoHandled")}</CardTitle></CardHeader><CardContent><dl className="admin-facts"><div><dt>{t("agent")}</dt><dd><strong>{role}</strong></dd></div><div><dt>{t("nowWith")}</dt><dd><strong>{handlerName(run.currentHandler)}</strong><span>{run.previousHandler ? t("before", { handler: handlerName(run.previousHandler) }) : t("fromStart")}</span></dd></div><div><dt>{t("toolUsed")}</dt><dd><strong>{t(`tools.${run.tool}`)}</strong><span>{t("toolNote")}</span></dd></div><div><dt>{admin("status")}</dt><dd><strong>{outcome}</strong><span>{t(`stopReasons.${run.stopReason}`)}</span></dd></div></dl></CardContent></Card><Card><CardHeader><CardTitle>{t("model")}</CardTitle></CardHeader><CardContent><dl className="admin-facts"><div><dt>{t("provider")}</dt><dd><strong>{t("inDevelopment", { provider: run.modelProvider })}</strong><span>{t("notApproved")}</span></dd></div><div><dt>{t("responseTime")}</dt><dd><strong>{latency}</strong></dd></div><div><dt>{t("usage")}</dt><dd><strong>{usage}</strong></dd></div></dl></CardContent></Card></div><ol className="agent-run-timeline" aria-label={t("steps")}>{run.steps.map((step) => <li key={step.id}><div className="agent-run-step-marker" aria-hidden="true" /><div className="agent-run-step-content"><header><span>{t(`phases.${step.phase}`)}</span><StatusBadge state={step.status} /></header><h3>{t(`stepTitles.${step.title}`)}</h3><p>{t(`stepSummaries.${step.summary}`)}</p>{step.reference ? <small>{t("reference", { ref: step.reference })}</small> : null}</div></li>)}</ol><StateNotice state="target-only" title={t("noResume.title")} description={t("noResume.description")} /></section>;
}

function AgentRunsBoundary({ model }: { readonly model: AgentRunsScreenModel }) {
  const t = useTranslations("administration");
  if (model.state === "loading") return <LoadingState label={t("runs.loading")} lines={6} />;
  if (model.state === "restricted") return <StateNotice state="permission-denied" title={t("runs.restricted")} description={t("ownersOnly")} />;
  if (model.state === "unavailable") return <StateNotice state="dependency-unavailable" title={t("runs.unavailable.title")} description={t("runs.unavailable.description")} />;
  if (model.state === "empty" || !model.selected) return <StateNotice state="valid-empty" title={t("runs.empty.title")} description={t("runs.empty.description")} />;
  return <div className="agent-runs-layout"><RunList model={model} /><RunDetail run={model.selected} /></div>;
}

/** AI activity: what the agents did, step by step, in plain terms. */
export function AgentRunsScreen({ model }: { readonly model: AgentRunsScreenModel }) {
  const t = useTranslations("administration.runs");
  const shell = useTranslations("shell");
  return <div className="feature-page admin-screen agent-runs-screen"><PageHeader title={shell("nav.aiActivity")} description={t("description")} source="sample" /><AgentRunsBoundary model={model} /></div>;
}
