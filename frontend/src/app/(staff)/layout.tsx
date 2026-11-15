import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { serverAuthAdapter } from "@/services/auth/server";
import { StateNotice } from "@/components/ui/StateNotice";
import { ApiError } from "@/services/api/client";

export default async function StaffLayout({ children }: { readonly children: ReactNode }) {
  let session;
  try { session = await serverAuthAdapter.getSession(); }
  catch (error) {
    const t = await getTranslations("auth.staffUnavailable");
    return <main className="standalone-page"><StateNotice state={error instanceof ApiError && error.status === 403 ? "permission-denied" : "dependency-unavailable"} title={t("title")} description={t("description")} /></main>;
  }
  if (!session) redirect("/login?state=session-expired");
  return <AppShell session={session}>{children}</AppShell>;
}
