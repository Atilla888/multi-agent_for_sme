import { defineMessages } from "../define";

/**
 * Interface text for the Overview screen. Case reasons and "Yesterday" come from escalations, so the
 * Overview names each case exactly as Needs review does. Order numbers and customer names stay as recorded.
 */
export const overview = defineMessages({
  en: {
    title: "Overview",
    needsReview: "Needs review",
    openAll: "Open all",
    nothingWaiting: "Nothing is waiting for a decision right now.",
    recentOrders: "Recent orders",
    viewAll: "View all",
    columns: { order: "Order", customer: "Customer", status: "Status", reservation: "Stock reservation" },
    reservation: "Reservation",
  },
  ru: {
    title: "Обзор",
    needsReview: "Требует внимания",
    openAll: "Открыть все",
    nothingWaiting: "Сейчас ничего не ждёт решения.",
    recentOrders: "Последние заказы",
    viewAll: "Все заказы",
    columns: { order: "Заказ", customer: "Клиент", status: "Статус", reservation: "Резерв товара" },
    reservation: "Резерв",
  },
  kk: {
    title: "Шолу",
    needsReview: "Қарау керек",
    openAll: "Барлығын ашу",
    nothingWaiting: "Қазір шешім күтіп тұрған ештеңе жоқ.",
    recentOrders: "Соңғы тапсырыстар",
    viewAll: "Барлық тапсырыстар",
    columns: { order: "Тапсырыс", customer: "Клиент", status: "Күйі", reservation: "Тауарды резервтеу" },
    reservation: "Резервтеу",
  },
});
