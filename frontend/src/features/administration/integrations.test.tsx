import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { administrationApiContracts } from "./adapters/contracts";
import { getIntegrationsFixtureScreen, integrationsFixtureAdapter } from "./adapters/fixtureAdapter";
import { IntegrationsScreen } from "./components/IntegrationsScreen";

function render(state = "fixture") { return renderToStaticMarkup(<IntegrationsScreen model={getIntegrationsFixtureScreen({ state })} />); }

describe("Channels", () => {
  it("renders only the approved channels", () => {
    const model = getIntegrationsFixtureScreen({});
    expect(model.items.map((item) => item.channel)).toEqual(["Instagram", "WhatsApp", "Telegram", "Web Chat"]);
    const markup = render();
    for (const channel of ["Instagram", "WhatsApp", "Telegram", "Web Chat"]) expect(markup).toContain(channel);
  });

  it("says plainly that nothing is connected", () => {
    const markup = render();
    expect(markup).toContain("No channels are connected yet");
    expect(markup).toContain("Not connected");
    expect(markup).toContain("Not set up");
    expect(markup).not.toMatch(/Connected<|Healthy|Active LIVE|M08|DEFERRED|fixture/);
  });

  it("claims no operating mode and no verification", () => {
    const model = getIntegrationsFixtureScreen({});
    expect(model.items.every((item) => item.mode === null)).toBe(true);
    expect(render()).toContain("No connection has been tested yet");
  });

  it("keeps connect and test actions disabled", () => {
    const markup = render();
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*><span>Connect<\/span>/);
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*><span>Test connection<\/span>/);
    expect(markup.match(/disabled=""/g)?.length).toBe(8);
  });

  it("is network-free and declares absent public contracts", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    integrationsFixtureAdapter.getScreen({});
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(administrationApiContracts.integrations.publicEndpoint).toBeNull();
    expect(administrationApiContracts.integrations.activate).toBe("UNAVAILABLE");
    vi.unstubAllGlobals();
  });

  it("keeps no-access, unavailable, empty and loading distinct", () => {
    expect(render("restricted")).toContain("don&#x27;t have access to channels");
    expect(render("unavailable")).toContain("can&#x27;t be loaded right now");
    expect(render("empty")).toContain("No channels yet");
    expect(render("loading")).toContain("Loading channels");
  });
});
