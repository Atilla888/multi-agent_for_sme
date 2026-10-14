import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, LoadingState, StateNotice } from "@/components/ui";
import { BusinessFixtureBanner } from "@/features/business";
import type { SettingsScreenModel } from "../types";

function SettingsBoundary({ model }: { readonly model: SettingsScreenModel }) {
  if (model.state === "loading") return <LoadingState label="Loading effective settings" lines={5} />;
  if (model.state === "restricted") return <StateNotice state="permission-denied" title="Settings access is restricted" description="No business value, effective grant, or configuration detail is disclosed without backend authorization." />;
  if (model.state === "unavailable") return <StateNotice state="dependency-unavailable" title="Configuration source is unavailable" description="No previous value is presented as current and no save confirmation is generated." />;
  if (model.state === "empty") return <StateNotice state="valid-empty" title="No configurable settings in scope" description="No unsupported setting group is invented to fill this authorized empty state." />;
  return <form className="settings-sections" aria-label="Read-only settings fixture">{model.sections.map((section) => <Card className="admin-card" key={section.id}><CardHeader><div><p className="card__label">Read-only section</p><CardTitle>{section.title}</CardTitle><p>{section.description}</p></div></CardHeader><CardContent><div className="settings-field-grid">{section.fields.map((field) => <Input key={field.id} id={`setting-${field.id}`} label={field.label} defaultValue={field.value} description={field.description} disabled />)}</div></CardContent></Card>)}<div className="settings-save-boundary"><Button disabled>Save settings · unavailable</Button><p>No write endpoint exists. Nothing is persisted and no success result is produced.</p></div></form>;
}

export function SettingsScreen({ model }: { readonly model: SettingsScreenModel }) {
  return <div className="feature-page admin-screen settings-screen"><PageHeader eyebrow="Administration / Settings" title="Settings" description="Review only approved business, access, and capability concepts; unsupported writes stay unavailable." /><BusinessFixtureBanner family="Settings" /><StateNotice state="restricted" title="Read-only contract boundary" description="These deterministic values demonstrate layout only. Effective access and every future setting mutation require fresh backend authorization and version checks." /><SettingsBoundary model={model} /></div>;
}
