'use client'

import { FilterErrorComponent, LoadingErrorComponent, NetworkErrorComponent } from '@/components/ui/error'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { useRetry } from '@/hooks/error/use-retry'
import { FilterError } from '@/lib/errors/filter-error'

interface ExampleProps {
  onFetch: () => Promise<void>
}

export function ExampleErrorHandling({ onFetch }: ExampleProps) {
  const {
    isRetrying,
    handleRetry
  } = useRetry(onFetch, {
    maxAttempts: 3,
    delayMs: 1000,
    onError: (error) => {
      console.error('Failed to fetch data:', error)
    }
  })

  // Example error handling with different types of errors
  const handleError = (error: Error) => {
    if (error instanceof FilterError) {
      return <FilterErrorComponent error={error} onReset={handleRetry} />
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return <NetworkErrorComponent code="offline" onRetry={handleRetry} />
    }

    return <LoadingErrorComponent onRetry={handleRetry} isRetrying={isRetrying} />
  }

  return (
    <div className="space-y-4">
      <ErrorBoundary
        fallback={<NetworkErrorComponent code="offline" onRetry={handleRetry} />}
        onReset={handleRetry}
      >
        <div>Network Error Example</div>
      </ErrorBoundary>

      <ErrorBoundary
        fallback={<FilterErrorComponent error={FilterError.invalidFilter('city')} onReset={handleRetry} />}
        onReset={handleRetry}
      >
        <div>Filter Error Example</div>
      </ErrorBoundary>

      <ErrorBoundary
        fallback={<LoadingErrorComponent onRetry={handleRetry} isRetrying={isRetrying} />}
        onReset={handleRetry}
      >
        <div>Loading Error Example</div>
      </ErrorBoundary>
    </div>
  )
}
