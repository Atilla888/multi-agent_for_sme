import type { AppLocale } from "./locales";
import type { Messages } from "./messages";

/** Typed message keys and placeholders for useTranslations()/getTranslations(). */
declare module "next-intl" {
  interface AppConfig {
    Locale: AppLocale;
    Messages: Messages;
  }
}
