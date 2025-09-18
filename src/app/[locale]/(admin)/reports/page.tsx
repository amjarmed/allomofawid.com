import ReportDashboard from "@/components/admin/report-dashboard"
import { createClient } from "@/lib/supabase/server"
import { endOfMonth, startOfMonth } from "date-fns"
import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

export const metadata = {
  title: "Admin Reports",
  description: "View comprehensive reports and analytics",
}

async function getReportData() {
  const supabase = createClient()
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  // Get user statistics
  const { data: users } = await supabase
    .from("profiles")
    .select("*")

  const { data: newUsers } = await supabase
    .from("profiles")
    .select("*")
    .gte("created_at", monthStart.toISOString())
    .lte("created_at", monthEnd.toISOString())

  const userStats = {
    totalUsers: users?.length || 0,
    activeUsers: users?.filter(u => u.status === "active").length || 0,
    huissiers: users?.filter(u => u.role === "huissier").length || 0,
    newUsersThisMonth: newUsers?.length || 0,
  }

  // Get activity statistics
  const { data: requests } = await supabase
    .from("requests")
    .select("*")

  const activityStats = {
    totalRequests: requests?.length || 0,
    completedRequests: requests?.filter(r => r.status === "completed").length || 0,
    avgResponseTime: requests?.reduce((acc, curr) => {
      if (curr.responded_at && curr.created_at) {
        const responseTime = new Date(curr.responded_at).getTime() -
                           new Date(curr.created_at).getTime()
        return acc + responseTime
      }
      return acc
    }, 0) / (requests?.length || 1) / (1000 * 60), // Convert to minutes
    satisfactionRate: Math.round(
      (requests?.filter(r => r.rating && r.rating >= 4).length || 0) /
      (requests?.filter(r => r.rating).length || 1) * 100
    ),
  }

  // Get monthly statistics
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    return date.toISOString().slice(0, 7) // YYYY-MM format
  }).reverse()

  const monthlyStats = await Promise.all(
    last6Months.map(async (month) => {
      const { data: monthUsers } = await supabase
        .from("profiles")
        .select("*")
        .ilike("created_at", `${month}%`)

      const { data: monthRequests } = await supabase
        .from("requests")
        .select("*")
        .ilike("created_at", `${month}%`)

      return {
        month: new Date(month).toLocaleDateString(undefined, { month: "short" }),
        users: monthUsers?.length || 0,
        requests: monthRequests?.length || 0,
      }
    })
  )

  // Get user role distribution
  const userRoles = [
    {
      role: "user",
      count: users?.filter(u => u.role === "user").length || 0,
    },
    {
      role: "huissier",
      count: users?.filter(u => u.role === "huissier").length || 0,
    },
    {
      role: "admin",
      count: users?.filter(u => u.role === "admin").length || 0,
    },
  ]

  return {
    userStats,
    activityStats,
    monthlyStats,
    userRoles,
  }
}

export default async function ReportsPage() {
  const t = await getTranslations("admin")
  const data = await getReportData()

  return (
    <div className="p-6">
      <Suspense fallback={<div>{t("reports.loading")}</div>}>
        <ReportDashboard {...data} />
      </Suspense>
    </div>
  )
}
