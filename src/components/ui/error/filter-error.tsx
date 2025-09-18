'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { FilterError } from '@/lib/errors/filter-error'
import { FilterIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface FilterErrorProps {
  error: FilterError
  onReset?: () => void
}

export function FilterErrorComponent({ error, onReset }: FilterErrorProps) {
  const t = useTranslations('errors.filter')

  return (
    <Alert variant="default" className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
      <FilterIcon className="h-4 w-4" />
      <AlertTitle>{t('title')}</AlertTitle>
      <AlertDescription className="mt-2 flex flex-col gap-3">
        <p>{t(error.code)}</p>
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
