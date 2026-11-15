import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Card, CardContent, CardHeader, CardTitle, StateNotice, StatusBadge, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { BusinessFactList } from "@/features/business";
import { documentDate, documentText, versionProcessing } from "../documentText";
import type { DocumentDetailModel, DocumentProcessingState } from "../types";
import { DocumentBoundary } from "./DocumentBoundary";

function processingBadge(state: DocumentProcessingState) {
  if (state === "READY") return "confirmed" as const;
  if (state === "FAILED") return "known-failure" as const;
  return "processing" as const;
}

/** Document detail: where the document is in its life, its details, and every version. */
export function DocumentDetailScreen({ model }: { readonly model: DocumentDetailModel }) {
  const t = useTranslations("documents");
  const document = model.document;
  const text = document ? documentText(t, document) : null;
  return <div className="feature-page business-screen documents-screen">
    <PageHeader title={document?.title ?? t("document")} description={text ? `${text.access} · ${text.updated}` : undefined} source="sample" backHref="/documents" backLabel={t("title")} />
    <DocumentBoundary state={model.validationState} detail>
      {document && text ? <>
        <StateNotice state={document.availabilityBadge} title={text.availability} description={text.summary} />
        <div className="document-lifecycle-grid">
          <Card className="document-lifecycle-card"><CardHeader><div><p className="section-kicker">{t("lifecycle.uploaded.step")}</p><CardTitle>{t("lifecycle.uploaded.title", { version: document.latestVersion })}</CardTitle></div><StatusBadge state="confirmed" /></CardHeader><CardContent><p className="rule-note">{t("lifecycle.uploaded.note")}</p></CardContent></Card>
          <Card className="document-lifecycle-card"><CardHeader><div><p className="section-kicker">{t("lifecycle.processed.step")}</p><CardTitle>{text.processing}</CardTitle></div><StatusBadge state={document.processingBadge} /></CardHeader><CardContent><p className="rule-note">{t("lifecycle.processed.note")}</p></CardContent></Card>
          <Card className="document-lifecycle-card"><CardHeader><div><p className="section-kicker">{t("lifecycle.published.step")}</p><CardTitle>{document.currentVersion ? t("lifecycle.published.current", { version: document.currentVersion }) : t("lifecycle.published.none")}</CardTitle></div><StatusBadge state={document.currentVersion ? "success" : "restricted"} /></CardHeader><CardContent><p className="rule-note">{t("lifecycle.published.note", { availability: text.availability })}</p></CardContent></Card>
          <Card className="document-lifecycle-card"><CardHeader><div><p className="section-kicker">{t("lifecycle.used.step")}</p><CardTitle>{text.use}</CardTitle></div><StatusBadge state={document.currentVersion ? "pending" : "restricted"} /></CardHeader><CardContent><p className="rule-note">{t("lifecycle.used.note")}</p></CardContent></Card>
        </div>
        <div className="detail-layout">
          <div className="detail-layout__main">
            <Table scrollLabel={t("versions.label", { title: document.title })} className="document-versions-table responsive-table">
            <TableCaption className="sr-only">{t("versions.caption")}</TableCaption>
            <TableHeader><TableRow><TableHead>{t("columns.version")}</TableHead><TableHead>{t("columns.file")}</TableHead><TableHead className="col-secondary">{t("columns.uploaded")}</TableHead><TableHead>{t("columns.processing")}</TableHead><TableHead>{t("columns.published")}</TableHead><TableHead>{t("columns.note")}</TableHead></TableRow></TableHeader>
            <TableBody>{document.versions.map((version) => <TableRow key={version.id}>
              <TableCell data-label={t("columns.version")} className="cell-id">{version.label}</TableCell>
              <TableCell data-label={t("columns.file")}>{version.fileName}<span className="table-cell-note">{t(`fileTypes.${version.fileType}`)}</span></TableCell>
              <TableCell data-label={t("columns.uploaded")} className="col-secondary">{documentDate(t, version.storedAt)}</TableCell>
              <TableCell data-label={t("columns.processing")}><StatusBadge state={processingBadge(version.processingState)} /><span className="table-cell-note">{versionProcessing(t, version, document)}</span></TableCell>
              <TableCell data-label={t("columns.published")}>{version.isCurrent ? <><StatusBadge state="success" /><span className="table-cell-note">{t("versions.current", { date: version.publishedAt ? documentDate(t, version.publishedAt) : "" })}</span></> : <><StatusBadge state="pending" /><span className="table-cell-note">{version.publishedAt ? t("versions.previouslyPublished") : t("versions.notPublished")}</span></>}</TableCell>
              <TableCell data-label={t("columns.note")}>{version.failure ? t(`versions.failures.${version.failure}`) : version.isCurrent ? t("versions.inUse") : t("versions.kept")}</TableCell>
            </TableRow>)}</TableBody>
          </Table>
          </div>
          <aside className="detail-layout__side details-panel" aria-label={t("details.label")}>
            <section className="details-panel__group"><h3>{t("details.title")}</h3><BusinessFactList facts={[
            { label: t("details.business"), value: document.business },
            { label: t("columns.file"), value: document.sourceLabel, note: t(`fileTypes.${document.fileType}`) },
            { label: t("columns.access"), value: text.access },
            { label: t("columns.latestVersion"), value: document.latestVersion, note: text.updated },
            { label: t("details.publishedVersion"), value: document.currentVersion ?? t("details.none"), note: text.use },
          ]} /></section>
            <section className="details-panel__group"><h3>{t("actions.title")}</h3><div className="document-action-row"><Button disabled>{t("actions.publish")}</Button><Button variant="secondary" disabled>{t("actions.remove")}</Button></div><p className="rule-note">{t("actions.unavailable")}</p></section>
          </aside>
        </div>
        <StateNotice state="restricted" title={t("referenceOnly.title")} description={t("referenceOnly.description")} />
      </> : null}
    </DocumentBoundary>
  </div>;
}
