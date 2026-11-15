import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { withLocale } from "@/test/intl";

// The header's language and theme switch refreshes the page through the App Router.
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh() {} }) }));

import { webChatApiContract } from "./adapters/contracts";
import { getWebChatFixtureScreen, webChatFixtureAdapter } from "./adapters/fixtureAdapter";
import { CustomerWebChatScreen } from "./components/CustomerWebChatScreen";

function render(state: string) { return renderToStaticMarkup(<CustomerWebChatScreen model={getWebChatFixtureScreen({ state })} />); }

describe("Customer Web Chat", () => {
  it("uses a separate customer shell without staff navigation", () => {
    const markup = render("active");
    expect(markup).toContain("customer-chat-shell");
    expect(markup).toContain("North Shop");
    expect(markup).not.toContain("Administration");
    expect(markup).not.toContain("Needs review");
  });

  it("renders the customer and business sides with clear names", () => {
    const model = getWebChatFixtureScreen({ state: "confirmation" });
    const markup = renderToStaticMarkup(<CustomerWebChatScreen model={model} />);
    expect(model.messages.map((message) => message.actor)).toEqual(["Customer", "Sales Agent"]);
    expect(markup).toContain("You");
    expect(markup).toContain("North Shop sales");
  });

  it("keeps sending unavailable and performs no network call", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    webChatFixtureAdapter.getScreen("active");
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(webChatApiContract.publicEndpoint).toBeNull();
    expect(webChatApiContract.sendMessage).toBe("UNAVAILABLE");
    const markup = render("active");
    expect(markup).toContain("Preview");
    expect(markup).toMatch(/<textarea[^>]*disabled=""/);
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*><span>Send<\/span>/);
    vi.unstubAllGlobals();
  });

  it("asks for confirmation with both actions disabled", () => {
    const markup = render("confirmation");
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*><span>Confirm order<\/span>/);
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*><span>Change details<\/span>/);
    expect(markup).toContain("This preview cannot place it");
  });

  it("shows neutral processing copy without an invented call to action", () => {
    const markup = render("processing");
    expect(markup).toContain("We&#x27;ll update you here when the result is available");
    expect(markup).toContain("No further action is needed right now");
    expect(markup).not.toContain("Keep chat open");
    expect(markup).not.toContain("Confirm order");
  });

  it("protects customers from ordering twice after a reservation failure", () => {
    const markup = render("known-failure");
    expect(markup).toContain("Order ORD-1042 already exists");
    expect(markup).toContain("Item was not reserved");
    expect(markup).toContain("Please don&#x27;t place the same order again");
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*><span>Ask for help<\/span>/);
  });

  it("uses plain language for an uncertain result and prevents resubmission", () => {
    const markup = render("confirmation-pending");
    expect(markup).toContain("may have gone through");
    expect(markup).toContain("Please do not submit the same request again");
    expect(markup).not.toContain("OUTCOME_UNKNOWN");
  });

  it("keeps a confirmed order separate from a failed message", () => {
    const markup = render("delivery-failure");
    expect(markup).toContain("Reservation remains confirmed");
    expect(markup).toContain("Message</span><strong>Not delivered");
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*><span>Resend message<\/span>/);
    expect(markup).toContain("must never place the order or reserve the item again");
  });

  it("renders a person reviewing without promising completion", () => {
    const markup = render("waiting-human");
    expect(markup).toContain("A person is reviewing this");
    expect(markup).toContain("does not promise completion");
  });

  it("keeps loading and unavailable distinct from an empty chat", () => {
    const loading = render("loading");
    const unavailable = render("unavailable");
    expect(loading).toContain("Loading your conversation");
    expect(unavailable).toContain("Chat is unavailable right now");
    expect(unavailable).not.toContain('aria-label="Messages"');
  });

  it("contains no internal runtime terminology in any state", () => {
    const states = ["initial", "active", "clarification", "confirmation", "processing", "confirmed", "known-failure", "waiting-human", "confirmation-pending", "delivery-failure"];
    const markup = states.map(render).join("\n");
    expect(markup).toContain("customer-chat-page");
    expect(markup).toContain("webchat-timeline");
    expect(markup).not.toMatch(/LangGraph|Adaptive Orchestrator|raw prompt|chain-of-thought|E02 |LOCAL UI|unavailable ·/);
  });

  it("lets the customer switch language and theme from the chat header", () => {
    const markup = render("active");
    const header = markup.slice(markup.indexOf('class="webchat-header"'), markup.indexOf('class="webchat-timeline"'));
    expect(header).toContain('class="preferences"');
    expect(header).toContain('aria-label="Language"');
    for (const choice of ["System", "Light", "Dark"]) expect(header).toContain(`aria-label="${choice}"`);
    expect(header.indexOf("North Shop")).toBeLessThan(header.indexOf('class="preferences"'));
  });

  it("speaks Russian to the customer and keeps the conversation as written", () => {
    const markup = withLocale("ru", () => render("confirmation"));
    expect(markup).toContain("Чат с");
    expect(markup).toContain("Предпросмотр");
    expect(markup).toContain("<strong>Вы</strong>");
    expect(markup).toContain("<strong>Отдел продаж North Shop</strong>");
    expect(markup).toContain('aria-label="Сообщение: Вы"');
    expect(markup).toContain("10:42 · Доставлено");
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*><span>Подтвердить заказ<\/span>/);
    expect(markup).toContain("Если вы подтвердите, North Shop оформит этот заказ.");
    expect(markup).toContain("Здесь показан только ваш диалог с North Shop.");
    expect(markup).toContain('aria-label="Язык"');
    expect(markup).toMatch(/<option value="ru"[^>]*selected=""/);
    expect(markup).toContain("I would like one Desk Lamp in Slate.");
    expect(markup).toContain("Desk Lamp / Slate / standard size");
    expect(withLocale("ru", () => render("delivery-failure"))).toContain("Сообщение</span><strong>Не доставлено");
    expect(withLocale("ru", () => render("active"))).toContain('placeholder="Напишите сообщение…"');
    for (const english of ["Chat with", "Preview", ">You<", "North Shop sales", "Delivered", "Please confirm", "Confirm order", "Change details", "Only your conversation", "Language"]) expect(markup).not.toContain(english);
  });

  it("speaks Kazakh to the customer and keeps the conversation as written", () => {
    const markup = withLocale("kk", () => render("known-failure"));
    expect(markup).toContain("Алдын ала қарау");
    expect(markup).toContain("<strong>Сіз</strong>");
    expect(markup).toContain("<strong>North Shop сату бөлімі</strong>");
    expect(markup).toContain("ORD-1042 тапсырысы бұрыннан бар");
    expect(markup).toContain("Тауар резервтелмеді");
    expect(markup).toContain("Бұл тапсырысты қайта рәсімдемеңіз");
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*><span>Көмек сұрау<\/span>/);
    expect(markup).toContain("Мұнда тек сіз бен North Shop арасындағы диалог көрсетіледі.");
    expect(markup).toContain('aria-label="Тіл"');
    expect(markup).toContain("There is an update about your order.");
    expect(withLocale("kk", () => render("loading"))).toContain("Диалогыңыз жүктелуде");
    expect(withLocale("kk", () => render("waiting-human"))).toContain("Мұны қызметкер қарап жатыр");
    for (const english of ["Chat with", "Preview", ">You<", "North Shop sales", "already exists", "Item was not reserved", "Ask for help", "Only your conversation", "Language"]) expect(markup).not.toContain(english);
  });
});
