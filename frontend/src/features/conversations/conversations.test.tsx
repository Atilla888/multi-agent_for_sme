import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ConversationList } from "./components/ConversationList";
import { ConversationsScreen } from "./components/ConversationsScreen";
import { demoConversationItems, demoConversationWorkspace } from "./fixtures/demoConversations";
import { getConversationFixtureScreen, parseConversationScenario, parseConversationValidationState } from "./adapters/fixtureAdapter";
import { withLocale } from "@/test/intl";

describe("Inbox", () => {
  it("renders the list and the selected conversation", () => {
    const markup = renderToStaticMarkup(<ConversationList items={demoConversationItems} selectedId="c-42" />);
    expect(markup).toContain("Amina S.");
    expect(markup).toContain('href="/conversations/c-42"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain("Unread");
  });

  it("parses scenarios and states deterministically", () => {
    expect(parseConversationScenario("handoff")).toBe("handoff");
    expect(parseConversationScenario("invented")).toBe("default");
    expect(parseConversationValidationState("loading")).toBe("loading");
    expect(getConversationFixtureScreen("default", "default", "missing").selected).toBeNull();
  });

  it("renders system events as one compact line", () => {
    const markup = renderToStaticMarkup(<ConversationsScreen model={getConversationFixtureScreen("default", "default")} />);
    expect(markup).toContain("timeline-entry--system");
    expect(markup).toContain("Product and stock details were checked");
  });

  it("never colour-codes the agent and puts details in the side panel", () => {
    const markup = renderToStaticMarkup(<ConversationsScreen model={getConversationFixtureScreen("default", "default")} />);
    expect(markup).toContain("avatar--agent");
    expect(markup).not.toMatch(/badge--(sales|support|analytics)/);
    expect(markup).toContain("conversation-context details-panel");
    expect(markup).toContain("details-grid");
  });

  it("names every actor and never a fourth orchestrator agent", () => {
    const markup = renderToStaticMarkup(<ConversationsScreen model={getConversationFixtureScreen("default", "default")} />);
    expect(markup).toContain("Customer");
    expect(markup).toContain("Support Agent");
    expect(markup).toContain("System");
    expect(markup).not.toContain("Orchestrator Agent");
  });

  it("keeps loading and empty distinct", () => {
    const loading = renderToStaticMarkup(<ConversationsScreen model={getConversationFixtureScreen("loading", "default")} />);
    const empty = renderToStaticMarkup(<ConversationsScreen model={getConversationFixtureScreen("empty", "default")} />);
    expect(loading).toContain("Loading the open conversation");
    expect(empty).toContain("No conversations yet");
  });

  it("explains that messaging is not connected and disables sending", () => {
    const markup = renderToStaticMarkup(<ConversationsScreen model={getConversationFixtureScreen("m08-unavailable", "default")} />);
    expect(markup).toContain("Live messaging is not connected yet");
    expect(markup).toMatch(/<button[^>]*disabled[^>]*><span>Send message<\/span><\/button>/);
    expect(markup).not.toMatch(/M08|fixture|backend/);
  });

  it("hands over from Support to Sales without transferring access", () => {
    const workspace = demoConversationWorkspace("handoff");
    const markup = renderToStaticMarkup(<ConversationsScreen model={getConversationFixtureScreen("default", "handoff")} />);
    expect(workspace.handler).toBe("Sales Agent");
    expect(markup).toContain("access rights were not");
    expect(markup).toContain("do not transfer");
  });

  it("keeps a failed message separate from a confirmed reservation", () => {
    const markup = renderToStaticMarkup(<ConversationsScreen model={getConversationFixtureScreen("default", "delivery-failure")} />);
    expect(markup).toContain("The stock reservation is done");
    expect(markup).toContain("Resend the message only");
    expect(markup).toContain("must not be repeated");
  });

  it("asks for a check instead of a retry when the reservation outcome is unknown", () => {
    const markup = renderToStaticMarkup(<ConversationsScreen model={getConversationFixtureScreen("default", "outcome-unknown")} />);
    expect(markup).toContain("may have gone through");
    expect(markup).toContain("do not try to reserve again");
    expect(markup).not.toContain("OUTCOME_UNKNOWN");
  });
});

describe("Inbox in Russian and Kazakh", () => {
  const english = ["Inbox", "Conversations", "Needs attention", "Unread", "Support Agent", "Handled by", "Records", "Send message", "Search by name or message", "Verified", "Seen at", "Product and stock details were checked", "Yesterday", "System message at"];

  it("translates the list, the timeline and the details panel into Russian", () => {
    const markup = withLocale("ru", () => renderToStaticMarkup(<ConversationsScreen model={getConversationFixtureScreen("default", "default")} />));
    for (const text of ["Входящие", "Диалоги", "Требуют внимания", "Агент поддержки", "Обработал", "Вчера", "Для этого диалога проверены данные о товаре и остатках.", "Создан · ORD-1042", "8 штук при последней проверке", "Отправить сообщение", "aria-label=\"3 диалога\"", "Системное сообщение в 10:40"]) expect(markup).toContain(text);
    for (const text of english) expect(markup).not.toContain(text);
  });

  it("translates the list, the timeline and the details panel into Kazakh", () => {
    const markup = withLocale("kk", () => renderToStaticMarkup(<ConversationsScreen model={getConversationFixtureScreen("default", "default")} />));
    for (const text of ["Кіріс хабарлар", "Диалогтар", "Қолдау агенті", "Өңдеген", "Кеше", "Осы диалог үшін тауар мен қалдық деректері тексерілді.", "Жасалды · ORD-1042", "Соңғы тексеруде 8 дана", "Хабарлама жіберу", "Жүйе хабарламасы, сағат 10:40"]) expect(markup).toContain(text);
    for (const text of english) expect(markup).not.toContain(text);
  });

  it("keeps what customers and agents wrote, names and channels as they are", () => {
    const markup = withLocale("ru", () => renderToStaticMarkup(<ConversationsScreen model={getConversationFixtureScreen("default", "default")} />));
    expect(markup).toContain("Amina S.");
    expect(markup).toContain("Is the Slate desk lamp available?");
    expect(markup).toContain("Desk Lamp · Slate");
    expect(markup).toContain("Web Chat");
  });

  it("translates notices, system events and empty states", () => {
    const failure = withLocale("ru", () => renderToStaticMarkup(<ConversationsScreen model={getConversationFixtureScreen("default", "known-failure")} />));
    expect(failure).toContain("Заказ ORD-1042 создан. Зарезервировать под него товар не удалось.");
    expect(failure).toContain("Товар не зарезервирован");
    expect(failure).not.toContain("Stock was not reserved");
    const delivery = withLocale("kk", () => renderToStaticMarkup(<ConversationsScreen model={getConversationFixtureScreen("default", "delivery-failure")} />));
    expect(delivery).toContain("Жеткізілмеді");
    expect(delivery).toContain("Тек хабарламаны қайта жіберіңіз");
    expect(delivery).not.toContain("Not delivered");
    const empty = withLocale("kk", () => renderToStaticMarkup(<ConversationsScreen model={getConversationFixtureScreen("empty", "default")} />));
    expect(empty).toContain("Әзірге диалогтар жоқ");
    expect(empty).not.toContain("No conversations yet");
    const unavailable = withLocale("ru", () => renderToStaticMarkup(<ConversationsScreen model={getConversationFixtureScreen("m08-unavailable", "default")} />));
    expect(unavailable).toContain("Обмен сообщениями пока не подключён");
    expect(unavailable).not.toContain("Live messaging is not connected yet");
  });
});
