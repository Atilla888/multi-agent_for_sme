import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { administrationApiContracts } from "./adapters/contracts";
import { auditFixtureAdapter, getAuditFixtureScreen } from "./adapters/fixtureAdapter";
import { AuditScreen } from "./components/AuditScreen";

function render(query: Record<string, string> = {}) { return renderToStaticMarkup(<AuditScreen model={getAuditFixtureScreen(query)} />); }

describe("P5H Audit", () => {
  it("fails closed by default and withholds fixture event existence", () => {
    const markup = render();
    expect(markup).toContain("Audit access is restricted");
    expect(markup).toContain("Event existence and protected fields remain concealed");
    expect(markup).not.toContain("AUD-1042");
  });

  it("renders authorized fixture rows with semantic durable evidence", () => {
    const markup = render({ state: "fixture" });
    expect(markup).toContain("Redacted audit fixture events");
    expect(markup).toContain("reserve_inventory");
    expect(markup).toContain("update_order");
    expect(markup).toContain("REJECTED · E02");
    expect(markup).toContain("RECONCILIATION REQUIRED");
  });

  it("renders selected safe detail without secret or reasoning fields", () => {
    const markup = render({ state: "fixture", event: "AUD-1043" });
    expect(markup).toContain("Selected redacted fixture event");
    expect(markup).toContain("corr-demo-1043");
    expect(markup).toContain("The unsupported order update was rejected before a business effect");
    expect(markup).not.toMatch(/password|access[_ -]?token|private[_ -]?key|raw prompt|reasoning trace/i);
  });

  it("filters only deterministic safe fixture fields", () => {
    const model = getAuditFixtureScreen({ state: "fixture", q: "reconciliation" });
    expect(model.items.map((item) => item.id)).toEqual(["AUD-1044"]);
    const empty = getAuditFixtureScreen({ state: "fixture", q: "not present" });
    expect(empty.items).toHaveLength(0);
    expect(renderToStaticMarkup(<AuditScreen model={empty} />)).toContain("No matching fixture events");
  });

  it("keeps unavailable and loading distinct from valid empty", () => {
    expect(render({ state: "unavailable" })).toContain("Audit source is unavailable");
    expect(render({ state: "unavailable" })).toContain("not a valid no-event result");
    expect(render({ state: "empty" })).toContain("No matching fixture events");
    expect(render({ state: "loading" })).toContain("Loading authorized audit events");
  });

  it("is network-free and declares restricted absent API", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    auditFixtureAdapter.getScreen({ state: "fixture" });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(administrationApiContracts.audit.publicEndpoint).toBeNull();
    expect(administrationApiContracts.audit.access).toBe("RESTRICTED");
    vi.unstubAllGlobals();
  });
});
