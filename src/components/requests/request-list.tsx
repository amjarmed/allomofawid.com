'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { getUserRequests } from '@/lib/api/requests'
import { RequestStatusEnum, type RequestStatus } from '@/lib/validations/request'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import * as React from 'react'

const statusColors: Record<RequestStatus, string> = {
  PENDING: 'bg-yellow-500',
  ACCEPTED: 'bg-blue-500',
  REJECTED: 'bg-red-500',
  IN_PROGRESS: 'bg-purple-500',
  COMPLETED: 'bg-green-500',
  CANCELLED: 'bg-gray-500',
}

export function RequestList() {
  const t = useTranslations('requests')
  const [selectedStatus, setSelectedStatus] = React.useState<string[]>(['PENDING', 'ACCEPTED', 'IN_PROGRESS'])

  const { data: requests, isLoading, error } = useQuery({
    queryKey: ['requests', { status: selectedStatus }],
    queryFn: () => getUserRequests({ status: selectedStatus }),
  })

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-destructive mb-4">{t('error')}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              {t('retry')}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
                <Skeleton className="h-6 w-[100px]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!requests?.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">{t('noRequests')}</p>
            <Button asChild>
              <Link href="/requests/new">{t('createRequest')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Select
          defaultValue={selectedStatus.join(',')}
          onValueChange={(value) => setSelectedStatus(value.split(','))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('selectStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="PENDING,ACCEPTED,IN_PROGRESS">
                {t('activeRequests')}
              </SelectItem>
              <SelectItem value="COMPLETED,CANCELLED">
                {t('completedRequests')}
              </SelectItem>
              <SelectItem value={RequestStatusEnum.options.join(',')}>
                {t('allRequests')}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button asChild>
          <Link href="/requests/new">{t('newRequest')}</Link>
        </Button>
      </div>

      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{request.title}</h3>
                    <Badge className={statusColors[request.status]}>
                      {t(`status.${request.status.toLowerCase()}`)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span>{t(`types.${request.type.toLowerCase()}`)}</span>
                    <span className="mx-2">•</span>
                    <time dateTime={request.createdAt}>
                      {format(new Date(request.createdAt), 'PPP')}
                    </time>
                  </div>
                </div>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/requests/${request.id}`}>
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">{t('viewRequest')}</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
