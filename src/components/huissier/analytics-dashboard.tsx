'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { format, subDays } from 'date-fns'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

interface RequestStats {
  total: number
  completed: number
  pending: number
  cancelled: number
}

interface RequestByDay {
  date: string
  count: number
}

export function AnalyticsDashboard() {
  const t = useTranslations('analytics')
  const [stats, setStats] = useState<RequestStats>({
    total: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
  })
  const [requestsByDay, setRequestsByDay] = useState<RequestByDay[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      // Fetch request counts by status
      const { data: requestStats, error: statsError } = await supabase
        .from('requests')
        .select('status', { count: 'exact' })
        .then(async ({ data, error }) => {
          if (error) throw error

          const stats = {
            total: data.length,
            completed: data.filter((r) => r.status === 'completed').length,
            pending: data.filter((r) => r.status === 'pending').length,
            cancelled: data.filter((r) => r.status === 'cancelled').length,
          }

          return { data: stats, error: null }
        })

      if (statsError) throw statsError
      setStats(requestStats)

      // Fetch requests for the last 30 days
      const thirtyDaysAgo = subDays(new Date(), 30)
      const { data: recentRequests, error: recentError } = await supabase
        .from('requests')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at')

      if (recentError) throw recentError

      // Group requests by day
      const byDay = recentRequests.reduce<{ [key: string]: number }>(
        (acc, request) => {
          const day = format(new Date(request.created_at), 'yyyy-MM-dd')
          acc[day] = (acc[day] || 0) + 1
          return acc
        },
        {}
      )

      // Fill in missing days with zero
      const allDays: RequestByDay[] = []
      for (let i = 0; i < 30; i++) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
        allDays.push({
          date,
          count: byDay[date] || 0,
        })
      }

      setRequestsByDay(allDays.reverse())
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-4">{t('loading')}</div>
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('totalRequests')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('completedRequests')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('pendingRequests')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('cancelledRequests')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cancelled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Request Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t('requestTrend')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={requestsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), 'MM/dd')}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) => format(new Date(date), 'PP')}
                  formatter={(value: number) => [value, t('requests')]}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Request Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>{t('statusDistribution')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  {
                    name: t('completed'),
                    value: stats.completed,
                  },
                  {
                    name: t('pending'),
                    value: stats.pending,
                  },
                  {
                    name: t('cancelled'),
                    value: stats.cancelled,
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
