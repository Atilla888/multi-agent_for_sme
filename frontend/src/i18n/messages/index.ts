import type { AppLocale } from "../locales";
import { administration } from "./administration";
import { analytics } from "./analytics";
import { auth } from "./auth";
import { business } from "./business";
import { common } from "./common";
import { conversations } from "./conversations";
import { customers } from "./customers";
import { documents } from "./documents";
import { escalations } from "./escalations";
import { forecasts } from "./forecasts";
import { integration } from "./integration";
import { inventory } from "./inventory";
import { orders } from "./orders";
import { overview } from "./overview";
import { products } from "./products";
import { shell } from "./shell";
import { states } from "./states";
import { webchat } from "./webchat";

/** Every area's text in every language; the key is the namespace passed to useTranslations(). */
export const catalog = {
  common, states, shell, auth, business,
  overview, conversations, escalations, orders, customers, products, inventory,
  documents, analytics, forecasts, administration, integration, webchat,
} as const;

export type Messages = { readonly [Area in keyof typeof catalog]: (typeof catalog)[Area]["en"] };

export function messagesFor(locale: AppLocale): Messages {
  return Object.fromEntries(Object.entries(catalog).map(([area, languages]) => [area, languages[locale]])) as unknown as Messages;
}
