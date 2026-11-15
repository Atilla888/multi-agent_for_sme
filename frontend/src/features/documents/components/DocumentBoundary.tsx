import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { EmptyState, LoadingState, StateNotice } from "@/components/ui";
import type { DocumentValidationState } from "../types";

export function DocumentBoundary({ state, detail = false, children }: { readonly state: DocumentValidationState; readonly detail?: boolean; readonly children: ReactNode }) {
  const t = useTranslations("documents");
  if (state === "loading") return <section className="documents-loading" aria-label={t("states.loading")}><LoadingState label={t("states.loading")} lines={6} /><LoadingState label={t("states.loadingDetails")} lines={4} /></section>;
  if (state === "empty") return <EmptyState title={t(detail ? "states.emptyDetail.title" : "states.emptyList.title")} description={t(detail ? "states.emptyDetail.description" : "states.emptyList.description")} />;
  if (state === "restricted") return <StateNotice state="permission-denied" title={t("states.restricted")} description={t("states.askForAccess")} />;
  if (state === "unavailable") return <StateNotice state="dependency-unavailable" title={t("states.unavailable.title")} description={t("states.unavailable.description")} />;
  return children;
}
