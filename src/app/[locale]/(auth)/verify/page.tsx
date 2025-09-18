import { VerificationForm } from '@/components/auth/verification-form'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth')

  return {
    title: t('verify.title'),
    description: t('verify.description'),
  }
}

export default async function VerifyPage() {
  const t = await getTranslations('auth')

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('verify.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('verify.instructions')}
          </p>
        </div>
        <VerificationForm />
      </div>
    </div>
  )
}
