import Link from "next/link";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Card, CardContent, CardHeader, CardTitle, StateNotice, StatusBadge, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { BusinessBoundary, BusinessFactList, EntityToolbar } from "@/features/business";
import type { InventoryScreenModel } from "../types";

/** Inventory: stock on hand and reservations, with when each count was last checked. */
export function InventoryScreen({ model }: { readonly model: InventoryScreenModel }) {
  const t = useTranslations("inventory");
  const common = useTranslations("common");
  const states = useTranslations("states");
  const options = [{ value: "all", label: t("filters.all") }, { value: "confirmed", label: t("filters.inStock") }, { value: "known-failure", label: t("filters.outOfStock") }, { value: "stale-conflict", label: t("filters.freshCheck") }, { value: "outcome-unknown", label: states("outcome-unknown.label") }];
  const selected = model.selected;
  return <div className="feature-page business-screen">
    <PageHeader title={t("title")} description={t("description")} source="sample" />
    <EntityToolbar action="/inventory" query={model.query} searchLabel={t("searchLabel")} searchPlaceholder={t("searchPlaceholder")} status={model.status} statusLabel={t("filterLabel")} options={options} />
    <BusinessBoundary state={model.validationState} family="inventory" emptyDescription={t("empty")}>
      <div className="entity-master-detail">
        <Table scrollLabel={t("table.label")} className="responsive-table">
          <TableCaption className="sr-only">{t("table.caption")}</TableCaption>
          <TableHeader><TableRow><TableHead>{t("table.product")}</TableHead><TableHead>{t("table.inStock")}</TableHead><TableHead>{t("table.reserved")}</TableHead><TableHead>{t("table.status")}</TableHead><TableHead className="col-secondary">{t("table.lastChecked")}</TableHead><TableHead><span className="sr-only">{common("open")}</span></TableHead></TableRow></TableHeader>
          <TableBody>{model.items.map((item) => <TableRow key={item.id}>
            <TableCell data-label={t("table.product")}><Link className="row-link" href={`/inventory?product=${item.productId}`}>{item.product}</Link><span className="table-cell-note cell-id">{item.sku}</span></TableCell>
            <TableCell data-label={t("table.inStock")} className="quantity-cell">{t(`records.${item.copy}.available`)}</TableCell>
            <TableCell data-label={t("table.reserved")} className="cell-number">{t(`records.${item.copy}.reserved`)}</TableCell>
            <TableCell data-label={t("table.status")}><StatusBadge state={item.state} /><span className="table-cell-note">{t(`records.${item.copy}.state`)}</span></TableCell>
            <TableCell data-label={t("table.lastChecked")} className="col-secondary">{t(`records.${item.copy}.checked`)}</TableCell>
            <TableCell data-label=""><Link className="context-link" href={`/inventory?product=${item.productId}`}>{common("view")}</Link></TableCell>
          </TableRow>)}</TableBody>
        </Table>
        {selected ? <Card className="entity-side-detail"><CardHeader><div><p className="section-kicker">{t("selected")}</p><CardTitle>{selected.product}</CardTitle></div><StatusBadge state={selected.state} /></CardHeader><CardContent>{selected.state === "outcome-unknown" ? <StateNotice state="outcome-unknown" title={t("checkFirst.title")} description={t("checkFirst.description")} /> : null}<BusinessFactList facts={[{ label: t("facts.inStock"), value: t(`records.${selected.copy}.available`), note: t("facts.inStockNote") }, { label: t("facts.reserved"), value: t(`records.${selected.copy}.reserved`), note: t(`records.${selected.copy}.reservation`) }, { label: t("facts.source"), value: t(`records.${selected.copy}.source`), note: t(`records.${selected.copy}.checked`) }, { label: t("facts.note"), value: t(`records.${selected.copy}.note`) }]} /><div className="related-actions"><Link className="context-link" href={`/products?product=${selected.productId}`}>{t("openProduct")}</Link>{selected.relatedOrder ? <Link className="context-link" href={`/orders/${selected.relatedOrder}`}>{t("order", { id: selected.relatedOrder })}</Link> : null}</div><div><Button disabled variant="secondary">{t("refresh")}</Button><p className="muted-copy">{t("refreshUnavailable")}</p></div></CardContent></Card> : null}
      </div>
    </BusinessBoundary>
  </div>;
}
