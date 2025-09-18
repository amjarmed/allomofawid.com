export class FilterError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly field?: string
  ) {
    super(message)
    this.name = 'FilterError'
  }

  static invalidFilter(field: string): FilterError {
    return new FilterError(
      `Invalid filter value for ${field}`,
      'INVALID_FILTER',
      field
    )
  }

  static networkError(): FilterError {
    return new FilterError(
      'Failed to fetch results',
      'NETWORK_ERROR'
    )
  }

  static invalidResponse(): FilterError {
    return new FilterError(
      'Invalid response from server',
      'INVALID_RESPONSE'
    )
  }

  static invalidCursor(): FilterError {
    return new FilterError(
      'Invalid pagination cursor',
      'INVALID_CURSOR'
    )
  }
}
