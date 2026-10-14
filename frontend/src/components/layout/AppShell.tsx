import type { ReactNode } from "react";
import { MainContent } from "./MainContent";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import type { AuthenticatedSession } from "@/types/auth";

export function AppShell({ children, session }: { readonly children: ReactNode; readonly session?: AuthenticatedSession }) {
  return (
    <div className="app-shell">
      <Sidebar session={session} />
      <div className="app-shell__workspace">
        <TopBar session={session} />
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
}
