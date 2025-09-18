'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { WifiOff } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface NetworkErrorProps {
  code: 'offline' | 'timeout' | 'serverError'
  onRetry?: () => void
}

export function NetworkErrorComponent({ code, onRetry }: NetworkErrorProps) {
  const t = useTranslations('errors.network')

  return (
    <Alert variant="destructive" className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
      <WifiOff className="h-4 w-4" />
      <AlertTitle>{t('title')}</AlertTitle>
      <AlertDescription className="mt-2 flex flex-col gap-3">
        <p>{t(code)}</p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="w-fit"
          >
            {t('retry')}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
