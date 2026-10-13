import type { ComponentPropsWithoutRef } from "react";

export type BadgeTone = "neutral" | "information";

interface BadgeProps extends ComponentPropsWithoutRef<"span"> {
  readonly tone?: BadgeTone;
}

export function Badge({ className = "", tone = "neutral", ...props }: BadgeProps) {
  return <span className={`badge badge--${tone} ${className}`.trim()} {...props} />;
}
