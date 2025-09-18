'use client'

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/lib/supabase/client';
import { addDays, format, subDays } from 'date-fns';
import { ar, fr } from 'date-fns/locale';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const supabase = createClient()

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

interface TimeRange {
  start: Date
  end: Date
  label: string
}

interface ChartData {
  date: string
  approved: number
  rejected: number
  pending: number
}

interface TypeDistribution {
  type: string
  count: number
}

export function DashboardCharts() {
  const [timeRange, setTimeRange] = useState<TimeRange>({
    start: subDays(new Date(), 7),
    end: new Date(),
    label: '7d'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [verificationTrend, setVerificationTrend] = useState<ChartData[]>([])
  const [typeDistribution, setTypeDistribution] = useState<TypeDistribution[]>([])
  const t = useTranslations('admin')

  // Get locale for date formatting
  const dateLocale = {
    ar,
    fr,
    en: undefined
  }[t('locale') as keyof typeof dateLocale]

  const timeRanges: { [key: string]: TimeRange } = {
    '7d': {
      start: subDays(new Date(), 7),
      end: new Date(),
      label: '7d'
    },
    '30d': {
      start: subDays(new Date(), 30),
      end: new Date(),
      label: '30d'
    },
    '90d': {
      start: subDays(new Date(), 90),
      end: new Date(),
      label: '90d'
    }
  }

  useEffect(() => {
    async function fetchChartData() {
      setIsLoading(true)
      try {
        // Fetch verification trend data
        const { data: trendData, error: trendError } = await supabase
          .from('documents')
          .select('verification_status, created_at')
          .gte('created_at', timeRange.start.toISOString())
          .lte('created_at', timeRange.end.toISOString())
          .order('created_at', { ascending: true })

        if (trendError) throw trendError

        // Group by date and status
        const groupedData = trendData.reduce((acc: { [key: string]: ChartData }, doc) => {
          const date = format(new Date(doc.created_at), 'yyyy-MM-dd')
          if (!acc[date]) {
            acc[date] = {
              date,
              approved: 0,
              rejected: 0,
              pending: 0
            }
          }
          acc[date][doc.verification_status as keyof Omit<ChartData, 'date'>]++
          return acc
        }, {})

        // Fill in missing dates
        const allDates: ChartData[] = []
        let currentDate = timeRange.start
        while (currentDate <= timeRange.end) {
          const dateStr = format(currentDate, 'yyyy-MM-dd')
          allDates.push(
            groupedData[dateStr] || {
              date: dateStr,
              approved: 0,
              rejected: 0,
              pending: 0
            }
          )
          currentDate = addDays(currentDate, 1)
        }

        setVerificationTrend(allDates)

        // Fetch document type distribution
        const { data: typeData, error: typeError } = await supabase
          .from('documents')
          .select('document_type, count')
          .select('document_type')

        if (typeError) throw typeError

        const distribution = typeData.reduce((acc: { [key: string]: number }, doc) => {
          acc[doc.document_type] = (acc[doc.document_type] || 0) + 1
          return acc
        }, {})

        setTypeDistribution(
          Object.entries(distribution).map(([type, count]) => ({
            type,
            count
          }))
        )
      } catch (error) {
        console.error('Error fetching chart data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchChartData()
  }, [timeRange])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-4 w-[200px]" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-4 w-[200px]" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('charts.verificationTrend')}</CardTitle>
          <div className="flex gap-2">
            {Object.values(timeRanges).map((range) => (
              <Button
                key={range.label}
                variant={timeRange.label === range.label ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={verificationTrend}>
                <defs>
                  <linearGradient id="approved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#00C49F" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="rejected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF8042" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#FF8042" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="pending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFBB28" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#FFBB28" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) =>
                    format(new Date(date), 'MMM d', { locale: dateLocale })
                  }
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) =>
                    format(new Date(date), 'PPP', { locale: dateLocale })
                  }
                  formatter={(value: number, name: string) => [
                    value,
                    t(`status.${name}`)
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="approved"
                  stroke="#00C49F"
                  fillOpacity={1}
                  fill="url(#approved)"
                />
                <Area
                  type="monotone"
                  dataKey="rejected"
                  stroke="#FF8042"
                  fillOpacity={1}
                  fill="url(#rejected)"
                />
                <Area
                  type="monotone"
                  dataKey="pending"
                  stroke="#FFBB28"
                  fillOpacity={1}
                  fill="url(#pending)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('charts.documentTypes')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeDistribution}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) =>
                    `${t(`documentTypes.${entry.type}`)}: ${entry.count}`
                  }
                >
                  {typeDistribution.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend
                  formatter={(value: string) => t(`documentTypes.${value}`)}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    value,
                    t(`documentTypes.${name}`)
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
