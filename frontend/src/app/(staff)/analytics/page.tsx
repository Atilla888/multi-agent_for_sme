import { AnalyticsScreen, getAnalyticsFixtureScreen } from "@/features/analytics";

export default async function AnalyticsPage({ searchParams }: { readonly searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <AnalyticsScreen model={getAnalyticsFixtureScreen(await searchParams)} />;
}
