import { defineMessages } from "../define";

/**
 * Inventory screen with sample data. `records` holds the display text of each sample stock record
 * (counts as shown, when it was checked, reservation notes); product names, SKUs and order or
 * reservation references inside that text are record content and stay as they are.
 */
export const inventory = defineMessages({
  en: {
    title: "Inventory",
    description: "Stock on hand and what is reserved for orders. Every count shows when it was last checked.",
    searchLabel: "Search inventory",
    searchPlaceholder: "Product name or SKU",
    filterLabel: "Filter inventory",
    filters: { all: "All", inStock: "In stock", outOfStock: "Out of stock", freshCheck: "Needs a fresh check" },
    empty: "No stock records match this search or filter.",
    table: { label: "Inventory", caption: "Stock on hand and reserved units per product.", product: "Product", inStock: "In stock", reserved: "Reserved", status: "Status", lastChecked: "Last checked" },
    selected: "Selected product",
    checkFirst: {
      title: "Check before reserving again",
      description: "A reservation may have gone through without a confirmation. Reserving again could hold the stock twice, so check the records first.",
    },
    facts: { inStock: "In stock", inStockNote: "As last checked, not a live count.", reserved: "Reserved", source: "Source", note: "Note" },
    openProduct: "Open product",
    order: "Order {id}",
    refresh: "Refresh count",
    refreshUnavailable: "Refreshing from here is not available yet.",
    records: {
      lamp: { available: "8", reserved: "1", state: "In stock", source: "Stock records", checked: "Checked today 10:41", reservation: "1 reserved for ORD-1042 (ref R-1042)", note: "Counted today at 10:41. Not a live count." },
      shelf: { available: "0", reserved: "0", state: "Out of stock", source: "Stock records", checked: "Checked today 10:40", reservation: "No reservations", note: "Zero is a confirmed count, not a missing one." },
      chair: { available: "Last seen 3", reserved: "Unknown", state: "Needs a fresh check", source: "Stock records", checked: "Checked yesterday", reservation: "No current reservation on record", note: "Do not promise this item until the count is refreshed." },
      unconfirmed: { available: "Unknown", reserved: "Possibly 1 more", state: "Reservation needs checking", source: "Reservation RI-1044", checked: "No confirmation received", reservation: "A reservation for ORD-1044 may have gone through (ref RI-1044); check before reserving again", note: "Do not reserve again and do not reduce the count by hand." },
    },
  },
  ru: {
    title: "Склад",
    description: "Остатки на складе и резервы под заказы. У каждого подсчёта указано время последней проверки.",
    searchLabel: "Поиск по складу",
    searchPlaceholder: "Название товара или артикул",
    filterLabel: "Фильтр склада",
    filters: { all: "Все", inStock: "В наличии", outOfStock: "Нет в наличии", freshCheck: "Нужна новая проверка" },
    empty: "Нет записей об остатках по этому поиску или фильтру.",
    table: { label: "Склад", caption: "Остатки и зарезервированные единицы по каждому товару.", product: "Товар", inStock: "В наличии", reserved: "Зарезервировано", status: "Статус", lastChecked: "Последняя проверка" },
    selected: "Выбранный товар",
    checkFirst: {
      title: "Проверьте, прежде чем резервировать снова",
      description: "Резерв мог пройти без подтверждения. Повторный резерв может занять товар дважды, поэтому сначала проверьте записи.",
    },
    facts: { inStock: "В наличии", inStockNote: "На момент последней проверки, не в реальном времени.", reserved: "Зарезервировано", source: "Источник", note: "Примечание" },
    openProduct: "Открыть товар",
    order: "Заказ {id}",
    refresh: "Обновить остаток",
    refreshUnavailable: "Обновлять отсюда пока нельзя.",
    records: {
      lamp: { available: "8", reserved: "1", state: "В наличии", source: "Складской учёт", checked: "Проверено сегодня в 10:41", reservation: "1 шт. зарезервирована для ORD-1042 (номер R-1042)", note: "Подсчитано сегодня в 10:41. Это не данные в реальном времени." },
      shelf: { available: "0", reserved: "0", state: "Нет в наличии", source: "Складской учёт", checked: "Проверено сегодня в 10:40", reservation: "Резервов нет", note: "Ноль — это подтверждённый подсчёт, а не отсутствие данных." },
      chair: { available: "Последний раз: 3", reserved: "Неизвестно", state: "Нужна новая проверка", source: "Складской учёт", checked: "Проверено вчера", reservation: "Текущих резервов в записях нет", note: "Не обещайте этот товар, пока остаток не обновят." },
      unconfirmed: { available: "Неизвестно", reserved: "Возможно, ещё 1", state: "Резерв нужно проверить", source: "Резерв RI-1044", checked: "Подтверждение не получено", reservation: "Резерв для ORD-1044 мог пройти (номер RI-1044). Проверьте, прежде чем резервировать снова", note: "Не резервируйте снова и не уменьшайте остаток вручную." },
    },
  },
  kk: {
    title: "Қойма",
    description: "Қоймадағы қалдықтар және тапсырыстарға резервтелгені. Әр санақта соңғы тексеру уақыты көрсетілген.",
    searchLabel: "Қоймадан іздеу",
    searchPlaceholder: "Тауар атауы немесе артикул",
    filterLabel: "Қойма сүзгісі",
    filters: { all: "Барлығы", inStock: "Қоймада бар", outOfStock: "Қоймада жоқ", freshCheck: "Қайта тексеру керек" },
    empty: "Бұл іздеу немесе сүзгі бойынша қалдық жазбалары жоқ.",
    table: { label: "Қойма", caption: "Әр тауар бойынша қоймадағы және резервтелген саны.", product: "Тауар", inStock: "Қоймада бар", reserved: "Резервтелген", status: "Күйі", lastChecked: "Соңғы тексеру" },
    selected: "Таңдалған тауар",
    checkFirst: {
      title: "Қайта резервтемес бұрын тексеріңіз",
      description: "Резерв растаусыз өтіп кеткен болуы мүмкін. Қайта резервтесеңіз, тауар екі рет ұсталуы мүмкін, сондықтан алдымен жазбаларды тексеріңіз.",
    },
    facts: { inStock: "Қоймада бар", inStockNote: "Соңғы тексеру бойынша, нақты уақыттағы сан емес.", reserved: "Резервтелген", source: "Дереккөз", note: "Ескертпе" },
    openProduct: "Тауарды ашу",
    order: "Тапсырыс {id}",
    refresh: "Қалдықты жаңарту",
    refreshUnavailable: "Мұнда жаңарту әзірге мүмкін емес.",
    records: {
      lamp: { available: "8", reserved: "1", state: "Қоймада бар", source: "Қойма есебі", checked: "Бүгін 10:41-де тексерілді", reservation: "ORD-1042 үшін 1 дана резервтелген (нөмірі R-1042)", note: "Бүгін 10:41-де саналды. Бұл нақты уақыттағы сан емес." },
      shelf: { available: "0", reserved: "0", state: "Қоймада жоқ", source: "Қойма есебі", checked: "Бүгін 10:40-та тексерілді", reservation: "Резерв жоқ", note: "Нөл — расталған сан, деректің жоқтығы емес." },
      chair: { available: "Соңғы рет: 3", reserved: "Белгісіз", state: "Қайта тексеру керек", source: "Қойма есебі", checked: "Кеше тексерілді", reservation: "Жазбаларда ағымдағы резерв жоқ", note: "Қалдық жаңартылмайынша бұл тауарды уәде етпеңіз." },
      unconfirmed: { available: "Белгісіз", reserved: "Мүмкін, тағы 1", state: "Резервті тексеру керек", source: "RI-1044 резерві", checked: "Растау келмеді", reservation: "ORD-1044 үшін резерв өтіп кеткен болуы мүмкін (нөмірі RI-1044). Қайта резервтемес бұрын тексеріңіз", note: "Қайта резервтемеңіз және қалдықты қолмен азайтпаңыз." },
    },
  },
});
