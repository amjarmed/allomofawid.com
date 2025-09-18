import { createClient } from '@/lib/supabase/client'
import { type RequestRecord } from '@/lib/validations/request'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { toast } from 'sonner'

export function useRequestRealtimeUpdates(requestId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('requests')
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to request changes
    const requestChannel = supabase
      .channel(`request-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'requests',
          filter: `id=eq.${requestId}`,
        },
        async (payload) => {
          const oldStatus = (payload.old as RequestRecord).status
          const newStatus = (payload.new as RequestRecord).status

          // Update React Query cache
          queryClient.setQueryData(['request', requestId], (old: RequestRecord) => ({
            ...old,
            ...(payload.new as RequestRecord),
          }))

          // Show status change notification
          if (oldStatus !== newStatus) {
            toast.info(t('statusUpdated', {
              status: t(`status.${newStatus}`)
            }))
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'request_status_history',
          filter: `request_id=eq.${requestId}`,
        },
        async (payload) => {
          // Update React Query cache with new status history
          queryClient.setQueryData(['request', requestId], (old: RequestRecord) => ({
            ...old,
            statusHistory: [payload.new, ...(old.statusHistory || [])],
          }))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(requestChannel)
    }
  }, [requestId, queryClient, t])
}

export function useRequestsRealtimeUpdates() {
  const queryClient = useQueryClient()
  const t = useTranslations('requests')
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to all requests changes
    const requestsChannel = supabase
      .channel('requests')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'requests',
        },
        async (payload) => {
          // Update requests list cache
          queryClient.setQueryData(['requests'], (old: RequestRecord[]) =>
            old?.map((request) =>
              request.id === payload.new.id
                ? { ...request, ...(payload.new as RequestRecord) }
                : request
            )
          )

          // Show notification for urgent updates
          const newRequest = payload.new as RequestRecord
          if (newRequest.priority === 'URGENT') {
            toast.info(t('urgentRequestUpdated', {
              title: newRequest.title
            }))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(requestsChannel)
    }
  }, [queryClient, t])
}
