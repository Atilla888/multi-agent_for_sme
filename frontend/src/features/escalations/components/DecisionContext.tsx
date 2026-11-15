import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button, Card, CardContent, CardHeader, CardTitle, ContextHelper, StateNotice, StatusBadge } from "@/components/ui";
import type { DecisionLine, EscalationDetail } from "../types";

/** One review case: what happened, what is known, what is uncertain, and what to do. */
export function DecisionContext({ detail }: { readonly detail: EscalationDetail }) {
  const t = useTranslations("escalations");
  const lineText = (line: DecisionLine) => {
    if (line.key === "orderExists") return t("lines.orderExists", { orderId: line.orderId });
    if (line.key === "checkStockRecords") return t("lines.checkStockRecords", { reference: line.reference });
    if (line.key === "belongsToCase") return t("lines.belongsToCase", { conversationId: line.conversationId, orderId: line.orderId });
    return t(`lines.${line.key}`);
  };
  const meta = [detail.participant, detail.orderId ? t("order", { orderId: detail.orderId }) : null, detail.time === "Yesterday" ? t("yesterday") : detail.time].filter(Boolean).join(" · ");
  return <section className="decision-context" aria-labelledby="decision-context-title"><header className="decision-context__header"><div><p className="section-kicker">{t("case.kicker", { id: detail.id })}</p><h2 id="decision-context-title">{t(`reasons.${detail.reasonKey}`)}</h2><p>{meta}</p></div><StatusBadge state={detail.state} /><dl className="workspace-metadata"><div><dt>{t("case.conversation")}</dt><dd><Link className="context-link" href={`/conversations/${detail.conversationId}`}>{t("case.openConversation")}</Link></dd></div><div><dt>{t("case.handledBy")}</dt><dd>{t(`handlers.${detail.handler}`)}</dd></div><div><dt>{t("case.situation")}</dt><dd>{t(`situations.${detail.situation}`)}</dd></div></dl></header>
    {detail.state === "outcome-unknown" ? <StateNotice state="outcome-unknown" title={t("notices.outcomeUnknown.title")} description={t("notices.outcomeUnknown.description")} /> : null}
    {detail.state === "waiting-human" ? <StateNotice state="waiting-human" title={t("notices.waitingHuman.title")} description={t("notices.waitingHuman.description")} /> : null}
    {detail.m12Target ? <StateNotice state="target-only" title={t("notices.resumeUnavailable.title")} description={t("notices.resumeUnavailable.description")} /> : null}
    <ol className="decision-sections">{detail.sections.map((section, index) => <li key={section.id}><Card className={`decision-step decision-step--${section.id}`}><CardHeader><span className="decision-step__number" aria-hidden="true">{index + 1}</span><CardTitle>{t(`sections.${section.id}`)}</CardTitle></CardHeader><CardContent><ul>{section.lines.map((line) => <li key={line.key}>{lineText(line)}</li>)}</ul></CardContent></Card></li>)}</ol>
    <footer className="decision-actions"><ContextHelper>{t("actions.helper")}</ContextHelper><div className="decision-actions__buttons"><Button disabled variant="secondary">{t("actions.assign")}</Button><Button disabled>{detail.m12Target ? t("actions.resume") : t("actions.record")}</Button></div></footer>
  </section>;
}
