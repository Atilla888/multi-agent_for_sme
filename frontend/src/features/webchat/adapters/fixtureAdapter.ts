import { buildDemoWebChat } from "../fixtures/demoWebChat";
import type { WebChatScreenModel, WebChatViewState } from "../types";
import type { WebChatDataAdapter } from "./contracts";

const states: readonly WebChatViewState[] = ["initial", "active", "clarification", "confirmation", "processing", "confirmed", "known-failure", "waiting-human", "confirmation-pending", "delivery-failure", "loading", "unavailable"];

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export const webChatFixtureAdapter: WebChatDataAdapter = {
  getScreen(state) { return buildDemoWebChat(state); },
};

export function getWebChatFixtureScreen(query: Record<string, string | string[] | undefined>): WebChatScreenModel {
  const requested = first(query.state);
  const state = states.includes(requested as WebChatViewState) ? (requested as WebChatViewState) : "active";
  return webChatFixtureAdapter.getScreen(state);
}
