import { handleError } from '@/lib/api/error'
import { createClient } from '@/lib/supabase/server'
import { searchSchema } from '@/lib/validations/search'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const params = {
      query: searchParams.get('query') || undefined,
      city: searchParams.get('city') || '',
      specialties: searchParams.getAll('specialties'),
      verified: searchParams.get('verified') === 'true',
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 10
    }

    // Validate search parameters
    const validatedParams = searchSchema.parse(params)

    const supabase = createClient()

    let query = supabase
      .from('huissiers')
      .select('*', { count: 'exact' })
      .eq('active', true)

    // Apply filters
    if (validatedParams.city) {
      query = query.eq('city', validatedParams.city)
    }

    if (validatedParams.specialties?.length) {
      query = query.contains('specialties', validatedParams.specialties)
    }

    if (validatedParams.verified) {
      query = query.eq('verified', true)
    }

    // Add pagination
    const from = (validatedParams.page - 1) * validatedParams.limit
    const to = from + validatedParams.limit - 1

    const { data, error, count } = await query
      .order('rating', { ascending: false })
      .range(from, to)

    if (error) throw error

    return NextResponse.json({
      huissiers: data,
      pagination: {
        total: count,
        page: validatedParams.page,
        limit: validatedParams.limit,
        totalPages: count ? Math.ceil(count / validatedParams.limit) : 0
      }
    })
  } catch (error) {
    return handleError(error)
  }
}
