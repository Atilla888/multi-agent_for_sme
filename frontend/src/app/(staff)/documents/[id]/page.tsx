import { DocumentDetailScreen, getDocumentDetailFixture } from "@/features/documents";

export default async function DocumentDetailPage({ params, searchParams }: { readonly params: Promise<{ readonly id: string }>; readonly searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  return <DocumentDetailScreen model={getDocumentDetailFixture(id, query)} />;
}
