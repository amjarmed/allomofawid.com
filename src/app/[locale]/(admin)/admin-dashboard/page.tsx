'use client'

import { AdminNav } from '@/components/admin/nav'
import { VerificationQueue } from "@/components/admin/verification-queue"
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import { Suspense, useEffect, useState } from 'react'

type DashboardStats = {
  totalDocuments: number
  pendingVerification: number
  approvedDocuments: number
  rejectedDocuments: number
  verificationRate: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const t = useTranslations('admin')

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch document statistics
        const { data: documentsData, error: documentsError } = await supabase
          .from('documents')
          .select('verification_status, verified_at')

        if (documentsError) throw documentsError

        const docs = documentsData as Array<{
          verification_status: 'pending' | 'approved' | 'rejected'
          verified_at: string | null
        }>

        const stats: DashboardStats = {
          totalDocuments: docs.length,
          pendingVerification: docs.filter(d => d.verification_status === 'pending').length,
          approvedDocuments: docs.filter(d => d.verification_status === 'approved').length,
          rejectedDocuments: docs.filter(d => d.verification_status === 'rejected').length,
          verificationRate: docs.length ?
            (docs.filter(d => d.verification_status !== 'pending').length / docs.length) * 100 :
            0
        }

        setStats(stats)

        // Fetch recent activity
        const { data: activityData, error: activityError } = await supabase
          .from('documents')
          .select("*, verified_by_user:profiles!verified_by(full_name), document_owner:profiles(full_name)")
          .order('verified_at', { ascending: false })
          .limit(5)

        if (activityError) throw activityError

        setRecentActivity(activityData || [])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
        <aside className="hidden w-[200px] flex-col md:flex">
          <AdminNav />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>
            <div className="space-y-4">
              <Suspense fallback={<div>Loading verification queue...</div>}>
                <VerificationQueue />
              </Suspense>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
