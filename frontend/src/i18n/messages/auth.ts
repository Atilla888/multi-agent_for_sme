import { defineMessages } from "../define";

/** Sign-in page, staff loading and the staff-context error. */
export const auth = defineMessages({
  en: {
    metaDescription: "Customer conversations and sales for your shop, with AI agents and your team.",
    signIn: "Sign in",
    useCompanyAccount: "Use your company account.",
    notConfigured: { title: "Sign-in is not set up yet", description: "Ask your administrator to finish setting up sign-in for this workspace." },
    failed: { title: "Sign-in didn't work", description: "We couldn't reach the sign-in service. Please try again in a moment." },
    sessionExpired: { title: "Please sign in again", description: "Your session ended." },
    passwordNote: "Your password is handled by your company’s sign-in service, never by this app.",
    staffUnavailable: { title: "Staff context is unavailable", description: "Verified business access is required. No prior-tenant records are shown." },
    loading: { section: "Loading authorized staff data", label: "Loading the authorized business view" },
  },
  ru: {
    metaDescription: "Диалоги с клиентами и продажи вашего магазина — вместе с ИИ-агентами и вашей командой.",
    signIn: "Войти",
    useCompanyAccount: "Войдите с рабочей учётной записью.",
    notConfigured: { title: "Вход ещё не настроен", description: "Попросите администратора завершить настройку входа для этого рабочего пространства." },
    failed: { title: "Не удалось войти", description: "Служба входа недоступна. Попробуйте ещё раз чуть позже." },
    sessionExpired: { title: "Войдите снова", description: "Ваш сеанс завершён." },
    passwordNote: "Пароль обрабатывает служба входа вашей компании, а не это приложение.",
    staffUnavailable: { title: "Рабочие данные недоступны", description: "Нужен подтверждённый доступ к бизнесу. Данные других бизнесов не показываются." },
    loading: { section: "Загрузка рабочих данных", label: "Загружаем данные вашего бизнеса" },
  },
  kk: {
    metaDescription: "Дүкеніңіздің клиенттермен диалогтары мен сатылымдары — ЖИ-агенттермен және командаңызбен бірге.",
    signIn: "Кіру",
    useCompanyAccount: "Жұмыс есептік жазбаңызбен кіріңіз.",
    notConfigured: { title: "Кіру әлі бапталмаған", description: "Әкімшіден осы жұмыс кеңістігі үшін кіруді баптауды аяқтауын сұраңыз." },
    failed: { title: "Кіру сәтсіз аяқталды", description: "Кіру қызметіне қосылу мүмкін болмады. Сәлден кейін қайталап көріңіз." },
    sessionExpired: { title: "Қайта кіріңіз", description: "Сеансыңыз аяқталды." },
    passwordNote: "Құпиясөзіңізді осы қолданба емес, компанияңыздың кіру қызметі өңдейді.",
    staffUnavailable: { title: "Жұмыс деректері қолжетімсіз", description: "Бизнеске расталған қолжетімділік қажет. Басқа бизнестердің деректері көрсетілмейді." },
    loading: { section: "Жұмыс деректері жүктелуде", label: "Бизнесіңіздің деректері жүктелуде" },
  },
});
