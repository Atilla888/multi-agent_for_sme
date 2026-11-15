import { getOrderDetailFixture, OrderDetailScreen } from "@/features/orders";
import { fixtureReview, OrderReadPage } from "@/features/integration/serverScreens";
export default async function OrderDetailPage({ params, searchParams }: { readonly params: Promise<{ readonly id: string }>; readonly searchParams: Promise<Record<string, string | string[] | undefined>> }) { const [{ id }, query] = await Promise.all([params, searchParams]); return fixtureReview(query) ? <OrderDetailScreen model={getOrderDetailFixture(id, query)} /> : <OrderReadPage id={id} />; }
