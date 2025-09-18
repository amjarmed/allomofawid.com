import ReportDashboard from "@/components/admin/report-dashboard"
import { fireEvent, render, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"

// Mock translations
const messages = {
  admin: {
    reports: {
      title: "Reports",
      description: "View comprehensive reports and analytics",
      exportPDF: "Export PDF",
      exportCSV: "Export CSV",
      selectReport: "Select report type",
      selectDateRange: "Select date range",
      reports: {
        users: "User Report",
        requests: "Request Report",
        activity: "Activity Report",
      },
      stats: {
        totalUsers: "Total Users",
        totalUsersDesc: "Total number of registered users",
        activeUsers: "Active Users",
        activeUsersDesc: "Users active in the last 30 days",
        totalRequests: "Total Requests",
        totalRequestsDesc: "Total number of service requests",
        satisfactionRate: "Satisfaction Rate",
        satisfactionRateDesc: "Average user satisfaction rating",
      },
      charts: {
        monthlyActivity: "Monthly Activity",
        userRoles: "User Roles Distribution",
        users: "Users",
        requests: "Requests",
      },
    },
  },
}

// Mock data
const mockData = {
  userStats: {
    totalUsers: 100,
    activeUsers: 75,
    huissiers: 20,
    newUsersThisMonth: 10,
  },
  activityStats: {
    totalRequests: 500,
    completedRequests: 450,
    avgResponseTime: 30,
    satisfactionRate: 95,
  },
  monthlyStats: [
    { month: "Jan", users: 10, requests: 50 },
    { month: "Feb", users: 20, requests: 75 },
  ],
  userRoles: [
    { role: "user", count: 80 },
    { role: "huissier", count: 15 },
    { role: "admin", count: 5 },
  ],
}

// Mock fetch for export functionality
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    blob: () => Promise.resolve(new Blob()),
  })
) as jest.Mock

describe("ReportDashboard", () => {
  beforeEach(() => {
    // Create URL.createObjectURL mock
    window.URL.createObjectURL = jest.fn()
    // Create URL.revokeObjectURL mock
    window.URL.revokeObjectURL = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("renders the dashboard with correct stats", () => {
    render(
      <NextIntlClientProvider messages={messages} locale="en">
        <ReportDashboard {...mockData} />
      </NextIntlClientProvider>
    )

    // Check if stats are rendered
    expect(screen.getByText("100")).toBeInTheDocument() // Total users
    expect(screen.getByText("75")).toBeInTheDocument() // Active users
    expect(screen.getByText("500")).toBeInTheDocument() // Total requests
    expect(screen.getByText("95%")).toBeInTheDocument() // Satisfaction rate
  })

  it("handles export functionality", async () => {
    render(
      <NextIntlClientProvider messages={messages} locale="en">
        <ReportDashboard {...mockData} />
      </NextIntlClientProvider>
    )

    // Click export PDF button
    fireEvent.click(screen.getByText("Export PDF"))

    // Check if fetch was called with correct parameters
    expect(fetch).toHaveBeenCalledWith("/api/admin/reports/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: expect.stringContaining("pdf"),
    })
  })

  it("allows changing report type", () => {
    render(
      <NextIntlClientProvider messages={messages} locale="en">
        <ReportDashboard {...mockData} />
      </NextIntlClientProvider>
    )

    // Open select dropdown
    fireEvent.click(screen.getByRole("combobox"))

    // Select different report type
    fireEvent.click(screen.getByText("Request Report"))

    // Verify the selection was made
    expect(screen.getByText("Request Report")).toBeInTheDocument()
  })

  // Add more tests as needed...
})
