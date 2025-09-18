import { createClient } from "@/lib/supabase/server";
import { citySchema } from "@/lib/validations/location";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = createClient()

    // Verify admin role
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    // Validate request body
    const body = await req.json()
    const validatedData = citySchema.parse(body)

    // Convert location and bounds to PostGIS format
    const location = `POINT(${validatedData.location.lng} ${validatedData.location.lat})`
    const bounds = `POLYGON((${validatedData.bounds
      .map(point => `${point.lng} ${point.lat}`)
      .join(", ")}))`

    // Insert city
    const { data, error } = await supabase
      .from("cities")
      .insert({
        region_id: validatedData.region_id,
        name_ar: validatedData.name_ar,
        name_fr: validatedData.name_fr,
        name_en: validatedData.name_en,
        code: validatedData.code,
        location: location,
        bounds: bounds,
        population: validatedData.population,
        active: validatedData.active,
      })
      .select()
      .single()

    if (error) throw error

    // Log activity
    await supabase.from("activity_logs").insert({
      actor_id: user.id,
      action: "create",
      entity_type: "city",
      entity_id: data.id,
      metadata: { city: data },
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating city:", error)
    return NextResponse.json(
      { error: "Error creating city" },
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
    const regionId = searchParams.get("region_id")

    const supabase = createClient()

    let query = supabase
      .from("cities")
      .select(`
        *,
        region:regions (
          name_ar,
          name_fr,
          name_en
        )
      `)

    // Apply filters
    if (search) {
      query = query.or(`
        name_ar.ilike.%${search}%,
        name_fr.ilike.%${search}%,
        name_en.ilike.%${search}%,
        code.ilike.%${search}%
      `)
    }

    if (regionId) {
      query = query.eq("region_id", regionId)
    }

    // Get total count
    const { count } = await supabase
      .from("cities")
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
    console.error("Error fetching cities:", error)
    return NextResponse.json(
      { error: "Error fetching cities" },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const supabase = createClient()

    // Verify admin role
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "City ID is required" },
        { status: 400 }
      )
    }

    // Validate request body
    const body = await req.json()
    const validatedData = citySchema.parse(body)

    // Convert location and bounds to PostGIS format
    const location = `POINT(${validatedData.location.lng} ${validatedData.location.lat})`
    const bounds = `POLYGON((${validatedData.bounds
      .map(point => `${point.lng} ${point.lat}`)
      .join(", ")}))`

    // Update city
    const { data, error } = await supabase
      .from("cities")
      .update({
        region_id: validatedData.region_id,
        name_ar: validatedData.name_ar,
        name_fr: validatedData.name_fr,
        name_en: validatedData.name_en,
        code: validatedData.code,
        location: location,
        bounds: bounds,
        population: validatedData.population,
        active: validatedData.active,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    // Log activity
    await supabase.from("activity_logs").insert({
      actor_id: user.id,
      action: "update",
      entity_type: "city",
      entity_id: id,
      metadata: { city: data },
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating city:", error)
    return NextResponse.json(
      { error: "Error updating city" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = createClient()

    // Verify admin role
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "City ID is required" },
        { status: 400 }
      )
    }

    // Delete city
    const { error } = await supabase
      .from("cities")
      .delete()
      .eq("id", id)

    if (error) throw error

    // Log activity
    await supabase.from("activity_logs").insert({
      actor_id: user.id,
      action: "delete",
      entity_type: "city",
      entity_id: id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting city:", error)
    return NextResponse.json(
      { error: "Error deleting city" },
      { status: 500 }
    )
  }
}
