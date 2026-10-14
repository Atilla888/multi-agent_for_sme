import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { webChatApiContract } from "./adapters/contracts";
import { getWebChatFixtureScreen, webChatFixtureAdapter } from "./adapters/fixtureAdapter";
import { CustomerWebChatScreen } from "./components/CustomerWebChatScreen";

function render(state: string) { return renderToStaticMarkup(<CustomerWebChatScreen model={getWebChatFixtureScreen({ state })} />); }

describe("P5G Customer Web Chat", () => {
  it("uses a separate customer shell without staff navigation", () => {
    const markup = render("active");
    expect(markup).toContain("customer-chat-shell");
    expect(markup).toContain("North Shop");
    expect(markup).not.toContain("Staff workspace");
    expect(markup).not.toContain("Administration");
    expect(markup).not.toContain("Business switch");
  });

  it("renders customer and supported business actors with explicit identity", () => {
    const model = getWebChatFixtureScreen({ state: "confirmation" });
    const markup = renderToStaticMarkup(<CustomerWebChatScreen model={model} />);
    expect(model.messages.map((message) => message.actor)).toEqual(["Customer", "Sales Agent"]);
    expect(markup).toContain("You");
    expect(markup).toContain("North Shop sales");
  });

  it("keeps transport unavailable and performs no network call", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    webChatFixtureAdapter.getScreen("active");
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(webChatApiContract.publicEndpoint).toBeNull();
    expect(webChatApiContract.sendMessage).toBe("UNAVAILABLE");
    const markup = render("active");
    expect(markup).toContain("Web Chat · Not configured");
    expect(markup).toMatch(/<textarea[^>]*disabled=""/);
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*><span>Send · unavailable<\/span>/);
    vi.unstubAllGlobals();
  });

  it("names order confirmation and disables both unavailable actions", () => {
    const markup = render("confirmation");
    expect(markup).toContain("Confirm order · unavailable");
    expect(markup).toContain("Change details · unavailable");
    expect(markup).toContain("This preview cannot execute it");
    expect(markup.match(/disabled=""/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it("shows neutral processing copy without an invented customer CTA", () => {
    const markup = render("processing");
    expect(markup).toContain("We&#x27;ll update you here when the result is available");
    expect(markup).toContain("No further action is needed right now");
    expect(markup).not.toContain("Keep chat open");
    expect(markup).not.toContain("Confirm order");
  });

  it("protects customers from duplicate ordering after known reservation failure", () => {
    const markup = render("known-failure");
    expect(markup).toContain("Order ORD-1042 already exists");
    expect(markup).toContain("Item was not reserved");
    expect(markup).toContain("Please don&#x27;t place the same order again");
    expect(markup).toContain("Ask for help · unavailable");
  });

  it("uses plain-language uncertain-result semantics and prevents resubmission", () => {
    const markup = render("confirmation-pending");
    expect(markup).toContain("may have gone through");
    expect(markup).toContain("Please do not submit the same request again");
    expect(markup).not.toContain("OUTCOME_UNKNOWN");
    expect(markup).not.toContain("ToolCall");
    expect(markup).not.toContain("Agent Run");
  });

  it("keeps confirmed business effect separate from failed message delivery", () => {
    const markup = render("delivery-failure");
    expect(markup).toContain("Reservation remains confirmed");
    expect(markup).toContain("Message</span><strong>Not delivered");
    expect(markup).toContain("Retry message · unavailable");
    expect(markup).toContain("must never place the order or reserve inventory again");
  });

  it("renders Waiting Human without promising completion", () => {
    const markup = render("waiting-human");
    expect(markup).toContain("A person is reviewing this");
    expect(markup).toContain("does not promise completion");
  });

  it("keeps loading and unavailable states distinct from an empty chat", () => {
    const loading = render("loading");
    const unavailable = render("unavailable");
    expect(loading).toContain("Loading customer conversation");
    expect(unavailable).toContain("Customer service is unavailable");
    expect(unavailable).toContain("No answer, send receipt, or business result is fabricated");
    expect(unavailable).not.toContain("Customer conversation messages");
  });

  it("contains a mobile-safe structural boundary and no internal runtime terminology", () => {
    const states = ["initial", "active", "clarification", "confirmation", "processing", "confirmed", "known-failure", "waiting-human", "confirmation-pending", "delivery-failure"];
    const markup = states.map(render).join("\n");
    expect(markup).toContain("customer-chat-page");
    expect(markup).toContain("webchat-timeline");
    expect(markup).not.toMatch(/LangGraph|Adaptive Orchestrator|raw prompt|chain-of-thought|M12|E02/);
  });
});
