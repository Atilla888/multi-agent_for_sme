import { BUSINESS_FIXTURE_MODE, parseBusinessValidationState } from "@/features/business";
import { demoCustomers } from "../fixtures/demoCustomers";
import type { CustomerDataAdapter } from "./contracts";
import type { CustomerDetailModel, CustomerScreenModel } from "../types";
export const customerFixtureAdapter: CustomerDataAdapter = {
  list(query, status) { const needle = query.trim().toLocaleLowerCase(); return demoCustomers.filter((customer) => (!needle || `${customer.reference} ${customer.displayName}`.toLocaleLowerCase().includes(needle)) && (status === "all" || customer.verificationState === status)); },
  detail(id) { return demoCustomers.find((customer) => customer.id === id) ?? null; },
};
function first(value: string | string[] | undefined): string { return Array.isArray(value) ? value[0] ?? "" : value ?? ""; }
export function getCustomerFixtureScreen(query: Record<string, string | string[] | undefined>): CustomerScreenModel {
  const validationState = parseBusinessValidationState(query.state); const search = first(query.q); const status = first(query.status) || "all"; const items = validationState === "default" ? customerFixtureAdapter.list(search, status) : [];
  return { mode: BUSINESS_FIXTURE_MODE, validationState: validationState === "default" && items.length === 0 ? "empty" : validationState, items, query: search, status };
}
export function getCustomerDetailFixture(id: string, state: string | string[] | undefined): CustomerDetailModel {
  const validationState = parseBusinessValidationState(state); const customer = customerFixtureAdapter.detail(id);
  return { mode: BUSINESS_FIXTURE_MODE, validationState: validationState === "default" && !customer ? "empty" : validationState, customer: validationState === "default" ? customer : null };
}
