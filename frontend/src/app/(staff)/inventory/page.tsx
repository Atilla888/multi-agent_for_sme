import { getInventoryFixtureScreen, InventoryScreen } from "@/features/inventory";
export default async function InventoryPage({ searchParams }: { readonly searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <InventoryScreen model={getInventoryFixtureScreen(await searchParams)} />; }
