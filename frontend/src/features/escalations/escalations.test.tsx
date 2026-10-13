import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EscalationsScreen } from "./components/EscalationsScreen";
import { getEscalationsFixtureScreen, parseEscalationScenario } from "./adapters/fixtureAdapter";
import { demoEscalationDetail } from "./fixtures/demoEscalations";

describe("P5C escalation safety states", () => {
  it("renders WAITING_HUMAN as an automation stop", () => {
    const markup = renderToStaticMarkup(<EscalationsScreen model={getEscalationsFixtureScreen("waiting-human")} />);
    expect(markup).toContain("WAITING_HUMAN");
    expect(markup).toContain("Automation stopped");
    expect(markup).toContain("No fake assignment or resume is performed");
  });

  it("requires both reconciliation and no-blind-retry semantics for OUTCOME_UNKNOWN", () => {
    const markup = renderToStaticMarkup(<EscalationsScreen model={getEscalationsFixtureScreen("outcome-unknown")} />);
    expect(markup).toContain("The mutation may have committed");
    expect(markup).toContain("confirmation is unavailable");
    expect(markup).toContain("Reconcile authoritative reservation state");
    expect(markup).toContain("no blind retry");
    expect(markup).not.toContain(">Retry transaction<");
    expect(markup).not.toContain(">Repeat order<");
  });

  it("keeps known failure separate from OUTCOME_UNKNOWN", () => {
    const detail = demoEscalationDetail("known-failure");
    const text = detail.sections.flatMap((section) => section.lines).join(" ");
    expect(detail.state).toBe("known-failure");
    expect(text).toContain("Inventory is not reserved");
    expect(text).toContain("authorized recovery path");
    expect(text).not.toContain("Reconcile against authoritative");
  });

  it("keeps E02 restricted and claims no changed order", () => {
    const detail = demoEscalationDetail("restricted");
    const text = detail.sections.flatMap((section) => section.lines).join(" ");
    expect(text).toContain("update_order did not execute");
    expect(text).toContain("No changed order may be claimed");
  });

  it("renders M12 Resume as disabled TARGET-only", () => {
    const markup = renderToStaticMarkup(<EscalationsScreen model={getEscalationsFixtureScreen("resume-target")} />);
    expect(markup).toContain("M12 durable Resume · TARGET / NOT STARTED");
    expect(markup).toContain("no current backend call, persistence, or successful transition");
    expect(markup).toMatch(/<button[^>]*disabled[^>]*><span>Request controlled Resume · TARGET<\/span><\/button>/);
  });

  it("uses deterministic query parsing and real queue links", () => {
    expect(parseEscalationScenario("outcome-unknown")).toBe("outcome-unknown");
    expect(parseEscalationScenario("invented")).toBe("waiting-human");
    const markup = renderToStaticMarkup(<EscalationsScreen model={getEscalationsFixtureScreen("restricted")} />);
    expect(markup).toContain('href="/escalations?scenario=restricted"');
    expect(markup).toContain('aria-current="page"');
  });
});
