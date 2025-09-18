'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { getRequest } from '@/lib/api/requests'
import { useRequestRealtimeUpdates } from '@/hooks/use-request-realtime'
import { type RequestStatus } from '@/lib/validations/request'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Calendar, MapPin, MessageCircle, Phone } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import * as React from 'react'
import { RequestStatusTimeline } from './request-status-timeline'

const statusColors: Record<RequestStatus, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
  ACCEPTED: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
  REJECTED: 'bg-red-500/20 text-red-700 dark:text-red-400',
  IN_PROGRESS: 'bg-purple-500/20 text-purple-700 dark:text-purple-400',
  COMPLETED: 'bg-green-500/20 text-green-700 dark:text-green-400',
  CANCELLED: 'bg-gray-500/20 text-gray-700 dark:text-gray-400',
}

interface RequestDetailProps {
  requestId: string
}

'use client'

import { useTranslations } from 'next-intl'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import Link from 'next/link'
import {
  Calendar,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react'

import { getRequest } from '@/lib/api/requests'
import { useRequestRealtimeUpdates } from '@/hooks/use-request-realtime'
import type { RequestStatus, RequestWithDetails } from '@/lib/types'

import { RequestStatusTimeline } from './request-status-timeline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface RequestDetailProps {
  requestId: string
}

const statusColors: Record<RequestStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  accepted: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  inProgress: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

export function RequestDetail({ requestId }: RequestDetailProps) {
  const t = useTranslations('requests')
  const queryClient = useQueryClient()

  const { data: request, isLoading, error } = useQuery({
    queryKey: ['request', requestId],
    queryFn: () => getRequest(requestId),
  })

  // Subscribe to real-time updates
  useRequestRealtimeUpdates(requestId)

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
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-[300px] mb-2" />
          <Skeleton className="h-4 w-[200px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!request) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">{t('requestNotFound')}</p>
            <Button asChild className="mt-4">
              <Link href="/requests">{t('backToRequests')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Request Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{request.title}</CardTitle>
              <CardDescription className="mt-2">
                <Badge variant="secondary" className={statusColors[request.status]}>
                  {t(`status.${request.status}`)}
                </Badge>
                {request.huissier && (
                  <span className="ms-2 text-muted-foreground">
                    • {t('assignedHuissier')}: {request.huissier.fullName}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="text-end">
              <div className="text-sm text-muted-foreground">
                {t('preferredDate')}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Calendar className="h-4 w-4" />
                {request.preferredDate
                  ? format(new Date(request.preferredDate), 'PPP')
                  : t('notSpecified')}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="space-y-4">
                <div>
                  <div className="font-medium mb-2">{t('description')}</div>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {request.description}
                  </p>
                </div>
                <div>
                  <div className="font-medium mb-2">{t('location')}</div>
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-1 shrink-0" />
                    <div>
                      {request.location.address}
                      <br />
                      {request.location.city}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {request.huissier && (
              <div className="md:border-s md:ps-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {request.huissier.avatarUrl && (
                        <AvatarImage
                          src={request.huissier.avatarUrl}
                          alt={request.huissier.fullName}
                        />
                      )}
                      <AvatarFallback>
                        {request.huissier.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {request.huissier.fullName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {request.huissier.city}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {request.huissier.phone && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        asChild
                      >
                        <a href={`tel:${request.huissier.phone}`}>
                          <Phone className="h-4 w-4 me-2" />
                          {t('call')}
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <Link href={`/messages/${requestId}`}>
                        <MessageCircle className="h-4 w-4 me-2" />
                        {t('messages')}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status History Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('timeline.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {request.statusHistory && request.statusHistory.length > 0 ? (
            <RequestStatusTimeline history={request.statusHistory} />
          ) : (
            <p className="text-center text-muted-foreground py-6">
              {t('timeline.noHistory')}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Request Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{request.title}</CardTitle>
              <CardDescription className="mt-2">
                <Badge variant="secondary" className={statusColors[request.status]}>
                  {t(`status.${request.status}`)}
                </Badge>
                {request.huissier && (
                  <span className="ms-2 text-muted-foreground">
                    • {t('assignedHuissier')}: {request.huissier.fullName}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="text-end">
              <div className="text-sm text-muted-foreground">
                {t('preferredDate')}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Calendar className="h-4 w-4" />
                {request.preferredDate
                  ? format(new Date(request.preferredDate), 'PPP')
                  : t('notSpecified')}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="space-y-4">
                <div>
                  <div className="font-medium mb-2">{t('description')}</div>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {request.description}
                  </p>
                </div>
                <div>
                  <div className="font-medium mb-2">{t('location')}</div>
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-1 shrink-0" />
                    <div>
                      {request.location.address}
                      <br />
                      {request.location.city}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {request.huissier && (
              <div className="md:border-s md:ps-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {request.huissier.avatarUrl && (
                        <AvatarImage
                          src={request.huissier.avatarUrl}
                          alt={request.huissier.fullName}
                        />
                      )}
                      <AvatarFallback>
                        {request.huissier.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {request.huissier.fullName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {request.huissier.city}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {request.huissier.phone && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        asChild
                      >
                        <a href={`tel:${request.huissier.phone}`}>
                          <Phone className="h-4 w-4 me-2" />
                          {t('call')}
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <Link href={`/messages/${requestId}`}>
                        <MessageCircle className="h-4 w-4 me-2" />
                        {t('messages')}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status History Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('timeline.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {request.statusHistory && request.statusHistory.length > 0 ? (
            <RequestStatusTimeline history={request.statusHistory} />
          ) : (
            <p className="text-center text-muted-foreground py-6">
              {t('timeline.noHistory')}
            </p>
          )}
        </CardContent>
      </Card>
                      >
                        <Link href={file.url} target="_blank" rel="noopener noreferrer">
                          {file.name}
                        </Link>
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {request.huissierId && request.huissier && (
              <>
                <Separator />

                <div>
                  <h3 className="font-medium mb-4">{t('assignedHuissier')}</h3>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage
                        src={request.huissier.avatar_url || ''}
                        alt={request.huissier.full_name || ''}
                      />
                      <AvatarFallback>
                        {request.huissier.full_name[0] || 'H'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {request.huissier.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {request.huissier.city}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-auto">
                      {request.huissier.phone && (
                        <Button size="icon" variant="outline" asChild>
                          <Link
                            href={`tel:${request.huissier.phone}`}
                            aria-label={t('call')}
                          >
                            <Phone className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      <Button size="icon" variant="outline" asChild>
                        <Link
                          href={`/messages/${request.id}`}
                          aria-label={t('messages')}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
