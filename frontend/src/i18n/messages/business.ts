import { defineMessages } from "../define";

/**
 * Loading, empty, no-access and unavailable copy for the business lists and records.
 * Whole sentences per record family, because Russian and Kazakh nouns change form.
 */
export const business = defineMessages({
  en: {
    families: {
      customers: { loading: "Loading customers", empty: "No customers found", restricted: "You don't have access to customers", unavailable: "Customers can't be loaded right now" },
      customer: { loading: "Loading customer", empty: "No customer found", restricted: "You don't have access to customer", unavailable: "Customer can't be loaded right now" },
      orders: { loading: "Loading orders", empty: "No orders found", restricted: "You don't have access to orders", unavailable: "Orders can't be loaded right now" },
      order: { loading: "Loading order", empty: "No order found", restricted: "You don't have access to order", unavailable: "Order can't be loaded right now" },
      products: { loading: "Loading products", empty: "No products found", restricted: "You don't have access to products", unavailable: "Products can't be loaded right now" },
      inventory: { loading: "Loading inventory", empty: "No inventory found", restricted: "You don't have access to inventory", unavailable: "Inventory can't be loaded right now" },
    },
    loadingDetails: "Loading details",
    askForAccess: "Ask an owner or administrator if you need this.",
    unavailableDescription: "We could not reach the source. Nothing is shown in its place, so an empty screen here does not mean there are no records.",
  },
  ru: {
    families: {
      customers: { loading: "Загрузка клиентов", empty: "Клиенты не найдены", restricted: "У вас нет доступа к клиентам", unavailable: "Сейчас не удаётся загрузить клиентов" },
      customer: { loading: "Загрузка клиента", empty: "Клиент не найден", restricted: "У вас нет доступа к этому клиенту", unavailable: "Сейчас не удаётся загрузить клиента" },
      orders: { loading: "Загрузка заказов", empty: "Заказы не найдены", restricted: "У вас нет доступа к заказам", unavailable: "Сейчас не удаётся загрузить заказы" },
      order: { loading: "Загрузка заказа", empty: "Заказ не найден", restricted: "У вас нет доступа к этому заказу", unavailable: "Сейчас не удаётся загрузить заказ" },
      products: { loading: "Загрузка товаров", empty: "Товары не найдены", restricted: "У вас нет доступа к товарам", unavailable: "Сейчас не удаётся загрузить товары" },
      inventory: { loading: "Загрузка остатков", empty: "Остатки не найдены", restricted: "У вас нет доступа к складу", unavailable: "Сейчас не удаётся загрузить остатки" },
    },
    loadingDetails: "Загрузка подробностей",
    askForAccess: "Если вам это нужно, обратитесь к владельцу или администратору.",
    unavailableDescription: "Не удалось связаться с источником. Вместо данных ничего не показано, поэтому пустой экран не означает, что записей нет.",
  },
  kk: {
    families: {
      customers: { loading: "Клиенттер жүктелуде", empty: "Клиенттер табылмады", restricted: "Клиенттерге рұқсатыңыз жоқ", unavailable: "Клиенттерді қазір жүктеу мүмкін емес" },
      customer: { loading: "Клиент жүктелуде", empty: "Клиент табылмады", restricted: "Бұл клиентке рұқсатыңыз жоқ", unavailable: "Клиентті қазір жүктеу мүмкін емес" },
      orders: { loading: "Тапсырыстар жүктелуде", empty: "Тапсырыстар табылмады", restricted: "Тапсырыстарға рұқсатыңыз жоқ", unavailable: "Тапсырыстарды қазір жүктеу мүмкін емес" },
      order: { loading: "Тапсырыс жүктелуде", empty: "Тапсырыс табылмады", restricted: "Бұл тапсырысқа рұқсатыңыз жоқ", unavailable: "Тапсырысты қазір жүктеу мүмкін емес" },
      products: { loading: "Тауарлар жүктелуде", empty: "Тауарлар табылмады", restricted: "Тауарларға рұқсатыңыз жоқ", unavailable: "Тауарларды қазір жүктеу мүмкін емес" },
      inventory: { loading: "Қойма қалдықтары жүктелуде", empty: "Қалдықтар табылмады", restricted: "Қоймаға рұқсатыңыз жоқ", unavailable: "Қойма қалдықтарын қазір жүктеу мүмкін емес" },
    },
    loadingDetails: "Толық ақпарат жүктелуде",
    askForAccess: "Бұл қажет болса, иесіне немесе әкімшіге хабарласыңыз.",
    unavailableDescription: "Дереккөзге қосылу мүмкін болмады. Оның орнына ештеңе көрсетілмейді, сондықтан бос экран жазбалар жоқ дегенді білдірмейді.",
  },
});
