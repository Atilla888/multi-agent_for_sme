import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StateNotice } from "@/components/ui/StateNotice";

export default function CustomerChatPage() {
  return (
    <main className="standalone-page">
      <Card className="customer-chat-foundation" aria-labelledby="chat-heading">
        <div>
          <p className="card__label">Customer surface</p>
          <h1 id="chat-heading">Customer Web Chat</h1>
          <p className="locale-note">Separate from the staff shell · mobile-important · EN / RU / KZ ready</p>
        </div>
        <StateNotice
          state="not-available"
          title="Live chat is not available"
          description="The M08 channel/provider is deferred. No conversation, customer identity, or processing result is simulated."
        />
        <Button type="button" disabled>
          Start chat
        </Button>
      </Card>
    </main>
  );
}
