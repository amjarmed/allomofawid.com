import { createClient } from "@/lib/supabase/server"
import {
    ActivityLogInsert,
    AdminActionResult,
    Database,
    ProfileUpdate,
    ProfileWithActivity
} from "@/lib/types/supabase/admin"
import { SupabaseClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { z } from "zod"

// Input validation schemas
const bulkActionSchema = z.object({
  userIds: z.array(z.string().uuid()),
  action: z.enum(["activate", "deactivate", "delete"]),
})

const roleUpdateSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["user", "huissier", "admin"]),
})

// Verify admin middleware
async function verifyAdmin(
  supabase: SupabaseClient<Database>
): Promise<AdminActionResult> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Unauthorized", status: 401 }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") {
    return { error: "Forbidden", status: 403 }
  }

  return { user: profile }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role")
    const userStatus = searchParams.get("status")
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const supabase = createClient()

    // Verify admin role
    const { error, status } = await verifyAdmin(supabase)
    if (error) {
      return NextResponse.json({ error }, { status })
    }

    let query = supabase
      .from("profiles")
      .select(`
        *,
        activity_logs (
          action,
          entity_type,
          created_at
        )
      `)

    // Apply filters
    if (search) {
      query = query.or(`
        email.ilike.%${search}%,
        full_name.ilike.%${search}%,
        phone.ilike.%${search}%
      `)
    }

    if (role) {
      query = query.eq("role", role)
    }

    if (userStatus) {
      query = query.eq("status", userStatus)
    }

    // Get total count
    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })

    // Get paginated results
    const { data, error: fetchError } = await query
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range((page - 1) * limit, page * limit)

    if (fetchError) throw fetchError

    return NextResponse.json({
      data: data as ProfileWithActivity[],
      meta: {
        total: count,
        page,
        limit,
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Error fetching users" },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const supabase = createClient()

    // Verify admin role
    const { error, status, user } = await verifyAdmin(supabase)
    if (error) {
      return NextResponse.json({ error }, { status })
    }

    const body = await req.json()
    const { userId, role } = roleUpdateSchema.parse(body)

    // Update user role
    const updateData: ProfileUpdate = { role }
    const { data, error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single()

    if (updateError) throw updateError

    // Log activity
    const activityLog: ActivityLogInsert = {
      actor_id: user?.id as string,
      action: "update",
      entity_type: "user_role",
      entity_id: userId,
      metadata: { role },
    }

    await supabase.from("activity_logs").insert(activityLog)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json(
      { error: "Error updating user role" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createClient()

    // Verify admin role
    const { error, status, user } = await verifyAdmin(supabase)
    if (error) {
      return NextResponse.json({ error }, { status })
    }

    const body = await req.json()
    const { userIds, action } = bulkActionSchema.parse(body)

    let updateData: ProfileUpdate = {}

    switch (action) {
      case "activate":
        updateData = { status: "active" }
        break
      case "deactivate":
        updateData = { status: "inactive" }
        break
      case "delete":
        const { error: deleteError } = await supabase
          .from("profiles")
          .delete()
          .in("id", userIds)

        if (deleteError) throw deleteError

        // Log activity for each deleted user
        const deleteLogs: ActivityLogInsert[] = userIds.map(userId => ({
          actor_id: user?.id as string,
          action: "delete",
          entity_type: "user",
          entity_id: userId,
        }))

        await supabase.from("activity_logs").insert(deleteLogs)

        return NextResponse.json({ success: true })
    }

    // Update users
    const { error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .in("id", userIds)

    if (updateError) throw updateError

    // Log activity for each updated user
    const activityLogs: ActivityLogInsert[] = userIds.map(userId => ({
      actor_id: user?.id as string,
      action: action,
      entity_type: "user",
      entity_id: userId,
      metadata: updateData,
    }))

    await supabase.from("activity_logs").insert(activityLogs)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error performing bulk action:", error)
    return NextResponse.json(
      { error: "Error performing bulk action" },
      { status: 500 }
    )
  }
}
