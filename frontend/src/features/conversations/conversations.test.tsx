import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ConversationList } from "./components/ConversationList";
import { ConversationsScreen } from "./components/ConversationsScreen";
import { demoConversationItems, demoConversationWorkspace } from "./fixtures/demoConversations";
import { getConversationFixtureScreen, parseConversationScenario, parseConversationValidationState } from "./adapters/fixtureAdapter";

describe("Inbox", () => {
  it("renders the list and the selected conversation", () => {
    const markup = renderToStaticMarkup(<ConversationList items={demoConversationItems} selectedId="c-42" />);
    expect(markup).toContain("Amina S.");
    expect(markup).toContain('href="/conversations/c-42"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain("Unread");
  });

  it("parses scenarios and states deterministically", () => {
    expect(parseConversationScenario("handoff")).toBe("handoff");
    expect(parseConversationScenario("invented")).toBe("default");
    expect(parseConversationValidationState("loading")).toBe("loading");
    expect(getConversationFixtureScreen("default", "default", "missing").selected).toBeNull();
  });

  it("renders system events as one compact line", () => {
    const markup = renderToStaticMarkup(<ConversationsScreen model={getConversationFixtureScreen("default", "default")} />);
    expect(markup).toContain("timeline-entry--system");
    expect(markup).toContain("Product and stock details were checked");
  });

  it("never colour-codes the agent and puts details in the side panel", () => {
    const markup = renderToStaticMarkup(<ConversationsScreen model={getConversationFixtureScreen("default", "default")} />);
    expect(markup).toContain("avatar--agent");
    expect(markup).not.toMatch(/badge--(sales|support|analytics)/);
    expect(markup).toContain("conversation-context details-panel");
    expect(markup).toContain("details-grid");
  });

  it("names every actor and never a fourth orchestrator agent", () => {
    const markup = renderToStaticMarkup(<ConversationsScreen model={getConversationFixtureScreen("default", "default")} />);
    expect(markup).toContain("Customer");
    expect(markup).toContain("Support Agent");
    expect(markup).toContain("System");
    expect(markup).not.toContain("Orchestrator Agent");
  });

  it("keeps loading and empty distinct", () => {
    const loading = renderToStaticMarkup(<ConversationsScreen model={getConversationFixtureScreen("loading", "default")} />);
    const empty = renderToStaticMarkup(<ConversationsScreen model={getConversationFixtureScreen("empty", "default")} />);
    expect(loading).toContain("Loading the open conversation");
    expect(empty).toContain("No conversations yet");
  });

  it("explains that messaging is not connected and disables sending", () => {
    const markup = renderToStaticMarkup(<ConversationsScreen model={getConversationFixtureScreen("m08-unavailable", "default")} />);
    expect(markup).toContain("Live messaging is not connected yet");
    expect(markup).toMatch(/<button[^>]*disabled[^>]*><span>Send message<\/span><\/button>/);
    expect(markup).not.toMatch(/M08|fixture|backend/);
  });

  it("hands over from Support to Sales without transferring access", () => {
    const workspace = demoConversationWorkspace("handoff");
    const text = workspace.messages.map((message) => message.body).join(" ");
    expect(workspace.handler).toBe("Sales Agent");
    expect(text).toContain("access rights were not");
    expect(workspace.notice?.description).toContain("do not transfer");
  });

  it("keeps a failed message separate from a confirmed reservation", () => {
    const markup = renderToStaticMarkup(<ConversationsScreen model={getConversationFixtureScreen("default", "delivery-failure")} />);
    expect(markup).toContain("The stock reservation is done");
    expect(markup).toContain("Resend the message only");
    expect(markup).toContain("must not be repeated");
  });

  it("asks for a check instead of a retry when the reservation outcome is unknown", () => {
    const markup = renderToStaticMarkup(<ConversationsScreen model={getConversationFixtureScreen("default", "outcome-unknown")} />);
    expect(markup).toContain("may have gone through");
    expect(markup).toContain("do not try to reserve again");
    expect(markup).not.toContain("OUTCOME_UNKNOWN");
  });
});
