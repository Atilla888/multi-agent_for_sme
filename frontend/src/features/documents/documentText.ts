import type { useTranslations } from "next-intl";
import type { DocumentListItem, DocumentVersionView } from "./types";

/** Translator for the "documents" namespace: useTranslations("documents") in a screen, createTranslator elsewhere. */
export type DocumentsTranslator = ReturnType<typeof useTranslations<"documents">>;

const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"] as const;

/** A shop-local "YYYY-MM-DDTHH:mm" time as "14 Oct, 10:32" / "14 окт., 10:32" / "14 қаз., 10:32". */
export function documentDate(t: DocumentsTranslator, at: string): string {
  const month = months[Number(at.slice(5, 7)) - 1];
  return month ? t("date", { day: at.slice(8, 10), month: t(`months.${month}`), time: at.slice(11, 16) }) : at;
}

/** Every label and explanation for a document, worded from where it is in its life. */
export function documentText(t: DocumentsTranslator, document: DocumentListItem) {
  const latest = document.latestVersion;
  const current = document.currentVersion ?? "";
  const situation = document.availability;
  return {
    access: t(`access.${document.accessScope}`),
    processing: t(`processing.${situation}`, { latest }),
    availability: t(`availability.${situation}`, { latest, current }),
    use: t(`use.${situation}`, { current }),
    updated: t(`updated.${situation}`, { latest, date: documentDate(t, document.updatedAt) }),
    summary: t(`summary.${situation}`, { latest, current }),
  };
}

/** A version's processing note. A ready version of a removed document is shown as old. */
export function versionProcessing(t: DocumentsTranslator, version: DocumentVersionView, document: DocumentListItem): string {
  return t(`versions.processing.${version.processingState === "READY" && document.availability === "revoked" ? "READY_OLD" : version.processingState}`);
}
