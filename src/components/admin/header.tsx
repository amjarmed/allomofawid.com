import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function AdminHeader() {
  const t = useTranslations('admin')
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      toast.success(t('signedOut'))
      router.push('/auth/signin')
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error(t('signOutError'))
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <h1 className="text-lg font-semibold">{t('adminDashboard')}</h1>
        <Button
          variant="ghost"
          onClick={handleSignOut}
        >
          {t('signOut')}
        </Button>
      </div>
    </header>
  )
}
