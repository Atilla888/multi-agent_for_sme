import { ConversationsScreen, getConversationFixtureScreen, parseConversationScenario, parseConversationValidationState } from "@/features/conversations";
import { ConversationsReadPage, fixtureReview } from "@/features/integration/serverScreens";

interface ConversationDetailPageProps {
  readonly params: Promise<{ readonly id: string }>;
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ConversationDetailPage({ params, searchParams }: ConversationDetailPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  return fixtureReview(query) ? <ConversationsScreen model={getConversationFixtureScreen(parseConversationValidationState(query.state), parseConversationScenario(query.scenario), id)} /> : <ConversationsReadPage query={query} id={id} />;
}
