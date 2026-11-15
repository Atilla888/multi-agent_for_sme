/**
 * One area's interface text in all three languages. English is the source: Russian and Kazakh must
 * have exactly the same keys (TypeScript rejects a missing or extra key), and placeholders such as
 * {count} must match (checked by i18n.test.ts).
 *
 * Messages use ICU syntax: "{name}" inserts a value, and plurals look like
 *   en: "{count, plural, one {# order} other {# orders}}"
 *   ru: "{count, plural, one {# заказ} few {# заказа} many {# заказов} other {# заказа}}"
 *   kk: "{count, plural, other {# тапсырыс}}"
 * A literal { or } must be quoted as '{' and '}'.
 */
export interface MessageTree { readonly [key: string]: string | MessageTree }

export type Translation<T> = { readonly [K in keyof T]: T[K] extends string ? string : Translation<T[K]> };

export function defineMessages<const T extends MessageTree>(messages: { readonly en: T; readonly ru: NoInfer<Translation<T>>; readonly kk: NoInfer<Translation<T>> }) {
  return messages;
}
