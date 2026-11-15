import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { redirect } from "next/navigation";
import { serverAuthAdapter } from "@/services/auth/server";
import { StateNotice } from "@/components/ui/StateNotice";
import { ApiError } from "@/services/api/client";

export default async function StaffLayout({ children }: { readonly children: ReactNode }) {
  let session;
  try { session = await serverAuthAdapter.getSession(); }
  catch (error) { return <main className="standalone-page"><StateNotice state={error instanceof ApiError && error.status === 403 ? "permission-denied" : "dependency-unavailable"} title="Staff context is unavailable" description="Verified business access is required. No prior-tenant records are shown." /></main>; }
  if (!session) redirect("/login?state=session-expired");
  return <AppShell session={session}>{children}</AppShell>;
}
