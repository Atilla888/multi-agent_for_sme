import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { BusinessBoundary, EntityToolbar } from "@/features/business";
import type { CustomerScreenModel } from "../types";

const statusOptions = [{ value: "all", label: "All" }, { value: "confirmed", label: "Verified" }, { value: "waiting-human", label: "Needs verification" }, { value: "stale-conflict", label: "May be out of date" }] as const;

/** Customers list. */
export function CustomersScreen({ model }: { readonly model: CustomerScreenModel }) {
  return <div className="feature-page business-screen">
    <PageHeader title="Customers" source="sample" />
    <section className="card list-card" aria-label="Customers list">
      <EntityToolbar action="/customers" query={model.query} searchLabel="Search customers" searchPlaceholder="Name or customer ID" status={model.status} statusLabel="Filter customers" options={statusOptions} />
      <BusinessBoundary state={model.validationState} family="Customers" emptyDescription="No customers match this search or filter.">
        <Table scrollLabel="Customers" className="responsive-table">
          <TableCaption className="sr-only">Customers with their contact channel and verification status.</TableCaption>
          <TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Contact channel</TableHead><TableHead>Status</TableHead><TableHead className="col-secondary">Activity</TableHead><TableHead className="col-secondary">Updated</TableHead><TableHead><span className="sr-only">Open</span></TableHead></TableRow></TableHeader>
          <TableBody>{model.items.map((customer) => <TableRow key={customer.id}>
            <TableCell data-label="Customer"><Link className="row-link" href={`/customers/${customer.id}`}>{customer.displayName}</Link><span className="table-cell-note cell-id">{customer.reference}</span></TableCell>
            <TableCell data-label="Contact channel">{customer.identityContext}</TableCell>
            <TableCell data-label="Status"><StatusBadge state={customer.verificationState} /></TableCell>
            <TableCell data-label="Activity" className="col-secondary">{customer.conversations} conversations · {customer.orders} orders</TableCell>
            <TableCell data-label="Updated" className="col-secondary">{customer.observedAt}</TableCell>
            <TableCell data-label=""><Link className="context-link" href={`/customers/${customer.id}`}>View</Link></TableCell>
          </TableRow>)}</TableBody>
        </Table>
      </BusinessBoundary>
    </section>
  </div>;
}
