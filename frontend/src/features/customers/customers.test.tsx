import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { withLocale } from "@/test/intl";
import { getCustomerDetailFixture, getCustomerFixtureScreen } from "./adapters/fixtureAdapter";
import { CustomerDetailScreen } from "./components/CustomerDetailScreen";
import { CustomersScreen } from "./components/CustomersScreen";

describe("Customers", () => {
  it("shows customer facts in the details panel next to their conversations and orders", () => {
    const markup = renderToStaticMarkup(<CustomerDetailScreen model={getCustomerDetailFixture("cust-1042", undefined)} />);
    expect(markup).toContain("detail-layout__side details-panel");
    expect(markup).toContain("Only the details needed for support are shown");
  });

  it("renders the list with sample-data labelling and detail links", () => {
    const markup = renderToStaticMarkup(<CustomersScreen model={getCustomerFixtureScreen({})} />);
    expect(markup).toContain("Sample data");
    expect(markup).toContain("/customers/cust-1042");
    expect(markup).not.toMatch(/fixture|PII/);
  });

  it("filters the sample records without a network call", () => {
    const model = getCustomerFixtureScreen({ q: "C-1043", status: "waiting-human" });
    expect(model.items).toHaveLength(1);
    expect(model.items[0]?.reference).toBe("C-1043");
  });

  it("keeps an empty result and no access distinct", () => {
    expect(renderToStaticMarkup(<CustomersScreen model={getCustomerFixtureScreen({ state: "empty" })} />)).toContain("No customers found");
    const restricted = renderToStaticMarkup(<CustomersScreen model={getCustomerFixtureScreen({ state: "restricted" })} />);
    expect(restricted).toContain("don&#x27;t have access");
    expect(restricted).not.toContain("Amina S.");
  });

  it("links a customer to their orders and keeps the details minimal", () => {
    const markup = renderToStaticMarkup(<CustomerDetailScreen model={getCustomerDetailFixture("cust-1042", undefined)} />);
    expect(markup).toContain("Orders");
    expect(markup).toContain("/orders/ORD-1042");
    expect(markup).toContain("Only the details needed for support are shown");
  });
});

describe("Customers in Russian and Kazakh", () => {
  it("translates the customers list, its filters, activity counts and times, and keeps names and channels as they are", () => {
    const ru = withLocale("ru", () => renderToStaticMarkup(<CustomersScreen model={getCustomerFixtureScreen({})} />));
    for (const text of ["<h1>Клиенты</h1>", "Пример данных", "Канал связи", "Активность", "Web Chat · подтверждён", "Telegram · ещё не подтверждён", "2 диалога · 2 заказа", "1 диалог · 0 заказов", "Сегодня, 10:40", "Вчера", "Подтверждённые", "Нужно подтвердить", "Может быть устаревшим", 'placeholder="Имя или ID клиента"', 'data-label="Статус"', ">Открыть<"]) expect(ru).toContain(text);
    for (const text of ["Amina S.", "C-1042", "Bekzat T."]) expect(ru).toContain(text);

    const kk = withLocale("kk", () => renderToStaticMarkup(<CustomersScreen model={getCustomerFixtureScreen({})} />));
    for (const text of ["<h1>Клиенттер</h1>", "Үлгі деректер", "Байланыс арнасы", "Web Chat · расталған", "Telegram · әлі расталмаған", "2 диалог · 2 тапсырыс", "Бүгін, 09:18", "Кеше", "Расталғандар", 'aria-label="Клиенттерді сүзу"', ">Қарау<"]) expect(kk).toContain(text);

    for (const markup of [ru, kk]) expect(markup).not.toMatch(/Contact channel|Activity|conversations|orders<|Today|Yesterday|verified|Needs verification|May be out of date|Search customers|Filter customers|Name or customer ID|>All<|>View<|>Open</);
  });

  it("translates the customer detail: facts, related records and their status, with topics and products unchanged", () => {
    const ru = withLocale("ru", () => renderToStaticMarkup(<CustomerDetailScreen model={getCustomerDetailFixture("cust-1042", undefined)} />));
    for (const text of ["C-1042 · Web Chat · подтверждён", "Обновлено сегодня в 10:40", "Диалоги", "c-42 · Обрабатывает поддержка", "Desk Lamp / Slate · Создан · товар зарезервирован", "Desk Lamp / Slate · Создан · резерв нужно проверить", "Сведения", "Показаны только данные, нужные для поддержки.", "ID клиента", "Web Chat (подтверждён)", "Запись клиента · версия 4", 'aria-label="Сведения о клиенте"', ">Клиенты</a>"]) expect(ru).toContain(text);
    expect(ru).toContain("Product availability");
    expect(ru).toContain("North Shop");

    const stale = withLocale("ru", () => renderToStaticMarkup(<CustomerDetailScreen model={getCustomerDetailFixture("cust-1044", undefined)} />));
    for (const text of ["Обновлено вчера", "Заказов пока нет.", "c-44 · Требует внимания", "Запись клиента · версия 1 · нужно обновить", "Web Chat (может быть устаревшим)"]) expect(stale).toContain(text);

    const kk = withLocale("kk", () => renderToStaticMarkup(<CustomerDetailScreen model={getCustomerDetailFixture("cust-1043", undefined)} />));
    for (const text of ["C-1043 · Telegram · әлі расталмаған", "Бүгін 09:18 жаңартылды", "Диалогтар", "c-43 · Қызметкер керек", "Desk Lamp / Slate · Жасалды · тауар резервтелмеді", "Мәліметтер", "Тек қолдау көрсетуге қажет мәліметтер ғана көрсетілген.", "Telegram (расталмаған)", "Клиент жазбасы · 2-нұсқа", "Байланыстырылған арнаның өзі адамның кім екенін дәлелдемейді."]) expect(kk).toContain(text);

    for (const markup of [ru, stale, kk]) expect(markup).not.toMatch(/Last updated|Conversations|>Orders<|No orders yet|Customer record|Only the details|Customer ID|Contact channels|Support is handling it|Needs review|Needs a person|Created ·|not verified|\(verified\)|Customer details|>Details</);
  });
});
