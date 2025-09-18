import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardNav } from '@/components/dashboard/nav';
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user) redirect(`/${locale}/login`)

  const t = await getTranslations('dashboard')

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <DashboardNav locale={locale} />

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <DashboardHeader locale={locale} user={user} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
