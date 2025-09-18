'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CursorPagination } from '@/components/ui/cursor-pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { useLoadingState } from '@/hooks/use-loading-state'
import { type HuissierWithPagination, type Huissier } from '@/lib/types/huissier'
import { type PaginationState } from '@/lib/types/pagination'
import { createFilterReducer } from '@/lib/utils/filter-reducer'
import {
  type HuissierFilters,
  specialtyOptions,
  type Specialty,
  type HuissierFilter
} from '@/lib/validations/filters'
import { Check, SortAsc, SortDesc } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useReducer, useEffect } from 'react'
import { HuissierFiltersSkeleton } from './huissier-filters-skeleton'

export function HuissierFilters() {
  const t = useTranslations('filters')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { isLoading, startLoading, stopLoading } = useLoadingState()

  if (isLoading) {
    return <HuissierFiltersSkeleton />
  }

  // Default filters state
  const defaultFilters: HuissierFilters = {
    specialties: [],
    verificationStatus: 'all',
    sortBy: 'distance',
    sortOrder: 'asc',
    perPage: 10,
    cursor: undefined,
  }

  // Initialize filters from URL params
  const initialFilters: HuissierFilters = {
    specialties: searchParams.get('specialties')?.split(',').filter((s): s is Specialty => 
      specialtyOptions.includes(s as Specialty)
    ) || defaultFilters.specialties,
    verificationStatus:
      (searchParams.get('verification') as HuissierFilters['verificationStatus']) ||
      defaultFilters.verificationStatus,
    sortBy: (searchParams.get('sort') as HuissierFilters['sortBy']) || defaultFilters.sortBy,
    sortOrder: (searchParams.get('order') as HuissierFilters['sortOrder']) || defaultFilters.sortOrder,
    perPage: Number(searchParams.get('per_page')) || defaultFilters.perPage,
    cursor: searchParams.get('cursor') || undefined,
  }

  const [filters, dispatch] = useReducer(createFilterReducer<HuissierFilters>(defaultFilters), initialFilters)

  // Update URL with current filters
  const updateURL = useCallback(async (newFilters: HuissierFilters) => {
    const params = new URLSearchParams()

    try {
      startLoading()

      // Only add params that differ from defaults
      if (newFilters.specialties.length > 0) {
        params.set('specialties', newFilters.specialties.join(','))
      }
      if (newFilters.verificationStatus !== defaultFilters.verificationStatus) {
        params.set('verification', newFilters.verificationStatus)
      }
      if (newFilters.sortBy !== defaultFilters.sortBy) {
        params.set('sort', newFilters.sortBy)
      }
      if (newFilters.sortOrder !== defaultFilters.sortOrder) {
        params.set('order', newFilters.sortOrder)
      }
      if (newFilters.perPage !== defaultFilters.perPage) {
        params.set('per_page', newFilters.perPage.toString())
      }
      if (newFilters.cursor) {
        params.set('cursor', newFilters.cursor)
      }

      // Replace current URL with new params
      await router.replace(`?${params.toString()}`)
    } catch (error) {
      console.error('Error updating URL:', error)
      toast({
        title: t('error.title'),
        description: t('error.description'),
        variant: 'destructive',
      })
    } finally {
      stopLoading()
    }
  }, [defaultFilters, router, t, toast, startLoading, stopLoading])

  // Filter actions
  const toggleSpecialty = (specialty: Specialty) => {
    dispatch({ 
      type: 'SET_FILTER',
      payload: {
        specialties: filters.specialties.includes(specialty)
          ? filters.specialties.filter(s => s !== specialty)
          : [...filters.specialties, specialty]
      }
    })
  }

  const updateVerification = (status: string) => {
    dispatch({
      type: 'SET_FILTER',
      payload: { verificationStatus: status as HuissierFilters['verificationStatus'] }
    })
  }

  const updateSort = (sort: string) => {
    dispatch({
      type: 'SET_FILTER',
      payload: { sortBy: sort as HuissierFilters['sortBy'] }
    })
  }

  const toggleSortOrder = () => {
    dispatch({
      type: 'SET_FILTER',
      payload: { sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' }
    })
  }

  // Update URL whenever filters change
  useEffect(() => {
    updateURL(filters)
  }, [filters, updateURL])

  return (
    <Card className="p-4 space-y-4">
      {/* Specialties */}
      <div className="flex flex-wrap gap-2">
        {specialtyOptions.map((specialty) => (
          <Badge
            key={specialty}
            variant={filters.specialties.includes(specialty) ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => toggleSpecialty(specialty)}
          >
            {filters.specialties.includes(specialty) && (
              <Check className="w-3 h-3 mr-1" />
            )}
            {t(`specialties.${specialty}`)}
          </Badge>
        ))}
      </div>

      <div className="flex flex-wrap gap-4">
        {/* Verification Status */}
        <Select
          value={filters.verificationStatus}
          onValueChange={updateVerification}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('verification.placeholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('verification.all')}</SelectItem>
            <SelectItem value="verified">{t('verification.verified')}</SelectItem>
            <SelectItem value="unverified">{t('verification.unverified')}</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select
          value={filters.sortBy}
          onValueChange={updateSort}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('sort.placeholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="distance">{t('sort.distance')}</SelectItem>
            <SelectItem value="rating">{t('sort.rating')}</SelectItem>
            <SelectItem value="verification">{t('sort.verification')}</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Order */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSortOrder}
        >
          {filters.sortOrder === 'asc' ? (
            <SortAsc className="w-4 h-4" />
          ) : (
            <SortDesc className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Cursor Pagination */}
      <CursorPagination
        cursor={filters.cursor}
        perPage={filters.perPage}
        hasMore={!!filters.cursor}
        isFirstPage={!filters.cursor}
        isLoading={isLoading}
        onPerPageChange={(value) => dispatch({ 
          type: 'SET_FILTER', 
          payload: { perPage: value } 
        })}
        onNavigate={(direction) => {
          if (direction === 'next') {
            dispatch({ type: 'SET_FILTER', payload: { cursor: filters.cursor } })
          } else if (direction === 'prev') {
            dispatch({ type: 'SET_FILTER', payload: { cursor: undefined } })
          }
        }}
      />
    </Card>
  )
}