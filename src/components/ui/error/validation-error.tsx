'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ValidationErrorProps {
  code: 'required' | 'invalid'
  field?: string
}

export function ValidationErrorComponent({ code, field }: ValidationErrorProps) {
  const t = useTranslations('errors.validation')

  return (
    <Alert variant="destructive" className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{field ? `${field}: ${t(code)}` : t(code)}</AlertTitle>
      <AlertDescription className="mt-2">
        <p>{t('description')}</p>
      </AlertDescription>
    </Alert>
  )
}
