import { ConversationsScreen, getConversationFixtureScreen, parseConversationScenario, parseConversationValidationState } from "@/features/conversations";

interface ConversationsPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ConversationsPage({ searchParams }: ConversationsPageProps) {
  const query = await searchParams;
  return <ConversationsScreen model={getConversationFixtureScreen(parseConversationValidationState(query.state), parseConversationScenario(query.scenario))} />;
}
