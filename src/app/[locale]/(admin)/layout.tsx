'use client'

import { createClient } from "@/lib/supabase/client"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { AdminHeader } from "@/components/admin/header"
import { AdminNav } from "@/components/admin/nav"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const t = useTranslations('admin')

  useEffect(() => {
    async function checkAdmin() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
          redirect('/auth/signin')
        }

        // Check if user has admin role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profileError || !profile || profile.role !== 'admin') {
          toast.error(t('unauthorized'))
          redirect('/')
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Admin check error:', error)
        redirect('/auth/signin')
      }
    }

    checkAdmin()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <AdminHeader />
      <div className="flex flex-1">
        <AdminNav />
        <main className="flex-1 space-y-4 p-8 pt-6">
          {children}
        </main>
      </div>
    </div>
  )
}
  )
}
