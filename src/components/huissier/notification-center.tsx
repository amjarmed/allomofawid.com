'use client'

import { Badge } from '@/components/ui/badge'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Notification {
  id: string
  type: 'request' | 'document' | 'system'
  title: string
  message: string
  created_at: string
  read: boolean
}

export function NotificationCenter() {
  const t = useTranslations('notifications')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchNotifications()
    subscribeToNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setNotifications(data)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error(t('fetchError'))
    } finally {
      setIsLoading(false)
    }
  }

  const subscribeToNotifications = () => {
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          setNotifications((current) => [payload.new as Notification, ...current])
          toast.info(payload.new.title)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) throw error

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error(t('updateError'))
    }
  }

  const getNotificationTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'request':
        return 'bg-blue-500'
      case 'document':
        return 'bg-green-500'
      case 'system':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (isLoading) {
    return <div className="text-center py-4">{t('loading')}</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('notifications')}</CardTitle>
        <CardDescription>{t('notificationsDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          {notifications.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              {t('noNotifications')}
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`transition-colors ${
                    notification.read ? 'bg-muted/50' : 'bg-background'
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={getNotificationTypeColor(notification.type)}
                          >
                            {t(notification.type)}
                          </Badge>
                          {!notification.read && (
                            <Badge variant="secondary">
                              {t('new')}
                            </Badge>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
