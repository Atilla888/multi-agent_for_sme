import { EscalationsScreen, getEscalationsFixtureScreen, parseEscalationScenario } from "@/features/escalations";

interface EscalationsPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function EscalationsPage({ searchParams }: EscalationsPageProps) {
  const query = await searchParams;
  return <EscalationsScreen model={getEscalationsFixtureScreen(parseEscalationScenario(query.scenario))} />;
}
