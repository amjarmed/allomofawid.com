import { ApiException, handleError } from '@/lib/api/error'
import { createClient } from '@/lib/supabase/server'
import { createRequestSchema } from '@/lib/validations/requests'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    // Parse and validate request body
    const body = await req.json()
    const validatedData = createRequestSchema.parse(body)

    // Get authenticated user
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new ApiException('UNAUTHORIZED', 'You must be logged in to create a request', 401)
    }

    // Create request in database
    const { data, error } = await supabase
      .from('requests')
      .insert({
        ...validatedData,
        user_id: user.id,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
