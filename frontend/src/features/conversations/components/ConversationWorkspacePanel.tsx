import { Avatar, Button, StateNotice, StatusBadge, Textarea } from "@/components/ui";
import type { ConversationActor, ConversationWorkspace } from "../types";

const initials: Record<ConversationActor, string> = { Customer: "CU", "Human Operator": "HO", "Sales Agent": "SA", "Support Agent": "SU", "Analytics Agent": "AN", System: "SY" };

export function ConversationWorkspacePanel({ workspace }: { readonly workspace: ConversationWorkspace }) {
  return <section className="conversation-workspace" aria-labelledby="conversation-title">
    <header className="conversation-workspace__header"><div><p className="section-kicker">Selected conversation</p><h1 id="conversation-title">{workspace.participant}</h1><p>{workspace.subject}</p></div><StatusBadge state={workspace.state} /><dl className="workspace-metadata"><div><dt>Channel</dt><dd>{workspace.channel}</dd></div><div><dt>Active handler</dt><dd>{workspace.handler}</dd></div></dl></header>
    <div className="message-thread" aria-label="Message timeline">{workspace.messages.map((message) => <article className={`message message--${message.actor.toLowerCase().replaceAll(" ", "-")}`} key={message.id} aria-label={`${message.actor} message at ${message.time}`}><Avatar accessibleName={message.actor} initials={initials[message.actor]} /><div className="message__body"><header><strong>{message.actor}</strong><time>{message.time}</time></header><p>{message.body}</p>{message.delivery === "failed" ? <span className="message__delivery">Message not delivered · fixture state</span> : null}</div></article>)}</div>
    {workspace.notice ? <StateNotice state={workspace.notice.state} title={workspace.notice.title} description={workspace.notice.description} /> : null}
    <form className="conversation-composer" aria-label="Message composer unavailable"><Textarea id="conversation-message" label="Message" placeholder="Live messaging is not connected" disabled description="M08 external channel delivery is PARTIAL / BLOCKED / DEFERRED." /><Button type="submit" disabled>Send message</Button></form>
  </section>;
}
