import { type FilterError } from '../errors/filter-error';
import { type HuissierFilters } from '../validations/filters';
import { type HuissierWithPagination } from './huissier';

export type HuissierFilterState = {
  filters: HuissierFilters
  items: HuissierWithPagination['items']
  hasMore: boolean
  isLoading: boolean
  error?: FilterError
}
