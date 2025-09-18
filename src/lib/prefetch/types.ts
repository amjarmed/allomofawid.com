import type { Database } from '@/lib/types/supabase'

export interface PrefetchOptions {
  /** Time in milliseconds to consider cached data valid */
  cacheDuration?: number
  /** Whether to prefetch on mount */
  prefetchOnMount?: boolean
  /** Number of items to prefetch */
  prefetchCount?: number
  /** Whether to prefetch when network is idle */
  prefetchOnIdle?: boolean
  /** Network conditions to prefetch under */
  networkConditions?: {
    /** Minimum network speed in Mbps */
    minSpeed?: number
    /** Maximum latency in ms */
    maxLatency?: number
  }
}

export interface PrefetchState<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  timestamp: number
}

export type PrefetchCache = Map<string, PrefetchState<any>>

export interface QueryConfig {
  table: keyof Database['public']['Tables']
  columns?: string
  filters?: Record<string, any>
  range?: {
    from: number
    to: number
  }
  orderBy?: {
    column: string
    ascending?: boolean
  }
}

export interface PrefetchConfig {
  /** Unique key for the prefetch operation */
  key: string
  /** Query configuration */
  query: QueryConfig
  /** Optional configuration for how the prefetch should behave */
  options?: PrefetchOptions
}
