import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, StatusBadge } from "@/components/ui";
import { BusinessBoundary, BusinessFactList } from "@/features/business";
import type { CustomerDetailModel } from "../types";

/** Customer detail: identity, their conversations and their orders. */
export function CustomerDetailScreen({ model }: { readonly model: CustomerDetailModel }) {
  const customer = model.customer;
  return <div className="feature-page business-screen">
    <PageHeader title={customer?.displayName ?? "Customer"} description={customer ? `${customer.reference} · ${customer.identityContext}` : undefined} source="sample" backHref="/customers" backLabel="Customers" />
    <BusinessBoundary state={model.validationState} family="Customer" emptyDescription="There is no customer with this ID.">{customer ? <>
      <div className="entity-detail-heading"><span>Last updated {customer.observedAt.toLowerCase()}</span><StatusBadge state={customer.verificationState} /></div>
      <div className="entity-detail-grid">
        <Card><CardHeader><CardTitle>Details</CardTitle></CardHeader><CardContent><BusinessFactList facts={[{ label: "Name", value: customer.displayName, note: "Only the details needed for support are shown." }, { label: "Customer ID", value: customer.reference }, { label: "Business", value: "North Shop" }, { label: "Contact channels", value: customer.channelIdentities.join(", "), note: "A linked channel on its own does not prove who the person is." }, { label: "Record", value: customer.provenance, note: customer.observedAt }]} /></CardContent></Card>
        <Card><CardHeader><CardTitle>Conversations</CardTitle></CardHeader><CardContent><ul className="record-links">{customer.relatedConversations.map((item) => <li key={item.id}><Link href={`/conversations/${item.id}`}><strong>{item.label}</strong><span>{item.id} · {item.state}</span></Link></li>)}</ul></CardContent></Card>
        <Card><CardHeader><CardTitle>Orders</CardTitle></CardHeader><CardContent>{customer.relatedOrders.length ? <ul className="record-links">{customer.relatedOrders.map((item) => <li key={item.id}><Link href={`/orders/${item.id}`}><strong>{item.id}</strong><span>{item.label} · {item.state}</span></Link></li>)}</ul> : <p className="muted-copy">No orders yet.</p>}</CardContent></Card>
      </div>
    </> : null}</BusinessBoundary>
  </div>;
}
