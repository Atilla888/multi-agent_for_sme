import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Input, SearchInput, Select, StatusBadge, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import type { DocumentsScreenModel } from "../types";
import { DocumentBoundary } from "./DocumentBoundary";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "published-current", label: "Published" },
  { value: "ready-unpublished", label: "Ready to publish" },
  { value: "processing", label: "Processing" },
  { value: "failed", label: "Failed" },
  { value: "revoked", label: "Removed" },
] as const;

/** Documents: the reference material agents use when answering customers. */
export function DocumentsScreen({ model }: { readonly model: DocumentsScreenModel }) {
  return <div className="feature-page business-screen documents-screen">
    <PageHeader title="Documents" description="Policies and guides your AI agents can use when answering customers. A document can have several versions; only the published one is used." source="sample" />
    <section className="document-controls" aria-label="Find and add documents">
      <form className="entity-toolbar document-filter-toolbar" action="/documents" method="get">
        <SearchInput id="documents-search" label="Search documents" name="q" defaultValue={model.query} placeholder="Title or version" />
        <Select id="documents-status" label="Status" name="status" defaultValue={model.status}>
          {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </Select>
        <Button type="submit" variant="secondary">Apply</Button>
      </form>
      <div className="document-upload-boundary" aria-label="Add a document">
        <Input id="document-upload" label="Add a document" type="file" accept=".txt,text/plain" disabled description="Plain text (.txt) up to 1 MB." />
        <Button disabled>Upload</Button>
        <p>Uploading is not available yet. Nothing is sent from this screen.</p>
      </div>
    </section>
    <DocumentBoundary state={model.validationState}>
      <Table scrollLabel="Documents" className="documents-table responsive-table">
        <TableCaption className="sr-only">Documents with their processing and publishing status.</TableCaption>
        <TableHeader><TableRow><TableHead>Document</TableHead><TableHead className="col-secondary">Who can use it</TableHead><TableHead>Latest version</TableHead><TableHead>Processing</TableHead><TableHead>Published</TableHead><TableHead className="col-secondary">Updated</TableHead><TableHead><span className="sr-only">Open</span></TableHead></TableRow></TableHeader>
        <TableBody>{model.items.map((document) => <TableRow key={document.id}>
          <TableCell data-label="Document"><Link className="row-link" href={`/documents/${document.id}`}>{document.title}</Link><span className="table-cell-note">{document.business}</span></TableCell>
          <TableCell data-label="Who can use it" className="col-secondary">{document.accessLabel}</TableCell>
          <TableCell data-label="Latest version"><span className="cell-id">{document.latestVersion}</span></TableCell>
          <TableCell data-label="Processing"><StatusBadge state={document.processingBadge} /><span className="table-cell-note">{document.processingLabel}</span></TableCell>
          <TableCell data-label="Published"><StatusBadge state={document.availabilityBadge} /><span className="table-cell-note">{document.availabilityLabel}</span><span className="table-cell-note">{document.retrievabilityLabel}</span></TableCell>
          <TableCell data-label="Updated" className="col-secondary">{document.updatedAt}</TableCell>
          <TableCell data-label=""><Link className="context-link" href={`/documents/${document.id}`}>View</Link></TableCell>
        </TableRow>)}</TableBody>
      </Table>
    </DocumentBoundary>
  </div>;
}
