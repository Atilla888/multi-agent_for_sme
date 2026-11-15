import { ForecastsScreen, getForecastFixtureScreen } from "@/features/forecasts";

export default async function ForecastsPage({ searchParams }: { readonly searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <ForecastsScreen model={getForecastFixtureScreen(await searchParams)} />;
}
