import createMiddleware from 'next-intl/middleware';
import { defaultLocale, locales } from './src/i18n/settings';

// Create middleware with combined locale handling
export default createMiddleware({
  defaultLocale,
  locales,
  localePrefix: 'always'  // This ensures consistent URL structure
});

// Match all routes that should be handled by next-intl
// This includes "/" to catch the root path
export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api/auth (API routes)
    // - /_next (Next.js internals)
    // - /icons, /images (static files)
    '/((?!api|_next|icons|images|[\\w-]+\\.\\w+).*)'
  ]
};
