import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ConversationList } from "./components/ConversationList";
import { ConversationsScreen } from "./components/ConversationsScreen";
import { demoConversationItems, demoConversationWorkspace } from "./fixtures/demoConversations";
import { getConversationFixtureScreen, parseConversationScenario, parseConversationValidationState } from "./adapters/fixtureAdapter";

describe("P5C conversation fixture boundary", () => {
  it("renders the deterministic list and route-based selected state", () => {
    const markup = renderToStaticMarkup(<ConversationList items={demoConversationItems} selectedId="c-42" />);
    expect(markup).toContain("Amina S.");
    expect(markup).toContain('href="/conversations/c-42"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain("Unread");
  });

  it("keeps fixture and parser behavior deterministic", () => {
    expect(parseConversationScenario("handoff")).toBe("handoff");
    expect(parseConversationScenario("invented")).toBe("default");
    expect(parseConversationValidationState("loading")).toBe("loading");
    expect(getConversationFixtureScreen("default", "default", "missing").selected).toBeNull();
  });

  it("renders explicit actor identities without a fourth orchestrator agent", () => {
    const markup = renderToStaticMarkup(<ConversationsScreen model={getConversationFixtureScreen("default", "default")} />);
    expect(markup).toContain("Customer");
    expect(markup).toContain("Support Agent");
    expect(markup).toContain("System");
    expect(markup).not.toContain("Orchestrator Agent");
  });

  it("renders loading and valid empty states without pretending backend proof", () => {
    const loading = renderToStaticMarkup(<ConversationsScreen model={getConversationFixtureScreen("loading", "default")} />);
    const empty = renderToStaticMarkup(<ConversationsScreen model={getConversationFixtureScreen("empty", "default")} />);
    expect(loading).toContain("Loading selected conversation");
    expect(empty).toContain("No conversations in this fixture view");
    expect(empty).toContain("does not prove");
  });

  it("marks the unavailable M08 boundary and disables message sending", () => {
    const markup = renderToStaticMarkup(<ConversationsScreen model={getConversationFixtureScreen("m08-unavailable", "default")} />);
    expect(markup).toContain("M08 external provider/channel delivery remains PARTIAL / BLOCKED / DEFERRED");
    expect(markup).toMatch(/<button[^>]*disabled[^>]*><span>Send message<\/span><\/button>/);
    expect(markup).toContain("not a live backend session or channel");
  });

  it("represents Support to Sales handoff without transferring permission", () => {
    const workspace = demoConversationWorkspace("handoff");
    const text = workspace.messages.map((message) => message.body).join(" ");
    expect(workspace.handler).toBe("Sales Agent");
    expect(text).toContain("permissions did not transfer");
    expect(workspace.notice?.description).toContain("not live adaptive orchestration");
  });

  it("keeps message delivery failure separate from a confirmed business effect", () => {
    const markup = renderToStaticMarkup(<ConversationsScreen model={getConversationFixtureScreen("default", "delivery-failure")} />);
    expect(markup).toContain("The reservation remains confirmed");
    expect(markup).toContain("Retry communication only");
    expect(markup).toContain("do not replay reserve_inventory");
  });
});
