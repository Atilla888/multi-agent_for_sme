import { getIntegrationsFixtureScreen, IntegrationsScreen } from "@/features/administration";

export default async function IntegrationsPage({ searchParams }: { readonly searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <IntegrationsScreen model={getIntegrationsFixtureScreen(await searchParams)} />;
}
