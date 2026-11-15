import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Card, CardContent, CardHeader, CardTitle, StateNotice, StatusBadge, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { BusinessBoundary, BusinessFactList, EntityToolbar } from "@/features/business";
import type { InventoryScreenModel } from "../types";

const options = [{ value: "all", label: "All" }, { value: "confirmed", label: "In stock" }, { value: "known-failure", label: "Out of stock" }, { value: "stale-conflict", label: "Needs a fresh check" }, { value: "outcome-unknown", label: "Needs checking" }] as const;

/** Inventory: stock on hand and reservations, with when each count was last checked. */
export function InventoryScreen({ model }: { readonly model: InventoryScreenModel }) {
  return <div className="feature-page business-screen">
    <PageHeader title="Inventory" description="Stock on hand and what is reserved for orders. Every count shows when it was last checked." source="sample" />
    <EntityToolbar action="/inventory" query={model.query} searchLabel="Search inventory" searchPlaceholder="Product name or SKU" status={model.status} statusLabel="Filter inventory" options={options} />
    <BusinessBoundary state={model.validationState} family="Inventory" emptyDescription="No stock records match this search or filter.">
      <div className="entity-master-detail">
        <Table scrollLabel="Inventory" className="responsive-table">
          <TableCaption className="sr-only">Stock on hand and reserved units per product.</TableCaption>
          <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>In stock</TableHead><TableHead>Reserved</TableHead><TableHead>Status</TableHead><TableHead className="col-secondary">Last checked</TableHead><TableHead><span className="sr-only">Open</span></TableHead></TableRow></TableHeader>
          <TableBody>{model.items.map((item) => <TableRow key={item.id}>
            <TableCell data-label="Product"><Link className="row-link" href={`/inventory?product=${item.productId}`}>{item.product}</Link><span className="table-cell-note">{item.sku}</span></TableCell>
            <TableCell data-label="In stock" className="quantity-cell">{item.availableQuantity}</TableCell>
            <TableCell data-label="Reserved" className="cell-number">{item.reservedQuantity}</TableCell>
            <TableCell data-label="Status"><StatusBadge state={item.state} /><span className="table-cell-note">{item.stateLabel}</span></TableCell>
            <TableCell data-label="Last checked" className="col-secondary">{item.observedAt}</TableCell>
            <TableCell data-label=""><Link className="context-link" href={`/inventory?product=${item.productId}`}>View</Link></TableCell>
          </TableRow>)}</TableBody>
        </Table>
        {model.selected ? <Card className="entity-side-detail"><CardHeader><div><p className="section-kicker">Selected product</p><CardTitle>{model.selected.product}</CardTitle></div><StatusBadge state={model.selected.state} /></CardHeader><CardContent>{model.selected.state === "outcome-unknown" ? <StateNotice state="outcome-unknown" title="Check before reserving again" description="A reservation may have gone through without a confirmation. Reserving again could hold the stock twice, so check the records first." /> : null}<BusinessFactList facts={[{ label: "In stock", value: model.selected.availableQuantity, note: "As last checked, not a live count." }, { label: "Reserved", value: model.selected.reservedQuantity, note: model.selected.reservationEvidence }, { label: "Source", value: model.selected.source, note: model.selected.observedAt }, { label: "Note", value: model.selected.decisionNote }]} /><div className="related-actions"><Link className="context-link" href={`/products?product=${model.selected.productId}`}>Open product</Link>{model.selected.relatedOrder ? <Link className="context-link" href={`/orders/${model.selected.relatedOrder}`}>Order {model.selected.relatedOrder}</Link> : null}</div><div><Button disabled variant="secondary">Refresh count</Button><p className="muted-copy">Refreshing from here is not available yet.</p></div></CardContent></Card> : null}
      </div>
    </BusinessBoundary>
  </div>;
}
