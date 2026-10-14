import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Card, CardContent, CardHeader, CardTitle, LoadingState, StateNotice, StatusBadge } from "@/components/ui";
import { BusinessFixtureBanner } from "@/features/business";
import type { IntegrationView, IntegrationsScreenModel } from "../types";

function IntegrationCard({ item }: { readonly item: IntegrationView }) {
  return <Card className="admin-card integration-card"><CardHeader><div><p className="card__label">Channel provider</p><CardTitle>{item.channel}</CardTitle></div><StatusBadge state={item.readiness === "NOT_CONFIGURED" ? "not-configured" : "not-available"} /></CardHeader><CardContent><dl className="admin-facts"><div><dt>Readiness</dt><dd><strong>{item.readiness.replace("_", " ")}</strong><span>{item.observation}</span></dd></div><div><dt>Operating mode</dt><dd><strong>Not assigned</strong><span>No LIVE, MOCK, or SANDBOX state is claimed.</span></dd></div><div><dt>Capability</dt><dd><strong>{item.capability}</strong><span>{item.impact}</span></dd></div><div><dt>Last verified</dt><dd><strong>No live verification</strong><span>M08 acceptance is incomplete.</span></dd></div></dl><div className="admin-disabled-actions"><Button disabled>Configure · unavailable</Button><Button variant="secondary" disabled>Validate · unavailable</Button></div></CardContent></Card>;
}

function IntegrationsBoundary({ model }: { readonly model: IntegrationsScreenModel }) {
  if (model.state === "loading") return <LoadingState label="Loading integration status" lines={5} />;
  if (model.state === "restricted") return <StateNotice state="permission-denied" title="Integration access is restricted" description="Provider configuration and health remain hidden. Navigation visibility does not grant an assigned provider or business scope." />;
  if (model.state === "unavailable") return <StateNotice state="dependency-unavailable" title="Integration status is unavailable" description="No provider is presented as healthy, connected, or live while the trusted source cannot be read." />;
  if (model.state === "empty") return <StateNotice state="valid-empty" title="No supported integration records" description="This fixture view contains no configured connection. It is not evidence that a channel is live." />;
  return <section className="admin-card-grid" aria-label="Integration readiness fixtures">{model.items.map((item) => <IntegrationCard item={item} key={item.id} />)}</section>;
}

export function IntegrationsScreen({ model }: { readonly model: IntegrationsScreenModel }) {
  return <div className="feature-page admin-screen integrations-screen"><PageHeader eyebrow="Administration / Integrations" title="Integrations" description="Inspect truthful channel readiness without confusing configuration, validation, activation, or operating mode." /><BusinessFixtureBanner family="Integrations" /><StateNotice state="not-configured" title="M08 live channels are not accepted" description="Instagram, WhatsApp, Telegram, and Web Chat remain unconfigured or deferred. No provider transport is called by this screen." /><IntegrationsBoundary model={model} /></div>;
}
