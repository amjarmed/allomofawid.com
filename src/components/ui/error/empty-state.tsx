'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SearchX } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface EmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
}

export function EmptyStateComponent({
  title,
  description,
  actionLabel,
  onAction,
  icon = <SearchX className="h-12 w-12 text-muted-foreground" />
}: EmptyStateProps) {
  const t = useTranslations('errors')

  return (
    <Card className="w-full text-center">
      <CardHeader>
        <div className="flex justify-center mb-4">
          {icon}
        </div>
        <CardTitle>{title || t('filter.noResults')}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {onAction && (
        <CardContent>
          <Button
            variant="outline"
            onClick={onAction}
            className="mt-4"
          >
            {actionLabel || t('retry')}
          </Button>
        </CardContent>
      )}
    </Card>
  )
}
