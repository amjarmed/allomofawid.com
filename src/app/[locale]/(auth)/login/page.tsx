import { AuthLoginForm } from '@/components/auth/auth-login-form'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth')

  return {
    title: t('login.title'),
    description: t('login.description'),
  }
}

export default async function LoginPage() {
  const t = await getTranslations('auth')

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <img src="/logo.svg" alt="Allo Mofawid" className="h-8 w-8 mr-2" />
          {t('common.appName')}
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              {t('login.quote')}
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t('login.welcomeBack')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('login.enterDetails')}
            </p>
          </div>
          <AuthLoginForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            <a href="/auth/register" className="hover:text-brand underline underline-offset-4">
              {t('login.noAccount')}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
