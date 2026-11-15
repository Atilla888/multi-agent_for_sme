import type { HTMLAttributes } from "react";

export interface SeparatorProps extends HTMLAttributes<HTMLElement> {
  readonly decorative?: boolean;
  readonly orientation?: "horizontal" | "vertical";
}

export function Separator({ className = "", decorative = true, orientation = "horizontal", ...props }: SeparatorProps) {
  if (orientation === "horizontal") {
    return <hr className={`separator separator--horizontal ${className}`.trim()} aria-hidden={decorative || undefined} {...props} />;
  }
  return (
    <span
      aria-hidden={decorative || undefined}
      aria-orientation={decorative ? undefined : "vertical"}
      className={`separator separator--vertical ${className}`.trim()}
      role={decorative ? "presentation" : "separator"}
      {...props}
    />
  );
}
