import { defineMessages } from "../define";

/** Words shared by every screen. */
export const common = defineMessages({
  en: {
    back: "Back",
    loading: "Loading",
    clearSearch: "Clear search",
    pressEnterToSearch: "Press Enter to search.",
    open: "Open",
    view: "View",
    pagination: { label: "Pagination", previous: "Previous page", next: "Next page", page: "Page {page}" },
    dataSource: {
      sample: { label: "Sample data", title: "These are example records for review. Nothing on this screen is live business data." },
      live: { label: "Live data", title: "These records come from your business account." },
    },
  },
  ru: {
    back: "Назад",
    loading: "Загрузка",
    clearSearch: "Очистить поиск",
    pressEnterToSearch: "Нажмите Enter, чтобы найти.",
    open: "Открыть",
    view: "Открыть",
    pagination: { label: "Страницы", previous: "Предыдущая страница", next: "Следующая страница", page: "Страница {page}" },
    dataSource: {
      sample: { label: "Пример данных", title: "Это примерные записи для ознакомления. На этом экране нет реальных данных бизнеса." },
      live: { label: "Реальные данные", title: "Эти записи получены из учётной записи вашего бизнеса." },
    },
  },
  kk: {
    back: "Артқа",
    loading: "Жүктелуде",
    clearSearch: "Іздеуді тазалау",
    pressEnterToSearch: "Іздеу үшін Enter пернесін басыңыз.",
    open: "Ашу",
    view: "Қарау",
    pagination: { label: "Беттер", previous: "Алдыңғы бет", next: "Келесі бет", page: "{page}-бет" },
    dataSource: {
      sample: { label: "Үлгі деректер", title: "Бұл — танысуға арналған үлгі жазбалар. Бұл экранда бизнестің нақты деректері жоқ." },
      live: { label: "Нақты деректер", title: "Бұл жазбалар бизнесіңіздің есептік жазбасынан алынған." },
    },
  },
});
