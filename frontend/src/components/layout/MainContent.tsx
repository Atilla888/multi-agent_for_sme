import type { ReactNode } from "react";

export function MainContent({ children }: { readonly children: ReactNode }) {
  return <main className="main-content">{children}</main>;
}
