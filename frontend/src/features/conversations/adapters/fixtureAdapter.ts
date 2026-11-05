import { demoConversationItems, demoConversationWorkspace } from "../fixtures/demoConversations";
import type { ConversationScenario, ConversationScreenModel, ConversationValidationState } from "../types";

const validationStates = new Set<ConversationValidationState>(["default", "loading", "empty", "restricted", "m08-unavailable"]);
const scenarios = new Set<ConversationScenario>(["default", "handoff", "waiting-human", "known-failure", "outcome-unknown", "delivery-failure"]);

export function parseConversationValidationState(value: string | string[] | undefined): ConversationValidationState {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate && validationStates.has(candidate as ConversationValidationState) ? candidate as ConversationValidationState : "default";
}
export function parseConversationScenario(value: string | string[] | undefined): ConversationScenario {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate && scenarios.has(candidate as ConversationScenario) ? candidate as ConversationScenario : "default";
}

export function getConversationFixtureScreen(validationState: ConversationValidationState, scenario: ConversationScenario, selectedId = "c-42"): ConversationScreenModel {
  if (validationState === "empty") return { mode: "sample", items: [], selected: null, validationState };
  return { mode: "sample", items: demoConversationItems, selected: selectedId === "c-42" ? demoConversationWorkspace(scenario) : null, validationState };
}
