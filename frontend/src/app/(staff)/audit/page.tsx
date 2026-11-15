import { AuditScreen, getAuditFixtureScreen } from "@/features/administration";

export default async function AuditPage({ searchParams }: { readonly searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <AuditScreen model={getAuditFixtureScreen(await searchParams)} />;
}
