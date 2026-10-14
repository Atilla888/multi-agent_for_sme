import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { administrationApiContracts } from "./adapters/contracts";
import { getIntegrationsFixtureScreen, integrationsFixtureAdapter } from "./adapters/fixtureAdapter";
import { IntegrationsScreen } from "./components/IntegrationsScreen";

function render(state = "fixture") { return renderToStaticMarkup(<IntegrationsScreen model={getIntegrationsFixtureScreen({ state })} />); }

describe("P5H Integrations", () => {
  it("renders only the approved channel categories", () => {
    const model = getIntegrationsFixtureScreen({});
    expect(model.items.map((item) => item.channel)).toEqual(["Instagram", "WhatsApp", "Telegram", "Web Chat"]);
    const markup = render();
    for (const channel of ["Instagram", "WhatsApp", "Telegram", "Web Chat"]) expect(markup).toContain(channel);
  });

  it("keeps M08 provider state truthful", () => {
    const markup = render();
    expect(markup).toContain("M08 live channels are not accepted");
    expect(markup).toContain("NOT CONFIGURED");
    expect(markup).toContain("DEFERRED");
    expect(markup).not.toMatch(/Connected|Healthy|Active LIVE/);
  });

  it("does not claim LIVE, MOCK, or SANDBOX mode", () => {
    const model = getIntegrationsFixtureScreen({});
    expect(model.items.every((item) => item.mode === null)).toBe(true);
    const markup = render();
    expect(markup).toContain("No LIVE, MOCK, or SANDBOX state is claimed");
    expect(markup).toContain("No live verification");
  });

  it("keeps configuration and validation actions disabled", () => {
    const markup = render();
    expect(markup).toContain("Configure · unavailable");
    expect(markup).toContain("Validate · unavailable");
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

  it("keeps restricted, unavailable, empty, and loading states distinct", () => {
    expect(render("restricted")).toContain("Integration access is restricted");
    expect(render("unavailable")).toContain("Integration status is unavailable");
    expect(render("empty")).toContain("No supported integration records");
    expect(render("loading")).toContain("Loading integration status");
  });
});
