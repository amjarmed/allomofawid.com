import { useCallback, useEffect, useRef, useState } from 'react'

interface UseLoadingStateProps {
  /** The delay before showing the loading state (in ms) */
  delay?: number
  /** The minimum duration to show the loading state (in ms) */
  minDuration?: number
}

export function useLoadingState({
  delay = 200,
  minDuration = 500
}: UseLoadingStateProps = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const loadingStartTime = useRef<number | null>(null)
  const timeoutId = useRef<NodeJS.Timeout | null>(null)

  const startLoading = useCallback(() => {
    // Clear any existing timeout
    if (timeoutId.current) {
      clearTimeout(timeoutId.current)
    }

    // Set a delay before showing loading state to prevent flashing
    timeoutId.current = setTimeout(() => {
      setIsLoading(true)
      loadingStartTime.current = Date.now()
    }, delay)
  }, [delay])

  const stopLoading = useCallback(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current)
    }

    if (loadingStartTime.current) {
      const elapsedTime = Date.now() - loadingStartTime.current
      const remainingTime = Math.max(0, minDuration - elapsedTime)

      // Ensure loading state shows for at least minDuration
      setTimeout(() => {
        setIsLoading(false)
        loadingStartTime.current = null
      }, remainingTime)
    } else {
      setIsLoading(false)
    }
  }, [minDuration])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current)
      }
    }
  }, [])

  return {
    isLoading,
    startLoading,
    stopLoading
  }
}
