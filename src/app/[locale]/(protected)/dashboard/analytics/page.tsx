import { AnalyticsDashboard } from '@/components/huissier/analytics-dashboard'
import { getTranslations } from 'next-intl/server'

export default async function AnalyticsPage() {
  const t = await getTranslations('analytics')

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t('analytics')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('analyticsDescription')}
        </p>
      </div>

      <AnalyticsDashboard />
    </div>
  )
}
