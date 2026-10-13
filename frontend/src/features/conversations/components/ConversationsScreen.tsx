import { EmptyState, LoadingState, StateNotice } from "@/components/ui";
import type { ConversationScreenModel } from "../types";
import { ConversationContextPanel } from "./ConversationContextPanel";
import { ConversationList } from "./ConversationList";
import { ConversationWorkspacePanel } from "./ConversationWorkspacePanel";

export function ConversationsScreen({ model }: { readonly model: ConversationScreenModel }) {
  return <div className="feature-page"><div className="fixture-banner" role="note"><strong>{model.mode}</strong><span>Deterministic development/demo data · not a live backend session or channel.</span></div>
    {model.validationState === "restricted" ? <StateNotice state="permission-denied" title="Conversation access is restricted" description="The fixture demonstrates denial without exposing protected values. Backend authorization remains decisive." /> : null}
    {model.validationState === "m08-unavailable" ? <StateNotice state="dependency-unavailable" title="Live messaging is unavailable" description="M08 external provider/channel delivery remains PARTIAL / BLOCKED / DEFERRED. Existing fixture context remains readable." /> : null}
    {model.validationState === "loading" ? <div className="conversation-layout conversation-layout--loading" aria-label="Loading conversations"><LoadingState label="Loading conversation list" lines={5} /><LoadingState label="Loading selected conversation" lines={6} /><LoadingState label="Loading case context" lines={5} /></div> : model.validationState === "empty" ? <EmptyState title="No conversations in this fixture view" description="The local query completed with no records. This does not prove that the backend contains no conversations." /> : model.validationState === "restricted" ? null : <div className="conversation-layout"><ConversationList items={model.items} selectedId={model.selected?.id} />{model.selected ? <><ConversationWorkspacePanel workspace={model.selected} /><ConversationContextPanel workspace={model.selected} /></> : <EmptyState title="Conversation not found in fixture data" description="No network request was made. Choose an available deterministic fixture conversation." />}</div>}
  </div>;
}
