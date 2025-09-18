'use client'

import { createClient } from '@/lib/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (provider: 'google' | 'email' | 'phone', credentials?: { email?: string; phone?: string; password?: string }) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const t = useTranslations('auth.errors')

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        toast.error(t('session_error'), {
          description: error.message
        })
        return
      }
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      if (event === 'SIGNED_IN') {
        router.refresh()
      }
      if (event === 'SIGNED_OUT') {
        router.refresh()
        router.push('/')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const signIn = async (
    provider: 'google' | 'email' | 'phone',
    credentials?: { email?: string; phone?: string; password?: string }
  ) => {
    try {
      if (provider === 'google') {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
      } else if (provider === 'email' && credentials?.email && credentials.password) {
        const { error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        })
        if (error) throw error
      } else if (provider === 'phone' && credentials?.phone && credentials.password) {
        const { error } = await supabase.auth.signInWithPassword({
          phone: credentials.phone,
          password: credentials.password,
        })
        if (error) throw error
      }

    } catch (err) {
      if (err instanceof Error) {
        const error = err as Error
        switch (error.message) {
          case 'Invalid login credentials':
            toast.error(t('invalid_credentials'))
            break
          case 'Email not confirmed':
            toast.error(t('email_not_confirmed'))
            break
          case 'Phone not confirmed':
            toast.error(t('phone_not_confirmed'))
            break
          case 'User not found':
            toast.error(t('user_not_found'))
            break
          default:
            toast.error(t('unknown_error'), {
              description: error.message
            })
        }
      } else {
        toast.error(t('network_error'))
      }
      throw err
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (err) {
      if (err instanceof Error) {
        toast.error(t('sign_out_error'), {
          description: err.message
        })
      } else {
        toast.error(t('network_error'))
      }
      throw err
    }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
