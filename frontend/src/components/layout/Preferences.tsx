"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { isLocale, localeCookie, localeNames, locales } from "@/i18n/locales";
import { themeCookie, themes, type ThemeChoice } from "@/i18n/theme";
import { useTheme } from "./ThemeProvider";

const themeIcons: Record<ThemeChoice, IconName> = { system: "monitor", light: "sun", dark: "moon" };

/** Cookie that remembers a preference for a year on this device. */
export function preferenceCookie(name: string, value: string): string {
  return `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

function savePreference(name: string, value: string): void {
  document.cookie = preferenceCookie(name, value);
}

/** Language picker and System / Light / Dark switch. Language re-renders the page on the server; theme applies at once. */
export function Preferences({ className = "" }: { readonly className?: string }) {
  const t = useTranslations("shell.preferences");
  const locale = useLocale();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [pending, startTransition] = useTransition();

  function chooseLanguage(value: string) {
    if (!isLocale(value) || value === locale) return;
    savePreference(localeCookie, value);
    startTransition(() => router.refresh());
  }

  function chooseTheme(value: ThemeChoice) {
    savePreference(themeCookie, value);
    setTheme(value);
  }

  return (
    <div className={`preferences ${className}`.trim()} role="group" aria-label={t("label")} aria-busy={pending || undefined}>
      <label className="preferences__language">
        <Icon name="globe" size={14} />
        <select aria-label={t("language")} value={locale} onChange={(event) => chooseLanguage(event.target.value)}>
          {locales.map((option) => <option key={option} value={option} lang={option}>{localeNames[option]}</option>)}
        </select>
      </label>
      <div className="theme-switch" role="group" aria-label={t("theme")}>
        {themes.map((choice) => (
          <button
            key={choice}
            type="button"
            className="theme-switch__option"
            aria-pressed={theme === choice}
            aria-label={t(choice)}
            title={t(choice)}
            onClick={() => chooseTheme(choice)}
          >
            <Icon name={themeIcons[choice]} size={14} />
          </button>
        ))}
      </div>
    </div>
  );
}
