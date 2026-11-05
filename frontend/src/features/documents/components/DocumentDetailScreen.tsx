import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Card, CardContent, CardHeader, CardTitle, StateNotice, StatusBadge, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { BusinessFactList } from "@/features/business";
import type { DocumentDetailModel, DocumentProcessingState } from "../types";
import { DocumentBoundary } from "./DocumentBoundary";

function processingBadge(state: DocumentProcessingState) {
  if (state === "READY") return "confirmed" as const;
  if (state === "FAILED") return "known-failure" as const;
  return "processing" as const;
}

/** Document detail: where the document is in its life, its details, and every version. */
export function DocumentDetailScreen({ model }: { readonly model: DocumentDetailModel }) {
  const document = model.document;
  return <div className="feature-page business-screen documents-screen">
    <PageHeader title={document?.title ?? "Document"} description={document ? `${document.accessLabel} · ${document.updatedAt}` : undefined} source="sample" backHref="/documents" backLabel="Documents" />
    <DocumentBoundary state={model.validationState} detail>
      {document ? <>
        <StateNotice state={document.availabilityBadge} title={document.availabilityLabel} description={document.lifecycleSummary} />
        <div className="document-lifecycle-grid">
          <Card className="document-lifecycle-card"><CardHeader><div><p className="section-kicker">1 · Uploaded</p><CardTitle>{document.latestVersion} uploaded</CardTitle></div><StatusBadge state="confirmed" /></CardHeader><CardContent><p className="muted-copy">The file is stored. Uploading alone does not make it available to agents.</p></CardContent></Card>
          <Card className="document-lifecycle-card"><CardHeader><div><p className="section-kicker">2 · Processed</p><CardTitle>{document.processingLabel}</CardTitle></div><StatusBadge state={document.processingBadge} /></CardHeader><CardContent><p className="muted-copy">The text is prepared so agents can search it. Ready does not mean published.</p></CardContent></Card>
          <Card className="document-lifecycle-card"><CardHeader><div><p className="section-kicker">3 · Published</p><CardTitle>{document.currentVersion ? `${document.currentVersion} is current` : "Nothing published"}</CardTitle></div><StatusBadge state={document.currentVersion ? "success" : "restricted"} /></CardHeader><CardContent><p className="muted-copy">{document.availabilityLabel}. Only publishing a version makes it the one agents use.</p></CardContent></Card>
          <Card className="document-lifecycle-card"><CardHeader><div><p className="section-kicker">4 · Used by agents</p><CardTitle>{document.retrievabilityLabel}</CardTitle></div><StatusBadge state={document.currentVersion ? "pending" : "restricted"} /></CardHeader><CardContent><p className="muted-copy">Agents use the published version, within the access rules for each conversation.</p></CardContent></Card>
        </div>
        <div className="entity-detail-grid document-detail-grid">
          <Card><CardHeader><CardTitle>Details</CardTitle></CardHeader><CardContent><BusinessFactList facts={[
            { label: "Business", value: document.business },
            { label: "File", value: document.sourceLabel, note: "Plain text · UTF-8" },
            { label: "Who can use it", value: document.accessLabel },
            { label: "Latest version", value: document.latestVersion, note: document.updatedAt },
            { label: "Published version", value: document.currentVersion ?? "None", note: document.retrievabilityLabel },
          ]} /></CardContent></Card>
          <Card className="document-actions-card"><CardHeader><CardTitle>Actions</CardTitle></CardHeader><CardContent><div className="document-action-row"><Button disabled>Publish version</Button><Button variant="secondary" disabled>Remove</Button></div><p className="muted-copy">Publishing and removing are not available yet. Nothing changes from this screen.</p></CardContent></Card>
        </div>
        <Table scrollLabel={`Versions of ${document.title}`} className="document-versions-table responsive-table">
          <TableCaption className="sr-only">Every version of this document. A newer upload does not replace the published version until you publish it.</TableCaption>
          <TableHeader><TableRow><TableHead>Version</TableHead><TableHead>File</TableHead><TableHead className="col-secondary">Uploaded</TableHead><TableHead>Processing</TableHead><TableHead>Published</TableHead><TableHead>Note</TableHead></TableRow></TableHeader>
          <TableBody>{document.versions.map((version) => <TableRow key={version.id}>
            <TableCell data-label="Version"><strong>{version.label}</strong></TableCell>
            <TableCell data-label="File">{version.fileName}<span className="table-cell-note">{version.sourceType}</span></TableCell>
            <TableCell data-label="Uploaded" className="col-secondary">{version.storedAt}</TableCell>
            <TableCell data-label="Processing"><StatusBadge state={processingBadge(version.processingState)} /><span className="table-cell-note">{version.processingLabel}</span></TableCell>
            <TableCell data-label="Published">{version.isCurrent ? <><StatusBadge state="success" /><span className="table-cell-note">Current · {version.publishedAt}</span></> : <><StatusBadge state="pending" /><span className="table-cell-note">{version.publishedAt ? "Previously published" : "Not published"}</span></>}</TableCell>
            <TableCell data-label="Note">{version.failureReason ?? (version.isCurrent ? "This is the version agents use." : "Kept for reference.")}</TableCell>
          </TableRow>)}</TableBody>
        </Table>
        <StateNotice state="restricted" title="Documents inform answers; they don't change anything" description="Text in a document can't change prices, stock, orders or who has access. Agents treat it as reference material only." />
      </> : null}
    </DocumentBoundary>
  </div>;
}
