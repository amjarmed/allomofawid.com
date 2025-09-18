import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getTranslations } from 'next-intl/server'

export async function CitySearch() {
  const t = await getTranslations('search')

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>{t('citySearch')}</Label>
          <Input
            type="text"
            placeholder={t('searchPlaceholder')}
          />
        </div>
        {/* City selector will be implemented */}
      </div>
    </Card>
  )
}
