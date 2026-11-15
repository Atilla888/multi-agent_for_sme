import Link from "next/link";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Input, SearchInput, Select, StatusBadge, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { documentText } from "../documentText";
import type { DocumentsScreenModel } from "../types";
import { DocumentBoundary } from "./DocumentBoundary";

const statusOptions = ["all", "published-current", "ready-unpublished", "processing", "failed", "revoked"] as const;

/** Documents: the reference material agents use when answering customers. */
export function DocumentsScreen({ model }: { readonly model: DocumentsScreenModel }) {
  const t = useTranslations("documents");
  const common = useTranslations("common");
  return <div className="feature-page business-screen documents-screen">
    <PageHeader title={t("title")} description={t("description")} source="sample" />
    <section className="document-controls" aria-label={t("controls")}>
      <form className="entity-toolbar document-filter-toolbar" action="/documents" method="get">
        <SearchInput id="documents-search" label={t("search.label")} name="q" defaultValue={model.query} placeholder={t("search.placeholder")} />
        <Select id="documents-status" label={t("status.label")} name="status" defaultValue={model.status}>
          {statusOptions.map((option) => <option key={option} value={option}>{t(`status.${option}`)}</option>)}
        </Select>
        <Button type="submit" variant="secondary">{t("apply")}</Button>
      </form>
      <div className="document-upload-boundary" aria-label={t("upload.label")}>
        <Input id="document-upload" label={t("upload.label")} type="file" accept=".txt,text/plain" disabled description={t("upload.hint")} />
        <Button disabled>{t("upload.button")}</Button>
        <p>{t("upload.unavailable")}</p>
      </div>
    </section>
    <DocumentBoundary state={model.validationState}>
      <Table scrollLabel={t("title")} className="documents-table responsive-table">
        <TableCaption className="sr-only">{t("caption")}</TableCaption>
        <TableHeader><TableRow><TableHead>{t("columns.document")}</TableHead><TableHead className="col-secondary">{t("columns.access")}</TableHead><TableHead>{t("columns.latestVersion")}</TableHead><TableHead>{t("columns.processing")}</TableHead><TableHead>{t("columns.published")}</TableHead><TableHead className="col-secondary">{t("columns.updated")}</TableHead><TableHead><span className="sr-only">{common("open")}</span></TableHead></TableRow></TableHeader>
        <TableBody>{model.items.map((document) => {
          const text = documentText(t, document);
          return <TableRow key={document.id}>
            <TableCell data-label={t("columns.document")}><Link className="row-link" href={`/documents/${document.id}`}>{document.title}</Link><span className="table-cell-note">{document.business}</span></TableCell>
            <TableCell data-label={t("columns.access")} className="col-secondary">{text.access}</TableCell>
            <TableCell data-label={t("columns.latestVersion")}><span className="cell-id">{document.latestVersion}</span></TableCell>
            <TableCell data-label={t("columns.processing")}><StatusBadge state={document.processingBadge} /><span className="table-cell-note">{text.processing}</span></TableCell>
            <TableCell data-label={t("columns.published")}><StatusBadge state={document.availabilityBadge} /><span className="table-cell-note">{text.availability}</span><span className="table-cell-note">{text.use}</span></TableCell>
            <TableCell data-label={t("columns.updated")} className="col-secondary">{text.updated}</TableCell>
            <TableCell data-label=""><Link className="context-link" href={`/documents/${document.id}`}>{common("view")}</Link></TableCell>
          </TableRow>;
        })}</TableBody>
      </Table>
    </DocumentBoundary>
  </div>;
}
