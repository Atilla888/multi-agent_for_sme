import { StateNotice } from "@/components/ui";
import { oidcEnvironment } from "@/services/auth/configuration";

/** Sign in: one quiet column. Passwords never touch this app. */
export default async function LoginPage({ searchParams }: { readonly searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  let configured = true;
  try { oidcEnvironment(); } catch { configured = false; }
  const failed = ["unavailable", "login-failed"].includes(String(query.state));
  return <main className="signin">
    <div className="signin__column">
      <p className="signin__product"><span className="workspace-mark" aria-hidden="true">R</span>Retail Ops</p>
      <div className="signin__heading">
        <h1 id="login-heading">Sign in</h1>
        <p className="muted-copy">Use your company account.</p>
      </div>
      {!configured ? <StateNotice state="not-configured" title="Sign-in is not set up yet" description="Ask your administrator to finish setting up sign-in for this workspace." /> : failed ? <StateNotice state="dependency-unavailable" title="Sign-in didn't work" description="We couldn't reach the sign-in service. Please try again in a moment." /> : query.state === "session-expired" ? <StateNotice state="pending" title="Please sign in again" description="Your session ended." /> : null}
      {configured ? <a className="button button--primary" href="/api/auth/login">Sign in</a> : null}
      <p className="locale-note">Your password is handled by your company’s sign-in service, never by this app.</p>
    </div>
  </main>;
}
