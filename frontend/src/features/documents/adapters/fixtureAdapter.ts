import { demoDocuments } from "../fixtures/demoDocuments";
import type { DocumentDetailModel, DocumentsScreenModel, DocumentValidationState } from "../types";
import type { DocumentDataAdapter } from "./contracts";

export const DOCUMENT_FIXTURE_MODE = "sample" as const;

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function parseValidationState(value: string | string[] | undefined): DocumentValidationState {
  const candidate = first(value);
  return ["loading", "empty", "restricted", "unavailable"].includes(candidate)
    ? candidate as DocumentValidationState
    : "default";
}

export const documentFixtureAdapter: DocumentDataAdapter = {
  list(query, status) {
    const needle = query.trim().toLocaleLowerCase();
    return demoDocuments.filter((document) => {
      const matchesText = !needle || `${document.title} ${document.latestVersion} ${document.accessLabel} ${document.availabilityLabel}`.toLocaleLowerCase().includes(needle);
      const matchesStatus = status === "all" || document.availability === status;
      return matchesText && matchesStatus;
    });
  },
  detail(id) {
    return demoDocuments.find((document) => document.id === id) ?? null;
  },
};

export function getDocumentsFixtureScreen(query: Record<string, string | string[] | undefined>): DocumentsScreenModel {
  const validationState = parseValidationState(query.state);
  const search = first(query.q);
  const status = first(query.status) || "all";
  const items = validationState === "default" ? documentFixtureAdapter.list(search, status) : [];
  return {
    mode: DOCUMENT_FIXTURE_MODE,
    validationState: validationState === "default" && items.length === 0 ? "empty" : validationState,
    items,
    query: search,
    status,
  };
}

export function getDocumentDetailFixture(id: string, query: Record<string, string | string[] | undefined>): DocumentDetailModel {
  const validationState = parseValidationState(query.state);
  const document = validationState === "default" ? documentFixtureAdapter.detail(id) : null;
  return {
    mode: DOCUMENT_FIXTURE_MODE,
    validationState: validationState === "default" && !document ? "empty" : validationState,
    document,
  };
}
