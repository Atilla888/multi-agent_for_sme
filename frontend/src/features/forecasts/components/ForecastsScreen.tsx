import Link from "next/link";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Card, CardContent, CardHeader, CardTitle, StateNotice, StatusBadge } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import type { ForecastScreenModel } from "../types";

/** Forecasts: not ready yet. The screen says what is missing and where to look in the meantime. */
export function ForecastsScreen({ model }: { readonly model: ForecastScreenModel }) {
  const t = useTranslations("forecasts");
  return <div className="feature-page business-screen forecasts-screen">
    <PageHeader title={t("title")} description={t("description")} />
    <section className="forecast-current-banner" role="note" aria-labelledby="forecast-banner-title"><span className="forecast-current-banner__icon" aria-hidden="true"><Icon name="info" size={16} /></span><div><h2 id="forecast-banner-title">{t("banner.title")}</h2><p>{t("banner.body")}</p><StatusBadge state="model-not-ready" /></div><Link className="button button--secondary" href="/analytics">{t("banner.openReports")}</Link></section>
    {model.state === "restricted" ? <StateNotice state="permission-denied" title={t("restricted.title")} description={t("restricted.description")} /> : <ForecastNotReady />}
  </div>;
}

const missingParts = ["model", "history", "prediction"] as const;
const previewPoints = ["lines", "scope", "confidence", "made"] as const;

function ForecastNotReady() {
  const t = useTranslations("forecasts");
  return <>
    <section className="forecast-readiness-grid" aria-label={t("missing.title")}>
      <Card className="forecast-readiness-card"><CardHeader><CardTitle>{t("missing.title")}</CardTitle><StatusBadge state="model-not-ready" /></CardHeader><CardContent><dl className="business-facts">
        {missingParts.map((part) => <div key={part}><dt>{t(`missing.${part}.label`)}</dt><dd><strong>{t(`missing.${part}.value`)}</strong><span>{t(`missing.${part}.note`)}</span></dd></div>)}
      </dl></CardContent></Card>
      <Card className="forecast-request-card"><CardHeader><CardTitle>{t("request.title")}</CardTitle></CardHeader><CardContent><p>{t("request.body")}</p><Button disabled>{t("request.button")}</Button><p className="rule-note">{t("request.unavailable")}</p></CardContent></Card>
    </section>
    <Card className="forecast-target-boundary"><CardHeader><CardTitle>{t("preview.title")}</CardTitle><StatusBadge state="target-only" /></CardHeader><CardContent>
      <ul className="forecast-requirements">{previewPoints.map((point) => <li key={point}>{t(`preview.${point}`)}</li>)}</ul>
      <p className="rule-note">{t("preview.note")}</p>
    </CardContent></Card>
  </>;
}
