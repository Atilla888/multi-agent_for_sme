import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Card, CardContent, CardHeader, CardTitle, StateNotice, StatusBadge, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { BusinessFactList, BusinessFixtureBanner } from "@/features/business";
import type { DocumentDetailModel, DocumentProcessingState } from "../types";
import { DocumentBoundary } from "./DocumentBoundary";

function processingBadge(state: DocumentProcessingState) {
  if (state === "READY") return "confirmed" as const;
  if (state === "FAILED") return "known-failure" as const;
  return "processing" as const;
}

export function DocumentDetailScreen({ model }: { readonly model: DocumentDetailModel }) {
  const document = model.document;
  return <div className="feature-page business-screen documents-screen">
    <PageHeader eyebrow="Knowledge / Documents / Version detail" title={document?.title ?? "Document detail"} description="Inspect stored versions, processing evidence and the current publication pointer without conflating them." />
    <BusinessFixtureBanner family="Document detail" />
    <DocumentBoundary state={model.validationState} detail>
      {document ? <>
        <div className="entity-detail-heading"><Link className="context-link" href="/documents">← Back to Documents</Link><span>{document.business} · private business scope</span></div>
        <StateNotice state={document.availabilityBadge} title={document.availabilityLabel} description={document.lifecycleSummary} />
        <div className="document-lifecycle-grid">
          <Card className="document-lifecycle-card"><CardHeader><div><p className="section-kicker">1 · Source storage</p><CardTitle>{document.latestVersion} stored</CardTitle></div><StatusBadge state="confirmed" /></CardHeader><CardContent><p>The source record exists for this business.</p><p className="muted-copy">Storage alone does not confirm safe parsing, complete indexing, publication or retrieval.</p></CardContent></Card>
          <Card className="document-lifecycle-card"><CardHeader><div><p className="section-kicker">2 · Processing</p><CardTitle>{document.processingLabel}</CardTitle></div><StatusBadge state={document.processingBadge} /></CardHeader><CardContent><p>Latest attempt: {document.latestVersion}.</p><p className="muted-copy">READY means processing completed for that version; it does not publish it.</p></CardContent></Card>
          <Card className="document-lifecycle-card"><CardHeader><div><p className="section-kicker">3 · Publication pointer</p><CardTitle>{document.currentVersion ? `${document.currentVersion} is current` : "No current version"}</CardTitle></div><StatusBadge state={document.currentVersion ? "success" : "restricted"} /></CardHeader><CardContent><p>{document.availabilityLabel}</p><p className="muted-copy">Only an explicit authorized publication transition moves the current pointer.</p></CardContent></Card>
          <Card className="document-lifecycle-card"><CardHeader><div><p className="section-kicker">4 · Retrieval eligibility</p><CardTitle>{document.retrievabilityLabel}</CardTitle></div><StatusBadge state={document.currentVersion ? "pending" : "restricted"} /></CardHeader><CardContent><p>Business, publication, revocation and access-scope checks still apply per request.</p><p className="muted-copy">Document content never grants permission.</p></CardContent></Card>
        </div>
        <div className="entity-detail-grid document-detail-grid">
          <Card><CardHeader><CardTitle>Safe provenance</CardTitle></CardHeader><CardContent><BusinessFactList facts={[
            { label: "Business", value: `${document.business} · fixture scope`, note: "Cross-business access is never implied." },
            { label: "Source", value: document.sourceLabel, note: "Plain text · UTF-8" },
            { label: "Access scope", value: document.accessLabel, note: "Backend authorization remains decisive." },
            { label: "Latest stored", value: document.latestVersion, note: document.updatedAt },
            { label: "Current published", value: document.currentVersion ?? "None", note: document.retrievabilityLabel },
          ]} /></CardContent></Card>
          <Card className="document-actions-card"><CardHeader><CardTitle>Lifecycle actions</CardTitle></CardHeader><CardContent><p>Public staff workflow endpoints are not available in the current application contract.</p><div className="document-action-row"><Button disabled>Publish version · unavailable</Button><Button variant="secondary" disabled>Revoke current · unavailable</Button></div><p className="muted-copy">No action executed. A future uncertain publish/revoke result must reconcile the authoritative pointer before any retry.</p></CardContent></Card>
        </div>
        <Table scrollLabel={`Versions for ${document.title}`} className="document-versions-table">
          <TableCaption>Version history fixture. A newer stored attempt does not automatically replace the current published version.</TableCaption>
          <TableHeader><TableRow><TableHead>Version</TableHead><TableHead>Source</TableHead><TableHead>Stored</TableHead><TableHead>Processing</TableHead><TableHead>Publication</TableHead><TableHead>Failure / next fact</TableHead></TableRow></TableHeader>
          <TableBody>{document.versions.map((version) => <TableRow key={version.id}>
            <TableCell><strong>{version.label}</strong></TableCell>
            <TableCell>{version.fileName}<span className="table-cell-note">{version.sourceType}</span></TableCell>
            <TableCell>{version.storedAt}</TableCell>
            <TableCell><StatusBadge state={processingBadge(version.processingState)} /><span className="table-cell-note">{version.processingLabel}</span></TableCell>
            <TableCell>{version.isCurrent ? <><StatusBadge state="success" /><span className="table-cell-note">Published/current · {version.publishedAt}</span></> : <><StatusBadge state="pending" /><span className="table-cell-note">Not current{version.publishedAt ? " · historical publication" : " · unpublished"}</span></>}</TableCell>
            <TableCell>{version.failureReason ?? (version.isCurrent ? "Current pointer confirmed in fixture" : "No current publication claim")}</TableCell>
          </TableRow>)}</TableBody>
        </Table>
        <StateNotice state="restricted" title="RAG evidence is not authorization" description="Retrieved document text is untrusted evidence. It cannot grant access, change policy, override structured Order or Inventory facts, promise live stock, or trigger a business mutation." />
      </> : null}
    </DocumentBoundary>
  </div>;
}
