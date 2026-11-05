import { ConversationsScreen, getConversationFixtureScreen, parseConversationScenario, parseConversationValidationState } from "@/features/conversations";
import { ConversationsReadPage, fixtureReview } from "@/features/integration/serverScreens";

interface ConversationsPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ConversationsPage({ searchParams }: ConversationsPageProps) {
  const query = await searchParams;
  return fixtureReview(query) ? <ConversationsScreen model={getConversationFixtureScreen(parseConversationValidationState(query.state), parseConversationScenario(query.scenario))} /> : <ConversationsReadPage query={query} />;
}
