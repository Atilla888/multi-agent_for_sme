import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState, LoadingState, StateNotice } from "@/components/ui";
import type { ConversationScreenModel } from "../types";
import { ConversationContextPanel } from "./ConversationContextPanel";
import { ConversationList } from "./ConversationList";
import { ConversationWorkspacePanel } from "./ConversationWorkspacePanel";

/** Inbox: the list on the left, the open conversation in the middle, its details on the right. */
export function ConversationsScreen({ model }: { readonly model: ConversationScreenModel }) {
  const t = useTranslations("conversations");
  return <div className="feature-page">
    <PageHeader title={t("title")} source="sample" />
    {model.validationState === "restricted" ? <StateNotice state="permission-denied" title={t("restricted.title")} description={t("restricted.description")} /> : null}
    {model.validationState === "m08-unavailable" ? <StateNotice state="dependency-unavailable" title={t("unavailable.title")} description={t("unavailable.description")} /> : null}
    {model.validationState === "loading" ? <div className="conversation-layout conversation-layout--loading" aria-label={t("loading.conversations")}><LoadingState label={t("loading.conversations")} lines={5} /><LoadingState label={t("loading.open")} lines={6} /><LoadingState label={t("loading.details")} lines={5} /></div> : model.validationState === "empty" ? <EmptyState title={t("empty.title")} description={t("empty.description")} /> : model.validationState === "restricted" ? null : <div className="conversation-layout"><ConversationList items={model.items} selectedId={model.selected?.id} />{model.selected ? <><ConversationWorkspacePanel workspace={model.selected} /><ConversationContextPanel workspace={model.selected} /></> : <EmptyState title={t("notFound.title")} description={t("notFound.description")} />}</div>}
  </div>;
}
