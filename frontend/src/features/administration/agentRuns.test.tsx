import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { withLocale } from "@/test/intl";
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

  it("speaks Russian and Kazakh, keeping the steps in order", () => {
    const ru = withLocale("ru", () => render({ state: "fixture" }));
    expect(ru).toContain("<h1>Действия ИИ</h1>");
    expect(ru).toContain("Агент поддержки");
    expect(ru).toContain("Сотрудник-оператор");
    expect(ru).toContain("Начат 14 окт. 2026 г., 10:40");
    expect(ru).toContain("Gemini (разработка)");
    expect(ru).toContain("Возобновлять приостановленные запуски пока нельзя");
    expect(ru.indexOf("Агент предложил")).toBeGreaterThan(-1);
    expect(ru.indexOf("Права проверены")).toBeGreaterThan(ru.indexOf("Агент предложил"));
    expect(ru.indexOf("Выполнено")).toBeGreaterThan(ru.indexOf("Права проверены"));
    expect(withLocale("ru", () => render())).toContain("У вас нет доступа к действиям ИИ");

    const kk = withLocale("kk", () => render({ state: "fixture", run: "RUN-1045" }));
    expect(kk).toContain("<h1>ЖИ әрекеттері</h1>");
    expect(kk).toContain("Сату агенті");
    expect(kk).toContain("<strong>Аяқталды</strong>");
    expect(kk).toContain("Қалдықты тексеру");
    expect(kk).toContain("Нәтиже тіркелді");
    expect(kk).toContain("Идентификатор: inventory:SKU-LAMP-SLATE");
    expect(withLocale("kk", () => render({ state: "empty" }))).toContain("Әзірге ЖИ әрекеттері жоқ");

    for (const markup of [ru, kk]) {
      for (const record of ["RUN-1042", "RUN-1045", "Gemini"]) expect(markup).toContain(record);
      for (const english of ["Support Agent", "Sales Agent", "Human Operator", "Agent proposed", "Permission checked", "Who handled it", "Not recorded", "(development)", "Completed", "Check stock", "Oct 2026", "Reference:"]) expect(markup).not.toContain(english);
    }
  });

  it("formats recorded response time and usage for the chosen language", () => {
    const model = getAgentRunsFixtureScreen({ state: "fixture" });
    const recorded = { ...model, selected: model.selected && { ...model.selected, latencyMs: 1240, usageTokens: 5 } };
    const markup = (locale: "en" | "ru" | "kk") => withLocale(locale, () => renderToStaticMarkup(<AgentRunsScreen model={recorded} />));
    expect(markup("en")).toContain("<strong>1.2 secs</strong>");
    expect(markup("en")).toContain("<strong>5 tokens</strong>");
    expect(markup("ru")).toContain("<strong>1,2 с</strong>");
    expect(markup("ru")).toContain("<strong>5 токенов</strong>");
    expect(markup("kk")).toContain("<strong>5 токен</strong>");
  });
});
