/**
 * Renders every staff screen, the sign-in page and the customer chat with sample data into
 * static HTML files (frontend/.preview/*.html) so the design can be reviewed in a browser
 * without Keycloak or the backend. Run with `npm run preview`.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { compile } from "@tailwindcss/node";
import { renderToStaticMarkup } from "react-dom/server";
import { it, vi } from "vitest";
import type { ReactNode } from "react";

const route = vi.hoisted(() => ({ current: "/overview" }));
vi.mock("next/navigation", () => ({
  usePathname: () => route.current,
  useRouter: () => ({ push() {}, replace() {}, prefetch() {} }),
  redirect: (to: string) => { throw new Error(`redirect:${to}`); },
}));

import { AppShell } from "@/components/layout/AppShell";
import { getOverviewFixture, OverviewScreen } from "@/features/overview";
import { ConversationsScreen, getConversationFixtureScreen } from "@/features/conversations";
import { EscalationsScreen, getEscalationsFixtureScreen } from "@/features/escalations";
import { CustomersScreen, CustomerDetailScreen, getCustomerFixtureScreen, getCustomerDetailFixture } from "@/features/customers";
import { OrdersScreen, OrderDetailScreen, getOrdersFixtureScreen, getOrderDetailFixture } from "@/features/orders";
import { ProductsScreen, getProductsFixtureScreen } from "@/features/products";
import { InventoryScreen, getInventoryFixtureScreen } from "@/features/inventory";
import { DocumentsScreen, DocumentDetailScreen, getDocumentsFixtureScreen, getDocumentDetailFixture } from "@/features/documents";
import { AnalyticsScreen, getAnalyticsFixtureScreen } from "@/features/analytics";
import { ForecastsScreen, getForecastFixtureScreen } from "@/features/forecasts";
import { IntegrationsScreen, SettingsScreen, AuditScreen, AgentRunsScreen, getIntegrationsFixtureScreen, getSettingsFixtureScreen, getAuditFixtureScreen, getAgentRunsFixtureScreen } from "@/features/administration";
import { CustomerWebChatScreen, getWebChatFixtureScreen } from "@/features/webchat";
import LoginPage from "@/app/(auth)/login/page";
import { RealAnalyticsScreen, RealCustomerScreen, RealInventoryScreen, RealOrderScreen, RealProductsScreen } from "@/features/integration/components";
import { RealConversationsScreen } from "@/features/integration/RealConversationsScreen";
import { liveAnalytics, liveConversations, liveCustomer, liveInventory, liveOrder, liveProducts } from "./liveStubs";
import type { AuthenticatedSession } from "@/types/auth";
import { testLocale } from "@/test/intl";

const session: AuthenticatedSession = { subject: "preview", displayName: "Aruzhan Kassym", roles: ["OWNER"], activeBusinessId: "north-shop", expiresAt: "", businessName: "North Shop" };

const screens: Record<string, () => ReactNode> = {
  overview: () => <OverviewScreen model={getOverviewFixture()} />,
  conversations: () => <ConversationsScreen model={getConversationFixtureScreen("default", "default")} />,
  escalations: () => <EscalationsScreen model={getEscalationsFixtureScreen("waiting-human")} />,
  customers: () => <CustomersScreen model={getCustomerFixtureScreen({})} />,
  "customers/cust-1042": () => <CustomerDetailScreen model={getCustomerDetailFixture("cust-1042", undefined)} />,
  orders: () => <OrdersScreen model={getOrdersFixtureScreen({})} />,
  "orders/ORD-1044": () => <OrderDetailScreen model={getOrderDetailFixture("ORD-1044", {})} />,
  products: () => <ProductsScreen model={getProductsFixtureScreen({})} />,
  inventory: () => <InventoryScreen model={getInventoryFixtureScreen({})} />,
  documents: () => <DocumentsScreen model={getDocumentsFixtureScreen({})} />,
  "documents/doc-shipping": () => <DocumentDetailScreen model={getDocumentDetailFixture("doc-shipping", {})} />,
  analytics: () => <AnalyticsScreen model={getAnalyticsFixtureScreen({})} />,
  forecasts: () => <ForecastsScreen model={getForecastFixtureScreen({})} />,
  integrations: () => <IntegrationsScreen model={getIntegrationsFixtureScreen({})} />,
  settings: () => <SettingsScreen model={getSettingsFixtureScreen({})} />,
  audit: () => <AuditScreen model={getAuditFixtureScreen({ state: "fixture" })} />,
  "agent-runs": () => <AgentRunsScreen model={getAgentRunsFixtureScreen({ state: "fixture" })} />,
  // Live-data screens (what the app shows by default), rendered from stub read models.
  "live/conversations": () => <RealConversationsScreen model={liveConversations} />,
  "live/products": () => <RealProductsScreen model={liveProducts} />,
  "live/inventory": () => <RealInventoryScreen model={liveInventory} />,
  "live/customer": () => <RealCustomerScreen model={liveCustomer} />,
  "live/order": () => <RealOrderScreen model={liveOrder} />,
  "live/analytics": () => <RealAnalyticsScreen model={liveAnalytics} />,
};

const theme = process.env.PREVIEW_THEME === "dark" ? "dark" : "light"; // PREVIEW_THEME=dark npm run preview
const locale = testLocale(); // PREVIEW_LOCALE=ru|kk npm run preview

function page(title: string, css: string, body: string): string {
  return `<!doctype html><html lang="${locale}" data-theme="${theme}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap"><style>${css}</style></head><body>${body}</body></html>`;
}

it("writes every screen to .preview/", async () => {
  const root = fileURLToPath(new URL("../../", import.meta.url));
  const out = `${root}.preview/`;
  mkdirSync(out, { recursive: true });
  const stylesDir = `${root}src/styles`;
  const { readFileSync } = await import("node:fs");
  const compiler = await compile(readFileSync(`${stylesDir}/globals.css`, "utf8"), { base: stylesDir, onDependency() {} });
  const css = compiler.build([]);
  for (const [name, render] of Object.entries(screens)) {
    route.current = `/${name}`;
    const markup = renderToStaticMarkup(<AppShell session={session}>{render()}</AppShell>);
    writeFileSync(`${out}${name.replaceAll("/", "__")}.html`, page(name, css, markup));
  }
  writeFileSync(`${out}chat.html`, page("chat", css, renderToStaticMarkup(<CustomerWebChatScreen model={getWebChatFixtureScreen({ state: "confirmation" })} />)));
  Object.assign(process.env, { APP_ORIGIN: "http://127.0.0.1:3000", API_SERVER_BASE_URL: "http://127.0.0.1:8000", OIDC_ISSUER: "http://127.0.0.1:8080/realms/preview", OIDC_CLIENT_ID: "preview", APP_BUSINESS_ID: "00000000-0000-4000-8000-000000000001", OIDC_ALLOW_LOCAL_HTTP: "true" });
  writeFileSync(`${out}login.html`, page("login", css, renderToStaticMarkup(await LoginPage({ searchParams: Promise.resolve({}) }))));
});
