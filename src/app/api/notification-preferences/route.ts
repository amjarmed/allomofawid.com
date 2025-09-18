import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

const preferencesSchema = z.object({
  categories: z.object({
    request_status: z.boolean(),
    request_messages: z.boolean(),
    request_documents: z.boolean(),
    system_updates: z.boolean(),
  }),
  soundsEnabled: z.boolean(),
  desktopEnabled: z.boolean(),
  emailEnabled: z.boolean(),
  quietHours: z.object({
    enabled: z.boolean(),
    start: z.string(),
    end: z.string(),
    timezone: z.string(),
  }),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's preferences
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching notification preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const json = await request.json()
    const preferences = preferencesSchema.parse(json)

    const supabase = createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Update preferences
    const { error } = await supabase
      .from('notification_preferences')
      .update({
        categories: preferences.categories,
        sounds_enabled: preferences.soundsEnabled,
        desktop_enabled: preferences.desktopEnabled,
        email_enabled: preferences.emailEnabled,
        quiet_hours: preferences.quietHours,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}
