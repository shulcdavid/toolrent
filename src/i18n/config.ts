export const locales = ["en", "lt"] as const;
export type Locale = (typeof locales)[number];
