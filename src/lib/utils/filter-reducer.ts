import { type FilterError } from '../errors/filter-error'

export type FilterAction<T> = {
  type: 'SET_FILTER' | 'SET_ERROR' | 'CLEAR_ERROR' | 'RESET'
  payload?: Partial<T> | FilterError
}

export function createFilterReducer<T>(defaultState: T) {
  return function filterReducer(
    state: T,
    action: FilterAction<T>
  ): T {
    switch (action.type) {
      case 'SET_FILTER':
        return {
          ...state,
          ...action.payload,
          error: undefined,
        }
      case 'SET_ERROR':
        return {
          ...state,
          error: action.payload as FilterError,
        }
      case 'CLEAR_ERROR':
        return {
          ...state,
          error: undefined,
        }
      case 'RESET':
        return {
          ...defaultState,
          error: undefined,
        }
      default:
        return state
    }
  }
}