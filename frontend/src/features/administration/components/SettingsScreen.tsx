import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, LoadingState, StateNotice } from "@/components/ui";
import type { SettingsScreenModel } from "../types";

function SettingsBoundary({ model }: { readonly model: SettingsScreenModel }) {
  if (model.state === "loading") return <LoadingState label="Loading settings" lines={5} />;
  if (model.state === "restricted") return <StateNotice state="permission-denied" title="You don't have access to settings" description="Ask an owner or administrator if you need this." />;
  if (model.state === "unavailable") return <StateNotice state="dependency-unavailable" title="Settings can't be loaded right now" description="No values are shown while the source is unavailable." />;
  if (model.state === "empty") return <StateNotice state="valid-empty" title="No settings to show" description="There is nothing to configure for this account yet." />;
  return <form className="settings-sections" aria-label="Settings">{model.sections.map((section) => <Card className="admin-card" key={section.id}><CardHeader><div><CardTitle>{section.title}</CardTitle><p>{section.description}</p></div></CardHeader><CardContent><div className="settings-field-grid">{section.fields.map((field) => <Input key={field.id} id={`setting-${field.id}`} label={field.label} defaultValue={field.value} description={field.description} disabled />)}</div></CardContent></Card>)}<div className="settings-save-boundary"><Button disabled>Save changes</Button><p>Changing settings is not available yet. Nothing on this screen is saved.</p></div></form>;
}

/** Settings: business details, access and what is switched off. Read-only for now. */
export function SettingsScreen({ model }: { readonly model: SettingsScreenModel }) {
  return <div className="feature-page admin-screen settings-screen"><PageHeader title="Settings" description="Your business details, how people sign in, and what is switched off." source="sample" /><SettingsBoundary model={model} /></div>;
}
