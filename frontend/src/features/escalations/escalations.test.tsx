import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { withLocale } from "@/test/intl";
import { DecisionContext } from "./components/DecisionContext";
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
    const text = renderToStaticMarkup(<DecisionContext detail={detail} />);
    expect(detail.state).toBe("known-failure");
    expect(text).toContain("No stock is held for it");
    expect(text).toContain("choose how to proceed");
    expect(text).not.toContain("records are checked");
  });

  it("keeps a blocked order change clear that nothing changed", () => {
    const text = renderToStaticMarkup(<DecisionContext detail={demoEscalationDetail("restricted")} />);
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

describe("Needs review in Russian and Kazakh", () => {
  const english = ["Needs review", "Cases", "Search cases", "Waiting", "Resolved", "Stock reservation needs a decision", "Case ESC-204", "Open conversation", "Handled by", "Nobody yet", "Why it stopped", "Your decision", "Assign to someone", "Record decision", "Yesterday", "Order ORD-1042"];

  it("translates the queue and the case into Russian", () => {
    const markup = withLocale("ru", () => renderToStaticMarkup(<EscalationsScreen model={getEscalationsFixtureScreen("waiting-human")} />));
    for (const text of ["Требует внимания", "Обращения", "Нужно решение по резерву товара", "Amina S. · Заказ ORD-1042 · 10:42", "Dana R. · Заказ ORD-1090 · Вчера", "Обращение ESC-204", "Открыть диалог", "Пока никто", "Почему остановилось", "К этому обращению относятся диалог c-42 и заказ ORD-1042.", "Ждёт сотрудника", "Назначить сотрудника", "Записать решение"]) expect(markup).toContain(text);
    for (const text of english) expect(markup).not.toContain(text);
  });

  it("translates the queue and the case into Kazakh", () => {
    const markup = withLocale("kk", () => renderToStaticMarkup(<EscalationsScreen model={getEscalationsFixtureScreen("waiting-human")} />));
    for (const text of ["Қарау керек", "Өтініштер", "Тауар резерві бойынша шешім керек", "Dana R. · Тапсырыс ORD-1090 · Кеше", "Өтініш ESC-204", "Диалогты ашу", "Әзірге ешкім", "Неге тоқтады", "Бұл өтінішке c-42 диалогы мен ORD-1042 тапсырысы жатады.", "Қызметкерді күтуде", "Қызметкер тағайындау", "Шешімді жазу"]) expect(markup).toContain(text);
    for (const text of english) expect(markup).not.toContain(text);
  });

  it("translates each case's notices, lines and actions", () => {
    const unknown = withLocale("ru", () => renderToStaticMarkup(<EscalationsScreen model={getEscalationsFixtureScreen("outcome-unknown")} />));
    expect(unknown).toContain("Прежде всего проверьте складские записи");
    expect(unknown).toContain("Проверьте складские записи по номеру RI-1044.");
    expect(unknown).not.toContain("Check the stock records");
    const resume = withLocale("kk", () => renderToStaticMarkup(<EscalationsScreen model={getEscalationsFixtureScreen("resume-target")} />));
    expect(resume).toMatch(/<button[^>]*disabled[^>]*><span>Автоматты түрде жалғастыру<\/span><\/button>/);
    expect(resume).not.toContain("Resume automatically");
    const restricted = withLocale("kk", () => renderToStaticMarkup(<DecisionContext detail={demoEscalationDetail("restricted")} />));
    expect(restricted).toContain("Тапсырыс өзгертілген жоқ.");
    expect(restricted).toContain("Ережемен тыйым салынған");
    expect(restricted).not.toContain("The order was not changed");
  });
});
