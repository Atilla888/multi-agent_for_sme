import { useTranslations } from "next-intl";
import { Avatar, Button, StateNotice, StatusBadge, Textarea } from "@/components/ui";
import { avatarHue } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { initials as nameInitials } from "@/components/layout/sessionDisplay";
import { actorKey, isAgent } from "../agents";
import type { ConversationMessage, ConversationSystemEvent, ConversationWorkspace } from "../types";

/** One entry in the conversation timeline: a message bubble, or a one-line system event. */
function TimelineEntry({ message, participant }: { readonly message: ConversationMessage; readonly participant: string }) {
  const t = useTranslations("conversations");
  const eventText = (event: ConversationSystemEvent) => event.key === "reservationFailed" ? t("events.reservationFailed", { orderId: event.orderId }) : t(`events.${event.key}`);
  if (message.actor === "System") {
    return <article className="timeline-entry timeline-entry--system" aria-label={t("timeline.systemEntry", { time: message.time })}>
      <Icon name="clock" size={13} />
      <p>{eventText(message.event)}</p>
      <time>{message.time}</time>
    </article>;
  }
  const customer = message.actor === "Customer";
  const actor = t(`actors.${actorKey[message.actor]}`);
  const name = customer ? participant : actor;
  return <article className={`timeline-entry message--${message.actor.toLowerCase().replaceAll(" ", "-")}`} aria-label={t("timeline.entry", { actor, time: message.time })}>
    <Avatar variant={isAgent(message.actor) ? "agent" : "person"} accessibleName={customer ? t("timeline.customerAvatar", { name: participant }) : actor} colorKey={customer ? `Customer ${participant}` : message.actor} initials={customer ? nameInitials(participant) : t("personInitials")} />
    <div className="timeline-entry__body">
      <header className="timeline-entry__who"><strong>{name}</strong>{customer ? <span>{actor}</span> : null}<time>{message.time}</time></header>
      <p className="message-bubble">{message.body}</p>
      {message.delivery === "failed" ? <span className="message__delivery">{t("timeline.notDelivered")}</span> : null}
    </div>
  </article>;
}

export function ConversationWorkspacePanel({ workspace }: { readonly workspace: ConversationWorkspace }) {
  const t = useTranslations("conversations");
  return <section className="conversation-workspace" aria-labelledby="conversation-title">
    <header className="conversation-workspace__header">
      <span className={`avatar avatar--hue-${avatarHue(workspace.participant)}`} aria-hidden="true">{nameInitials(workspace.participant)}</span>
      <div><h2 id="conversation-title">{workspace.participant}</h2><p>{t(`subjects.${workspace.subject}`)}</p></div>
      <StatusBadge state={workspace.state} />
    </header>
    <div className="message-thread" aria-label={t("timeline.label")}>{workspace.messages.map((message) => <TimelineEntry key={message.id} message={message} participant={workspace.participant} />)}</div>
    {workspace.notice ? <StateNotice state={workspace.notice.state} title={t(`notices.${workspace.notice.key}.title`)} description={t(`notices.${workspace.notice.key}.description`)} /> : null}
    <form className="conversation-composer" aria-label={t("composer.label")}><Textarea id="conversation-message" label={t("composer.label")} placeholder={t("composer.placeholder")} disabled description={t("composer.description")} /><Button type="submit" disabled>{t("composer.send")}</Button></form>
  </section>;
}
