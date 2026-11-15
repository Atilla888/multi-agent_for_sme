import type { DocumentDetailView, DocumentListItem } from "../types";

export interface DocumentDataAdapter {
  list(query: string, status: string): readonly DocumentListItem[];
  detail(id: string): DocumentDetailView | null;
}

export const documentApiContract = {
  mode: "UNAVAILABLE",
  publicEndpoint: null,
  list: "UNAVAILABLE",
  detail: "UNAVAILABLE",
  upload: "UNAVAILABLE",
  publish: "UNAVAILABLE",
  revoke: "UNAVAILABLE",
  internalEvidence: "M07 private document lifecycle and retrieval contracts",
  reason: "No authenticated public staff document workflow endpoint exists.",
} as const;
