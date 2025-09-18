export const locales = ['ar', 'en', 'fr'] as const
export const defaultLocale = 'ar' as const

export type Locale = (typeof locales)[number]
