import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Input, SearchInput, Select, StateNotice, StatusBadge, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { BusinessFixtureBanner } from "@/features/business";
import type { DocumentsScreenModel } from "../types";
import { DocumentBoundary } from "./DocumentBoundary";

const statusOptions = [
  { value: "all", label: "All lifecycle states" },
  { value: "published-current", label: "Published / current" },
  { value: "ready-unpublished", label: "READY / unpublished" },
  { value: "processing", label: "Processing" },
  { value: "failed", label: "Failed attempt" },
  { value: "revoked", label: "Revoked" },
] as const;

export function DocumentsScreen({ model }: { readonly model: DocumentsScreenModel }) {
  return <div className="feature-page business-screen documents-screen">
    <PageHeader eyebrow="Knowledge / Documents" title="Documents" description="Inspect business-scoped sources, version processing and the separate current publication pointer." />
    <BusinessFixtureBanner family="Documents" />
    <StateNotice state="pending" title="Lifecycle facts stay separate" description="Stored does not mean READY. READY does not mean published/current. Published/current still requires request authorization before retrieval." />
    <section className="document-controls" aria-label="Document fixture controls">
      <form className="entity-toolbar document-filter-toolbar" action="/documents" method="get">
        <SearchInput id="documents-search" label="Search documents" name="q" defaultValue={model.query} placeholder="Title, version or scope" description="Filters deterministic fixture rows only; no server search is claimed." />
        <Select id="documents-status" label="Lifecycle state" name="status" defaultValue={model.status}>
          {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </Select>
        <Button type="submit">Apply filters</Button>
      </form>
      <div className="document-upload-boundary" aria-label="Upload capability unavailable">
        <Input id="document-upload" label="Add document version" type="file" accept=".txt,text/plain" disabled description="Plain text · UTF-8 · maximum 1 MiB. Selection is unavailable because no authenticated public upload endpoint exists." />
        <Button disabled>Add text document · unavailable</Button>
        <p>No file is sent and no stored, indexed or published result is claimed.</p>
      </div>
    </section>
    <DocumentBoundary state={model.validationState}>
      <Table scrollLabel="Document fixture records" className="documents-table">
        <TableCaption>Local document fixtures. Lifecycle and retrieval eligibility are shown as separate facts.</TableCaption>
        <TableHeader><TableRow><TableHead>Document</TableHead><TableHead>Scope</TableHead><TableHead>Stored version</TableHead><TableHead>Processing</TableHead><TableHead>Publication / retrieval</TableHead><TableHead>Updated</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
        <TableBody>{model.items.map((document) => <TableRow key={document.id}>
          <TableCell><strong>{document.title}</strong><span className="table-cell-note">{document.business} · private business scope</span></TableCell>
          <TableCell>{document.accessLabel}</TableCell>
          <TableCell><strong>{document.latestVersion}</strong><span className="table-cell-note">Stored source record</span></TableCell>
          <TableCell><StatusBadge state={document.processingBadge} /><span className="table-cell-note">{document.processingLabel}</span></TableCell>
          <TableCell><StatusBadge state={document.availabilityBadge} /><span className="table-cell-note">{document.availabilityLabel}</span><span className="table-cell-note">{document.retrievabilityLabel}</span></TableCell>
          <TableCell>{document.updatedAt}</TableCell>
          <TableCell><Link className="context-link" href={`/documents/${document.id}`}>Inspect versions</Link></TableCell>
        </TableRow>)}</TableBody>
      </Table>
    </DocumentBoundary>
  </div>;
}
