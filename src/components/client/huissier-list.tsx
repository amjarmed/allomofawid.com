'use client'

import { createClient } from '@/lib/supabase/client'
import { HuissierFilter } from '@/lib/validations/filters'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { Button } from '../ui/button'
import { HuissierCard } from './huissier-card'

const ITEMS_PER_PAGE = 10

export function HuissierList() {
  const t = useTranslations('search')
  const searchParams = useSearchParams()
  const supabase = createClient()

  const filters: HuissierFilter = {
    specialties: searchParams.getAll('specialty'),
    verificationStatus: (searchParams.get('verification') as HuissierFilter['verificationStatus']) || 'all',
    sortBy: (searchParams.get('sortBy') as HuissierFilter['sortBy']) || 'distance',
    sortOrder: (searchParams.get('sortOrder') as HuissierFilter['sortOrder']) || 'desc',
    page: Number(searchParams.get('page')) || 1,
    perPage: ITEMS_PER_PAGE,
  }

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isError,
  } = useInfiniteQuery({
    queryKey: ['huissiers', filters],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('huissiers')
        .select(`
          *,
          ratings(rating),
          specialties!inner(specialty)
        `)

      // Apply filters
      if (filters.specialties.length > 0) {
        query = query.in('specialties.specialty', filters.specialties)
      }

      if (filters.verificationStatus !== 'all') {
        query = query.eq('is_verified', filters.verificationStatus === 'verified')
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'rating':
          query = query.order('avg_rating', { ascending: filters.sortOrder === 'asc' })
          break
        case 'verification':
          query = query.order('is_verified', { ascending: filters.sortOrder === 'asc' })
          break
        case 'distance':
        default:
          // For distance, we need user's location from context/store
          query = query.order('created_at', { ascending: filters.sortOrder === 'asc' })
      }

      // Apply pagination
      query = query
        .range(pageParam * ITEMS_PER_PAGE, (pageParam + 1) * ITEMS_PER_PAGE - 1)

      const { data, error } = await query

      if (error) throw error
      return data
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === ITEMS_PER_PAGE ? pages.length : undefined
    },
    initialPageParam: 0,
  })

  if (isError) {
    return <div className="text-center text-destructive">{t('error')}</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data?.pages.map((page, i) => (
          page.map((huissier) => (
            <HuissierCard key={huissier.id} huissier={huissier} />
          ))
        ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetching}
            variant="outline"
          >
            {isFetching ? t('loading') : t('loadMore')}
          </Button>
        </div>
      )}
    </div>
  )
}
