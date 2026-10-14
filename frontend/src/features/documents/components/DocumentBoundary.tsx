import type { ReactNode } from "react";
import { EmptyState, LoadingState, StateNotice } from "@/components/ui";
import type { DocumentValidationState } from "../types";

export function DocumentBoundary({ state, detail = false, children }: { readonly state: DocumentValidationState; readonly detail?: boolean; readonly children: ReactNode }) {
  if (state === "loading") return <section className="documents-loading" aria-label="Loading Documents"><LoadingState label="Loading document records" lines={6} /><LoadingState label="Loading lifecycle context" lines={4} /></section>;
  if (state === "empty") return <EmptyState title={detail ? "Document not found" : "No documents in this fixture view"} description={detail ? "No permitted deterministic fixture matches this document reference." : "No permitted document source matches the local search and lifecycle filter."} />;
  if (state === "restricted") return <StateNotice state="permission-denied" title="Documents access is restricted" description="Protected document names, versions and provenance are withheld. Visible navigation does not grant backend access." />;
  if (state === "unavailable") return <StateNotice state="dependency-unavailable" title="Document source is unavailable" description="No live lifecycle result is available. Do not reinterpret this as an empty collection, failed indexing, or revoked publication." />;
  return children;
}
