import { ProfileForm } from '@/components/huissier/profile-form'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const supabase = createClient()
  const t = await getTranslations('profile')

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get existing profile data
  const { data: profile } = await supabase
    .from('huissier_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t('profile')}</h3>
        <p className="text-sm text-muted-foreground">{t('profileDescription')}</p>
      </div>

      <ProfileForm initialData={profile || undefined} userId={user.id} />
    </div>
  )
}
