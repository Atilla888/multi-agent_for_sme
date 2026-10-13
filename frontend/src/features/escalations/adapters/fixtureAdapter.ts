import { demoEscalationDetail, demoEscalationQueue } from "../fixtures/demoEscalations";
import type { EscalationScenario, EscalationsScreenModel } from "../types";

const scenarios = new Set<EscalationScenario>(["waiting-human", "outcome-unknown", "known-failure", "restricted", "resume-target", "resolved"]);

export function parseEscalationScenario(value: string | string[] | undefined): EscalationScenario {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate && scenarios.has(candidate as EscalationScenario) ? candidate as EscalationScenario : "waiting-human";
}
export function getEscalationsFixtureScreen(scenario: EscalationScenario): EscalationsScreenModel {
  return { mode: "LOCAL UI FIXTURE ONLY", queue: demoEscalationQueue, selected: demoEscalationDetail(scenario) };
}
