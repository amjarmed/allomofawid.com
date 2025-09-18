'use client'

import { useCallback, useState } from 'react'

interface UseRetryOptions {
  maxAttempts?: number
  delayMs?: number
  onSuccess?: () => void
  onError?: (error: Error) => void
}

interface UseRetryResult {
  isRetrying: boolean
  retryCount: number
  handleRetry: () => Promise<void>
  reset: () => void
}

export function useRetry(
  operation: () => Promise<void>,
  options: UseRetryOptions = {}
): UseRetryResult {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    onSuccess,
    onError
  } = options

  const [isRetrying, setIsRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const reset = useCallback(() => {
    setIsRetrying(false)
    setRetryCount(0)
  }, [])

  const handleRetry = useCallback(async () => {
    if (isRetrying || retryCount >= maxAttempts) {
      return
    }

    setIsRetrying(true)
    setRetryCount((prev) => prev + 1)

    try {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
      await operation()
      onSuccess?.()
      reset()
    } catch (error) {
      onError?.(error as Error)
      setIsRetrying(false)
    }
  }, [isRetrying, retryCount, maxAttempts, delayMs, operation, onSuccess, onError, reset])

  return {
    isRetrying,
    retryCount,
    handleRetry,
    reset
  }
}

export function withRetry<T>(
  operation: () => Promise<T>,
  options: UseRetryOptions = {}
): () => Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    onSuccess,
    onError
  } = options

  return async () => {
    let attempts = 0

    while (attempts < maxAttempts) {
      try {
        const result = await operation()
        onSuccess?.()
        return result
      } catch (error) {
        attempts++
        onError?.(error as Error)

        if (attempts === maxAttempts) {
          throw error
        }

        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }

    throw new Error('Max retry attempts exceeded')
  }
}
