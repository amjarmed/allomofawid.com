import { POST } from "@/app/api/admin/reports/export/route"
import { createMocks } from "node-mocks-http"

// Mock Supabase client
jest.mock("@/lib/supabase/server", () => ({
  createClient: () => ({
    auth: {
      getUser: () => ({
        data: {
          user: { id: "test-user-id" },
        },
      }),
    },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: () => ({
            data: { role: "admin" },
          }),
        }),
        gte: () => ({
          lte: () => ({
            data: [
              {
                id: "1",
                role: "user",
                status: "active",
                created_at: "2025-01-01",
              },
              {
                id: "2",
                role: "huissier",
                status: "active",
                created_at: "2025-01-02",
              },
            ],
          }),
        }),
      }),
    }),
  }),
}))

describe("/api/admin/reports/export", () => {
  it("returns PDF report for users", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        type: "users",
        format: "pdf",
        dateRange: {
          from: "2025-01-01",
          to: "2025-01-31",
        },
      },
    })

    await POST(req)

    expect(res._getStatusCode()).toBe(200)
    expect(res._getHeaders()["content-type"]).toBe("application/pdf")
    expect(res._getHeaders()["content-disposition"]).toContain(
      'attachment; filename=report-users-2025-01-01.pdf'
    )
  })

  it("returns CSV report for requests", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        type: "requests",
        format: "csv",
        dateRange: {
          from: "2025-01-01",
          to: "2025-01-31",
        },
      },
    })

    await POST(req)

    expect(res._getStatusCode()).toBe(200)
    expect(res._getHeaders()["content-type"]).toBe("text/csv")
    expect(res._getHeaders()["content-disposition"]).toContain(
      'attachment; filename=report-requests-2025-01-01.csv'
    )
  })

  it("validates request body", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        type: "invalid",
        format: "invalid",
        dateRange: {
          from: "invalid",
        },
      },
    })

    await POST(req)

    expect(res._getStatusCode()).toBe(400)
    expect(JSON.parse(res._getData())).toHaveProperty("error")
  })

  it("requires admin role", async () => {
    // Override mock to return non-admin role
    jest.mock("@/lib/supabase/server", () => ({
      createClient: () => ({
        auth: {
          getUser: () => ({
            data: {
              user: { id: "test-user-id" },
            },
          }),
        },
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () => ({
                data: { role: "user" },
              }),
            }),
          }),
        }),
      }),
    }))

    const { req, res } = createMocks({
      method: "POST",
      body: {
        type: "users",
        format: "pdf",
        dateRange: {
          from: "2025-01-01",
          to: "2025-01-31",
        },
      },
    })

    await POST(req)

    expect(res._getStatusCode()).toBe(403)
    expect(JSON.parse(res._getData())).toHaveProperty("error", "Forbidden")
  })
})
