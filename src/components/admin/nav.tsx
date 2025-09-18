import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export function AdminNav() {
  const t = useTranslations('admin')

  const navItems = [
    {
      title: t('dashboard'),
      href: '/admin',
      icon: 'dashboard',
    },
    {
      title: t('verification'),
      href: '/admin/verification',
      icon: 'check-circle',
    },
    {
      title: t('users'),
      href: '/admin/users',
      icon: 'users',
    },
    {
      title: t('settings'),
      href: '/admin/settings',
      icon: 'settings',
    },
  ]

  return (
    <nav className="hidden border-r px-4 pb-12 md:block">
      <div className="space-y-4 py-4">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            className="w-full justify-start"
            asChild
          >
            <Link href={item.href}>
              <Icon name={item.icon} className="mr-2 h-4 w-4" />
              {item.title}
            </Link>
          </Button>
        ))}
      </div>
    </nav>
  )
}
