import { vi } from "vitest";

/**
 * Outside Next.js there is no request and no NextIntlClientProvider, so next-intl's hooks would throw.
 * Replace them with next-intl's own translator and formatter over the real catalog, in testLocale().
 */
vi.mock("next-intl", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next-intl")>();
  const { messagesFor } = await import("@/i18n/messages");
  const { testLocale } = await import("./intl");
  const translator = (namespace?: string) =>
    actual.createTranslator({ locale: testLocale(), messages: messagesFor(testLocale()), namespace: namespace as never, timeZone: "Asia/Almaty" });
  return {
    ...actual,
    useTranslations: translator,
    useLocale: () => testLocale(),
    useFormatter: () => actual.createFormatter({ locale: testLocale(), timeZone: "Asia/Almaty" }),
  };
});

vi.mock("next-intl/server", async () => {
  const actual = await vi.importActual<typeof import("next-intl")>("next-intl");
  const { messagesFor } = await import("@/i18n/messages");
  const { testLocale } = await import("./intl");
  return {
    getTranslations: async (namespace?: string) =>
      actual.createTranslator({ locale: testLocale(), messages: messagesFor(testLocale()), namespace: namespace as never, timeZone: "Asia/Almaty" }),
    getLocale: async () => testLocale(),
    getFormatter: async () => actual.createFormatter({ locale: testLocale(), timeZone: "Asia/Almaty" }),
    getRequestConfig: (factory: unknown) => factory,
  };
});
