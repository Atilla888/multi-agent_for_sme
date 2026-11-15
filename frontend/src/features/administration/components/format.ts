import { intlLocale, type AppLocale } from "@/i18n/locales";

/** The app's configured time zone (see i18n/request.ts), so a server render shows the business's local time. */
const timeZone = "Asia/Almaty";

/** Date and time of a log entry or run: "14 Oct 2026, 10:42" / "14 окт. 2026 г., 10:42" / "2026 ж. 14 қаз., 10:42". */
export function formatWhen(iso: string, locale: AppLocale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone }).format(new Date(iso));
}

/** Response time in seconds, e.g. "1.2 secs" / "1,2 с". */
export function formatSeconds(milliseconds: number, locale: AppLocale): string {
  return new Intl.NumberFormat(intlLocale(locale), { style: "unit", unit: "second", unitDisplay: "short", maximumFractionDigits: 1 }).format(milliseconds / 1000);
}
