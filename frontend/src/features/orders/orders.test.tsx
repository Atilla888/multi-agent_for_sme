import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { withLocale } from "@/test/intl";
import { getOrderDetailFixture, getOrdersFixtureScreen } from "./adapters/fixtureAdapter";
import { OrderDetailScreen } from "./components/OrderDetailScreen";
import { OrdersScreen } from "./components/OrdersScreen";

describe("Orders", () => {
  it("keeps order and reservation as two separate statuses with a mono order id", () => {
    const markup = renderToStaticMarkup(<OrdersScreen model={getOrdersFixtureScreen({})} />);
    const row = markup.slice(markup.indexOf(">ORD-1043<"), markup.indexOf(">ORD-1044<")); // table cells, not the export link
    expect(row.match(/status-badge /g)).toHaveLength(2);
    expect(row).toContain("Failed");
    expect(markup).toMatch(/class="row-link cell-id"[^>]*>ORD-1043</);
  });

  it("puts the order's customer and next step in the details panel", () => {
    const markup = renderToStaticMarkup(<OrderDetailScreen model={getOrderDetailFixture("ORD-1044", {})} />);
    expect(markup).toContain("detail-layout__side details-panel");
    expect(markup).toContain('class="rule-note"');
  });

  it("shows order status and stock reservation as separate columns", () => {
    const markup = renderToStaticMarkup(<OrdersScreen model={getOrdersFixtureScreen({})} />);
    expect(markup).toContain("Order status");
    expect(markup).toContain("Stock reservation");
    expect(markup).toContain("Needs checking");
    expect(markup).not.toMatch(/OUTCOME_UNKNOWN|fixture|E02/);
  });

  it("explains a clear reservation failure without asking for a recheck", () => {
    const markup = renderToStaticMarkup(<OrderDetailScreen model={getOrderDetailFixture("ORD-1043", {})} />);
    expect(markup).toContain("Stock was not reserved");
    expect(markup).toContain("Check current stock");
    expect(markup).toContain("nothing to double-check");
  });

  it("asks for a check and offers no retry button when the reservation outcome is unknown", () => {
    const markup = renderToStaticMarkup(<OrderDetailScreen model={getOrderDetailFixture("ORD-1044", {})} />);
    expect(markup).toContain("may have gone through");
    expect(markup).toContain("Check the stock records");
    expect(markup).toContain("do not try to reserve again");
    expect(markup).not.toMatch(/<button[^>]*>[^<]*Retry/i);
  });

  it("shows blocked order changes as a disabled control with nothing changed", () => {
    const markup = renderToStaticMarkup(<OrderDetailScreen model={getOrderDetailFixture("ORD-1047", {})} />);
    expect(markup).toContain("Order changes are blocked");
    expect(markup).toMatch(/<button[^>]*disabled[^>]*><span>Change order<\/span><\/button>/);
    expect(markup).toContain("Nothing was changed");
  });

  it("keeps delivery and customer messages separate from the order itself", () => {
    const markup = renderToStaticMarkup(<OrderDetailScreen model={getOrderDetailFixture("ORD-1042", {})} />);
    expect(markup).toContain("Delivery");
    expect(markup).toContain("Customer message");
    expect(markup).toContain("Messages never change the order or the reservation");
  });
});

/** The CSV behind the Export link, decoded. */
function exportedCsv(markup: string): string {
  return decodeURIComponent(/href="data:text\/csv;charset=utf-8,([^"]*)"/.exec(markup)?.[1] ?? "");
}

