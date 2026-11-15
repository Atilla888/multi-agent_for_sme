import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Card, CardContent, CardHeader, CardTitle, LoadingState, StateNotice, StatusBadge } from "@/components/ui";
import type { IntegrationView, IntegrationsScreenModel } from "../types";

function IntegrationCard({ item }: { readonly item: IntegrationView }) {
  const t = useTranslations("administration");
  const states = useTranslations("states");
  const observation = item.observation === "not-configured" ? states("not-configured.label") : t("integrations.notConnected");
  const impact = item.capability === "customer-messages" ? t("integrations.uses.customer-messages.impact", { channel: item.channel }) : t("integrations.uses.website-chat.impact");
  return <Card className="admin-card integration-card"><CardHeader><div><p className="card__label">{t("integrations.channel")}</p><CardTitle>{item.channel}</CardTitle></div><StatusBadge state={item.readiness === "NOT_CONFIGURED" ? "not-configured" : "not-available"} /></CardHeader><CardContent><dl className="admin-facts"><div><dt>{t("status")}</dt><dd><strong>{observation}</strong></dd></div><div><dt>{t("integrations.usedFor")}</dt><dd><strong>{t(`integrations.uses.${item.capability}.label`)}</strong><span>{impact}</span></dd></div><div><dt>{t("integrations.lastChecked")}</dt><dd><strong>{t("integrations.never")}</strong><span>{t("integrations.neverTested")}</span></dd></div></dl><div className="admin-disabled-actions"><Button disabled>{t("integrations.connect")}</Button><Button variant="secondary" disabled>{t("integrations.testConnection")}</Button></div></CardContent></Card>;
}

function IntegrationsBoundary({ model }: { readonly model: IntegrationsScreenModel }) {
  const t = useTranslations("administration");
  const shell = useTranslations("shell");
  if (model.state === "loading") return <LoadingState label={t("integrations.loading")} lines={5} />;
  if (model.state === "restricted") return <StateNotice state="permission-denied" title={t("integrations.restricted")} description={t("askForAccess")} />;
  if (model.state === "unavailable") return <StateNotice state="dependency-unavailable" title={t("integrations.unavailable.title")} description={t("integrations.unavailable.description")} />;
  if (model.state === "empty") return <StateNotice state="valid-empty" title={t("integrations.empty.title")} description={t("integrations.empty.description")} />;
  return <section className="admin-card-grid" aria-label={shell("nav.channels")}>{model.items.map((item) => <IntegrationCard item={item} key={item.id} />)}</section>;
}

/** Channels: where customers can reach you. */
export function IntegrationsScreen({ model }: { readonly model: IntegrationsScreenModel }) {
  const t = useTranslations("administration.integrations");
  const shell = useTranslations("shell");
  return <div className="feature-page admin-screen integrations-screen"><PageHeader title={shell("nav.channels")} description={t("description")} source="sample" /><StateNotice state="not-configured" title={t("noneConnected.title")} description={t("noneConnected.description")} /><IntegrationsBoundary model={model} /></div>;
}
