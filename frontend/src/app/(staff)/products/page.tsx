import { getProductsFixtureScreen, ProductsScreen } from "@/features/products";
export default async function ProductsPage({ searchParams }: { readonly searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <ProductsScreen model={getProductsFixtureScreen(await searchParams)} />; }
