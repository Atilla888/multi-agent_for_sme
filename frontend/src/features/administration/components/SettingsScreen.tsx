import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, LoadingState, StateNotice } from "@/components/ui";
import type { SettingFieldView, SettingValue, SettingsScreenModel } from "../types";

/** Record content as is; worded answers and staff roles in the chosen language. */
function useSettingValue(): (value: SettingValue) => string {
  const t = useTranslations("administration");
  const shell = useTranslations("shell");
  return (value) => {
    if (value.kind === "text") return value.text;
    if (value.kind === "roles") return value.roles.map((role) => shell(`account.roles.${role}`)).join(", ");
    return value.answer === "blocked-by-policy" ? t("blockedByPolicy") : t(`settings.answers.${value.answer}`);
  };
}

function SettingField({ field }: { readonly field: SettingFieldView }) {
  const t = useTranslations("administration.settings.fields");
  const valueText = useSettingValue();
  return <Input id={`setting-${field.id}`} label={t(`${field.id}.label`)} defaultValue={valueText(field.value)} description={t(`${field.id}.description`)} disabled />;
}

function SettingsBoundary({ model }: { readonly model: SettingsScreenModel }) {
  const t = useTranslations("administration");
  const shell = useTranslations("shell");
  if (model.state === "loading") return <LoadingState label={t("settings.loading")} lines={5} />;
  if (model.state === "restricted") return <StateNotice state="permission-denied" title={t("settings.restricted")} description={t("askForAccess")} />;
  if (model.state === "unavailable") return <StateNotice state="dependency-unavailable" title={t("settings.unavailable.title")} description={t("settings.unavailable.description")} />;
  if (model.state === "empty") return <StateNotice state="valid-empty" title={t("settings.empty.title")} description={t("settings.empty.description")} />;
  return <form className="settings-sections" aria-label={shell("nav.settings")}>{model.sections.map((section) => <Card className="admin-card" key={section.id}><CardHeader><div><CardTitle>{t(`settings.sections.${section.id}.title`)}</CardTitle><p>{t(`settings.sections.${section.id}.description`)}</p></div></CardHeader><CardContent><div className="settings-field-grid">{section.fields.map((field) => <SettingField key={field.id} field={field} />)}</div></CardContent></Card>)}<div className="settings-save-boundary"><Button disabled>{t("settings.save")}</Button><p>{t("settings.saveUnavailable")}</p></div></form>;
}

/** Settings: business details, access and what is switched off. Read-only for now. */
export function SettingsScreen({ model }: { readonly model: SettingsScreenModel }) {
  const shell = useTranslations("shell");
  return <div className="feature-page admin-screen settings-screen"><PageHeader title={shell("nav.settings")} source="sample" /><SettingsBoundary model={model} /></div>;
}
