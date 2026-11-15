import type { useTranslations } from "next-intl";
import { intlLocale, type AppLocale } from "@/i18n/locales";
import type { AnalyticsGranularity, AnalyticsMetric, ReportPoint } from "./types";

/** Translator for the "analytics" namespace, from useTranslations("analytics"). */
export type AnalyticsTranslator = ReturnType<typeof useTranslations<"analytics">>;

const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"] as const;

/** A "YYYY-MM-DD" day as "2026-09-01" / "01.09.2026". */
export function reportDate(t: AnalyticsTranslator, day: string): string {
  return t("date", { year: day.slice(0, 4), month: day.slice(5, 7), day: day.slice(8, 10) });
}

/** The month of a "YYYY-MM-DD" day as "September 2026" / "сентябрь 2026 г." / "2026 ж. қыркүйек". */
export function reportMonth(locale: AppLocale, day: string): string {
  return new Intl.DateTimeFormat(intlLocale(locale), { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${day.slice(0, 7)}-01T00:00:00Z`));
}

/** A week within one month as "Sep 1-7" / "1–7 сент." / "1–7 қыр.". */
function reportWeek(t: AnalyticsTranslator, point: ReportPoint): string {
  const month = months[Number(point.period.slice(5, 7)) - 1];
  if (!month) return point.period;
  return t("week", { month: t(`months.${month}`), from: String(Number(point.period.slice(8, 10))), to: String(Number(point.periodEnd.slice(8, 10))) });
}

/** The name of a report period in the reader's language. */
export function periodName(t: AnalyticsTranslator, locale: AppLocale, point: ReportPoint, granularity: AnalyticsGranularity): string {
  if (granularity === "DAY") return reportDate(t, point.period);
  if (granularity === "MONTH") return reportMonth(locale, point.period);
  return reportWeek(t, point);
}

/** A figure with its unit: "1,234 units" / "1 234 шт." / "15,500 KZT". A missing value is never shown as zero. */
export function reportValue(t: AnalyticsTranslator, locale: AppLocale, value: number | null, metric: AnalyticsMetric, currency: string): string {
  if (value === null) return t("missing");
  const number = new Intl.NumberFormat(intlLocale(locale)).format(value);
  return metric === "CONFIRMED_ORDER_VALUE" ? `${number} ${currency}` : t("units", { value: number });
}
