import { Database } from '@/lib/types/supabase';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient(cookieStore: ReturnType<typeof cookies>) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookie errors in development due to static rendering
            if (process.env.NODE_ENV === 'development') {
              console.warn('Error setting cookie:', error)
            } else {
              throw error
            }
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('Error removing cookie:', error)
            } else {
              throw error
            }
          }
        },
      },
    }
  )
}

export async function getUser() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

export async function getUserWithRole() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError
    if (!user) return null

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) throw profileError

    return {
      ...user,
      role: profile.role
    }
  } catch (error) {
    console.error('Error getting user with role:', error)
    return null
  }
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export async function requireAdmin() {
  const user = await getUserWithRole()
  if (!user || user.role !== 'admin') {
    throw new Error('Admin access required')
  }
  return user
}

export type AuthError = {
  code: 'UNAUTHORIZED' | 'FORBIDDEN'
  message: string
}

export function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error.code === 'UNAUTHORIZED' || error.code === 'FORBIDDEN')
  )
}
