import { DocumentsScreen, getDocumentsFixtureScreen } from "@/features/documents";

export default async function DocumentsPage({ searchParams }: { readonly searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <DocumentsScreen model={getDocumentsFixtureScreen(await searchParams)} />;
}
