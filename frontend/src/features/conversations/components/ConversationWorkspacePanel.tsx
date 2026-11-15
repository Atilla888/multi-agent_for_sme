import { Avatar, Badge, Button, StateNotice, StatusBadge, Textarea } from "@/components/ui";
import { isAgent } from "../agents";
import type { ConversationActor, ConversationWorkspace } from "../types";

const initials: Record<ConversationActor, string> = { Customer: "CU", "Human Operator": "HO", "Sales Agent": "SA", "Support Agent": "SU", "Analytics Agent": "AN", System: "SY" };

export function ConversationWorkspacePanel({ workspace }: { readonly workspace: ConversationWorkspace }) {
  return <section className="conversation-workspace" aria-labelledby="conversation-title">
    <header className="conversation-workspace__header"><div><h2 id="conversation-title">{workspace.participant}</h2><p>{workspace.subject}</p></div><StatusBadge state={workspace.state} /><dl className="workspace-metadata"><div><dt>Channel</dt><dd>{workspace.channel}</dd></div><div><dt>Handled by</dt><dd><Badge>{workspace.handler}</Badge></dd></div></dl></header>
    <div className="message-thread" aria-label="Messages">{workspace.messages.map((message) => <article className={`message message--${message.actor.toLowerCase().replaceAll(" ", "-")}`} key={message.id} aria-label={`${message.actor} message at ${message.time}`}><Avatar variant={isAgent(message.actor) ? "agent" : "person"} accessibleName={message.actor} initials={initials[message.actor]} /><div className="message__body"><header><strong>{message.actor}</strong><time>{message.time}</time></header><p>{message.body}</p>{message.delivery === "failed" ? <span className="message__delivery">Not delivered</span> : null}</div></article>)}</div>
    {workspace.notice ? <StateNotice state={workspace.notice.state} title={workspace.notice.title} description={workspace.notice.description} /> : null}
    <form className="conversation-composer" aria-label="Reply"><Textarea id="conversation-message" label="Reply" placeholder="Messaging is not connected yet" disabled description="Connect a channel under Administration › Channels to send messages." /><Button type="submit" disabled>Send message</Button></form>
  </section>;
}
