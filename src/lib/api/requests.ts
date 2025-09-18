import { Database } from '@/lib/types/supabase'
import { createClient } from '@/lib/supabase/server'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { requestSchema, type RequestRecord, type CreateRequestInput } from '@/lib/validations/request'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

export async function getRequest(requestId: string): Promise<RequestRecord> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('requests')
    .select(`
      *,
      huissier:profiles(
        id,
        full_name,
        avatar_url,
        city,
        phone
      )
    `)
    .eq('id', requestId)
    .single()

  if (error) throw error
  if (!data) throw new Error('Request not found')

  return requestSchema.parse(data)
}

export async function getUserRequests(options?: {
  status?: string[]
  limit?: number
  offset?: number
}): Promise<RequestRecord[]> {
  const supabase = createClient()

  let query = supabase
    .from('requests')
    .select(`
      *,
      huissier:profiles(
        id,
        full_name,
        avatar_url,
        city,
        phone
      )
    `)

  if (options?.status) {
    query = query.in('status', options.status)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  if (!data) return []

  return data.map(request => requestSchema.parse(request))
}

export async function createRequest(input: CreateRequestInput): Promise<RequestRecord> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('requests')
    .insert({
      ...input,
      status: 'PENDING',
      status_history: [{
        status: 'PENDING',
        created_at: new Date().toISOString()
      }]
    })
    .select(`
      *,
      huissier:profiles(
        id,
        full_name,
        avatar_url,
        city,
        phone
      )
    `)
    .single()

  if (error) throw error
  if (!data) throw new Error('Failed to create request')

  return requestSchema.parse(data)
}

/**
 * Subscribe to real-time updates for a request
 */
export function subscribeToRequest(
  requestId: string,
  callback: (payload: { new: RequestRecord }) => void
) {
  const supabase = createBrowserClient()
  const client = createClient()
  const channel = supabase.channel(`request-${requestId}`)

  channel
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'requests',
        filter: `id=eq.${requestId}`,
      },
      async (payload: RealtimePostgresChangesPayload<Database['public']['Tables']['requests']['Row']>) => {
        if (payload.new) {
          // Fetch the updated request with huissier details
          const { data, error } = await client
            .from('requests')
            .select(`
              *,
              huissier:profiles(
                id,
                full_name,
                avatar_url,
                city,
                phone
              )
            `)
            .eq('id', requestId)
            .single()

          if (!error && data) {
            callback({ new: requestSchema.parse(data) })
          }
        }
      }
    )
    .subscribe()

  return {
    unsubscribe: () => {
      channel.unsubscribe()
    },
  }
}
  }

  const { data, error } = await supabase
    .from('requests')
    .insert(requestData)
    .select()
    .single()

  if (error) throw error
  return data as RequestRecord
}

/**
 * Update request status
 */
export async function updateRequestStatus(
  { requestId, status, note, attachments }: UpdateRequestStatusInput
): Promise<RequestRecord> {
  const supabase = createClient()

  const updateData: RequestUpdate = {
    status,
    ...(attachments && { attachments })
  }

  const { data, error } = await supabase
    .from('requests')
    .update(updateData)
    .eq('id', requestId)
    .select()
    .single()

  if (error) throw error
  return data as RequestRecord
}

/**
 * Subscribe to request updates (client-side)
 */
export function subscribeToRequest(
  requestId: string,
  callback: (payload: { new: RequestRecord; old: RequestRecord }) => void
) {
  const supabase = createClientComponentClient<Database>()

  return supabase
    .channel(`request-${requestId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'requests',
        filter: `id=eq.${requestId}`
      },
      (payload) => callback(payload as any)
    )
    .subscribe()
}

/**
 * Subscribe to user's request notifications (client-side)
 */
export function subscribeToNotifications(
  callback: (payload: { new: Tables['request_notifications']['Row'] }) => void
) {
  const supabase = createClientComponentClient<Database>()

  return supabase
    .channel('request-notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'request_notifications'
      },
      (payload) => callback(payload as any)
    )
    .subscribe()
}
