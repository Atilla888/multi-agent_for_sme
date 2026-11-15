import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { localeCookie, resolveLocale } from "./locales";
import { messagesFor } from "./messages";

/** Language for this request: the saved choice, else the browser's languages, else English. No locale in the URL. */
export default getRequestConfig(async () => {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const locale = resolveLocale(cookieStore.get(localeCookie)?.value, headerStore.get("accept-language"));
  return { locale, messages: messagesFor(locale), timeZone: "Asia/Almaty" };
});
