'use client'

import { useEffect, useRef, useState } from 'react'

interface UseInfiniteScrollOptions<T> {
  onLoadMore: (startIndex: number) => Promise<{
    items: T[]
    hasMore: boolean
  }>
  threshold?: number
}

export function useInfiniteScroll<T>({ onLoadMore, threshold = 100 }: UseInfiniteScrollOptions<T>) {
  const [items, setItems] = useState<T[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const observerRef = useRef<HTMLDivElement>(null)
  const startIndexRef = useRef(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        const target = entries[0]
        if (target.isIntersecting && hasMore && !isLoading) {
          setIsLoading(true)
          try {
            const result = await onLoadMore(startIndexRef.current)
            setItems((prev) => [...prev, ...result.items])
            setHasMore(result.hasMore)
            startIndexRef.current += result.items.length
          } finally {
            setIsLoading(false)
          }
        }
      },
      {
        rootMargin: `${threshold}px`,
      }
    )

    const currentObserver = observer
    const currentElement = observerRef.current

    if (currentElement) {
      currentObserver.observe(currentElement)
    }

    return () => {
      if (currentElement) {
        currentObserver.unobserve(currentElement)
      }
    }
  }, [hasMore, isLoading, onLoadMore, threshold])

  return {
    items,
    isLoading,
    hasMore,
    ref: observerRef,
  }
}
