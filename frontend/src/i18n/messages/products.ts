import { defineMessages } from "../define";

/**
 * Products screen with sample data. `records` holds the explanatory text of each sample product
 * (when it was updated, what its stock looks like); names, SKUs, variants and prices stay in the
 * fixture because they are record content.
 */
export const products = defineMessages({
  en: {
    title: "Products",
    description: "Your catalog. Stock levels live on the Inventory screen.",
    searchLabel: "Search products",
    searchPlaceholder: "Name, SKU or variant",
    filterLabel: "Filter products",
    filters: { all: "All", active: "Active" },
    empty: "No products match this search or filter.",
    table: { label: "Products", caption: "Products in the catalog.", product: "Product", sku: "SKU", variant: "Variant", price: "Price", status: "Status" },
    selected: "Selected product",
    facts: {
      skuVariant: "SKU / variant",
      price: "Price",
      catalogVersion: "Catalog version",
      stock: "Stock",
      stockNote: "A product in the catalog is not the same as stock on hand. Check Inventory before promising anything.",
    },
    checkStock: "Check stock",
    order: "Order {id}",
    records: {
      lamp: { updated: "Updated today 10:38", stock: "8 in stock when last checked" },
      chair: { updated: "Updated yesterday", stock: "Stock needs a fresh check" },
      shelf: { updated: "Updated today 10:35", stock: "0 in stock (confirmed)" },
    },
  },
  ru: {
    title: "Товары",
    description: "Ваш каталог. Остатки — на экране «Склад».",
    searchLabel: "Поиск товаров",
    searchPlaceholder: "Название, артикул или вариант",
    filterLabel: "Фильтр товаров",
    filters: { all: "Все", active: "Активные" },
    empty: "Нет товаров по этому поиску или фильтру.",
    table: { label: "Товары", caption: "Товары в каталоге.", product: "Товар", sku: "Артикул", variant: "Вариант", price: "Цена", status: "Статус" },
    selected: "Выбранный товар",
    facts: {
      skuVariant: "Артикул / вариант",
      price: "Цена",
      catalogVersion: "Версия каталога",
      stock: "Остаток",
      stockNote: "Товар в каталоге — это ещё не товар на складе. Прежде чем что-то обещать, проверьте «Склад».",
    },
    checkStock: "Проверить остаток",
    order: "Заказ {id}",
    records: {
      lamp: { updated: "Обновлено сегодня в 10:38", stock: "8 шт. в наличии на момент проверки" },
      chair: { updated: "Обновлено вчера", stock: "Остаток нужно проверить заново" },
      shelf: { updated: "Обновлено сегодня в 10:35", stock: "0 шт. в наличии (подтверждено)" },
    },
  },
  kk: {
    title: "Тауарлар",
    description: "Сіздің каталогыңыз. Қалдықтар «Қойма» экранында.",
    searchLabel: "Тауарларды іздеу",
    searchPlaceholder: "Атауы, артикулы немесе нұсқасы",
    filterLabel: "Тауарлар сүзгісі",
    filters: { all: "Барлығы", active: "Белсенді" },
    empty: "Бұл іздеу немесе сүзгі бойынша тауар жоқ.",
    table: { label: "Тауарлар", caption: "Каталогтағы тауарлар.", product: "Тауар", sku: "Артикул", variant: "Нұсқасы", price: "Баға", status: "Күйі" },
    selected: "Таңдалған тауар",
    facts: {
      skuVariant: "Артикул / нұсқасы",
      price: "Баға",
      catalogVersion: "Каталог версиясы",
      stock: "Қалдық",
      stockNote: "Каталогтағы тауар қоймадағы тауармен бірдей емес. Бірдеңе уәде етпес бұрын «Қойма» бөлімін тексеріңіз.",
    },
    checkStock: "Қалдықты тексеру",
    order: "Тапсырыс {id}",
    records: {
      lamp: { updated: "Бүгін 10:38-де жаңартылды", stock: "Соңғы тексеруде қоймада 8 дана болды" },
      chair: { updated: "Кеше жаңартылды", stock: "Қалдықты қайта тексеру керек" },
      shelf: { updated: "Бүгін 10:35-те жаңартылды", stock: "Қоймада 0 дана (расталды)" },
    },
  },
});
