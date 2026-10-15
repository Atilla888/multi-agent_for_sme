import type { BadgeTone } from "@/components/ui/Badge";

/** Figma agent colors: Sales green, Support blue, Analytics violet; people stay neutral. */
export function agentTone(handler: string): BadgeTone {
  if (handler.startsWith("Sales")) return "sales";
  if (handler.startsWith("Support")) return "support";
  if (handler.startsWith("Analytics")) return "analytics";
  return "neutral";
}
