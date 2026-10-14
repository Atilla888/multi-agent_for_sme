import { getInventoryFixtureScreen, InventoryScreen } from "@/features/inventory";
import { fixtureReview, InventoryReadPage } from "@/features/integration/serverScreens";
export default async function InventoryPage({ searchParams }: { readonly searchParams: Promise<Record<string, string | string[] | undefined>> }) { const query = await searchParams; return fixtureReview(query) ? <InventoryScreen model={getInventoryFixtureScreen(query)} /> : <InventoryReadPage query={query} />; }
