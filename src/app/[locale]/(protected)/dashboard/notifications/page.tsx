import { NotificationCenter } from '@/components/huissier/notification-center'
import { getTranslations } from 'next-intl/server'

export default async function NotificationsPage() {
  const t = await getTranslations('notifications')

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t('notifications')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('notificationsDescription')}
        </p>
      </div>

      <NotificationCenter />
    </div>
  )
}
