import { Button } from '@/components/ui/button'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth')

  return {
    title: t('error.title'),
    description: t('error.description'),
  }
}

export default async function AuthErrorPage() {
  const t = await getTranslations('auth')

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-10 w-10"
          >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
          </svg>
        </div>
        <h3 className="mt-4 text-2xl font-semibold">{t('error.title')}</h3>
        <p className="mt-2 text-center text-muted-foreground">
          {t('error.description')}
        </p>
        <div className="mt-8 flex flex-col gap-4">
          <Button asChild>
            <Link href="/auth/login">
              {t('error.tryAgain')}
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">
              {t('error.goHome')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
