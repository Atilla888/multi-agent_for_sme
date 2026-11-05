import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Card, CardContent, CardHeader, CardTitle, LoadingState, StateNotice, StatusBadge } from "@/components/ui";
import type { IntegrationView, IntegrationsScreenModel } from "../types";

function IntegrationCard({ item }: { readonly item: IntegrationView }) {
  return <Card className="admin-card integration-card"><CardHeader><div><p className="card__label">Channel</p><CardTitle>{item.channel}</CardTitle></div><StatusBadge state={item.readiness === "NOT_CONFIGURED" ? "not-configured" : "not-available"} /></CardHeader><CardContent><dl className="admin-facts"><div><dt>Status</dt><dd><strong>{item.observation}</strong></dd></div><div><dt>Used for</dt><dd><strong>{item.capability}</strong><span>{item.impact}</span></dd></div><div><dt>Last checked</dt><dd><strong>Never</strong><span>No connection has been tested yet.</span></dd></div></dl><div className="admin-disabled-actions"><Button disabled>Connect</Button><Button variant="secondary" disabled>Test connection</Button></div></CardContent></Card>;
}

function IntegrationsBoundary({ model }: { readonly model: IntegrationsScreenModel }) {
  if (model.state === "loading") return <LoadingState label="Loading channels" lines={5} />;
  if (model.state === "restricted") return <StateNotice state="permission-denied" title="You don't have access to channels" description="Ask an owner or administrator if you need this." />;
  if (model.state === "unavailable") return <StateNotice state="dependency-unavailable" title="Channel status can't be loaded right now" description="No channel is shown as connected while the status is unknown." />;
  if (model.state === "empty") return <StateNotice state="valid-empty" title="No channels yet" description="Nothing has been set up. This is not a sign that a channel is live." />;
  return <section className="admin-card-grid" aria-label="Channels">{model.items.map((item) => <IntegrationCard item={item} key={item.id} />)}</section>;
}

/** Channels: where customers can reach you. */
export function IntegrationsScreen({ model }: { readonly model: IntegrationsScreenModel }) {
  return <div className="feature-page admin-screen integrations-screen"><PageHeader title="Channels" description="Where customers can reach you. Connect a channel to receive and send messages there." source="sample" /><StateNotice state="not-configured" title="No channels are connected yet" description="Messaging through Instagram, WhatsApp, Telegram and Web Chat is not switched on. Customers can't reach you here until a channel is connected." /><IntegrationsBoundary model={model} /></div>;
}
