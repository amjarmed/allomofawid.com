import type { Database } from '@/lib/types/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
    PrefetchCache,
    PrefetchConfig,
    PrefetchState,
    QueryConfig
} from './types'

class PrefetchManager {
  private cache: PrefetchCache = new Map()
  private prefetchQueue: Set<string> = new Set()
  private networkSpeed: number = Infinity
  private networkLatency: number = 0

  constructor(private supabase: SupabaseClient<Database>) {
    this.initNetworkMonitoring()
  }

  private initNetworkMonitoring() {
    if (typeof window === 'undefined') return

    // Monitor network conditions
    const connection = (navigator as any).connection
    if (connection) {
      this.networkSpeed = connection.downlink
      connection.addEventListener('change', () => {
        this.networkSpeed = connection.downlink
      })
    }

    // Monitor latency with periodic ping
    this.measureLatency()
  }

  private async measureLatency() {
    if (typeof window === 'undefined') return

    const start = performance.now()
    try {
      await fetch('/api/ping')
      this.networkLatency = performance.now() - start
    } catch {
      this.networkLatency = Infinity
    }
  }

  private async executeQuery<T>(config: QueryConfig): Promise<T[]> {
    let query = this.supabase
      .from(config.table)
      .select(config.columns || '*')

    if (config.filters) {
      Object.entries(config.filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    if (config.range) {
      query = query.range(config.range.from, config.range.to)
    }

    if (config.orderBy) {
      query = query.order(config.orderBy.column, {
        ascending: config.orderBy.ascending
      })
    }

    const { data, error } = await query

    if (error) throw error
    return data as T[]
  }

  private shouldPrefetch(config: PrefetchConfig): boolean {
    const { options } = config
    if (!options) return true

    const { networkConditions } = options
    if (!networkConditions) return true

    const { minSpeed = 0, maxLatency = Infinity } = networkConditions
    return this.networkSpeed >= minSpeed && this.networkLatency <= maxLatency
  }

  async prefetch<T>(config: PrefetchConfig): Promise<void> {
    const { key, query, options } = config

    // Check if we should prefetch
    if (!this.shouldPrefetch(config)) return

    // Add to queue if not already queued
    if (this.prefetchQueue.has(key)) return
    this.prefetchQueue.add(key)

    try {
      const state: PrefetchState<T> = {
        data: null,
        isLoading: true,
        error: null,
        timestamp: Date.now()
      }

      this.cache.set(key, state)

      const data = await this.executeQuery<T>(query)

      this.cache.set(key, {
        ...state,
        data,
        isLoading: false,
        timestamp: Date.now()
      })
    } catch (error) {
      this.cache.set(key, {
        data: null,
        isLoading: false,
        error: error as Error,
        timestamp: Date.now()
      })
    } finally {
      this.prefetchQueue.delete(key)
    }
  }

  getCached<T>(key: string): PrefetchState<T> | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    return cached as PrefetchState<T>
  }

  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }
}

export { PrefetchManager }
