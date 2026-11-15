import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { withLocale } from "@/test/intl";
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

  it("speaks Russian and Kazakh, with dates in the chosen language", () => {
    const ru = withLocale("ru", () => render({ state: "fixture", event: "AUD-1043" }));
    expect(ru).toContain("<h1>Журнал действий</h1>");
    expect(ru).toContain("14 окт. 2026 г., 10:45");
    expect(ru).toContain("Резервирование товара");
    expect(ru).toContain("Заказ ORD-1042");
    expect(ru).toContain("Запрещено правилами");
    expect(ru).toContain("Нужно проверить");
    expect(ru).toContain("Выбранная запись");
    expect(ru).toContain('placeholder="Действие, заказ или сотрудник"');
    expect(withLocale("ru", () => render())).toContain("У вас нет доступа к журналу действий");

    const kk = withLocale("kk", () => render({ state: "fixture", event: "AUD-1043" }));
    expect(kk).toContain("<h1>Әрекеттер журналы</h1>");
    expect(kk).toContain("2026 ж. 14 қаз., 10:45");
    expect(kk).toContain("Тапсырысты өзгерту");
    expect(kk).toContain("op-demo-7 резерві");
    expect(kk).toContain("Ереже бойынша шешім");
    expect(kk).toContain("Таңдалған жазба");
    expect(withLocale("kk", () => render({ state: "unavailable" }))).toContain("Бұл ештеңе болмады дегенді білдірмейді");

    for (const markup of [ru, kk]) {
      for (const record of ["AUD-1042", "corr-demo-1043", "North Shop"]) expect(markup).toContain(record);
      for (const english of ["14 Oct 2026", "Reserve stock", "Change order", "Blocked by policy", "Needs checking", "Selected entry", "Search the log", "Recorded by the system", "Policy decision", "Operator"]) expect(markup).not.toContain(english);
    }
  });

  it("finds entries by the words shown in any language", () => {
    expect(getAuditFixtureScreen({ state: "fixture", q: "проверка резерва" }).items.map((item) => item.id)).toEqual(["AUD-1044"]);
    expect(getAuditFixtureScreen({ state: "fixture", q: "Резервті тексеру" }).items.map((item) => item.id)).toEqual(["AUD-1044"]);
    expect(getAuditFixtureScreen({ state: "fixture", q: "заказ ord-1042" }).items.map((item) => item.id)).toEqual(["AUD-1042", "AUD-1043"]);
  });
});
