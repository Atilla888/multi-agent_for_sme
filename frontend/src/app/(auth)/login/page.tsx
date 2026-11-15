import { StateNotice } from "@/components/ui";
import { oidcEnvironment } from "@/services/auth/configuration";

const highlights = [
  "Agents check real stock before promising anything",
  "Anything uncertain goes to your team, never guessed",
  "Sales reports in one place",
] as const;

/** Sign in: brand panel on the left, sign-in card on the right. Passwords never touch this app. */
export default async function LoginPage({ searchParams }: { readonly searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  let configured = true;
  try { oidcEnvironment(); } catch { configured = false; }
  const failed = ["unavailable", "login-failed"].includes(String(query.state));
  return <main className="signin">
    <section className="signin__brand" aria-label="Retail Ops">
      <p className="signin__logo"><span className="sidebar__logo" aria-hidden="true">RO</span>Retail Ops</p>
      <div className="signin__pitch">
        <h2>One inbox for Instagram, WhatsApp, Telegram and web chat, answered by AI agents that know your store.</h2>
        <p>Sales, Support and Analytics agents work from the same business records. When they are unsure, the case goes to your team with the full context.</p>
        <ul>{highlights.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul>
      </div>
      <p className="signin__footnote">Retail Ops · Multi-agent platform for small businesses</p>
    </section>
    <section className="signin__panel">
      <div className="card signin__card" aria-labelledby="login-heading">
        <div>
          <h1 id="login-heading" className="type-h1">Sign in</h1>
          <p className="muted-copy">Use your company account.</p>
        </div>
        {!configured ? <StateNotice state="not-configured" title="Sign-in is not set up yet" description="Ask your administrator to finish setting up sign-in for this workspace." /> : failed ? <StateNotice state="dependency-unavailable" title="Sign-in didn't work" description="We couldn't reach the sign-in service. Please try again in a moment." /> : query.state === "session-expired" ? <StateNotice state="pending" title="Please sign in again" description="Your session ended." /> : null}
        {configured ? <a className="button button--primary" href="/api/auth/login">Sign in</a> : null}
        <p className="locale-note">Your password is handled by your company’s sign-in service, never by this app.</p>
      </div>
    </section>
  </main>;
}
