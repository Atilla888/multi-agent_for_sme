import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { administrationApiContracts } from "./adapters/contracts";
import { auditFixtureAdapter, getAuditFixtureScreen } from "./adapters/fixtureAdapter";
import { AuditScreen } from "./components/AuditScreen";

function render(query: Record<string, string> = {}) { return renderToStaticMarkup(<AuditScreen model={getAuditFixtureScreen(query)} />); }

describe("Activity log", () => {
  it("fails closed by default and withholds entry existence", () => {
    const markup = render();
    expect(markup).toContain("don&#x27;t have access to the activity log");
    expect(markup).toContain("Nothing about its contents is shown");
    expect(markup).not.toContain("AUD-1042");
  });

  it("renders entries with plain-language actions and results", () => {
    const markup = render({ state: "fixture" });
    expect(markup).toContain("Reserve stock");
    expect(markup).toContain("Change order");
    expect(markup).toContain("Blocked by policy");
    expect(markup).toContain("Needs checking");
    expect(markup).not.toMatch(/reserve_inventory|update_order|REJECTED|RECONCILIATION/);
  });

  it("renders the selected entry without secret or reasoning fields", () => {
    const markup = render({ state: "fixture", event: "AUD-1043" });
    expect(markup).toContain("Selected entry");
    expect(markup).toContain("corr-demo-1043");
    expect(markup).toContain("The order change was blocked before anything changed");
    expect(markup).not.toMatch(/password|access[_ -]?token|private[_ -]?key|raw prompt|reasoning trace/i);
  });

  it("filters only safe fields", () => {
    const model = getAuditFixtureScreen({ state: "fixture", q: "check reservation" });
    expect(model.items.map((item) => item.id)).toEqual(["AUD-1044"]);
    const empty = getAuditFixtureScreen({ state: "fixture", q: "not present" });
    expect(empty.items).toHaveLength(0);
    expect(renderToStaticMarkup(<AuditScreen model={empty} />)).toContain("No matching entries");
  });

  it("keeps unavailable and loading distinct from empty", () => {
    expect(render({ state: "unavailable" })).toContain("can&#x27;t be loaded right now");
    expect(render({ state: "unavailable" })).toContain("does not mean nothing happened");
    expect(render({ state: "empty" })).toContain("No matching entries");
    expect(render({ state: "loading" })).toContain("Loading the activity log");
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
