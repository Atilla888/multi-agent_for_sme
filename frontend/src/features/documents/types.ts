import type { ProductState } from "@/types/states";

export type DocumentAccessScope = "CUSTOMER" | "STAFF";
export type DocumentProcessingState = "STAGED" | "PROCESSING" | "READY" | "FAILED";
export type DocumentAvailability = "published-current" | "ready-unpublished" | "processing" | "failed" | "revoked";
export type DocumentValidationState = "default" | "loading" | "empty" | "restricted" | "unavailable";

export interface DocumentVersionView {
  readonly id: string;
  readonly label: string;
  readonly fileName: string;
  readonly sourceType: "Plain text · UTF-8";
  readonly storedAt: string;
  readonly processingState: DocumentProcessingState;
  readonly processingLabel: string;
  readonly isCurrent: boolean;
  readonly publishedAt: string | null;
  readonly failureReason: string | null;
}

export interface DocumentListItem {
  readonly id: string;
  readonly title: string;
  readonly business: "North Shop";
  readonly accessScope: DocumentAccessScope;
  readonly accessLabel: string;
  readonly latestVersion: string;
  readonly processingState: DocumentProcessingState;
  readonly processingBadge: ProductState;
  readonly processingLabel: string;
  readonly currentVersion: string | null;
  readonly availability: DocumentAvailability;
  readonly availabilityBadge: ProductState;
  readonly availabilityLabel: string;
  readonly retrievabilityLabel: string;
  readonly updatedAt: string;
}

export interface DocumentDetailView extends DocumentListItem {
  readonly sourceLabel: string;
  readonly versions: readonly DocumentVersionView[];
  readonly lifecycleSummary: string;
}

export interface DocumentsScreenModel {
  readonly mode: "LOCAL UI FIXTURE ONLY";
  readonly validationState: DocumentValidationState;
  readonly items: readonly DocumentListItem[];
  readonly query: string;
  readonly status: string;
}

export interface DocumentDetailModel {
  readonly mode: "LOCAL UI FIXTURE ONLY";
  readonly validationState: DocumentValidationState;
  readonly document: DocumentDetailView | null;
}
