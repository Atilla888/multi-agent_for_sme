import { Avatar, Button, StateNotice, StatusBadge, Textarea } from "@/components/ui";
import { avatarHue } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { initials as nameInitials } from "@/components/layout/sessionDisplay";
import { isAgent } from "../agents";
import type { ConversationActor, ConversationMessage, ConversationWorkspace } from "../types";

const initials: Record<ConversationActor, string> = { Customer: "CU", "Human Operator": "HO", "Sales Agent": "SA", "Support Agent": "SU", "Analytics Agent": "AN", System: "SY" };

/** One entry in the conversation timeline: a message bubble, or a one-line system event. */
function TimelineEntry({ message, participant }: { readonly message: ConversationMessage; readonly participant: string }) {
  if (message.actor === "System") {
    return <article className="timeline-entry timeline-entry--system" aria-label={`System message at ${message.time}`}>
      <Icon name="clock" size={13} />
      <p>{message.body}</p>
      <time>{message.time}</time>
    </article>;
  }
  const name = message.actor === "Customer" ? participant : message.actor;
  return <article className={`timeline-entry message--${message.actor.toLowerCase().replaceAll(" ", "-")}`} aria-label={`${message.actor} message at ${message.time}`}>
    <Avatar variant={isAgent(message.actor) ? "agent" : "person"} accessibleName={message.actor === "Customer" ? `Customer ${participant}` : message.actor} initials={message.actor === "Customer" ? nameInitials(participant) : initials[message.actor]} />
    <div className="timeline-entry__body">
      <header className="timeline-entry__who"><strong>{name}</strong>{message.actor === "Customer" ? <span>Customer</span> : null}<time>{message.time}</time></header>
      <p className="message-bubble">{message.body}</p>
      {message.delivery === "failed" ? <span className="message__delivery">Not delivered</span> : null}
    </div>
  </article>;
}

export function ConversationWorkspacePanel({ workspace }: { readonly workspace: ConversationWorkspace }) {
  return <section className="conversation-workspace" aria-labelledby="conversation-title">
    <header className="conversation-workspace__header">
      <span className={`avatar avatar--hue-${avatarHue(workspace.participant)}`} aria-hidden="true">{nameInitials(workspace.participant)}</span>
      <div><h2 id="conversation-title">{workspace.participant}</h2><p>{workspace.subject}</p></div>
      <StatusBadge state={workspace.state} />
    </header>
    <div className="message-thread" aria-label="Messages">{workspace.messages.map((message) => <TimelineEntry key={message.id} message={message} participant={workspace.participant} />)}</div>
    {workspace.notice ? <StateNotice state={workspace.notice.state} title={workspace.notice.title} description={workspace.notice.description} /> : null}
    <form className="conversation-composer" aria-label="Reply"><Textarea id="conversation-message" label="Reply" placeholder="Messaging is not connected yet" disabled description="Connect a channel under Administration › Channels to send messages." /><Button type="submit" disabled>Send message</Button></form>
  </section>;
}
