import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { resolveTheme, themeAttribute, themeCookie } from "@/i18n/theme";
import "@/styles/globals.css";

const geist = Geist({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-geist-mono", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: { default: "Retail Ops", template: "%s · Retail Ops" }, description: t("metaDescription") };
}

/** Language comes from next-intl (cookie or browser); a saved light/dark choice is applied here so there is no flash. */
export default async function RootLayout({ children }: { readonly children: ReactNode }) {
  const [locale, cookieStore] = await Promise.all([getLocale(), cookies()]);
  const theme = resolveTheme(cookieStore.get(themeCookie)?.value);
  return (
    <html lang={locale} data-theme={themeAttribute(theme)} className={`${geist.variable} ${geistMono.variable}`}>
      <body><NextIntlClientProvider><ThemeProvider initialTheme={theme}>{children}</ThemeProvider></NextIntlClientProvider></body>
    </html>
  );
}
