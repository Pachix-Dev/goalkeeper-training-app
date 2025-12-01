// Can be imported from a shared config
export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];
