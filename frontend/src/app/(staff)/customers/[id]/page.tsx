import { CustomerDetailScreen, getCustomerDetailFixture } from "@/features/customers";
import { fixtureReview, CustomerReadPage } from "@/features/integration/serverScreens";
export default async function CustomerDetailPage({ params, searchParams }: { readonly params: Promise<{ readonly id: string }>; readonly searchParams: Promise<Record<string, string | string[] | undefined>> }) { const [{ id }, query] = await Promise.all([params, searchParams]); return fixtureReview(query) ? <CustomerDetailScreen model={getCustomerDetailFixture(id, query.state)} /> : <CustomerReadPage id={id} />; }
