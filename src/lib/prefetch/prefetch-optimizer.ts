'use client'

interface NetworkConditions {
  downlink: number
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g'
  rtt: number
  saveData: boolean
}

interface PrefetchStrategy {
  shouldPrefetch: boolean
  prefetchLimit: number
  cacheDuration: number
}

export class PrefetchOptimizer {
  private static instance: PrefetchOptimizer
  private networkConditions: NetworkConditions
  private userEngagement: Map<string, number> = new Map()
  private prefetchHistory: Map<string, number> = new Map()

  private constructor() {
    this.networkConditions = this.getNetworkConditions()
    this.initNetworkListener()
    this.initUserEngagementTracking()
  }

  static getInstance(): PrefetchOptimizer {
    if (!PrefetchOptimizer.instance) {
      PrefetchOptimizer.instance = new PrefetchOptimizer()
    }
    return PrefetchOptimizer.instance
  }

  private getNetworkConditions(): NetworkConditions {
    if (typeof window === 'undefined') {
      return {
        downlink: 10,
        effectiveType: '4g',
        rtt: 50,
        saveData: false
      }
    }

    const connection = (navigator as any).connection || {
      downlink: 10,
      effectiveType: '4g',
      rtt: 50,
      saveData: false
    }

    return {
      downlink: connection.downlink,
      effectiveType: connection.effectiveType,
      rtt: connection.rtt,
      saveData: connection.saveData
    }
  }

  private initNetworkListener(): void {
    if (typeof window === 'undefined') return

    const connection = (navigator as any).connection
    if (connection) {
      connection.addEventListener('change', () => {
        this.networkConditions = this.getNetworkConditions()
      })
    }
  }

  private initUserEngagementTracking(): void {
    if (typeof window === 'undefined') return

    // Track time spent on routes
    let startTime = Date.now()
    let currentPath = window.location.pathname

    const recordEngagement = () => {
      const timeSpent = Date.now() - startTime
      this.userEngagement.set(
        currentPath,
        (this.userEngagement.get(currentPath) || 0) + timeSpent
      )
    }

    window.addEventListener('popstate', () => {
      recordEngagement()
      currentPath = window.location.pathname
      startTime = Date.now()
    })

    // Record prefetch success/usage
    window.addEventListener('pagehide', () => {
      recordEngagement()
    })
  }

  calculateStrategy(routePath: string): PrefetchStrategy {
    const {
      downlink,
      effectiveType,
      rtt,
      saveData
    } = this.networkConditions

    // Base conditions that prevent prefetching
    if (saveData) {
      return { shouldPrefetch: false, prefetchLimit: 0, cacheDuration: 0 }
    }

    // Calculate network score (0-1)
    const networkScore = Math.min(
      1,
      (downlink / 10) * 0.4 + // Weight: 40%
      (effectiveType === '4g' ? 0.4 : effectiveType === '3g' ? 0.2 : 0) + // Weight: 40%
      (1 - Math.min(1, rtt / 1000)) * 0.2 // Weight: 20%
    )

    // Calculate user engagement score (0-1)
    const engagementTime = this.userEngagement.get(routePath) || 0
    const engagementScore = Math.min(1, engagementTime / (5 * 60 * 1000)) // Cap at 5 minutes

    // Calculate success rate score (0-1)
    const prefetchCount = this.prefetchHistory.get(routePath) || 0
    const successRateScore = prefetchCount > 0 ? 0.8 : 0.5 // Favor previously successful prefetches

    // Combined score (0-1)
    const totalScore =
      networkScore * 0.4 + // Weight: 40%
      engagementScore * 0.3 + // Weight: 30%
      successRateScore * 0.3 // Weight: 30%

    // Define strategy based on total score
    if (totalScore >= 0.7) {
      return {
        shouldPrefetch: true,
        prefetchLimit: 5,
        cacheDuration: 5 * 60 * 1000 // 5 minutes
      }
    } else if (totalScore >= 0.4) {
      return {
        shouldPrefetch: true,
        prefetchLimit: 3,
        cacheDuration: 3 * 60 * 1000 // 3 minutes
      }
    } else {
      return {
        shouldPrefetch: totalScore >= 0.2,
        prefetchLimit: 1,
        cacheDuration: 1 * 60 * 1000 // 1 minute
      }
    }
  }

  recordPrefetch(routePath: string): void {
    this.prefetchHistory.set(
      routePath,
      (this.prefetchHistory.get(routePath) || 0) + 1
    )
  }

  getPrefetchHistory(): Map<string, number> {
    return new Map(this.prefetchHistory)
  }

  getUserEngagement(): Map<string, number> {
    return new Map(this.userEngagement)
  }

  clearHistory(): void {
    this.prefetchHistory.clear()
    this.userEngagement.clear()
  }
}

// Hook for using the PrefetchOptimizer
export function usePrefetchOptimizer() {
  const optimizer = PrefetchOptimizer.getInstance()

  return {
    calculateStrategy: (routePath: string) => optimizer.calculateStrategy(routePath),
    recordPrefetch: (routePath: string) => optimizer.recordPrefetch(routePath),
    getPrefetchHistory: () => optimizer.getPrefetchHistory(),
    getUserEngagement: () => optimizer.getUserEngagement(),
    clearHistory: () => optimizer.clearHistory()
  }
}
