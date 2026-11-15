import Link from "next/link";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, StatusBadge, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { BusinessBoundary, BusinessFactList, EntityToolbar } from "@/features/business";
import type { ProductsScreenModel } from "../types";

/** Products: the catalog on the left, the selected product on the right. */
export function ProductsScreen({ model }: { readonly model: ProductsScreenModel }) {
  const t = useTranslations("products");
  const common = useTranslations("common");
  const states = useTranslations("states");
  const options = [{ value: "all", label: t("filters.all") }, { value: "confirmed", label: t("filters.active") }, { value: "stale-conflict", label: states("stale-conflict.label") }];
  const selected = model.selected;
  return <div className="feature-page business-screen">
    <PageHeader title={t("title")} description={t("description")} source="sample" />
    <EntityToolbar action="/products" query={model.query} searchLabel={t("searchLabel")} searchPlaceholder={t("searchPlaceholder")} status={model.status} statusLabel={t("filterLabel")} options={options} />
    <BusinessBoundary state={model.validationState} family="products" emptyDescription={t("empty")}>
      <div className="entity-master-detail">
        <Table scrollLabel={t("table.label")} className="responsive-table">
          <TableCaption className="sr-only">{t("table.caption")}</TableCaption>
          <TableHeader><TableRow><TableHead>{t("table.product")}</TableHead><TableHead>{t("table.sku")}</TableHead><TableHead className="col-secondary">{t("table.variant")}</TableHead><TableHead>{t("table.price")}</TableHead><TableHead>{t("table.status")}</TableHead><TableHead><span className="sr-only">{common("open")}</span></TableHead></TableRow></TableHeader>
          <TableBody>{model.items.map((product) => <TableRow key={product.id}>
            <TableCell data-label={t("table.product")}><Link className="row-link" href={`/products?product=${product.id}`}>{product.name}</Link></TableCell>
            <TableCell data-label={t("table.sku")} className="cell-id">{product.sku}</TableCell>
            <TableCell data-label={t("table.variant")} className="col-secondary">{product.variant}</TableCell>
            <TableCell data-label={t("table.price")} className="cell-number">{product.price}</TableCell>
            <TableCell data-label={t("table.status")}><StatusBadge state={product.status} /></TableCell>
            <TableCell data-label=""><Link className="context-link" href={`/products?product=${product.id}`}>{common("view")}</Link></TableCell>
          </TableRow>)}</TableBody>
        </Table>
        {selected ? <Card className="entity-side-detail"><CardHeader><div><p className="section-kicker">{t("selected")}</p><CardTitle>{selected.name}</CardTitle></div><StatusBadge state={selected.status} /></CardHeader><CardContent><BusinessFactList facts={[{ label: t("facts.skuVariant"), value: `${selected.sku} · ${selected.variant}` }, { label: t("facts.price"), value: selected.price }, { label: t("facts.catalogVersion"), value: String(selected.version), note: t(`records.${selected.copy}.updated`) }, { label: t("facts.stock"), value: t(`records.${selected.copy}.stock`), note: t("facts.stockNote") }]} /><div className="related-actions"><Link className="context-link" href={`/inventory?product=${selected.id}`}>{t("checkStock")}</Link>{selected.relatedOrders.map((id) => <Link className="context-link" href={`/orders/${id}`} key={id}>{t("order", { id })}</Link>)}</div></CardContent></Card> : null}
      </div>
    </BusinessBoundary>
  </div>;
}
