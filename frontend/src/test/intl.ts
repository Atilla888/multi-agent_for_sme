import { isLocale, type AppLocale } from "@/i18n/locales";

/**
 * Language used when tests render components. Tests render outside Next.js, so next-intl's hooks are
 * replaced (see setup.ts) by translators over the real message catalog in this language. English by
 * default; PREVIEW_LOCALE picks the language for `npm run preview`.
 */
let current: AppLocale = isLocale(process.env.PREVIEW_LOCALE) ? process.env.PREVIEW_LOCALE : "en";

export function testLocale(): AppLocale {
  return current;
}

/** Render in another language for the duration of fn, e.g. withLocale("ru", () => renderToStaticMarkup(<X />)). */
export function withLocale<T>(locale: AppLocale, fn: () => T): T {
  const previous = current;
  current = locale;
  try { return fn(); } finally { current = previous; }
}
