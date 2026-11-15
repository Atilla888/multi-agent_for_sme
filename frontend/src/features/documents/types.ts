import type { ProductState } from "@/types/states";

export type DocumentAccessScope = "CUSTOMER" | "STAFF";
export type DocumentProcessingState = "STAGED" | "PROCESSING" | "READY" | "FAILED";
/** Where the document is in its life. The screens word every label and summary from this. */
export type DocumentAvailability = "published-current" | "ready-unpublished" | "processing" | "failed" | "revoked";
export type DocumentValidationState = "default" | "loading" | "empty" | "restricted" | "unavailable";
export type DocumentFileType = "PLAIN_TEXT_UTF8";
/** Why processing a version failed. */
export type DocumentFailure = "UNREADABLE";

/** Times are shop-local wall-clock times, "YYYY-MM-DDTHH:mm", shown as recorded. */
export interface DocumentVersionView {
  readonly id: string;
  readonly label: string;
  readonly fileName: string;
  readonly fileType: DocumentFileType;
  readonly storedAt: string;
  readonly processingState: DocumentProcessingState;
  readonly isCurrent: boolean;
  readonly publishedAt: string | null;
  readonly failure: DocumentFailure | null;
}

export interface DocumentListItem {
  readonly id: string;
  readonly title: string;
  readonly business: "North Shop";
  readonly accessScope: DocumentAccessScope;
  readonly latestVersion: string;
  readonly processingState: DocumentProcessingState;
  readonly processingBadge: ProductState;
  readonly currentVersion: string | null;
  readonly availability: DocumentAvailability;
  readonly availabilityBadge: ProductState;
  /** When the latest change happened; what the change was follows from availability. */
  readonly updatedAt: string;
}

export interface DocumentDetailView extends DocumentListItem {
  readonly sourceLabel: string;
  readonly fileType: DocumentFileType;
  readonly versions: readonly DocumentVersionView[];
}

export interface DocumentsScreenModel {
  readonly mode: "sample";
  readonly validationState: DocumentValidationState;
  readonly items: readonly DocumentListItem[];
  readonly query: string;
  readonly status: string;
}

export interface DocumentDetailModel {
  readonly mode: "sample";
  readonly validationState: DocumentValidationState;
  readonly document: DocumentDetailView | null;
}
