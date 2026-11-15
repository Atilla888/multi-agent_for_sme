import { useLocale, useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, LoadingState, StateNotice, StatusBadge, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import type { AuditEventView, AuditScreenModel } from "../types";
import { formatWhen } from "./format";

/** An entry's who / what / result / when in the chosen language. */
function useAuditWords() {
  const t = useTranslations("administration");
  const states = useTranslations("states");
  const locale = useLocale();
  return (event: AuditEventView) => ({
    actor: t(`audit.actors.${event.actor}`),
    action: t(`audit.actions.${event.action}`),
    resource: event.resource.type === "order" ? t("audit.resources.order", { ref: event.resource.ref }) : t("audit.resources.reservation", { ref: event.resource.ref }),
    result: event.result === "blocked-by-policy" ? t("blockedByPolicy") : states(`${event.result}.label`),
    provenance: t(`audit.provenance.${event.provenance}`),
    summary: t(`audit.summaries.${event.summary}`),
    when: formatWhen(event.occurredAt, locale),
  });
}

function AuditDetail({ event }: { readonly event: AuditEventView }) {
  const t = useTranslations("administration.audit");
  const words = useAuditWords()(event);
  return <Card className="admin-detail-card" aria-labelledby="audit-detail-title"><CardHeader><div><p className="card__label">{t("selected")}</p><CardTitle id="audit-detail-title">{words.action}</CardTitle></div><StatusBadge state={event.badge} /></CardHeader><CardContent><dl className="admin-facts admin-facts--detail"><div><dt>{t("who")}</dt><dd><strong>{words.actor}</strong><span>{event.scope}</span></dd></div><div><dt>{t("what")}</dt><dd><strong>{words.resource}</strong></dd></div><div><dt>{t("result")}</dt><dd><strong>{words.result}</strong><span>{words.summary}</span></dd></div><div><dt>{t("when")}</dt><dd><strong>{words.when}</strong></dd></div><div><dt>{t("reference")}</dt><dd><strong>{event.id}</strong><span>{event.correlationRef} · {words.provenance}</span></dd></div></dl></CardContent></Card>;
}

function AuditBoundary({ model }: { readonly model: AuditScreenModel }) {
  const t = useTranslations("administration");
  const shell = useTranslations("shell");
  const wordsFor = useAuditWords();
  if (model.state === "loading") return <LoadingState label={t("audit.loading")} lines={6} />;
  if (model.state === "restricted") return <StateNotice state="permission-denied" title={t("audit.restricted")} description={t("ownersOnly")} />;
  if (model.state === "unavailable") return <StateNotice state="dependency-unavailable" title={t("audit.unavailable.title")} description={t("audit.unavailable.description")} />;
  if (model.state === "empty" || model.items.length === 0) return <StateNotice state="valid-empty" title={t("audit.empty.title")} description={t("audit.empty.description")} />;
  return <div className="admin-list-detail"><Table scrollLabel={shell("nav.activityLog")} className="admin-table"><TableCaption className="sr-only">{t("audit.caption")}</TableCaption><TableHeader><TableRow><TableHead>{t("audit.when")}</TableHead><TableHead>{t("audit.who")}</TableHead><TableHead>{t("audit.what")}</TableHead><TableHead>{t("audit.result")}</TableHead><TableHead>{t("audit.reference")}</TableHead></TableRow></TableHeader><TableBody>{model.items.map((event) => {
    const words = wordsFor(event);
    return <TableRow key={event.id}><TableCell><strong>{words.when}</strong><span className="table-cell-note">{event.id}</span></TableCell><TableCell>{words.actor}<span className="table-cell-note">{event.scope}</span></TableCell><TableCell>{words.action}<span className="table-cell-note">{words.resource}</span></TableCell><TableCell><StatusBadge state={event.badge} /><span className="table-cell-note">{words.result}</span></TableCell><TableCell className="muted-copy">{event.correlationRef}</TableCell></TableRow>;
  })}</TableBody></Table>{model.selected ? <AuditDetail event={model.selected} /> : null}</div>;
}

/** Activity log: who did what, when, and the result. */
export function AuditScreen({ model }: { readonly model: AuditScreenModel }) {
  const t = useTranslations("administration.audit.search");
  const shell = useTranslations("shell");
  return <div className="feature-page admin-screen audit-screen"><PageHeader title={shell("nav.activityLog")} source="sample" />{model.state === "fixture" ? <form className="admin-filter" action="/audit" method="get"><input type="hidden" name="state" value="fixture" /><Input id="audit-search" name="q" label={t("label")} defaultValue={model.query} placeholder={t("placeholder")} /><Button type="submit" variant="secondary">{t("submit")}</Button></form> : null}<AuditBoundary model={model} /></div>;
}
