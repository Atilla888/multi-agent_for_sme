import { AnalyticsScreen, getAnalyticsFixtureScreen } from "@/features/analytics";
import { fixtureReview, AnalyticsReadPage } from "@/features/integration/serverScreens";

export default async function AnalyticsPage({ searchParams }: { readonly searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  return fixtureReview(query) ? <AnalyticsScreen model={getAnalyticsFixtureScreen(query)} /> : <AnalyticsReadPage query={query} />;
}
