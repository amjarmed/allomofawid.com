'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import * as React from 'react'

export function VerificationForm() {
  const t = useTranslations('auth')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [code, setCode] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const supabase = createClient()

  const type = searchParams.get('type') || 'signup'
  const email = searchParams.get('email')
  const phone = searchParams.get('phone')

  const verify = async () => {
    if (!code) return

    setIsLoading(true)

    try {
      let error

      if (type === 'signup') {
        const response = await supabase.auth.verifyOtp({
          email: email || undefined,
          phone: phone || undefined,
          token: code,
          type: 'signup'
        })
        error = response.error
      } else {
        const response = await supabase.auth.verifyOtp({
          email: email || undefined,
          phone: phone || undefined,
          token: code,
          type: 'recovery'
        })
        error = response.error
      }

      if (error) throw error

      toast({
        title: t('verify.success'),
        description: t('verify.redirecting'),
      })

      router.push('/dashboard')
    } catch (error) {
      toast({
        title: t('verify.error'),
        description: t('verify.invalidCode'),
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resend = async () => {
    try {
      let error

      if (email) {
        const response = await supabase.auth.resend({
          email,
          type: 'signup'
        })
        error = response.error
      } else if (phone) {
        const response = await supabase.auth.resend({
          phone,
          type: 'signup'
        })
        error = response.error
      }

      if (error) throw error

      toast({
        title: t('verify.resendSuccess'),
        description: email
          ? t('verify.resendEmailDescription')
          : t('verify.resendPhoneDescription'),
      })
    } catch (error) {
      toast({
        title: t('verify.resendError'),
        description: t('verify.tryAgainLater'),
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="grid gap-4">
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={t('verify.codePlaceholder')}
        disabled={isLoading}
      />
      <Button onClick={verify} disabled={!code || isLoading}>
        {isLoading ? t('verify.verifying') : t('verify.verify')}
      </Button>
      <Button variant="link" onClick={resend} disabled={isLoading}>
        {t('verify.resendCode')}
      </Button>
    </div>
  )
}
