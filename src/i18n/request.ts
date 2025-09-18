import { getRequestConfig } from 'next-intl/server'
import { defaultLocale } from './settings'

export default getRequestConfig(async ({ locale }) => {
  return {
    messages: (await import(`../messages/${locale}.json`)).default,
    locale: locale,
    defaultLocale: defaultLocale,
    timeZone: 'Africa/Casablanca',
    now: new Date(),
  }
})
