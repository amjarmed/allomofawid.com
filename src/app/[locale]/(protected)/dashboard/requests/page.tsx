import { RequestManagement } from '@/components/huissier/request-management'
import { getTranslations } from 'next-intl/server'

export default async function RequestsPage() {
  const t = await getTranslations('requests')

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t('requests')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('requestsDescription')}
        </p>
      </div>

      <RequestManagement />
    </div>
  )
}
