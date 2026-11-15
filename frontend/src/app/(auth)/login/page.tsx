import { getTranslations } from "next-intl/server";
import { Preferences } from "@/components/layout/Preferences";
import { StateNotice } from "@/components/ui";
import { oidcEnvironment } from "@/services/auth/configuration";

/** Sign in: one quiet column. Passwords never touch this app. */
export default async function LoginPage({ searchParams }: { readonly searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [query, t] = await Promise.all([searchParams, getTranslations("auth")]);
  let configured = true;
  try { oidcEnvironment(); } catch { configured = false; }
  const failed = ["unavailable", "login-failed"].includes(String(query.state));
  return <main className="signin">
    <Preferences className="preferences--corner" />
    <div className="signin__column">
      <p className="signin__product"><span className="workspace-mark" aria-hidden="true">R</span>Retail Ops</p>
      <div className="signin__heading">
        <h1 id="login-heading">{t("signIn")}</h1>
        <p className="muted-copy">{t("useCompanyAccount")}</p>
      </div>
      {!configured ? <StateNotice state="not-configured" title={t("notConfigured.title")} description={t("notConfigured.description")} /> : failed ? <StateNotice state="dependency-unavailable" title={t("failed.title")} description={t("failed.description")} /> : query.state === "session-expired" ? <StateNotice state="pending" title={t("sessionExpired.title")} description={t("sessionExpired.description")} /> : null}
      {configured ? <a className="button button--primary" href="/api/auth/login">{t("signIn")}</a> : null}
      <p className="locale-note">{t("passwordNote")}</p>
    </div>
  </main>;
}
