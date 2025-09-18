import { RequestForm } from '@/components/requests/request-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('requests')

  return {
    title: t('newRequest'),
    description: t('newRequestDesc'),
  }
}

export default async function NewRequestPage() {
  const t = await getTranslations('requests')

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('newRequest')}</CardTitle>
          <CardDescription>{t('newRequestDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <RequestForm />
        </CardContent>
      </Card>
    </div>
  )
}
