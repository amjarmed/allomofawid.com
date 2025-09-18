'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
  error?: Error
}

export function ErrorBoundary({
  children,
  fallback,
  onReset,
  error
}: ErrorBoundaryProps) {
  const t = useTranslations('errors')

  if (error) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{t('title')}</AlertTitle>
        <AlertDescription className="mt-2 flex flex-col gap-3">
          <p>{t('description')}</p>
          {onReset && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="w-fit"
            >
              {t('retry')}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  return <>{children}</>
}
