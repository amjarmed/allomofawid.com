'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
    BarChart,
    Bell,
    ClipboardList,
    LayoutDashboard,
    Settings,
    UserCircle,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface DashboardNavProps {
  locale: string
}

export function DashboardNav({ locale }: DashboardNavProps) {
  const t = useTranslations('dashboard')
  const pathname = usePathname()

  const routes = [
    {
      href: `/${locale}/dashboard`,
      icon: LayoutDashboard,
      title: t('overview'),
    },
    {
      href: `/${locale}/dashboard/profile`,
      icon: UserCircle,
      title: t('profile'),
    },
    {
      href: `/${locale}/dashboard/requests`,
      icon: ClipboardList,
      title: t('requests'),
    },
    {
      href: `/${locale}/dashboard/analytics`,
      icon: BarChart,
      title: t('analytics'),
    },
    {
      href: `/${locale}/dashboard/notifications`,
      icon: Bell,
      title: t('notifications'),
    },
    {
      href: `/${locale}/dashboard/settings`,
      icon: Settings,
      title: t('settings'),
    },
  ]

  return (
    <nav className="group fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r bg-background p-2">
      <div className="flex h-14 items-center border-b px-4">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <span className="font-bold">{t('appName')}</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 py-2">
        {routes.map((route) => (
          <Button
            key={route.href}
            variant={pathname === route.href ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-2",
              pathname === route.href && "bg-secondary"
            )}
            asChild
          >
            <Link href={route.href}>
              <route.icon className="h-5 w-5" />
              {route.title}
            </Link>
          </Button>
        ))}
      </ScrollArea>
    </nav>
  )
}
