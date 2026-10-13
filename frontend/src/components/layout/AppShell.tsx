import type { ReactNode } from "react";
import { MainContent } from "./MainContent";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell({ children }: { readonly children: ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell__workspace">
        <TopBar />
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
}
