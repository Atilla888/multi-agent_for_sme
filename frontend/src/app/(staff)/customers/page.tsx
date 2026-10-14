import { CustomersScreen, getCustomerFixtureScreen } from "@/features/customers";
export default async function CustomersPage({ searchParams }: { readonly searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <CustomersScreen model={getCustomerFixtureScreen(await searchParams)} />; }
