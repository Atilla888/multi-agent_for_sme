import { StateNotice } from "@/components/ui";
import { oidcEnvironment } from "@/services/auth/configuration";

const highlights = [
  "Agents check real stock before promising anything",
  "Uncertain actions are escalated, never retried blindly",
  "Owners see sales analytics in one place",
] as const;

/** Sign in — Figma page 02 · Sign in: brand panel on the left, sign-in card on the right. */
export default async function LoginPage({ searchParams }: { readonly searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  let configured = true;
  try { oidcEnvironment(); } catch { configured = false; }
  const failed = ["unavailable", "login-failed"].includes(String(query.state));
  return <main className="signin">
    <section className="signin__brand" aria-label="Multi-Agent Retail Ops">
      <p className="signin__logo"><span className="sidebar__logo" aria-hidden="true">MA</span>Multi-Agent Retail Ops</p>
      <div className="signin__pitch">
        <h2>One inbox for Instagram, WhatsApp, Telegram and Web Chat, answered by AI agents that know your store.</h2>
        <p>Sales, Support and Analytics agents work on the same business data. When they are unsure, the case goes to your team with the full context.</p>
        <ul>{highlights.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul>
      </div>
      <p className="signin__footnote">Diploma project · Multi-agent platform for SMEs</p>
    </section>
    <section className="signin__panel">
      <div className="card signin__card" aria-labelledby="login-heading">
        <div>
          <h1 id="login-heading" className="type-h1">Sign in to your workspace</h1>
          <p className="muted-copy">Use your staff account. Keycloak / OIDC handles the sign-in.</p>
        </div>
        {!configured ? <StateNotice state="not-configured" title="Identity provider is not configured" description="Server-side issuer, client, backend and business scope configuration is required." /> : failed ? <StateNotice state="dependency-unavailable" title="Sign-in could not be completed" description="The identity provider or authorized business context is unavailable. No session was fabricated." /> : query.state === "session-expired" ? <StateNotice state="pending" title="Sign in to continue" description="Your session ended. Business permissions are checked by the backend." /> : null}
        {configured ? <a className="button button--primary" href="/api/auth/login">Continue to Keycloak</a> : null}
        <p className="locale-note">Credentials stay with Keycloak. This application does not collect your password.</p>
      </div>
    </section>
  </main>;
}
