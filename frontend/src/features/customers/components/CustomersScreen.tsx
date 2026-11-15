import Link from "next/link";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { BusinessBoundary, EntityToolbar } from "@/features/business";
import type { CustomerScreenModel } from "../types";
import { useCustomerWords } from "./useCustomerWords";

/** Customers list. */
export function CustomersScreen({ model }: { readonly model: CustomerScreenModel }) {
  const t = useTranslations("customers");
  const common = useTranslations("common");
  const states = useTranslations("states");
  const words = useCustomerWords();
  const statusOptions = [{ value: "all", label: t("filters.all") }, { value: "confirmed", label: t("filters.verified") }, { value: "waiting-human", label: t("filters.needsVerification") }, { value: "stale-conflict", label: states("stale-conflict.label") }];
  const columns = { customer: t("columns.customer"), contactChannel: t("columns.contactChannel"), status: t("columns.status"), activity: t("columns.activity"), updated: t("columns.updated") };
  return <div className="feature-page business-screen">
    <PageHeader title={t("title")} source="sample" />
    <section className="card list-card" aria-label={t("listLabel")}>
      <EntityToolbar action="/customers" query={model.query} searchLabel={t("searchLabel")} searchPlaceholder={t("searchPlaceholder")} status={model.status} statusLabel={t("filterLabel")} options={statusOptions} />
      <BusinessBoundary state={model.validationState} family="customers" emptyDescription={t("emptyDescription")}>
        <Table scrollLabel={t("title")} className="responsive-table">
          <TableCaption className="sr-only">{t("caption")}</TableCaption>
          <TableHeader><TableRow><TableHead>{columns.customer}</TableHead><TableHead>{columns.contactChannel}</TableHead><TableHead>{columns.status}</TableHead><TableHead className="col-secondary">{columns.activity}</TableHead><TableHead className="col-secondary">{columns.updated}</TableHead><TableHead><span className="sr-only">{common("open")}</span></TableHead></TableRow></TableHeader>
          <TableBody>{model.items.map((customer) => <TableRow key={customer.id}>
            <TableCell data-label={columns.customer}><Link className="row-link" href={`/customers/${customer.id}`}>{customer.displayName}</Link><span className="table-cell-note cell-id">{customer.reference}</span></TableCell>
            <TableCell data-label={columns.contactChannel}>{words.identity(customer.identity)}</TableCell>
            <TableCell data-label={columns.status}><StatusBadge state={customer.verificationState} /></TableCell>
            <TableCell data-label={columns.activity} className="col-secondary">{t("activity", { conversations: customer.conversations, orders: customer.orders })}</TableCell>
            <TableCell data-label={columns.updated} className="col-secondary">{words.time(customer.observedAt)}</TableCell>
            <TableCell data-label=""><Link className="context-link" href={`/customers/${customer.id}`}>{common("view")}</Link></TableCell>
          </TableRow>)}</TableBody>
        </Table>
      </BusinessBoundary>
    </section>
  </div>;
}
