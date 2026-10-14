import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { administrationApiContracts } from "./adapters/contracts";
import { agentRunsFixtureAdapter, getAgentRunsFixtureScreen } from "./adapters/fixtureAdapter";
import { AgentRunsScreen } from "./components/AgentRunsScreen";

function render(query: Record<string, string> = {}) { return renderToStaticMarkup(<AgentRunsScreen model={getAgentRunsFixtureScreen(query)} />); }

describe("P5H Agent Runs", () => {
  it("fails closed by default and withholds run existence", () => {
    const markup = render();
    expect(markup).toContain("Agent Runs access is restricted");
    expect(markup).toContain("Run existence");
    expect(markup).not.toContain("RUN-1042");
  });

  it("renders a restricted fixture list and selected run detail", () => {
    const markup = render({ state: "fixture" });
    expect(markup).toContain("Restricted agent run fixtures");
    expect(markup).toContain("RUN-1042");
    expect(markup).toContain("RUN-1045");
    expect(markup).toContain("Support Agent");
    expect(markup).toContain("Human Operator");
  });

  it("shows the trusted activity boundary in order", () => {
    const markup = render({ state: "fixture" });
    const proposed = markup.indexOf("MODEL PROPOSES");
    const authorized = markup.indexOf("EXECUTOR AUTHORIZES");
    const enforced = markup.indexOf("DOMAIN ENFORCES");
    expect(proposed).toBeGreaterThan(-1);
    expect(authorized).toBeGreaterThan(proposed);
    expect(enforced).toBeGreaterThan(authorized);
    expect(markup).toContain("no mutation was attempted");
  });

  it("contains safe provider/tool metadata and no private reasoning or secret", () => {
    const markup = render({ state: "fixture", run: "RUN-1045" });
    expect(markup).toContain("Safe provider metadata");
    expect(markup).toContain("M08");
    expect(markup).toContain("check_inventory");
    expect(markup).not.toMatch(/chain-of-thought|system prompt|raw argument|password|access[_ -]?token|private[_ -]?key/i);
  });

  it("keeps M12 target-only without a Resume action", () => {
    const markup = render({ state: "fixture" });
    expect(markup).toContain("Durable Resume is not available");
    expect(markup).toContain("M12 remains TARGET / NOT STARTED");
    expect(markup).not.toMatch(/<button[^>]*>.*Resume/i);
    expect(administrationApiContracts.agentRuns.resume).toBe("TARGET-ONLY");
  });

  it("keeps unavailable, empty, and loading states distinct", () => {
    expect(render({ state: "unavailable" })).toContain("Run evidence is unavailable");
    expect(render({ state: "empty" })).toContain("No authorized fixture runs");
    expect(render({ state: "loading" })).toContain("Loading authorized run summaries");
  });

  it("is network-free and declares contextual restricted access", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    agentRunsFixtureAdapter.getScreen({ state: "fixture" });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(administrationApiContracts.agentRuns.publicEndpoint).toBeNull();
    expect(administrationApiContracts.agentRuns.access).toBe("CONTEXTUAL / RESTRICTED");
    vi.unstubAllGlobals();
  });
});
