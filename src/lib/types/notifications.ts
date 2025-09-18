import { type Database } from './supabase'

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  data?: {
    url?: string
    [key: string]: any
  }
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
  tag?: string
  requireInteraction?: boolean
  renotify?: boolean
  silent?: boolean
  timestamp?: number
}

export interface PushSubscriptionJSON {
  endpoint: string
  expirationTime: number | null
  keys: {
    p256dh: string
    auth: string
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type NotificationRecord = Tables<'notifications'>
