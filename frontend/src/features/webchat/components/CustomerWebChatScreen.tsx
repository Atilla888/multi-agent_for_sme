import { Button, Card, CardContent, CardHeader, CardTitle, LoadingState, StateNotice, StatusBadge, Textarea } from "@/components/ui";
import type { WebChatMessage, WebChatScreenModel } from "../types";

const deliveryLabel = { sent: "Sent", delivered: "Delivered", pending: "Pending", failed: "Message not delivered" } as const;

function MessageBubble({ message }: { readonly message: WebChatMessage }) {
  const customer = message.actor === "Customer";
  return <li className={`webchat-message ${customer ? "webchat-message--customer" : "webchat-message--business"}`}><article aria-label={`${message.customerLabel} message`}><header><strong>{message.customerLabel}</strong><span>{message.actor}</span></header><p>{message.body}</p><footer>{message.time} · {deliveryLabel[message.delivery]}</footer></article></li>;
}

function Fact({ label, value, state }: { readonly label: string; readonly value: string; readonly state: "confirmed" | "known-failure" }) {
  return <div className="webchat-fact"><span>{label}</span><strong>{value}</strong><StatusBadge state={state} /></div>;
}

function UnavailableAction({ label }: { readonly label: string }) {
  return <Button type="button" disabled>{label} · unavailable</Button>;
}

function CustomerState({ model }: { readonly model: WebChatScreenModel }) {
  switch (model.state) {
    case "loading": return <LoadingState label="Loading customer conversation" lines={4} />;
    case "unavailable": return <StateNotice state="dependency-unavailable" title="Customer service is unavailable" description="A trusted session or reply cannot be loaded. No answer, send receipt, or business result is fabricated." />;
    case "initial": return <StateNotice state="not-configured" title="Start a conversation" description="Live Web Chat transport is not configured. The composer is shown only as an approved interface preview." />;
    case "active": return <StateNotice state="not-configured" title="Connection required" description="This deterministic conversation validates the approved interface. Sending is unavailable until a verified customer session and M08 transport exist." />;
    case "clarification": return <Card className="webchat-state-card"><CardHeader><div><p className="card__label">One detail needed</p><CardTitle>Which size would you like?</CardTitle></div></CardHeader><CardContent><Textarea label="Preferred size" disabled placeholder="Type your size" description="Sending details is unavailable without a customer session." /><UnavailableAction label="Send details" /></CardContent></Card>;
    case "confirmation": return <Card className="webchat-state-card"><CardHeader><div><p className="card__label">Confirmation required</p><CardTitle>Place an order for this item?</CardTitle></div></CardHeader><CardContent><dl className="webchat-order-summary"><div><dt>Item</dt><dd>Desk Lamp / Slate / standard size</dd></div><div><dt>Quantity</dt><dd>1</dd></div></dl><p>If you confirm, North Shop will place this order. This preview cannot execute it.</p><div className="webchat-actions"><UnavailableAction label="Confirm order" /><Button type="button" variant="secondary" disabled>Change details · unavailable</Button></div></CardContent></Card>;
    case "processing": return <StateNotice state="processing" title="We are checking your request" description="We'll update you here when the result is available. No further action is needed right now." />;
    case "confirmed": return <Card className="webchat-state-card"><CardHeader><div><p className="card__label">Your order update</p><CardTitle>Confirmed business result</CardTitle></div></CardHeader><CardContent><div className="webchat-facts"><Fact label="Order" value="Order created" state="confirmed" /><Fact label="Reservation" value="Item reserved" state="confirmed" /></div><p>Example order reference: ORD-1042. This is fixture data, not a live result.</p></CardContent></Card>;
    case "known-failure": return <Card className="webchat-state-card"><CardHeader><div><p className="card__label">Order created / item not reserved</p><CardTitle>We need to help with the next step</CardTitle></div></CardHeader><CardContent><div className="webchat-facts"><Fact label="Order" value="Order ORD-1042 already exists" state="confirmed" /><Fact label="Reservation" value="Item was not reserved" state="known-failure" /></div><StateNotice state="known-failure" title="Please don't place the same order again" description="We'll help you review current availability and choose the next safe option." /><UnavailableAction label="Ask for help" /></CardContent></Card>;
    case "waiting-human": return <StateNotice state="waiting-human" title="A person is reviewing this" description="We'll update you here. This does not promise completion or transfer any additional permission." />;
    case "confirmation-pending": return <StateNotice state="pending" title="We are checking your request" description="Your request may have gone through, but we cannot confirm it yet. Please do not submit the same request again. We will update you when confirmation is available." />;
    case "delivery-failure": return <Card className="webchat-state-card"><CardHeader><div><p className="card__label">Message delivery issue</p><CardTitle>Your business result remains confirmed</CardTitle></div></CardHeader><CardContent><div className="webchat-facts"><Fact label="Business result" value="Reservation remains confirmed" state="confirmed" /><Fact label="Message" value="Not delivered" state="known-failure" /></div><p>Only the customer message needs attention. Retrying communication must never place the order or reserve inventory again.</p><UnavailableAction label="Retry message" /></CardContent></Card>;
  }
}

function Composer() {
  return <form className="webchat-composer" aria-label="Customer message composer"><Textarea label="Message" disabled placeholder="Write a message…" description="Not configured · a verified Web Chat connection is required." /><Button type="button" disabled>Send · unavailable</Button></form>;
}

export function CustomerWebChatScreen({ model }: { readonly model: WebChatScreenModel }) {
  const stateOwnsAction = ["loading", "unavailable", "confirmation", "clarification", "processing", "known-failure", "confirmation-pending", "delivery-failure"].includes(model.state);
  return <main className="customer-chat-page"><section className="customer-chat-shell" aria-labelledby="customer-chat-title"><header className="webchat-header"><div><p className="card__label">Customer service</p><h1 id="customer-chat-title">{model.businessName}</h1></div><span className="webchat-header__status">Web Chat · Not configured</span></header><div className="webchat-fixture-note" role="note"><strong>{model.mode}</strong><span>Synthetic UI-validation messages · no provider or business action was called</span></div>{model.state !== "loading" && model.state !== "unavailable" ? <ol className="webchat-timeline" aria-label="Customer conversation messages">{model.messages.map((message) => <MessageBubble key={message.id} message={message} />)}</ol> : null}<div className="webchat-state"><CustomerState model={model} /></div>{!stateOwnsAction ? <Composer /> : null}<footer className="webchat-footer">Your messages and order details require a verified customer session. Staff tools and internal reasoning are never shown here.</footer></section></main>;
}
