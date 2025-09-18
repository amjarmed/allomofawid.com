'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface HuissierSkeletonProps {
  className?: string
}

export function HuissierFiltersSkeleton({ className }: HuissierSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="p-4 border rounded-lg bg-card">
        <div className="space-y-4">
          <div>
            <Skeleton className="h-5 w-24 mb-2" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-24" />
              ))}
            </div>
          </div>

          <div>
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div>
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div>
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-[70px]" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  )
}
