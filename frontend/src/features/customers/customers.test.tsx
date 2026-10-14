import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getCustomerDetailFixture, getCustomerFixtureScreen } from "./adapters/fixtureAdapter";
import { CustomerDetailScreen } from "./components/CustomerDetailScreen";
import { CustomersScreen } from "./components/CustomersScreen";

describe("P5D Customers fixture boundary", () => {
  it("renders a scoped customer list with accessible detail links", () => {
    const markup = renderToStaticMarkup(<CustomersScreen model={getCustomerFixtureScreen({})} />);
    expect(markup).toContain("LOCAL UI FIXTURE ONLY");
    expect(markup).toContain("Customer fixture records");
    expect(markup).toContain("/customers/cust-1042");
    expect(markup).not.toContain("no unrestricted PII");
  });

  it("filters deterministic fixtures without a network contract", () => {
    const model = getCustomerFixtureScreen({ q: "C-1043", status: "waiting-human" });
    expect(model.items).toHaveLength(1);
    expect(model.items[0]?.reference).toBe("C-1043");
  });

  it("keeps valid empty and permission denial distinct", () => {
    expect(renderToStaticMarkup(<CustomersScreen model={getCustomerFixtureScreen({ state: "empty" })} />)).toContain("No customers in this fixture view");
    const restricted = renderToStaticMarkup(<CustomersScreen model={getCustomerFixtureScreen({ state: "restricted" })} />);
    expect(restricted).toContain("Permission denied");
    expect(restricted).not.toContain("Amina S.");
  });

  it("renders permitted Customer to Order relationships without unrestricted PII", () => {
    const markup = renderToStaticMarkup(<CustomerDetailScreen model={getCustomerDetailFixture("cust-1042", undefined)} />);
    expect(markup).toContain("Related orders");
    expect(markup).toContain("/orders/ORD-1042");
    expect(markup).toContain("no unrestricted PII");
  });
});
