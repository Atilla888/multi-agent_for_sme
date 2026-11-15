import { getOrdersFixtureScreen, OrdersScreen } from "@/features/orders";
export default async function OrdersPage({ searchParams }: { readonly searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <OrdersScreen model={getOrdersFixtureScreen(await searchParams)} />; }
