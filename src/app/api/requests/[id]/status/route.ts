import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/database.types'
import {
  updateRequestStatusSchema,
  type RequestRecord,
  type RequestStatus
} from '@/lib/validations/request'
import { checkRequestPermission } from '@/lib/permissions/request'
import { NextResponse } from 'next/server'
import { z } from 'zod'

type RequestRow = Database['public']['Tables']['requests']['Row']
type UpdateRequestStatus = Database['public']['Functions']['update_request_status']['Args']

type RequestRow = Database['public']['Tables']['requests']['Row']
type UpdateRequestStatus = Database['public']['Functions']['update_request_status']['Args']

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate request ID
    const requestId = params.id
    if (!z.string().uuid().safeParse(requestId).success) {
      return NextResponse.json(
        { error: 'Invalid request ID' },
        { status: 400 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateRequestStatusSchema.safeParse({
      ...body,
      requestId,
    })

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validatedData.error },
        { status: 400 }
      )
    }

    const { status, note, attachments } = validatedData.data

    // Get the current request to check permissions
    const { data: existingRequest, error: requestError } = await supabase
      .from('requests')
      .select(`
        id,
        userId,
        huissierId,
        type,
        priority,
        status,
        title,
        description,
        location,
        attachments,
        preferredDate,
        createdAt,
        updatedAt
      `)
      .eq('id', requestId)
      .single()

    if (requestError || !existingRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Check permissions using our permission utility
    const permission = checkRequestPermission(existingRequest as RequestRecord, user, 'update_status', {
      newStatus: status as RequestStatus
    })    if (!permission.allowed) {
      return NextResponse.json(
        { error: 'Forbidden', reason: permission.reason },
        { status: 403 }
      )
    }

    // Call the database function for atomic updates
    const { data: result, error: updateError } = await supabase.rpc(
      'update_request_status',
      {
        p_request_id: requestId,
        p_status: status,
        p_note: note,
        p_attachments: attachments,
        p_user_id: user.id
      } as UpdateRequestStatus
    )

    if (updateError) {
      console.error('Error updating request status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update request status' },
        { status: 500 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in request status update:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
