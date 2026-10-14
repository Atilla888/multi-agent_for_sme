import { AgentRunsScreen, getAgentRunsFixtureScreen } from "@/features/administration";

export default async function AgentRunsPage({ searchParams }: { readonly searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <AgentRunsScreen model={getAgentRunsFixtureScreen(await searchParams)} />;
}
