import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EscalationsScreen } from "./components/EscalationsScreen";
import { getEscalationsFixtureScreen, parseEscalationScenario } from "./adapters/fixtureAdapter";
import { demoEscalationDetail } from "./fixtures/demoEscalations";

describe("Needs review", () => {
  it("shows a waiting case as stopped automation that needs a person", () => {
    const markup = renderToStaticMarkup(<EscalationsScreen model={getEscalationsFixtureScreen("waiting-human")} />);
    expect(markup).toContain("Waiting for a person");
    expect(markup).toContain("Automatic handling stopped");
    expect(markup).toContain("Assigning and deciding from this screen are not available yet");
    expect(markup).not.toMatch(/WAITING_HUMAN|fixture/);
  });

  it("asks for a records check and no blind retry when the outcome is unknown", () => {
    const markup = renderToStaticMarkup(<EscalationsScreen model={getEscalationsFixtureScreen("outcome-unknown")} />);
    expect(markup).toContain("may have gone through");
    expect(markup).toContain("no confirmation came back");
    expect(markup).toContain("Check the stock records");
    expect(markup).toContain("Do not reserve again until the records are checked");
    expect(markup).not.toContain(">Retry transaction<");
    expect(markup).not.toContain(">Repeat order<");
  });

  it("keeps a clear failure separate from an unknown outcome", () => {
    const detail = demoEscalationDetail("known-failure");
    const text = detail.sections.flatMap((section) => section.lines).join(" ");
    expect(detail.state).toBe("known-failure");
    expect(text).toContain("No stock is held for it");
    expect(text).toContain("choose how to proceed");
    expect(text).not.toContain("records are checked");
  });

  it("keeps a blocked order change clear that nothing changed", () => {
    const detail = demoEscalationDetail("restricted");
    const text = detail.sections.flatMap((section) => section.lines).join(" ");
    expect(text).toContain("The order was not changed");
    expect(text).toContain("Nothing on the order should be reported as changed");
  });

  it("shows the planned resume option as a disabled control", () => {
    const markup = renderToStaticMarkup(<EscalationsScreen model={getEscalationsFixtureScreen("resume-target")} />);
    expect(markup).toContain("Resuming automatically is not available yet");
    expect(markup).toMatch(/<button[^>]*disabled[^>]*><span>Resume automatically<\/span><\/button>/);
    expect(markup).not.toMatch(/TARGET|NOT STARTED/);
  });

  it("uses deterministic query parsing and real queue links", () => {
    expect(parseEscalationScenario("outcome-unknown")).toBe("outcome-unknown");
    expect(parseEscalationScenario("invented")).toBe("waiting-human");
    const markup = renderToStaticMarkup(<EscalationsScreen model={getEscalationsFixtureScreen("restricted")} />);
    expect(markup).toContain('href="/escalations?scenario=restricted"');
    expect(markup).toContain('aria-current="page"');
  });
});
