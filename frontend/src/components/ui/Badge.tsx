import type { ComponentPropsWithoutRef } from "react";

/**
 * Tag tones: neutral for metadata, status tones colour the words only.
 * @deprecated `sales`, `support` and `analytics` render exactly like `neutral`: agents are never colour-coded.
 */
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
