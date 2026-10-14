import type { WebChatScreenModel, WebChatViewState } from "../types";

export interface WebChatDataAdapter {
  getScreen(state: WebChatViewState): WebChatScreenModel;
}

export const webChatApiContract = {
  publicEndpoint: null,
  mode: "LOCAL UI FIXTURE ONLY",
  session: "NOT_CONFIGURED",
  sendMessage: "UNAVAILABLE",
  confirmBusinessAction: "UNAVAILABLE",
  retryDelivery: "UNAVAILABLE",
  m08: "PARTIAL / BLOCKED / DEFERRED",
} as const;
