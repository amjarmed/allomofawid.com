'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface LoadingErrorProps {
  title?: string
  description?: string
  onRetry?: () => void
  isRetrying?: boolean
}

export function LoadingErrorComponent({
  title,
  description,
  onRetry,
  isRetrying = false
}: LoadingErrorProps) {
  const t = useTranslations('errors')

  return (
    <Alert variant="destructive">
      <Loader2 className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
      <AlertTitle>{title || t('title')}</AlertTitle>
      <AlertDescription className="mt-2 flex flex-col gap-3">
        <p>{description || t('description')}</p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={isRetrying}
            className="w-fit"
          >
            {isRetrying ? t('retrying') : t('retry')}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
