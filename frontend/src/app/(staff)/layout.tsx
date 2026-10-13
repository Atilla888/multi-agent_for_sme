import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

export default function StaffLayout({ children }: { readonly children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
