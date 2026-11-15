import type { ReactNode } from "react";
import { EmptyState, LoadingState, StateNotice } from "@/components/ui";
import type { DocumentValidationState } from "../types";

export function DocumentBoundary({ state, detail = false, children }: { readonly state: DocumentValidationState; readonly detail?: boolean; readonly children: ReactNode }) {
  if (state === "loading") return <section className="documents-loading" aria-label="Loading documents"><LoadingState label="Loading documents" lines={6} /><LoadingState label="Loading details" lines={4} /></section>;
  if (state === "empty") return <EmptyState title={detail ? "Document not found" : "No documents found"} description={detail ? "It may have been removed." : "No documents match this search or filter."} />;
  if (state === "restricted") return <StateNotice state="permission-denied" title="You don't have access to documents" description="Ask an owner or administrator if you need this." />;
  if (state === "unavailable") return <StateNotice state="dependency-unavailable" title="Documents can't be loaded right now" description="We could not reach the source. An empty screen here does not mean there are no documents." />;
  return children;
}
