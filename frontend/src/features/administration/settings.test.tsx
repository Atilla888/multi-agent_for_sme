import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { withLocale } from "@/test/intl";
import { administrationApiContracts } from "./adapters/contracts";
import { getSettingsFixtureScreen, settingsFixtureAdapter } from "./adapters/fixtureAdapter";
import { SettingsScreen } from "./components/SettingsScreen";

function render(state = "fixture") { return renderToStaticMarkup(<SettingsScreen model={getSettingsFixtureScreen({ state })} />); }

describe("Settings", () => {
  it("renders only business, access and switched-off sections", () => {
    const markup = render();
    expect(markup).toContain("Business");
    expect(markup).toContain("Access");
    expect(markup).toContain("What is switched off");
    expect(markup).not.toMatch(/Billing|Theme marketplace|Agent policy editor|Keycloak|OIDC|fixture/);
  });

  it("renders every field disabled", () => {
    const model = getSettingsFixtureScreen({});
    expect(model.sections.flatMap((section) => section.fields).every((field) => field.editable === false)).toBe(true);
    const markup = render();
    expect(markup.match(/<input[^>]*disabled=""/g)?.length).toBe(7);
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*><span>Save changes<\/span>/);
  });

  it("does not fake saving", () => {
    const markup = render();
    expect(markup).toContain("Nothing on this screen is saved");
    expect(markup).not.toMatch(/saved successfully|changes saved/i);
    expect(administrationApiContracts.settings.write).toBe("UNAVAILABLE");
  });

  it("keeps blocked order changes and paused-case resume non-configurable", () => {
    const markup = render();
    expect(markup).toContain("Blocked by policy");
    expect(markup).toContain("Can&#x27;t be turned on from Settings");
    expect(markup).toContain("Not available yet");
    expect(markup).not.toMatch(/E02 |TARGET|NOT STARTED/);
  });

  it("is network-free and keeps failure states distinct", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    settingsFixtureAdapter.getScreen({});
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(render("restricted")).toContain("don&#x27;t have access to settings");
    expect(render("unavailable")).toContain("can&#x27;t be loaded right now");
    expect(render("empty")).toContain("No settings to show");
    expect(render("loading")).toContain("Loading settings");
    vi.unstubAllGlobals();
  });

  it("speaks Russian and Kazakh and keeps record values as they are", () => {
    const ru = withLocale("ru", () => render());
    expect(ru).toContain("<h1>Настройки</h1>");
    expect(ru).toContain("Что отключено");
    expect(ru).toContain('value="Учётная запись компании (единый вход)"');
    expect(ru).toContain('value="Владелец, Оператор, Администратор платформы"');
    expect(ru).toContain('value="Запрещено правилами"');
    expect(ru).toMatch(/<button[^>]*disabled=""[^>]*><span>Сохранить изменения<\/span>/);
    expect(withLocale("ru", () => render("unavailable"))).toContain("Сейчас не удаётся загрузить настройки");

    const kk = withLocale("kk", () => render());
    expect(kk).toContain("<h1>Баптаулар</h1>");
    expect(kk).toContain("Өшірілген мүмкіндіктер");
    expect(kk).toContain('value="Иесі, Оператор, Платформа әкімшісі"');
    expect(kk).toContain('value="Әзірге қолжетімсіз"');
    expect(kk).toContain("Бұл экранда ештеңе сақталмайды");
    expect(withLocale("kk", () => render("empty"))).toContain("Көрсететін баптаулар жоқ");

    for (const markup of [ru, kk]) {
      expect(markup).toContain('value="North Shop"');
      expect(markup).toContain('value="Asia/Qyzylorda"');
      for (const english of ["What is switched off", "Business name", "Time zone", "Save changes", "Company account", "Blocked by policy", "Owner, Operator", "Not available yet", "Nothing on this screen is saved"]) expect(markup).not.toContain(english);
    }
  });
});
