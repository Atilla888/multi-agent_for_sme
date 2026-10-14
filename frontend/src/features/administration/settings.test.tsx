import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { administrationApiContracts } from "./adapters/contracts";
import { getSettingsFixtureScreen, settingsFixtureAdapter } from "./adapters/fixtureAdapter";
import { SettingsScreen } from "./components/SettingsScreen";

function render(state = "fixture") { return renderToStaticMarkup(<SettingsScreen model={getSettingsFixtureScreen({ state })} />); }

describe("P5H Settings", () => {
  it("renders only approved business, access, and capability sections", () => {
    const markup = render();
    expect(markup).toContain("Business context");
    expect(markup).toContain("Effective access");
    expect(markup).toContain("Capability boundaries");
    expect(markup).not.toMatch(/Billing|Theme marketplace|Agent policy editor/);
  });

  it("renders every fixture field as disabled and read-only in effect", () => {
    const model = getSettingsFixtureScreen({});
    expect(model.sections.flatMap((section) => section.fields).every((field) => field.editable === false)).toBe(true);
    const markup = render();
    expect(markup.match(/<input[^>]*disabled=""/g)?.length).toBe(7);
    expect(markup).toContain("Save settings · unavailable");
  });

  it("does not fake settings persistence", () => {
    const markup = render();
    expect(markup).toContain("Nothing is persisted and no success result is produced");
    expect(markup).not.toMatch(/saved successfully|changes saved/i);
    expect(administrationApiContracts.settings.write).toBe("UNAVAILABLE");
  });

  it("preserves E02 and M12 as non-configurable boundaries", () => {
    const markup = render();
    expect(markup).toContain("E02 restricted");
    expect(markup).toContain("Cannot be enabled from Settings");
    expect(markup).toContain("M12 TARGET / NOT STARTED");
    expect(markup).toContain("No replay or Resume action is available");
  });

  it("is network-free and keeps failure states distinct", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    settingsFixtureAdapter.getScreen({});
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(render("restricted")).toContain("Settings access is restricted");
    expect(render("unavailable")).toContain("Configuration source is unavailable");
    expect(render("empty")).toContain("No configurable settings in scope");
    expect(render("loading")).toContain("Loading effective settings");
    vi.unstubAllGlobals();
  });
});
