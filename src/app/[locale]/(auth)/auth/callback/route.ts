import { createClient } from '@/lib/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const handleAuthCallback = async (request: NextRequest): Promise<Response> => {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (!code) {
      console.error('No code provided in callback')
      return NextResponse.redirect(new URL('/auth/auth-error', requestUrl.origin))
    }

    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth error:', error.message)
      return NextResponse.redirect(new URL('/auth/auth-error', requestUrl.origin))
    }

    // Successful authentication - redirect to dashboard or original destination
    const redirectTo = requestUrl.searchParams.get('redirectTo') || '/dashboard'
    return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
  } catch (err) {
    console.error('Callback error:', err instanceof Error ? err.message : String(err))
    return NextResponse.redirect(new URL(request.url).origin + '/auth/auth-error')
  }
}

export const GET = handleAuthCallback
