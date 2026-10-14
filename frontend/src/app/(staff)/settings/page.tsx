import { getSettingsFixtureScreen, SettingsScreen } from "@/features/administration";

export default async function SettingsPage({ searchParams }: { readonly searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <SettingsScreen model={getSettingsFixtureScreen(await searchParams)} />;
}
