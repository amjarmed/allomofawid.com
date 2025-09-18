'use client'

import { cn } from '@/lib/utils'
import * as React from 'react'

interface TimelineItemProps {
  title: React.ReactNode
  content?: React.ReactNode
  icon?: React.ReactNode
  date?: React.ReactNode
  isLast?: boolean
  className?: string
}

const TimelineItem = React.forwardRef<HTMLDivElement, TimelineItemProps>(
  ({ title, content, icon, date, isLast, className }, ref) => {
    return (
      <div ref={ref} className={cn('relative pb-8', className)}>
        {!isLast && (
          <span
            className="absolute start-4 top-4 -ms-px h-full w-0.5 bg-border"
            aria-hidden="true"
          />
        )}
        <div className="relative flex gap-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background border">
            {icon}
          </div>
          <div className="flex min-w-0 flex-1 justify-between gap-x-4 pt-1.5">
            <div>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              {content && (
                <p className="mt-2 text-sm text-muted-foreground">{content}</p>
              )}
            </div>
            {date && (
              <p className="whitespace-nowrap text-sm text-muted-foreground">
                {date}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }
)
TimelineItem.displayName = 'TimelineItem'

interface TimelineProps {
  children?: React.ReactNode
  className?: string
}

const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  ({ children, className }, ref) => {
    return (
      <div ref={ref} className={cn('flow-root', className)}>
        <ul role="list" className="-mb-8">
          {children}
        </ul>
      </div>
    )
  }
)
Timeline.displayName = 'Timeline'

export { Timeline, TimelineItem }
