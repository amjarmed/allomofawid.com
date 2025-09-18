'use client'

import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface CursorPaginationProps {
  /** Current cursor value */
  cursor?: string | null
  /** Total number of items (if available) */
  totalItems?: number
  /** Number of items per page */
  perPage: number
  /** Whether there are more items to load */
  hasMore: boolean
  /** Whether we're at the first page */
  isFirstPage: boolean
  /** Loading state */
  isLoading?: boolean
  /** Callback when per page value changes */
  onPerPageChange: (value: number) => void
  /** Callback when navigating to next/previous page */
  onNavigate: (direction: 'next' | 'prev' | 'first' | 'last') => void
  /** Optional className for the container */
  className?: string
}

const PER_PAGE_OPTIONS = [10, 20, 30, 50]

export function CursorPagination({
  cursor,
  totalItems,
  perPage,
  hasMore,
  isFirstPage,
  isLoading,
  onPerPageChange,
  onNavigate,
  className = '',
}: CursorPaginationProps) {
  const t = useTranslations('pagination')

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground">
          {t('itemsPerPage')}
        </p>
        <Select
          value={perPage.toString()}
          onValueChange={(value) => onPerPageChange(Number(value))}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PER_PAGE_OPTIONS.map((value) => (
              <SelectItem key={value} value={value.toString()}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {totalItems !== undefined && (
          <p className="text-sm text-muted-foreground">
            {t('totalItems', { count: totalItems })}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={isFirstPage || isLoading}
          onClick={() => onNavigate('first')}
        >
          <ChevronsLeft className="h-4 w-4" />
          <span className="sr-only">{t('firstPage')}</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={isFirstPage || isLoading}
          onClick={() => onNavigate('prev')}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">{t('previousPage')}</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={!hasMore || isLoading}
          onClick={() => onNavigate('next')}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">{t('nextPage')}</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={!hasMore || isLoading}
          onClick={() => onNavigate('last')}
        >
          <ChevronsRight className="h-4 w-4" />
          <span className="sr-only">{t('lastPage')}</span>
        </Button>
      </div>
    </div>
  )
}
