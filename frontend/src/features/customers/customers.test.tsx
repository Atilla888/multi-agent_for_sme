import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getCustomerDetailFixture, getCustomerFixtureScreen } from "./adapters/fixtureAdapter";
import { CustomerDetailScreen } from "./components/CustomerDetailScreen";
import { CustomersScreen } from "./components/CustomersScreen";

describe("Customers", () => {
  it("renders the list with sample-data labelling and detail links", () => {
    const markup = renderToStaticMarkup(<CustomersScreen model={getCustomerFixtureScreen({})} />);
    expect(markup).toContain("Sample data");
    expect(markup).toContain("/customers/cust-1042");
    expect(markup).not.toMatch(/fixture|PII/);
  });

  it("filters the sample records without a network call", () => {
    const model = getCustomerFixtureScreen({ q: "C-1043", status: "waiting-human" });
    expect(model.items).toHaveLength(1);
    expect(model.items[0]?.reference).toBe("C-1043");
  });

  it("keeps an empty result and no access distinct", () => {
    expect(renderToStaticMarkup(<CustomersScreen model={getCustomerFixtureScreen({ state: "empty" })} />)).toContain("No customers found");
    const restricted = renderToStaticMarkup(<CustomersScreen model={getCustomerFixtureScreen({ state: "restricted" })} />);
    expect(restricted).toContain("don&#x27;t have access");
    expect(restricted).not.toContain("Amina S.");
  });

  it("links a customer to their orders and keeps the details minimal", () => {
    const markup = renderToStaticMarkup(<CustomerDetailScreen model={getCustomerDetailFixture("cust-1042", undefined)} />);
    expect(markup).toContain("Orders");
    expect(markup).toContain("/orders/ORD-1042");
    expect(markup).toContain("Only the details needed for support are shown");
  });
});
