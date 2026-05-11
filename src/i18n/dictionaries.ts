import "server-only";
import { type Locale, locales } from "./config";

export type { Locale };
export { locales };

const dictionaries = {
  en: () => import("../../messages/en.json").then((m) => m.default),
  lt: () => import("../../messages/lt.json").then((m) => m.default),
};

export const hasLocale = (locale: string): locale is Locale =>
  locales.includes(locale as Locale);

export const getDictionary = async (locale: Locale) => dictionaries[locale]();