describe("Orders in Russian and Kazakh", () => {
  it("translates the orders list, its filters, footer and CSV column names, and keeps the records as they are", () => {
    const ru = withLocale("ru", () => renderToStaticMarkup(<OrdersScreen model={getOrdersFixtureScreen({})} />));
    for (const text of ["<h1>Заказы</h1>", "Пример данных", "Статус заказа", "Резерв товара", "Нужно проверить", "Не зарезервировано", "Сегодня, 10:43", "Проверьте остатки", "Показано 6 из 6 заказов", "Экспорт", 'placeholder="Номер заказа или клиент"', 'aria-label="Фильтр заказов"', 'data-label="Сумма"', ">Все<", ">Далее<"]) expect(ru).toContain(text);
    expect(ru).toContain("Amina S.");
    expect(ru).toContain("Desk Lamp / Slate × 1");
    expect(ru).toContain("₸ 24 900");
    expect(exportedCsv(ru).split("\n")[0]).toBe('"Заказ","Клиент","Канал","Товары","Сумма","Статус заказа","Резерв товара","Обновлено"');
    expect(exportedCsv(ru)).toContain('"ORD-1043","Bekzat T.","Web Chat","Desk Lamp / Slate × 1","₸ 24 900","Создан","Не зарезервировано","Сегодня, 10:43"');

    const kk = withLocale("kk", () => renderToStaticMarkup(<OrdersScreen model={getOrdersFixtureScreen({})} />));
    for (const text of ["<h1>Тапсырыстар</h1>", "Үлгі деректер", "Тапсырыс күйі", "Тауар резерві", "Тексеру керек", "Резервтелмеген", "Бүгін, 10:43", "Көрсетілгені: 6 / 6 тапсырыс", "Экспорттау", 'aria-label="Тапсырыстар тізімі"', ">Барлығы<"]) expect(kk).toContain(text);
    expect(exportedCsv(kk).split("\n")[0]).toBe('"Тапсырыс","Клиент","Арна","Тауарлар","Сомасы","Тапсырыс күйі","Тауар резерві","Жаңартылды"');

    for (const markup of [ru, kk]) {
      expect(markup).not.toMatch(/Order status|Stock reservation|Needs checking|Not reserved|Today|Showing|Export<|Search orders|Filter orders|Order number or customer|>All<|>Previous<|>Next<|Check stock/);
      expect(exportedCsv(markup)).not.toMatch(/"Order"|"Customer"|"Total"|"Updated"|Created|Today/);
    }
  });

  it("translates the order detail: explanations, timeline, items and next step, with references and prices unchanged", () => {
    const ru = withLocale("ru", () => renderToStaticMarkup(<OrderDetailScreen model={getOrderDetailFixture("ORD-1044", {})} />));
    for (const text of ["Заказ ORD-1044", "Обновлено сегодня в 10:43 · WhatsApp", "Резерв нужно проверить", "не пытайтесь зарезервировать товар повторно", "Заказ и резерв товара", "Запрос на резерв отправлен (номер RI-1044), подтверждения нет", "SKU-LAMP-42 · заказано: 1 · зарезервировано: 0", "Что произошло", "Доставка", "Сообщения никогда не меняют заказ или резерв.", "Следующий шаг", "Найдите номер RI-1044 в складских записях.", "Открыть обращение", 'aria-label="Товары в заказе ORD-1044"', ">Заказы</a>"]) expect(ru).toContain(text);
    expect(ru).toContain("24,900 KZT");
    expect(ru).toContain("Desk Lamp / Slate");

    const kk = withLocale("kk", () => renderToStaticMarkup(<OrderDetailScreen model={getOrderDetailFixture("ORD-1044", {})} />));
    for (const text of ["Тапсырыс ORD-1044", "Бүгін 10:43 жаңартылды", "Резервті тексеру керек", "Не болды", "Келесі қадам", "SKU-LAMP-42 · тапсырыста: 1 · резервтелген: 0", "Қойма жазбаларынан RI-1044 нөмірін табыңыз.", "Өтінішті ашу", 'aria-label="Тапсырыс туралы мәлімет"']) expect(kk).toContain(text);

    for (const markup of [ru, kk]) expect(markup).not.toMatch(/Order and stock|What happened|Next step|Last updated|Reservation needs checking|Check the stock records|ordered|Open customer|Open conversation|Open review case|Customer message|Order details|Items in/);
  });

  it("translates blocked changes and the confirmed order's references", () => {
    const blocked = withLocale("ru", () => renderToStaticMarkup(<OrderDetailScreen model={getOrderDetailFixture("ORD-1047", {})} />));
    expect(blocked).toMatch(/<button[^>]*disabled[^>]*><span>Изменить заказ<\/span><\/button>/);
    expect(blocked).toContain("Изменение заказов заблокировано");
    expect(blocked).not.toMatch(/Change order|Nothing was changed/);
    const confirmed = withLocale("kk", () => renderToStaticMarkup(<OrderDetailScreen model={getOrderDetailFixture("ORD-1042", {})} />));
    expect(confirmed).toContain("Тапсырыс жасалды (нөмірі CO-1042)");
    expect(confirmed).toContain("Тауар резервтелді (нөмірі R-1042)");
    expect(confirmed).toContain("Хабарлама жеткізілмеді");
    expect(confirmed).not.toMatch(/Order created|Stock reserved|Confirmation message/);
  });
});
