import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './src/i18n/routing';
import { updateSession } from './src/lib/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // Handle Supabase auth session refresh
  const supabaseResponse = await updateSession(request);

  // Apply internationalization middleware
  const intlResponse = intlMiddleware(request);

  // If the intl middleware returns a response (redirect), use it
  if (intlResponse instanceof Response) {
    // Copy cookies from supabase response to intl response
    const response = new NextResponse(intlResponse.body, {
      status: intlResponse.status,
      statusText: intlResponse.statusText,
      headers: intlResponse.headers,
    });

    // Copy Supabase auth cookies to the response
    supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
      response.cookies.set(name, value);
    });

    return response;
  }

  // If no redirect from intl middleware, return supabase response with updated session
  return supabaseResponse;
}

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(ar|fr|en)/:path*',

    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!_next|_vercel|.*\\..*).*)'
  ]
};
