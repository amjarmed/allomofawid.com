'use client'

import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { ar, fr } from 'date-fns/locale'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

const PAGE_SIZE = 10
const supabase = createClient()

type ActivityItem = {
  id: string
  created_at: string
  action_type: 'verification' | 'upload' | 'comment'
  status?: 'approved' | 'rejected' | 'pending'
  document_id: string
  performed_by: {
    id: string
    full_name: string
  }
  document: {
    title: string
  }
}

interface ActivityFeedProps {
  filter?: {
    action_type?: ActivityItem['action_type']
    status?: ActivityItem['status']
  }
}

export function ActivityFeed({ filter }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const t = useTranslations('admin')

  // Get locale for date formatting
  const dateLocale = {
    ar,
    fr,
    en: undefined
  }[t('locale') as keyof typeof dateLocale] || undefined

  const { ref, hasMore } = useInfiniteScroll({
    onLoadMore: async (startIndex) => {
      const query = supabase
        .from('activities')
        .select(`
          id,
          created_at,
          action_type,
          status,
          document_id,
          performed_by:profiles(id, full_name),
          document:documents(title)
        `)
        .order('created_at', { ascending: false })
        .range(startIndex, startIndex + PAGE_SIZE - 1)

      // Apply filters if provided
      if (filter?.action_type) {
        query.eq('action_type', filter.action_type)
      }
      if (filter?.status) {
        query.eq('status', filter.status)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching activities:', error)
        return { items: [], hasMore: false }
      }

      return {
        items: data as ActivityItem[],
        hasMore: data.length === PAGE_SIZE
      }
    }
  })

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('activities')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'activities'
      }, async (payload) => {
        // Fetch complete activity data including relations
        const { data } = await supabase
          .from('activities')
          .select(`
            id,
            created_at,
            action_type,
            status,
            document_id,
            performed_by:profiles(id, full_name),
            document:documents(title)
          `)
          .eq('id', payload.new.id)
          .single()

        if (data) {
          setActivities(prev => [data as ActivityItem, ...prev])
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  function getActionIcon(type: ActivityItem['action_type']) {
    switch (type) {
      case 'verification':
        return 'check-circle'
      case 'upload':
        return 'upload'
      case 'comment':
        return 'message'
      default:
        return 'activity'
    }
  }

  function getStatusBadge(status: ActivityItem['status']) {
    if (!status) return null

    const variants = {
      approved: 'success',
      rejected: 'destructive',
      pending: 'secondary'
    } as const

    return (
      <Badge variant={variants[status]}>
        {t(`status.${status}`)}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <ActivityItemSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <ScrollArea className="h-[600px] rounded-md border p-4">
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start space-x-4 rounded-lg border p-4"
          >
            <div className="mt-0.5">
              <Icon
                name={getActionIcon(activity.action_type)}
                className="h-5 w-5 text-muted-foreground"
              />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm">
                <span className="font-medium">
                  {activity.performed_by.full_name}
                </span>{' '}
                {t(`activity.${activity.action_type}`)}{' '}
                <span className="font-medium">
                  {activity.document.title}
                </span>
              </p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.created_at), {
                    addSuffix: true,
                    locale: dateLocale
                  })}
                </p>
                {activity.status && getStatusBadge(activity.status)}
              </div>
            </div>
          </div>
        ))}
        {hasMore && (
          <div ref={ref} className="py-4">
            <ActivityItemSkeleton />
          </div>
        )}
      </div>
    </ScrollArea>
  )
}

function ActivityItemSkeleton() {
  return (
    <div className="flex items-start space-x-4 rounded-lg border p-4">
      <Skeleton className="mt-0.5 h-5 w-5 rounded-full" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-5 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
    </div>
  )
}
