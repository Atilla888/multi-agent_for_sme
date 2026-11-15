/** Interface languages. Kazakh uses the Cyrillic script, as most shops and staff do today. */
export const locales = ["en", "ru", "kk"] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en";
export const localeCookie = "lang";

/** Each language is named in that language, so people can find their own. */
export const localeNames: Record<AppLocale, string> = { en: "English", ru: "Русский", kk: "Қазақша" };

/** Locale used for dates and numbers, e.g. "15 November" / "15 ноября" / "15 қараша". */
export function intlLocale(locale: AppLocale): string {
  return { en: "en-GB", ru: "ru-RU", kk: "kk-KZ" }[locale];
}

export function isLocale(value: unknown): value is AppLocale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

/** The saved choice wins; otherwise the first supported language the browser asks for; otherwise English. */
export function resolveLocale(saved: string | undefined, acceptLanguage: string | null | undefined): AppLocale {
  if (isLocale(saved)) return saved;
  const preferred = (acceptLanguage ?? "")
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const quality = Number(params.find((param) => param.trim().startsWith("q="))?.split("=")[1] ?? 1);
      return { language: tag.toLowerCase().split("-")[0], quality: Number.isFinite(quality) ? quality : 0 };
    })
    .filter((entry) => entry.language && entry.quality > 0)
    .sort((a, b) => b.quality - a.quality);
  return preferred.map((entry) => entry.language).find(isLocale) ?? defaultLocale;
}
