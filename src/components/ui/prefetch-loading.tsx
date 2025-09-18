'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface PrefetchLoadingProps {
  /** Whether the content is loading */
  isLoading?: boolean
  /** Whether this is a prefetch operation */
  isPrefetching?: boolean
  /** Additional CSS classes */
  className?: string
  /** Size of the loading indicator */
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5'
}

export function PrefetchLoading({
  isLoading = false,
  isPrefetching = false,
  className,
  size = 'md'
}: PrefetchLoadingProps) {
  if (!isLoading && !isPrefetching) return null

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        isPrefetching ? 'opacity-40' : 'opacity-100',
        className
      )}
    >
      <Loader2
        className={cn(
          'animate-spin',
          sizeClasses[size],
          isPrefetching ? 'animate-[spin_2s_linear_infinite]' : 'animate-spin'
        )}
      />
    </div>
  )
}
