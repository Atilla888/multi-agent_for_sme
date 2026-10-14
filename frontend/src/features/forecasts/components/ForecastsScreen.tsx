import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Card, CardContent, CardHeader, CardTitle, StateNotice, StatusBadge } from "@/components/ui";
import type { ForecastScreenModel } from "../types";

export function ForecastsScreen({ model }: { readonly model: ForecastScreenModel }) {
  return <div className="feature-page business-screen forecasts-screen">
    <PageHeader eyebrow="Analytics / Forecasts" title="Forecasts" description="Check forecast capability separately from observed historical Analytics." />
    <div className="forecast-current-banner" role="note"><strong>CURRENT ENGINEERING STATE</strong><span>No validated model artifact or forecast result exists.</span></div>
    {model.state === "restricted" ? <StateNotice state="permission-denied" title="Forecast access is restricted" description="Protected request context and any future result provenance remain hidden. Visible navigation does not grant backend access." /> : <ForecastNotReady model={model} />}
    <Card className="forecast-return-card"><CardHeader><div><p className="section-kicker">Safe available path</p><CardTitle>Use historical Analytics</CardTitle></div></CardHeader><CardContent><p>Analytics provides observed ACTUAL confirmed-order facts. It does not become a prediction and cannot replace a forecast model.</p><Link className="context-link" href="/analytics">Open historical Analytics →</Link></CardContent></Card>
  </div>;
}

function ForecastNotReady({ model }: { readonly model: ForecastScreenModel }) {
  const capability = model.capability!;
  return <>
    <StateNotice state="model-not-ready" title="MODEL_NOT_READY" description="No prediction has been produced. This state is not a zero forecast, valid empty result, timeout, or service outage." />
    <section className="forecast-readiness-grid" aria-label="Forecast readiness">
      <Card className="forecast-readiness-card"><CardHeader><CardTitle>Current availability</CardTitle><StatusBadge state="model-not-ready" /></CardHeader><CardContent><dl className="business-facts">
        <div><dt>Tool boundary</dt><dd><strong>forecast_sales</strong><span>Internal contract only</span></dd></div>
        <div><dt>Error code</dt><dd><strong>{capability.errorCode}</strong><span>{capability.safeMessage}</span></dd></div>
        <div><dt>Validated artifact</dt><dd><strong>Not available</strong><span>No model execution can start</span></dd></div>
        <div><dt>Prediction</dt><dd><strong>Not produced</strong><span>No values or predicted series</span></dd></div>
        <div><dt>Forecast run</dt><dd><strong>Not created</strong><span>No run detail exists</span></dd></div>
      </dl></CardContent></Card>
      <Card className="forecast-request-card"><CardHeader><div><p className="section-kicker">Request boundary</p><CardTitle>Forecast request unavailable</CardTitle></div></CardHeader><CardContent><p>Eligibility requires authorization, sufficient and complete history, a supported target and horizon, and a validated model artifact.</p><Button disabled>Request forecast · unavailable</Button><p className="muted-copy">No request was sent. No server action, artificial processing state, or result was created.</p></CardContent></Card>
    </section>
    <Card className="forecast-target-boundary"><CardHeader><div><p className="section-kicker">TARGET PRODUCT UX · not current</p><CardTitle>What a future real result must prove</CardTitle></div><StatusBadge state="target-only" /></CardHeader><CardContent>
      <ul className="forecast-requirements"><li>Authorized business, target definition, cutoff, and supported horizon.</li><li>Validated model and data provenance from a real completed execution.</li><li>ACTUAL and PREDICTED distinguished by labels, position, and solid versus dashed line style.</li><li>Uncertainty and limitations supplied by the real result contract.</li></ul>
      <p className="privacy-boundary">This reference is non-interactive and contains no prediction, model version, confidence, accuracy, generated timestamp, or ForecastRun identifier.</p>
    </CardContent></Card>
  </>;
}
