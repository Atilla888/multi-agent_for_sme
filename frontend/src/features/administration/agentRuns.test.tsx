import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { administrationApiContracts } from "./adapters/contracts";
import { agentRunsFixtureAdapter, getAgentRunsFixtureScreen } from "./adapters/fixtureAdapter";
import { AgentRunsScreen } from "./components/AgentRunsScreen";

function render(query: Record<string, string> = {}) { return renderToStaticMarkup(<AgentRunsScreen model={getAgentRunsFixtureScreen(query)} />); }

describe("AI activity", () => {
  it("fails closed by default and withholds run existence", () => {
    const markup = render();
    expect(markup).toContain("don&#x27;t have access to AI activity");
    expect(markup).toContain("Nothing about its contents is shown");
    expect(markup).not.toContain("RUN-1042");
  });

  it("renders the run list and the selected run", () => {
    const markup = render({ state: "fixture" });
    expect(markup).toContain("RUN-1042");
    expect(markup).toContain("RUN-1045");
    expect(markup).toContain("Support Agent");
    expect(markup).toContain("Human Operator");
    expect(markup).not.toMatch(/MODEL PROPOSES|EXECUTOR AUTHORIZES|M08 |TARGET/);
  });

  it("shows the steps in order: proposed, checked, carried out", () => {
    const markup = render({ state: "fixture" });
    const proposed = markup.indexOf("Agent proposed");
    const checked = markup.indexOf("Permission checked");
    const done = markup.indexOf("Carried out");
    expect(proposed).toBeGreaterThan(-1);
    expect(checked).toBeGreaterThan(proposed);
    expect(done).toBeGreaterThan(checked);
    expect(markup).toContain("Nothing was changed");
  });

  it("shows provider and tool names and no private reasoning or secret", () => {
    const markup = render({ state: "fixture", run: "RUN-1045" });
    expect(markup).toContain("Gemini (development)");
    expect(markup).toContain("Check stock");
    expect(markup).toContain("never its inputs");
    expect(markup).not.toMatch(/chain-of-thought|system prompt|raw argument|password|access[_ -]?token|private[_ -]?key/i);
  });

  it("offers no resume action", () => {
    const markup = render({ state: "fixture" });
    expect(markup).toContain("Resuming paused runs is not available yet");
    expect(markup).not.toMatch(/<button[^>]*>.*Resume/i);
    expect(administrationApiContracts.agentRuns.resume).toBe("TARGET-ONLY");
  });

  it("keeps unavailable, empty and loading distinct", () => {
    expect(render({ state: "unavailable" })).toContain("can&#x27;t be loaded right now");
    expect(render({ state: "empty" })).toContain("No AI activity yet");
    expect(render({ state: "loading" })).toContain("Loading AI activity");
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
