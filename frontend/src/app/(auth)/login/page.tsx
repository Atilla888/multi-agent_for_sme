import { Card } from "@/components/ui/Card";
import { StateNotice } from "@/components/ui/StateNotice";

export default function LoginPage() {
  return (
    <main className="standalone-page">
      <Card className="standalone-page__panel" aria-labelledby="login-heading">
        <div>
          <p className="card__label">Authentication boundary</p>
          <h1 id="login-heading">Staff sign-in</h1>
        </div>
        <StateNotice
          state="not-configured"
          title="Identity provider is not connected"
          description="This route is intentionally outside the staff navigation. P5A does not simulate a user, role, session, or successful sign-in."
        />
        <p className="locale-note">
          Authentication will be delegated to the approved identity provider; authorization remains a backend responsibility.
        </p>
      </Card>
    </main>
  );
}
