'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardCheck, Star, TrendingUp, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function DashboardOverview() {
  const t = useTranslations('dashboard')

  const stats = [
    {
      title: t('totalRequests'),
      value: '0',
      icon: ClipboardCheck,
    },
    {
      title: t('completedRequests'),
      value: '0',
      icon: Star,
    },
    {
      title: t('totalClients'),
      value: '0',
      icon: Users,
    },
    {
      title: t('growthRate'),
      value: '0%',
      icon: TrendingUp,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
