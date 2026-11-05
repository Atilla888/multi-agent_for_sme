import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Card, CardContent, CardHeader, CardTitle, StateNotice, StatusBadge } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import type { ForecastScreenModel } from "../types";

/** Forecasts: not ready yet. The screen says what is missing and where to look in the meantime. */
export function ForecastsScreen({ model }: { readonly model: ForecastScreenModel }) {
  return <div className="feature-page business-screen forecasts-screen">
    <PageHeader title="Forecasts" description="Predicted sales for upcoming periods, kept separate from recorded figures." />
    <section className="forecast-current-banner" role="note" aria-labelledby="forecast-banner-title"><span className="forecast-current-banner__icon" aria-hidden="true"><Icon name="info" size={16} /></span><div><h2 id="forecast-banner-title">Forecasts are not ready yet</h2><p>A forecast needs a tested model and enough complete sales history. Until then nothing is predicted, so no one plans stock on made-up numbers.</p><StatusBadge state="model-not-ready" /></div><Link className="button button--secondary" href="/analytics">Open Reports</Link></section>
    {model.state === "restricted" ? <StateNotice state="permission-denied" title="You don't have access to forecasts" description="Ask an owner or administrator if you need this." /> : <ForecastNotReady />}
    <Card className="forecast-return-card"><CardHeader><div><p className="section-kicker">In the meantime</p><CardTitle>Use Reports for what has actually sold</CardTitle></div></CardHeader><CardContent><p>Reports shows confirmed orders for past periods. It stays separate from forecasts so recorded figures are never mixed with predictions.</p><Link className="context-link" href="/analytics">Open Reports</Link></CardContent></Card>
  </div>;
}

function ForecastNotReady() {
  return <>
    <section className="forecast-readiness-grid" aria-label="What is missing">
      <Card className="forecast-readiness-card"><CardHeader><CardTitle>What is missing</CardTitle><StatusBadge state="model-not-ready" /></CardHeader><CardContent><dl className="business-facts">
        <div><dt>Forecast model</dt><dd><strong>Not ready</strong><span>A model has to be trained and tested before it can predict anything.</span></dd></div>
        <div><dt>Sales history</dt><dd><strong>Being collected</strong><span>Confirmed orders build up in Reports.</span></dd></div>
        <div><dt>Prediction</dt><dd><strong>None</strong><span>No numbers are predicted until the model is ready.</span></dd></div>
      </dl></CardContent></Card>
      <Card className="forecast-request-card"><CardHeader><div><p className="section-kicker">Later</p><CardTitle>Request a forecast</CardTitle></div></CardHeader><CardContent><p>When forecasts are ready, you will choose a product, a measure and a period here.</p><Button disabled>Request forecast</Button><p className="muted-copy">Not available yet. Nothing is requested from this screen.</p></CardContent></Card>
    </section>
    <Card className="forecast-target-boundary"><CardHeader><div><p className="section-kicker">What you’ll see later</p><CardTitle>How a forecast will be shown</CardTitle></div><StatusBadge state="target-only" /></CardHeader><CardContent>
      <ul className="forecast-requirements"><li>Recorded sales and predicted sales drawn with different lines, so you always know which is which.</li><li>The product, measure and period the forecast covers.</li><li>How confident the model is and what it did not take into account.</li><li>When the forecast was made.</li></ul>
      <p className="muted-copy">This is a description only. It contains no prediction.</p>
    </CardContent></Card>
  </>;
}
