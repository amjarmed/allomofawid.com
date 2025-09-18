'use client'

import { useEffect, useState } from 'react'
import type { QueryConfig } from './types'
import { usePrefetch } from './use-prefetch'

interface UsePaginationOptions {
  /** Number of items per page */
  pageSize: number
  /** Total number of items */
  total: number
  /** Initial page number */
  initialPage?: number
  /** Number of pages to prefetch */
  prefetchPages?: number
  /** Cache duration in milliseconds */
  cacheDuration?: number
}

interface PaginationResult<T> {
  /** Current page data */
  data: T[] | null
  /** Current page number (1-based) */
  currentPage: number
  /** Total number of pages */
  totalPages: number
  /** Whether the current page is loading */
  isLoading: boolean
  /** Any error that occurred */
  error: Error | null
  /** Go to a specific page */
  goToPage: (page: number) => void
  /** Go to the next page */
  nextPage: () => void
  /** Go to the previous page */
  previousPage: () => void
  /** Whether there is a next page */
  hasNextPage: boolean
  /** Whether there is a previous page */
  hasPreviousPage: boolean
}

export function usePaginationWithPrefetch<T>(
  baseQuery: QueryConfig,
  options: UsePaginationOptions
): PaginationResult<T> {
  const {
    pageSize,
    total,
    initialPage = 1,
    prefetchPages = 1,
    cacheDuration = 5 * 60 * 1000
  } = options

  const [currentPage, setCurrentPage] = useState(initialPage)
  const totalPages = Math.ceil(total / pageSize)

  // Current page query
  const currentPageData = usePrefetch<T[]>({
    key: `${baseQuery.table}-page-${currentPage}`,
    query: {
      ...baseQuery,
      range: {
        from: (currentPage - 1) * pageSize,
        to: currentPage * pageSize - 1
      }
    },
    options: {
      prefetchOnMount: true,
      cacheDuration
    }
  })

  // Prefetch next pages
  useEffect(() => {
    const prefetchNextPages = async () => {
      for (let i = 1; i <= prefetchPages; i++) {
        const nextPage = currentPage + i
        if (nextPage <= totalPages) {
          usePrefetch<T>({
            key: `${baseQuery.table}-page-${nextPage}`,
            query: {
              ...baseQuery,
              range: {
                from: (nextPage - 1) * pageSize,
                to: nextPage * pageSize - 1
              }
            },
            options: {
              prefetchOnIdle: true,
              cacheDuration
            }
          })
        }
      }
    }

    prefetchNextPages()
  }, [currentPage, totalPages, prefetchPages, pageSize])

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }

  return {
    data: currentPageData.data,
    currentPage,
    totalPages,
    isLoading: currentPageData.isLoading,
    error: currentPageData.error,
    goToPage,
    nextPage,
    previousPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1
  }
}
