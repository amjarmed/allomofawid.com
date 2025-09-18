/**
 * Generic pagination state that works with Supabase cursor-based pagination
 */
export interface PaginationState<TData> {
  /** Current page items */
  items: TData[]
  /** Current cursor value */
  cursor: string | null
  /** Whether there are more items to load */
  hasMore: boolean
  /** Whether we're at the first page */
  isFirstPage: boolean
  /** Whether we're loading more items */
  isLoading: boolean
  /** Total count of items (if available) */
  totalCount?: number
  /** Number of items per page */
  perPage: number
}

/**
 * Generic pagination query params for Supabase
 */
export interface PaginationQuery {
  /** Number of items to fetch */
  limit: number
  /** Starting position cursor */
  cursor?: string
  /** Sorting order */
  ascending?: boolean
  /** Column to sort by */
  sortBy?: string
}

/**
 * Helper type for cursor-based pagination ranges
 * Used for PostgreSQL range queries with Supabase
 */
export interface CursorRange {
  /** Start cursor value (exclusive) */
  from?: string | number | null
  /** End cursor value (inclusive) */
  to?: string | number | null
}

/**
 * Generic paginated response from Supabase
 */
export interface PaginatedResponse<TData> {
  /** Page data */
  data: TData[]
  /** Total count (if count enabled) */
  count?: number
  /** Error if any */
  error: Error | null
  /** Next cursor value */
  cursor: string | null
  /** Whether there are more items */
  hasMore: boolean
}

/**
 * Pagination actions for managing state
 */
export type PaginationAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: PaginatedResponse<any> }
  | { type: 'LOAD_ERROR'; error: Error }
  | { type: 'SET_PER_PAGE'; perPage: number }
  | { type: 'RESET' }
  | { type: 'GO_TO_FIRST' }
  | { type: 'GO_TO_LAST' }
