import type { ComponentPropsWithoutRef } from "react";

export function ContextHelper({ className = "", ...props }: ComponentPropsWithoutRef<"aside">) {
  return <aside className={`context-helper ${className}`.trim()} role="note" {...props} />;
}
