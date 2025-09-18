import { PostgrestError } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export type ApiError = {
  code: string
  message: string
  details?: unknown
}

export class ApiException extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 400,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = 'ApiException'
  }
}

export function handleError(error: unknown) {
  console.error('API Error:', error)

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: error.format()
      } satisfies ApiError,
      { status: 400 }
    )
  }

  // Handle Supabase errors
  if ((error as PostgrestError).code !== undefined) {
    const pgError = error as PostgrestError
    return NextResponse.json(
      {
        code: `SUPABASE_${pgError.code}`,
        message: pgError.message,
        details: pgError.details
      } satisfies ApiError,
      { status: 400 }
    )
  }

  // Handle our custom API exceptions
  if (error instanceof ApiException) {
    return NextResponse.json(
      {
        code: error.code,
        message: error.message,
        details: error.details
      } satisfies ApiError,
      { status: error.statusCode }
    )
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred'
    } satisfies ApiError,
    { status: 500 }
  )
}
