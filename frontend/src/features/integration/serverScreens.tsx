import { authenticatedReadApi } from "@/services/auth/server";
import { ApiError } from "@/services/api/client";
import { loadAnalytics, loadConversations, loadCustomer, loadInventory, loadOrder, loadProducts, type Query } from "./adapters";
import { ReadError, RealAnalyticsScreen, RealConversationsScreen, RealCustomerScreen, RealInventoryScreen, RealOrderScreen, RealProductsScreen } from "./components";

export function fixtureReview(query: Query) { return process.env.P5I_ENABLE_FIXTURE_REVIEW === "true" && query.mode === "fixture"; }
async function attempt<T>(read: () => Promise<T>): Promise<{ data: T; error?: never } | { error: ApiError; data?: never }> {
  try { return { data: await read() }; } catch (error) { if (!(error instanceof ApiError)) throw error; return { error }; }
}
export async function ProductsReadPage({ query }: { readonly query: Query }) { const result = await attempt(async () => loadProducts(await authenticatedReadApi(), query)); return result.error ? <ReadError title="Products" error={result.error} /> : <RealProductsScreen model={result.data} />; }
export async function InventoryReadPage({ query }: { readonly query: Query }) { const result = await attempt(async () => loadInventory(await authenticatedReadApi(), query)); return result.error ? <ReadError title="Inventory" error={result.error} /> : <RealInventoryScreen model={result.data} />; }
export async function CustomerReadPage({ id }: { readonly id: string }) { const result = await attempt(async () => loadCustomer(await authenticatedReadApi(), id)); return result.error ? <ReadError title="Customer" error={result.error} /> : <RealCustomerScreen model={result.data} />; }
export async function OrderReadPage({ id }: { readonly id: string }) { const result = await attempt(async () => loadOrder(await authenticatedReadApi(), id)); return result.error ? <ReadError title="Order" error={result.error} /> : <RealOrderScreen model={result.data} />; }
export async function AnalyticsReadPage({ query }: { readonly query: Query }) { const result = await attempt(async () => loadAnalytics(await authenticatedReadApi(), query)); return result.error ? <ReadError title="Analytics" error={result.error} /> : <RealAnalyticsScreen model={result.data} />; }
export async function ConversationsReadPage({ query, id }: { readonly query: Query; readonly id?: string }) { const result = await attempt(async () => loadConversations(await authenticatedReadApi(), query, id)); return result.error ? <ReadError title="Inbox" error={result.error} /> : <RealConversationsScreen model={result.data} />; }
