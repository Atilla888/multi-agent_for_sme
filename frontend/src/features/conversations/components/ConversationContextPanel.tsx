import Link from "next/link";
import { useTranslations } from "next-intl";
import { Avatar, Badge, ContextHelper, StatusBadge } from "@/components/ui";
import type { ContextFactFreshness, ContextFactValue, ConversationWorkspace } from "../types";
import { actorKey, isAgent } from "../agents";

/** The details panel: who and how first, then the order and stock facts with their source. */
export function ConversationContextPanel({ workspace }: { readonly workspace: ConversationWorkspace }) {
  const t = useTranslations("conversations");
  const handler = t(`actors.${actorKey[workspace.handler]}`);
  const value = (fact: ContextFactValue) => {
    if ("record" in fact) return fact.record;
    if (fact.key === "orderCreated") return t("facts.values.orderCreated", { orderId: fact.orderId });
    if (fact.key === "stockUnits") return t("facts.values.stockUnits", { count: fact.count });
    return t(`facts.values.${fact.key}`);
  };
  const freshness = (fact: ContextFactFreshness | undefined) => {
    if (!fact) return "";
    return fact.key === "seenAt" ? t("facts.freshness.seenAt", { time: fact.time }) : t(`facts.freshness.${fact.key}`);
  };
  return <aside className="conversation-context details-panel" aria-labelledby="context-title">
    <section className="details-panel__group">
      <h3 id="context-title">{t("details.title")}</h3>
      <dl className="details-grid">
        <div><dt>{t("details.status")}</dt><dd><StatusBadge state={workspace.state} /></dd></div>
        <div><dt>{t("details.handledBy")}</dt><dd className="details-grid__inline"><Avatar variant={isAgent(workspace.handler) ? "agent" : "person"} accessibleName={handler} colorKey={workspace.handler} initials={t("personInitials")} />{handler}</dd></div>
        <div><dt>{t("details.channel")}</dt><dd><Badge>{workspace.channel}</Badge></dd></div>
      </dl>
      {workspace.escalation ? <Link className="context-link" href={`/escalations?case=${workspace.escalation.id}`}>{t("details.openCase", { id: workspace.escalation.id })}</Link> : null}
    </section>
    <section className="details-panel__group">
      <h3>{t("details.records")}</h3>
      <dl className="details-grid">{workspace.facts.map((fact) => <div key={fact.label}><dt>{t(`facts.labels.${fact.label}`)}</dt><dd><span className="details-grid__value">{value(fact.value)}</span><span className="details-grid__source">{[t(`facts.sources.${fact.source}`), freshness(fact.freshness)].filter(Boolean).join(" · ")}</span></dd></div>)}</dl>
    </section>
    <ContextHelper>{t("details.accessNote")}</ContextHelper>
  </aside>;
}
