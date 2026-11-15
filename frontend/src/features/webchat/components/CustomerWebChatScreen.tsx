import { Button, Card, CardContent, CardHeader, CardTitle, LoadingState, StateNotice, StatusBadge, Textarea } from "@/components/ui";
import type { WebChatMessage, WebChatScreenModel } from "../types";

const deliveryLabel = { sent: "Sent", delivered: "Delivered", pending: "Sending", failed: "Not delivered" } as const;

function MessageBubble({ message }: { readonly message: WebChatMessage }) {
  const customer = message.actor === "Customer";
  return <li className={`webchat-message ${customer ? "webchat-message--customer" : "webchat-message--business"}`}><article aria-label={`${message.customerLabel} message`}><header><strong>{message.customerLabel}</strong></header><p>{message.body}</p><footer>{message.time} · {deliveryLabel[message.delivery]}</footer></article></li>;
}

function Fact({ label, value, state }: { readonly label: string; readonly value: string; readonly state: "confirmed" | "known-failure" }) {
  return <div className="webchat-fact"><span>{label}</span><strong>{value}</strong><StatusBadge state={state} /></div>;
}

function PreviewAction({ label }: { readonly label: string }) {
  return <Button type="button" disabled>{label}</Button>;
}

function CustomerState({ model }: { readonly model: WebChatScreenModel }) {
  switch (model.state) {
    case "loading": return <LoadingState label="Loading your conversation" lines={4} />;
    case "unavailable": return <StateNotice state="dependency-unavailable" title="Chat is unavailable right now" description="We can't load your conversation at the moment. Please try again shortly." />;
    case "initial": return <StateNotice state="not-configured" title="Start a conversation" description="Chat is not switched on yet. This is a preview of how it will look." />;
    case "active": return <StateNotice state="not-configured" title="Preview only" description="Sending is not available until chat is connected." />;
    case "clarification": return <Card className="webchat-state-card"><CardHeader><div><p className="card__label">One detail needed</p><CardTitle>Which size would you like?</CardTitle></div></CardHeader><CardContent><Textarea label="Size" disabled placeholder="Type your size" /><PreviewAction label="Send details" /></CardContent></Card>;
    case "confirmation": return <Card className="webchat-state-card"><CardHeader><div><p className="card__label">Please confirm</p><CardTitle>Place this order?</CardTitle></div></CardHeader><CardContent><dl className="webchat-order-summary"><div><dt>Item</dt><dd>Desk Lamp / Slate / standard size</dd></div><div><dt>Quantity</dt><dd>1</dd></div></dl><p>If you confirm, North Shop will place this order. This preview cannot place it.</p><div className="webchat-actions"><PreviewAction label="Confirm order" /><Button type="button" variant="secondary" disabled>Change details</Button></div></CardContent></Card>;
    case "processing": return <StateNotice state="processing" title="We are checking your request" description="We'll update you here when the result is available. No further action is needed right now." />;
    case "confirmed": return <Card className="webchat-state-card"><CardHeader><div><p className="card__label">Your order</p><CardTitle>Order placed</CardTitle></div></CardHeader><CardContent><div className="webchat-facts"><Fact label="Order" value="Order created" state="confirmed" /><Fact label="Item" value="Reserved for you" state="confirmed" /></div><p>Order reference: ORD-1042.</p></CardContent></Card>;
    case "known-failure": return <Card className="webchat-state-card"><CardHeader><div><p className="card__label">About your order</p><CardTitle>We need to help with the next step</CardTitle></div></CardHeader><CardContent><div className="webchat-facts"><Fact label="Order" value="Order ORD-1042 already exists" state="confirmed" /><Fact label="Item" value="Item was not reserved" state="known-failure" /></div><StateNotice state="known-failure" title="Please don't place the same order again" description="We'll help you check what is available and choose the next option." /><PreviewAction label="Ask for help" /></CardContent></Card>;
    case "waiting-human": return <StateNotice state="waiting-human" title="A person is reviewing this" description="We'll update you here. This does not promise completion." />;
    case "confirmation-pending": return <StateNotice state="pending" title="We are checking your request" description="Your request may have gone through, but we cannot confirm it yet. Please do not submit the same request again. We will update you when we know." />;
    case "delivery-failure": return <Card className="webchat-state-card"><CardHeader><div><p className="card__label">Message problem</p><CardTitle>Your order is fine</CardTitle></div></CardHeader><CardContent><div className="webchat-facts"><Fact label="Order" value="Reservation remains confirmed" state="confirmed" /><Fact label="Message" value="Not delivered" state="known-failure" /></div><p>Only the message needs resending. Resending it must never place the order or reserve the item again.</p><PreviewAction label="Resend message" /></CardContent></Card>;
  }
}

function Composer() {
  return <form className="webchat-composer" aria-label="Write a message"><Textarea label="Message" disabled placeholder="Write a message…" /><Button type="button" disabled>Send</Button></form>;
}

/** Customer-facing chat widget. No staff navigation, no internal details. */
export function CustomerWebChatScreen({ model }: { readonly model: WebChatScreenModel }) {
  const stateOwnsAction = ["loading", "unavailable", "confirmation", "clarification", "processing", "known-failure", "confirmation-pending", "delivery-failure"].includes(model.state);
  return <main className="customer-chat-page"><section className="customer-chat-shell" aria-labelledby="customer-chat-title"><header className="webchat-header"><div><p className="card__label">Chat with</p><h1 id="customer-chat-title">{model.businessName}</h1></div><span className="webchat-header__status">Preview</span></header>{model.state !== "loading" && model.state !== "unavailable" ? <ol className="webchat-timeline" aria-label="Messages">{model.messages.map((message) => <MessageBubble key={message.id} message={message} />)}</ol> : null}<div className="webchat-state"><CustomerState model={model} /></div>{!stateOwnsAction ? <Composer /> : null}<footer className="webchat-footer">Only your conversation with {model.businessName} is shown here. Your details stay private.</footer></section></main>;
}
