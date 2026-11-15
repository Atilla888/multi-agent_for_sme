import { useTranslations } from "next-intl";
import { Preferences } from "@/components/layout/Preferences";
import { Button, Card, CardContent, CardHeader, CardTitle, LoadingState, StateNotice, StatusBadge, Textarea } from "@/components/ui";
import type { WebChatMessage, WebChatScreenModel, WebChatSender } from "../types";

/** The sample order the preview cards talk about. Record content: shown as is in every language. */
const sampleOrder = { reference: "ORD-1042", item: "Desk Lamp / Slate / standard size", quantity: "1" } as const;

/** "You", the business itself, or a team at the business, e.g. "North Shop sales". */
function useSenderName(businessName: string): (sender: WebChatSender) => string {
  const t = useTranslations("webchat.senders");
  return (sender) => sender === "business" ? businessName : sender === "you" ? t("you") : t(sender, { business: businessName });
}

function MessageBubble({ message, businessName }: { readonly message: WebChatMessage; readonly businessName: string }) {
  const t = useTranslations("webchat");
  const name = useSenderName(businessName)(message.sender);
  const customer = message.actor === "Customer";
  return <li className={`webchat-message ${customer ? "webchat-message--customer" : "webchat-message--business"}`}><article aria-label={t("messageFrom", { name })}><header><strong>{name}</strong></header><p>{message.body}</p><footer>{message.time} · {t(`delivery.${message.delivery}`)}</footer></article></li>;
}

function Fact({ label, value, state }: { readonly label: string; readonly value: string; readonly state: "confirmed" | "known-failure" }) {
  return <div className="webchat-fact"><span>{label}</span><strong>{value}</strong><StatusBadge state={state} /></div>;
}

function PreviewAction({ label }: { readonly label: string }) {
  return <Button type="button" disabled>{label}</Button>;
}

function CustomerState({ model }: { readonly model: WebChatScreenModel }) {
  const t = useTranslations("webchat");
  const business = model.businessName;
  switch (model.state) {
    case "loading": return <LoadingState label={t("loading")} lines={4} />;
    case "unavailable": return <StateNotice state="dependency-unavailable" title={t("unavailable.title")} description={t("unavailable.description")} />;
    case "initial": return <StateNotice state="not-configured" title={t("initial.title")} description={t("initial.description")} />;
    case "active": return <StateNotice state="not-configured" title={t("active.title")} description={t("active.description")} />;
    case "clarification": return <Card className="webchat-state-card"><CardHeader><div><p className="card__label">{t("clarification.label")}</p><CardTitle>{t("clarification.question")}</CardTitle></div></CardHeader><CardContent><Textarea label={t("clarification.size")} disabled placeholder={t("clarification.sizePlaceholder")} /><PreviewAction label={t("clarification.send")} /></CardContent></Card>;
    case "confirmation": return <Card className="webchat-state-card"><CardHeader><div><p className="card__label">{t("confirmation.label")}</p><CardTitle>{t("confirmation.title")}</CardTitle></div></CardHeader><CardContent><dl className="webchat-order-summary"><div><dt>{t("item")}</dt><dd>{sampleOrder.item}</dd></div><div><dt>{t("confirmation.quantity")}</dt><dd>{sampleOrder.quantity}</dd></div></dl><p>{t("confirmation.note", { business })}</p><div className="webchat-actions"><PreviewAction label={t("confirmation.confirm")} /><Button type="button" variant="secondary" disabled>{t("confirmation.change")}</Button></div></CardContent></Card>;
    case "processing": return <StateNotice state="processing" title={t("checking")} description={t("processing")} />;
    case "confirmed": return <Card className="webchat-state-card"><CardHeader><div><p className="card__label">{t("confirmed.label")}</p><CardTitle>{t("confirmed.title")}</CardTitle></div></CardHeader><CardContent><div className="webchat-facts"><Fact label={t("order")} value={t("confirmed.orderCreated")} state="confirmed" /><Fact label={t("item")} value={t("confirmed.reserved")} state="confirmed" /></div><p>{t("confirmed.reference", { ref: sampleOrder.reference })}</p></CardContent></Card>;
    case "known-failure": return <Card className="webchat-state-card"><CardHeader><div><p className="card__label">{t("knownFailure.label")}</p><CardTitle>{t("knownFailure.title")}</CardTitle></div></CardHeader><CardContent><div className="webchat-facts"><Fact label={t("order")} value={t("knownFailure.orderExists", { ref: sampleOrder.reference })} state="confirmed" /><Fact label={t("item")} value={t("knownFailure.notReserved")} state="known-failure" /></div><StateNotice state="known-failure" title={t("knownFailure.noticeTitle")} description={t("knownFailure.noticeDescription")} /><PreviewAction label={t("knownFailure.askForHelp")} /></CardContent></Card>;
    case "waiting-human": return <StateNotice state="waiting-human" title={t("waitingHuman.title")} description={t("waitingHuman.description")} />;
    case "confirmation-pending": return <StateNotice state="pending" title={t("checking")} description={t("confirmationPending")} />;
    case "delivery-failure": return <Card className="webchat-state-card"><CardHeader><div><p className="card__label">{t("deliveryFailure.label")}</p><CardTitle>{t("deliveryFailure.title")}</CardTitle></div></CardHeader><CardContent><div className="webchat-facts"><Fact label={t("order")} value={t("deliveryFailure.reservationConfirmed")} state="confirmed" /><Fact label={t("message")} value={t("delivery.failed")} state="known-failure" /></div><p>{t("deliveryFailure.note")}</p><PreviewAction label={t("deliveryFailure.resend")} /></CardContent></Card>;
  }
}

function Composer() {
  const t = useTranslations("webchat");
  return <form className="webchat-composer" aria-label={t("composer.label")}><Textarea label={t("message")} disabled placeholder={t("composer.placeholder")} /><Button type="button" disabled>{t("composer.send")}</Button></form>;
}

/**
 * Customer-facing chat widget. No staff navigation, no internal details. The header carries the
 * language and theme switch; on a phone the header stacks, so the switch sits below the shop's name.
 */
export function CustomerWebChatScreen({ model }: { readonly model: WebChatScreenModel }) {
  const t = useTranslations("webchat");
  const stateOwnsAction = ["loading", "unavailable", "confirmation", "clarification", "processing", "known-failure", "confirmation-pending", "delivery-failure"].includes(model.state);
  return <main className="customer-chat-page"><section className="customer-chat-shell" aria-labelledby="customer-chat-title"><header className="webchat-header"><div><p className="card__label">{t("chatWith")}</p><h1 id="customer-chat-title">{model.businessName}</h1></div><div className="webchat-header__aside"><span className="webchat-header__status">{t("preview")}</span><Preferences /></div></header>{model.state !== "loading" && model.state !== "unavailable" ? <ol className="webchat-timeline" aria-label={t("messages")}>{model.messages.map((message) => <MessageBubble key={message.id} message={message} businessName={model.businessName} />)}</ol> : null}<div className="webchat-state"><CustomerState model={model} /></div>{!stateOwnsAction ? <Composer /> : null}<footer className="webchat-footer">{t("footer", { business: model.businessName })}</footer></section></main>;
}
