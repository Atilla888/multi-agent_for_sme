import type { ComponentPropsWithoutRef } from "react";

/** Badge tones from the Figma design system: status tones plus one tone per agent. */
export type BadgeTone =
  | "neutral"
  | "information"
  | "success"
  | "warning"
  | "danger"
  | "sales"
  | "support"
  | "analytics";

interface BadgeProps extends ComponentPropsWithoutRef<"span"> {
  readonly tone?: BadgeTone;
}

export function Badge({ className = "", tone = "neutral", ...props }: BadgeProps) {
  return <span className={`badge badge--${tone} ${className}`.trim()} {...props} />;
}
