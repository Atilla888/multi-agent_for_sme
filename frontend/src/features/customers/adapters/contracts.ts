import type { CustomerDetailView, CustomerListItem } from "../types";
export interface CustomerDataAdapter { list(query: string, status: string): readonly CustomerListItem[]; detail(id: string): CustomerDetailView | null; }
export const customerApiContract = { publicEndpoint: null, mode: "UNAVAILABLE", internalEvidence: "Customer domain model, identity links, tenant/customer policy" } as const;
