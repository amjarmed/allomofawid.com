'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'

interface RoutePrefetchOptions {
  /** Routes to prefetch */
  routes: string[]
  /** Whether to prefetch on mount */
  prefetchOnMount?: boolean
  /** Whether to prefetch on hover */
  prefetchOnHover?: boolean
  /** Whether to prefetch when network is idle */
  prefetchOnIdle?: boolean
  /** Minimum time in milliseconds to wait between prefetches */
  throttleMs?: number
}

export function useRoutePrefetch(options: RoutePrefetchOptions) {
  const router = useRouter()
  const pathname = usePathname()
  const {
    routes,
    prefetchOnMount = true,
    prefetchOnHover = true,
    prefetchOnIdle = true,
    throttleMs = 1000
  } = options

  const prefetchRoute = useCallback(
    (route: string) => {
      if (route === pathname) return
      router.prefetch(route)
    },
    [router, pathname]
  )

  useEffect(() => {
    if (!prefetchOnMount) return

    let timeoutId: NodeJS.Timeout

    const prefetchRoutes = () => {
      routes.forEach(route => {
        timeoutId = setTimeout(() => {
          prefetchRoute(route)
        }, throttleMs)
      })
    }

    prefetchRoutes()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [routes, prefetchOnMount, prefetchRoute, throttleMs])

  useEffect(() => {
    if (!prefetchOnIdle) return

    const handleIdle = () => {
      routes.forEach(prefetchRoute)
    }

    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(handleIdle)
      return () => window.cancelIdleCallback(id)
    } else {
      const id = setTimeout(handleIdle, 1)
      return () => clearTimeout(id)
    }
  }, [routes, prefetchOnIdle, prefetchRoute])

  const handleHover = useCallback(
    (route: string) => {
      if (!prefetchOnHover) return
      prefetchRoute(route)
    },
    [prefetchOnHover, prefetchRoute]
  )

  return {
    prefetchRoute,
    handleHover
  }
}
