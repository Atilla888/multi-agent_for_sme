import { getProductsFixtureScreen, ProductsScreen } from "@/features/products";
import { fixtureReview, ProductsReadPage } from "@/features/integration/serverScreens";
export default async function ProductsPage({ searchParams }: { readonly searchParams: Promise<Record<string, string | string[] | undefined>> }) { const query = await searchParams; return fixtureReview(query) ? <ProductsScreen model={getProductsFixtureScreen(query)} /> : <ProductsReadPage query={query} />; }
