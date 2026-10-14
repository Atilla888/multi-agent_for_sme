import { CustomerWebChatScreen, getWebChatFixtureScreen } from "@/features/webchat";

export default async function CustomerChatPage({ searchParams }: { readonly searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <CustomerWebChatScreen model={getWebChatFixtureScreen(await searchParams)} />;
}
