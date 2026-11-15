import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, StatusBadge, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { BusinessBoundary, BusinessFactList, EntityToolbar } from "@/features/business";
import type { ProductsScreenModel } from "../types";

const options = [{ value: "all", label: "All" }, { value: "confirmed", label: "Active" }, { value: "stale-conflict", label: "May be out of date" }] as const;

/** Products: the catalog on the left, the selected product on the right. */
export function ProductsScreen({ model }: { readonly model: ProductsScreenModel }) {
  return <div className="feature-page business-screen">
    <PageHeader title="Products" description="Your catalog. Stock levels live on the Inventory screen." source="sample" />
    <EntityToolbar action="/products" query={model.query} searchLabel="Search products" searchPlaceholder="Name, SKU or variant" status={model.status} statusLabel="Filter products" options={options} />
    <BusinessBoundary state={model.validationState} family="Products" emptyDescription="No products match this search or filter.">
      <div className="entity-master-detail">
        <Table scrollLabel="Products" className="responsive-table">
          <TableCaption className="sr-only">Products in the catalog.</TableCaption>
          <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>SKU</TableHead><TableHead className="col-secondary">Variant</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead><span className="sr-only">Open</span></TableHead></TableRow></TableHeader>
          <TableBody>{model.items.map((product) => <TableRow key={product.id}>
            <TableCell data-label="Product"><Link className="row-link" href={`/products?product=${product.id}`}>{product.name}</Link></TableCell>
            <TableCell data-label="SKU" className="cell-id">{product.sku}</TableCell>
            <TableCell data-label="Variant" className="col-secondary">{product.variant}</TableCell>
            <TableCell data-label="Price" className="cell-number">{product.price}</TableCell>
            <TableCell data-label="Status"><StatusBadge state={product.status} /></TableCell>
            <TableCell data-label=""><Link className="context-link" href={`/products?product=${product.id}`}>View</Link></TableCell>
          </TableRow>)}</TableBody>
        </Table>
        {model.selected ? <Card className="entity-side-detail"><CardHeader><div><p className="section-kicker">Selected product</p><CardTitle>{model.selected.name}</CardTitle></div><StatusBadge state={model.selected.status} /></CardHeader><CardContent><BusinessFactList facts={[{ label: "SKU / variant", value: `${model.selected.sku} · ${model.selected.variant}` }, { label: "Price", value: model.selected.price }, { label: "Catalog version", value: String(model.selected.version), note: model.selected.observedAt }, { label: "Stock", value: model.selected.inventorySummary, note: "A product in the catalog is not the same as stock on hand. Check Inventory before promising anything." }]} /><div className="related-actions"><Link className="context-link" href={`/inventory?product=${model.selected.id}`}>Check stock</Link>{model.selected.relatedOrders.map((id) => <Link className="context-link" href={`/orders/${id}`} key={id}>Order {id}</Link>)}</div></CardContent></Card> : null}
      </div>
    </BusinessBoundary>
  </div>;
}
