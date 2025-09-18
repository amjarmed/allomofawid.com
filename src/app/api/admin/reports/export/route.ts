import { createClient } from "@/lib/supabase/server"
import { Parser } from "json2csv"
import { NextResponse } from "next/server"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import { z } from "zod"

const exportRequestSchema = z.object({
  type: z.enum(["users", "requests", "activity"]),
  format: z.enum(["pdf", "csv"]),
  dateRange: z.object({
    from: z.string(),
    to: z.string(),
  }),
})

const chartDataSchema = z.array(
  z.object({
    name: z.string(),
    value: z.number(),
  })
)

async function generatePDF(data: any, type: string) {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage()
  const { width, height } = page.getSize()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  // Add title
  page.drawText(`${type.toUpperCase()} Report`, {
    x: 50,
    y: height - 50,
    size: 20,
    font,
    color: rgb(0, 0, 0),
  })

  // Add date
  page.drawText(`Generated on: ${new Date().toLocaleDateString()}`, {
    x: 50,
    y: height - 80,
    size: 12,
    font,
    color: rgb(0.5, 0.5, 0.5),
  })

  // Add data as text
  let y = height - 120
  Object.entries(data).forEach(([key, value]) => {
    page.drawText(`${key}: ${value}`, {
      x: 50,
      y,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    })
    y -= 20
  })

  return pdfDoc.save()
}

export async function POST(req: Request) {
  try {
    const supabase = createClient()

    // Verify admin role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { type, format, dateRange } = exportRequestSchema.parse(body)

    // Get report data based on type
    let data
    switch (type) {
      case "users":
        const { data: users } = await supabase
          .from("profiles")
          .select("*")
          .gte("created_at", dateRange.from)
          .lte("created_at", dateRange.to)

        data = {
          total: users?.length || 0,
          active: users?.filter(u => u.status === "active").length || 0,
          huissiers: users?.filter(u => u.role === "huissier").length || 0,
          admins: users?.filter(u => u.role === "admin").length || 0,
        }
        break

      case "requests":
        const { data: requests } = await supabase
          .from("requests")
          .select("*")
          .gte("created_at", dateRange.from)
          .lte("created_at", dateRange.to)

        data = {
          total: requests?.length || 0,
          completed: requests?.filter(r => r.status === "completed").length || 0,
          pending: requests?.filter(r => r.status === "pending").length || 0,
          cancelled: requests?.filter(r => r.status === "cancelled").length || 0,
        }
        break

      case "activity":
        const { data: activities } = await supabase
          .from("activity_logs")
          .select("*")
          .gte("created_at", dateRange.from)
          .lte("created_at", dateRange.to)

        data = {
          total: activities?.length || 0,
          byType: activities?.reduce((acc, curr) => {
            acc[curr.entity_type] = (acc[curr.entity_type] || 0) + 1
            return acc
          }, {} as Record<string, number>),
        }
        break
    }

    // Generate report in requested format
    if (format === "pdf") {
      const pdfBytes = await generatePDF(data, type)
      return new Response(pdfBytes, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename=report-${type}-${dateRange.from}.pdf`,
        },
      })
    } else {
      const parser = new Parser()
      const csv = parser.parse(
        Array.isArray(data) ? data : [data]
      )
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename=report-${type}-${dateRange.from}.csv`,
        },
      })
    }
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json(
      { error: "Error generating report" },
      { status: 500 }
    )
  }
}
