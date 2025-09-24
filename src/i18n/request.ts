import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing, type Locale } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Await the requestLocale as it's a Promise in Next.js 15
  const locale = await requestLocale;

  // Debug: Log what locale we're receiving
  console.log('getRequestConfig called with requestLocale:', locale);

  // Handle undefined locale by using default
  const resolvedLocale = locale || routing.defaultLocale;
  console.log('Resolved locale to:', resolvedLocale);

  // Validate that the resolved locale is valid
  if (!routing.locales.includes(resolvedLocale as Locale)) {
    console.log('Invalid locale detected:', resolvedLocale, 'falling back to notFound()');
    notFound();
  }

  console.log('Loading messages for valid locale:', resolvedLocale);

  const messages = (await import(`../messages/${resolvedLocale}.json`)).default;
  console.log('Successfully loaded messages for locale:', resolvedLocale, 'Sample title:', messages?.HomePage?.hero?.title);

  return {
    locale: resolvedLocale,
    messages,
    timeZone: 'Africa/Casablanca',
  };
});
