import Link from "next/link";
import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import type { EscalationSummary } from "../types";

export function EscalationQueue({ items, selectedId }: { readonly items: readonly EscalationSummary[]; readonly selectedId: string }) {
  const t = useTranslations("escalations");
  const scenarioById = { "ESC-204": "waiting-human", "ESC-205": "restricted", "ESC-206": "known-failure" } as const;
  const meta = (item: EscalationSummary) => [item.participant, item.orderId ? t("order", { orderId: item.orderId }) : null, item.time === "Yesterday" ? t("yesterday") : item.time].filter(Boolean).join(" · ");
  return <aside className="escalation-queue" aria-labelledby="escalation-queue-title"><header className="escalation-queue__header"><h2 id="escalation-queue-title">{t("queue.title")}</h2><span className="conversation-count">{items.length}</span></header><div className="toolbar-search" aria-disabled="true" title={t("queue.searchUnavailable")}><Icon name="search" size={16} /><input id="escalation-search" type="search" placeholder={t("queue.searchPlaceholder")} readOnly aria-label={t("queue.searchLabel")} /></div><div className="conversation-filters" aria-label={t("queue.filtersLabel")}><span className="filter-chip filter-chip--active">{t("queue.filters.open")} <span className="filter-chip__count">{items.length}</span></span><span className="filter-chip">{t("queue.filters.waiting")}</span><span className="filter-chip">{t("queue.filters.resolved")}</span></div><nav aria-label={t("queue.title")}><ul className="escalation-items">{items.map((item) => <li key={item.id}><Link className={`escalation-row ${item.id === selectedId ? "escalation-row--selected" : ""}`.trim()} href={`/escalations?scenario=${scenarioById[item.id as keyof typeof scenarioById] ?? "waiting-human"}`} aria-current={item.id === selectedId ? "page" : undefined}><span className="conversation-row__top"><span className="escalation-row__id">{item.id}</span><StatusBadge state={item.state} /></span><strong className="escalation-row__reason">{t(`reasons.${item.reasonKey}`)}</strong><span>{meta(item)}</span></Link></li>)}</ul></nav></aside>;
}
