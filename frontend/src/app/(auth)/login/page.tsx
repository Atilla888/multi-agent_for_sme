import { Card, StateNotice } from "@/components/ui";
import { oidcEnvironment } from "@/services/auth/configuration";

export default async function LoginPage({ searchParams }: { readonly searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  let configured = true;
  try { oidcEnvironment(); } catch { configured = false; }
  const failed = ["unavailable", "login-failed"].includes(String(query.state));
  return <main className="standalone-page"><Card className="standalone-page__panel" aria-labelledby="login-heading">
    <div><p className="card__label">Keycloak / OIDC</p><h1 id="login-heading">Staff sign-in</h1></div>
    {!configured ? <StateNotice state="not-configured" title="Identity provider is not configured" description="Server-side issuer, client, backend and business scope configuration is required." /> : failed ? <StateNotice state="dependency-unavailable" title="Sign-in could not be completed" description="The identity provider or authorized business context is unavailable. No session was fabricated." /> : <StateNotice state="pending" title={query.state === "session-expired" ? "Sign in to continue" : "Secure staff access"} description="Continue to Keycloak to authenticate. Business permissions are checked by the backend." />}
    {configured ? <a className="button button--primary" href="/api/auth/login">Continue to Keycloak</a> : null}
    <p className="locale-note">Credentials stay with Keycloak. This application does not collect your password.</p>
  </Card></main>;
}
