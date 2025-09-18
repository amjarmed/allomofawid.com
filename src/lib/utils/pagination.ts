import {
    PaginatedResponse,
    PaginationAction,
    PaginationQuery,
    PaginationState
} from '@/lib/types/pagination'
import { SupabaseClient } from '@supabase/supabase-js'

type SupabaseQueryBuilder = ReturnType<SupabaseClient['from']>

/**
 * Applies cursor-based pagination to a Supabase query
 * @param query The base Supabase query
 * @param pagination The pagination parameters
 * @returns Paginated response with data and metadata
 */
export async function withCursorPagination<T>(
  query: SupabaseQueryBuilder,
  pagination: PaginationQuery
): Promise<PaginatedResponse<T>> {
  const {
    limit = 10,
    cursor,
    ascending = true,
    sortBy = 'created_at'
  } = pagination

  // Apply sorting and pagination
  let paginatedQuery = query
    .select('*')
    .limit(limit)

  // Apply cursor if provided
  if (cursor) {
    paginatedQuery = ascending
      ? paginatedQuery.gt(sortBy, cursor)
      : paginatedQuery.lt(sortBy, cursor)
  }

  // Get data
  const { data, error } = await paginatedQuery

  if (error) {
    return {
      data: [],
      error,
      cursor: null,
      hasMore: false
    }
  }

  // Get the cursor for the next page
  const lastItem = data?.[data.length - 1]
  const nextCursor = lastItem ? lastItem[sortBy] : null

  // Check if there are more items
  const hasMore = data?.length === limit

  return {
    data: data || [],
    error: null,
    cursor: nextCursor,
    hasMore
  }
}

/**
 * Creates a reducer for managing pagination state
 * @param initialState The initial pagination state
 * @returns A reducer function for pagination state management
 */
export function createPaginationReducer<T>(initialState: PaginationState<T>) {
  return (state: PaginationState<T>, action: PaginationAction): PaginationState<T> => {
    switch (action.type) {
      case 'LOAD_START':
        return {
          ...state,
          isLoading: true
        }
      case 'LOAD_SUCCESS': {
        const { data, cursor, hasMore, count } = action.payload
        return {
          ...state,
          items: data,
          cursor,
          hasMore,
          totalCount: count,
          isLoading: false,
          isFirstPage: !cursor
        }
      }
      case 'LOAD_ERROR':
        return {
          ...state,
          isLoading: false,
          isFirstPage: true,
          cursor: null,
          hasMore: false
        }
      case 'SET_PER_PAGE':
        return {
          ...state,
          perPage: action.perPage,
          cursor: null,
          isFirstPage: true
        }
      case 'RESET':
        return {
          ...initialState,
          perPage: state.perPage
        }
      case 'GO_TO_FIRST':
        return {
          ...state,
          cursor: null,
          isFirstPage: true
        }
      default:
        return state
    }
  }
}
