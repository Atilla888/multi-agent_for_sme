import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState, LoadingState, StateNotice } from "@/components/ui";
import type { ConversationScreenModel } from "../types";
import { ConversationContextPanel } from "./ConversationContextPanel";
import { ConversationList } from "./ConversationList";
import { ConversationWorkspacePanel } from "./ConversationWorkspacePanel";

/** Inbox: the list on the left, the open conversation in the middle, its details on the right. */
export function ConversationsScreen({ model }: { readonly model: ConversationScreenModel }) {
  return <div className="feature-page">
    <PageHeader title="Inbox" description="Customer conversations from every channel. AI agents answer first; anything that needs a person goes to Needs review." source="sample" />
    {model.validationState === "restricted" ? <StateNotice state="permission-denied" title="You don't have access to this conversation" description="Ask an owner or administrator if you need it." /> : null}
    {model.validationState === "m08-unavailable" ? <StateNotice state="dependency-unavailable" title="Live messaging is not connected yet" description="No channel is connected, so new messages can't be sent or received. You can still read what is here." /> : null}
    {model.validationState === "loading" ? <div className="conversation-layout conversation-layout--loading" aria-label="Loading conversations"><LoadingState label="Loading conversations" lines={5} /><LoadingState label="Loading the open conversation" lines={6} /><LoadingState label="Loading details" lines={5} /></div> : model.validationState === "empty" ? <EmptyState title="No conversations yet" description="New customer messages will appear here once a channel is connected." /> : model.validationState === "restricted" ? null : <div className="conversation-layout"><ConversationList items={model.items} selectedId={model.selected?.id} />{model.selected ? <><ConversationWorkspacePanel workspace={model.selected} /><ConversationContextPanel workspace={model.selected} /></> : <EmptyState title="Conversation not found" description="It may have been removed. Pick one from the list." />}</div>}
  </div>;
}
