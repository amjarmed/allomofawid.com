'use client'

import { Progress } from '@/components/ui/progress'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export function NavigationProgress() {
  const [isNavigating, setIsNavigating] = useState(false)
  const [progress, setProgress] = useState(0)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const startProgress = () => {
      setIsNavigating(true)
      setProgress(0)

      const incrementProgress = () => {
        setProgress(prev => {
          if (prev >= 90) return prev
          return prev + (90 - prev) * 0.1
        })

        timeoutId = setTimeout(incrementProgress, 100)
      }

      incrementProgress()
    }

    const completeProgress = () => {
      setProgress(100)
      timeoutId = setTimeout(() => {
        setIsNavigating(false)
        setProgress(0)
      }, 200)
    }

    startProgress()
    completeProgress()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [pathname, searchParams])

  if (!isNavigating) return null

  return (
    <Progress
      value={progress}
      className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-transparent"
    />
  )
}
