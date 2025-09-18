import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { z } from "zod"

const specialtySchema = z.object({
  name_ar: z.string().min(2).max(100),
  name_fr: z.string().min(2).max(100),
  name_en: z.string().min(2).max(100),
  description_ar: z.string().optional(),
  description_fr: z.string().optional(),
  description_en: z.string().optional(),
  slug: z.string().min(2).max(100),
  icon: z.string().optional(),
  active: z.boolean().default(true),
})

// Verify admin middleware
async function verifyAdmin(supabase) {
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

  return { user }
}

export async function POST(req: Request) {
  try {
    const supabase = createClient()

    // Verify admin role
    const { error, status, user } = await verifyAdmin(supabase)
    if (error) {
      return NextResponse.json({ error }, { status })
    }

    // Validate request body
    const body = await req.json()
    const validatedData = specialtySchema.parse(body)

    // Insert specialty
    const { data, error: insertError } = await supabase
      .from("specialties")
      .insert(validatedData)
      .select()
      .single()

    if (insertError) throw insertError

    // Log activity
    await supabase.from("activity_logs").insert({
      actor_id: user.id,
      action: "create",
      entity_type: "specialty",
      entity_id: data.id,
      metadata: { specialty: data },
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating specialty:", error)
    return NextResponse.json(
      { error: "Error creating specialty" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const active = searchParams.get("active")

    const supabase = createClient()

    let query = supabase
      .from("specialties")
      .select(`
        *,
        huissier_specialties (
          huissier:profiles (
            id,
            name,
            city
          ),
          verified,
          verified_at
        )
      `)

    // Apply filters
    if (search) {
      query = query.or(`
        name_ar.ilike.%${search}%,
        name_fr.ilike.%${search}%,
        name_en.ilike.%${search}%,
        slug.ilike.%${search}%
      `)
    }

    if (active !== null) {
      query = query.eq("active", active === "true")
    }

    // Get total count
    const { count } = await supabase
      .from("specialties")
      .select("*", { count: "exact", head: true })

    // Get paginated results
    const { data, error } = await query
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit)

    if (error) throw error

    return NextResponse.json({
      data,
      meta: {
        total: count,
        page,
        limit,
      },
    })
  } catch (error) {
    console.error("Error fetching specialties:", error)
    return NextResponse.json(
      { error: "Error fetching specialties" },
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

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Specialty ID is required" },
        { status: 400 }
      )
    }

    // Validate request body
    const body = await req.json()
    const validatedData = specialtySchema.parse(body)

    // Update specialty
    const { data, error: updateError } = await supabase
      .from("specialties")
      .update(validatedData)
      .eq("id", id)
      .select()
      .single()

    if (updateError) throw updateError

    // Log activity
    await supabase.from("activity_logs").insert({
      actor_id: user.id,
      action: "update",
      entity_type: "specialty",
      entity_id: id,
      metadata: { specialty: data },
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating specialty:", error)
    return NextResponse.json(
      { error: "Error updating specialty" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = createClient()

    // Verify admin role
    const { error, status, user } = await verifyAdmin(supabase)
    if (error) {
      return NextResponse.json({ error }, { status })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Specialty ID is required" },
        { status: 400 }
      )
    }

    // Delete specialty
    const { error: deleteError } = await supabase
      .from("specialties")
      .delete()
      .eq("id", id)

    if (deleteError) throw deleteError

    // Log activity
    await supabase.from("activity_logs").insert({
      actor_id: user.id,
      action: "delete",
      entity_type: "specialty",
      entity_id: id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting specialty:", error)
    return NextResponse.json(
      { error: "Error deleting specialty" },
      { status: 500 }
    )
  }
}
