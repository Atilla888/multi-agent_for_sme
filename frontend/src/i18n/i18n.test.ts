import { describe, expect, it } from "vitest";
import { createTranslator } from "next-intl";
import { defaultLocale, intlLocale, localeNames, locales, resolveLocale } from "./locales";
import { resolveTheme, themes } from "./theme";
import { catalog, messagesFor } from "./messages";

describe("language choice", () => {
  it("offers English, Russian and Kazakh, each named in its own language", () => {
    expect(locales).toEqual(["en", "ru", "kk"]);
    expect(localeNames).toEqual({ en: "English", ru: "Русский", kk: "Қазақша" });
    expect(defaultLocale).toBe("en");
  });

  it("uses the saved choice first", () => {
    expect(resolveLocale("kk", "ru-RU,ru;q=0.9")).toBe("kk");
    expect(resolveLocale("ru", null)).toBe("ru");
  });

  it("falls back to the browser's languages, then English", () => {
    expect(resolveLocale(undefined, "ru-RU,ru;q=0.9,en;q=0.8")).toBe("ru");
    expect(resolveLocale(undefined, "kk-KZ,kk;q=0.9,ru;q=0.8")).toBe("kk");
    expect(resolveLocale(undefined, "de-DE,ru;q=0.5")).toBe("ru");
    expect(resolveLocale(undefined, "fr-FR")).toBe("en");
    expect(resolveLocale("xx", undefined)).toBe("en");
  });

  it("formats dates and numbers for the chosen language", () => {
    expect(intlLocale("en")).toBe("en-GB");
    expect(intlLocale("ru")).toBe("ru-RU");
    expect(intlLocale("kk")).toBe("kk-KZ");
  });
});

describe("theme choice", () => {
  it("is system, light or dark; anything else follows the system", () => {
    expect(themes).toEqual(["system", "light", "dark"]);
    expect(resolveTheme("dark")).toBe("dark");
    expect(resolveTheme("light")).toBe("light");
    expect(resolveTheme(undefined)).toBe("system");
    expect(resolveTheme("purple")).toBe("system");
  });
});

type Tree = { readonly [key: string]: string | Tree };

function leaves(tree: Tree, prefix = ""): [string, string][] {
  return Object.entries(tree).flatMap(([key, value]) => typeof value === "string" ? [[`${prefix}${key}`, value] as [string, string]] : leaves(value, `${prefix}${key}.`));
}

/** Top-level ICU argument names, e.g. "{count, plural, one {# order} other {# orders}} for {name}" → count, name. */
function icuArguments(message: string): string[] {
  const names = new Set<string>();
  let depth = 0;
  for (let index = 0; index < message.length; index += 1) {
    const character = message[index];
    if (character === "{") {
      if (depth === 0) names.add(/^\{\s*([A-Za-z0-9_]+)/.exec(message.slice(index))?.[1] ?? "?");
      depth += 1;
    } else if (character === "}") depth -= 1;
  }
  return [...names].sort();
}

/** Words that stay the same in every language: product and brand names. */
const sameInEveryLanguage = /^(Retail Ops|WhatsApp|Telegram|Instagram|Web Chat|SKU|ID|Email|E-mail|AI|CSV|OK|KZT|₸|[\s\d\W]*)$/;

describe("translations", () => {
  for (const [area, languages] of Object.entries(catalog)) {
    const english = new Map(leaves(languages.en as Tree));

    describe(area, () => {
      for (const locale of ["ru", "kk"] as const) {
        const translated = new Map(leaves(languages[locale] as Tree));

        it(`${locale} has exactly the English keys`, () => {
          expect([...translated.keys()].sort()).toEqual([...english.keys()].sort());
        });

        it(`${locale} keeps every placeholder and leaves nothing in English`, () => {
          for (const [key, source] of english) {
            const target = translated.get(key) ?? "";
            expect(target.trim(), `${area}.${key} is empty`).not.toBe("");
            expect(icuArguments(target), `${area}.${key} placeholders`).toEqual(icuArguments(source));
            if (/[A-Za-z]{3}/.test(source.replace(/\{[^}]*\}/g, "")) && !sameInEveryLanguage.test(source)) {
              expect(target, `${area}.${key} still in English`).not.toBe(source);
              expect(target, `${area}.${key} has no Cyrillic`).toMatch(/[А-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі]/);
            }
          }
        });
      }

      it("kk is not a copy of ru", () => {
        const russian = new Map(leaves(languages.ru as Tree));
        for (const [key, kazakh] of leaves(languages.kk as Tree)) {
          if (kazakh.length > 24) expect(kazakh, `${area}.${key} kk equals ru`).not.toBe(russian.get(key));
        }
      });
    });
  }

  it("serves one message tree per language", () => {
    expect(Object.keys(messagesFor("ru"))).toEqual(Object.keys(catalog));
    expect(messagesFor("kk").shell.nav.orders).toBe(catalog.shell.kk.nav.orders);
  });
});

describe("English plurals", () => {
  const t = createTranslator({ locale: "en", messages: messagesFor("en") });
  it("says one conversation, one order and one message", () => {
    expect(t("customers.activity", { conversations: 1, orders: 1 })).toBe("1 conversation · 1 order");
    expect(t("customers.activity", { conversations: 2, orders: 0 })).toBe("2 conversations · 0 orders");
    expect(t("integration.inbox.messageCount", { count: 1 })).toBe("1 message");
    expect(t("integration.inbox.messageCount", { count: 3 })).toBe("3 messages");
  });
});

