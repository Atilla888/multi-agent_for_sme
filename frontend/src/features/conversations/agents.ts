import type { ConversationActor } from "./types";

/** True for the AI specialists (Sales, Support, Analytics), which are shown with a neutral agent avatar. */
export function isAgent(name: string): boolean {
  return /^(Sales|Support|Analytics)\b/.test(name);
}

/** Where each actor's name lives under conversations.actors. */
export const actorKey = {
  Customer: "customer",
  "Human Operator": "humanOperator",
  "Sales Agent": "salesAgent",
  "Support Agent": "supportAgent",
  "Analytics Agent": "analyticsAgent",
  System: "system",
} as const satisfies Record<ConversationActor, string>;
