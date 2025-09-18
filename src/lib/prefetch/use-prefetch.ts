'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useRef, useState } from 'react'
import { PrefetchManager } from './prefetch-manager'
import type { PrefetchConfig, PrefetchState } from './types'

export function usePrefetch<T>(config: PrefetchConfig) {
  const supabase = createClient()
  const manager = useRef<PrefetchManager>(
    new PrefetchManager(supabase)
  ).current

  const [state, setState] = useState<PrefetchState<T>>({
    data: null,
    isLoading: true,
    error: null,
    timestamp: Date.now()
  })

  useEffect(() => {
    const cached = manager.getCached<T>(config.key)
    if (cached) {
      setState(cached)
      // Check if cache is still valid
      const isExpired =
        Date.now() - cached.timestamp >
        (config.options?.cacheDuration || 5 * 60 * 1000)

      if (!isExpired && !cached.error) return
    }

    // Prefetch data
    const prefetchData = async () => {
      try {
        await manager.prefetch<T>(config)
        const newState = manager.getCached<T>(config.key)
        if (newState) setState(newState)
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error as Error,
          isLoading: false
        }))
      }
    }

    if (config.options?.prefetchOnMount) {
      prefetchData()
    }

    if (config.options?.prefetchOnIdle) {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => prefetchData())
      } else {
        setTimeout(prefetchData, 1)
      }
    }

    return () => {
      // Optionally clear cache on unmount
      // manager.clearCache(config.key)
    }
  }, [config.key])

  return state
}
