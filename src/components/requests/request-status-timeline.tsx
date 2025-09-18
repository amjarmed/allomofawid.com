'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Timeline, TimelineItem } from '@/components/ui/timeline'
import { cn } from '@/lib/utils'
import { RequestStatusHistory } from '@/lib/validations/request'
import { formatDistanceToNow } from 'date-fns'
import { ar, enUS, fr } from 'date-fns/locale'
import { AlertCircleIcon, CheckCircleIcon, ClockIcon, FileIcon, XCircleIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

const locales = { ar, fr, en: enUS }

const statusIcons = {
  PENDING: ClockIcon,
  ACCEPTED: CheckCircleIcon,
  REJECTED: XCircleIcon,
  IN_PROGRESS: ClockIcon,
  COMPLETED: CheckCircleIcon,
  CANCELLED: AlertCircleIcon,
}

const statusColors = {
  PENDING: 'bg-yellow-500',
  ACCEPTED: 'bg-blue-500',
  REJECTED: 'bg-red-500',
  IN_PROGRESS: 'bg-blue-500',
  COMPLETED: 'bg-green-500',
  CANCELLED: 'bg-gray-500',
}

interface RequestStatusTimelineProps {
  history: RequestStatusHistory[]
  className?: string
}

export function RequestStatusTimeline({ history, className }: RequestStatusTimelineProps) {
  const t = useTranslations('requests')
  const params = useParams()
  const locale = params.locale as keyof typeof locales

  return (
    <Timeline className={className}>
      {history.map((item, index) => {
        const StatusIcon = statusIcons[item.status]
        const colorClass = statusColors[item.status]

        return (
          <TimelineItem
            key={item.id}
            icon={
              <StatusIcon
                className={cn('h-5 w-5 text-white', colorClass)}
                aria-hidden="true"
              />
            }
            title={
              <div className="flex items-center gap-2">
                <Badge variant="outline">{t(`status.${item.status}`)}</Badge>
                {item.createdByUser && (
                  <span className="text-sm text-muted-foreground">
                    {t('by')} {item.createdByUser.fullName}
                  </span>
                )}
              </div>
            }
            content={
              <div className="space-y-2">
                {item.note && <p>{item.note}</p>}
                {item.attachments && item.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.attachments.map((file) => (
                      <Button
                        key={file.url}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        asChild
                      >
                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                          <FileIcon className="h-4 w-4" />
                          {file.name}
                        </a>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            }
            date={formatDistanceToNow(new Date(item.createdAt), {
              addSuffix: true,
              locale: locales[locale],
            })}
            isLast={index === history.length - 1}
          />
        )
      })}
    </Timeline>
  )
}
