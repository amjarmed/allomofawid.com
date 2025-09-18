'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/types/supabase';
import { format } from 'date-fns';
import { ar, fr } from 'date-fns/locale';
import { Check, Mail, Trash2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

type Notification = Database['public']['Tables']['notifications']['Row']
type NotificationData = {
  url?: string;
  [key: string]: any;
}

export function NotificationList({ locale }: { locale: string }) {
  const t = useTranslations('notifications')
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const supabase = createClient()

  const { ref, inView } = useInView({
    threshold: 0,
  })

  const fetchNotifications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .range(page * 10, (page + 1) * 10 - 1)

      if (error) throw error

      if (data.length < 10) {
        setHasMore(false)
      }

      setNotifications(prev => [...prev, ...data])
      setPage(prev => prev + 1)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [page, supabase])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { data, error } = await supabase.rpc('mark_notification_read', {
        notification_id: notificationId,
      })

      if (error) throw error

      // Update the local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read_at: new Date().toISOString() }
            : notification
        )
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }, [supabase])

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications
        .filter(n => !n.read_at)
        .map(n => n.id)

      // Mark each notification as read
      await Promise.all(
        unreadNotifications.map(id =>
          supabase.rpc('mark_notification_read', {
            notification_id: id,
          })
        )
      )

      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          !notification.read_at
            ? { ...notification, read_at: new Date().toISOString() }
            : notification
        )
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }, [notifications, supabase])

  const clearNotification = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase.rpc('clear_notification', {
        notification_id: notificationId,
      })

      if (error) throw error

      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (error) {
      console.error('Error clearing notification:', error)
    }
  }, [supabase])

  const clearAllNotifications = useCallback(async () => {
    try {
      const { error } = await supabase.rpc('clear_all_notifications')

      if (error) throw error

      // Update local state
      setNotifications([])
      setHasMore(false)
    } catch (error) {
      console.error('Error clearing all notifications:', error)
    }
  }, [supabase])

  useEffect(() => {
    if (inView && hasMore && !loading) {
      fetchNotifications()
    }
  }, [inView, hasMore, loading, fetchNotifications])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  if (loading && notifications.length === 0) {
    return <NotificationSkeleton />
  }

  if (notifications.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        {t('noNotifications')}
      </Card>
    )
  }

  const getDateLocale = () => {
    switch (locale) {
      case 'ar':
        return ar
      case 'fr':
        return fr
      default:
        return undefined
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{t('title')}</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={!notifications.some(n => !n.read_at)}
          >
            <Check className="mr-2 h-4 w-4" />
            {t('markAllAsRead')}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={notifications.length === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('clearAll')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('clearAll')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('clearAllConfirm')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={clearAllNotifications}>
                  {t('confirm')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <ScrollArea className="h-[500px] rounded-md border p-4">
        <div className="space-y-4">
          {notifications.map((notification) => {
            const notificationData = notification.data as NotificationData | null
            return (
              <Card
                key={notification.id}
                className={`p-4 transition-colors hover:bg-muted/50 ${
                  !notification.read_at ? 'bg-muted/10' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        if (notificationData?.url) {
                          router.push(notificationData.url)
                        }
                      }}
                    >
                      <h4 className="font-semibold">{notification.title}</h4>
                      {notification.body && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {notification.body}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        {notification.category && (
                          <Badge variant="secondary">{notification.category}</Badge>
                        )}
                        <time
                          className="text-xs text-muted-foreground"
                          dateTime={notification.created_at}
                        >
                          {format(new Date(notification.created_at), 'PPp', {
                            locale: getDateLocale(),
                          })}
                        </time>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notification.read_at && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Mail className="h-4 w-4" />
                        <span className="sr-only">{t('markAsRead')}</span>
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <X className="h-4 w-4" />
                          <span className="sr-only">{t('delete')}</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('delete')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('clearConfirm')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => clearNotification(notification.id)}
                          >
                            {t('confirm')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            )
          })}
          {hasMore && (
            <div ref={ref} className="py-4">
              <NotificationSkeleton />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

function NotificationSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="space-y-3">
            <Skeleton className="h-5 w-[250px]" />
            <Skeleton className="h-4 w-[400px]" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-[70px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
