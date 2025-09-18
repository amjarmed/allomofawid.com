import { DashboardOverview } from '@/components/dashboard/overview'
import { getTranslations } from 'next-intl/server'

export default async function DashboardPage() {
  const t = await getTranslations('dashboard')

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('welcome')}</h2>
        <p className="text-muted-foreground">{t('welcomeMessage')}</p>
      </div>

      <DashboardOverview />
    </div>
  )
}
