import { NotificationList } from '@/components/client/notification-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from 'next-intl'
import { Suspense } from 'react'

export default function NotificationsPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = useTranslations('notifications')

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('notifications')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<NotificationsSkeleton />}>
            <NotificationList locale={locale} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

function NotificationsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-[500px] w-full rounded-lg" />
    </div>
  )
}
