export const locales = ["en", "lt", "pl", "lv", "et"] as const;
export type Locale = (typeof locales)[number];
