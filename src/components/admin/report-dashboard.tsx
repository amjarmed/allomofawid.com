"use client"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { addDays } from "date-fns"
import { Download } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

interface ReportDashboardProps {
  userStats: {
    totalUsers: number
    activeUsers: number
    huissiers: number
    newUsersThisMonth: number
  }
  activityStats: {
    totalRequests: number
    completedRequests: number
    avgResponseTime: number
    satisfactionRate: number
  }
  monthlyStats: Array<{
    month: string
    users: number
    requests: number
  }>
  userRoles: Array<{
    role: string
    count: number
  }>
}

export default function ReportDashboard({
  userStats,
  activityStats,
  monthlyStats,
  userRoles,
}: ReportDashboardProps) {
  const t = useTranslations("admin.reports")
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: addDays(new Date(), 30),
  })
  const [reportType, setReportType] = useState("users")

  const handleExport = async (format: "pdf" | "csv") => {
    const response = await fetch("/api/admin/reports/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: reportType,
        format,
        dateRange,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to export report")
    }

    // Download the file
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `report-${reportType}-${dateRange.from.toISOString().split("T")[0]}.${format}`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">{t("title")}</h2>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport("pdf")}
          >
            <Download className="w-4 h-4 mr-2" />
            {t("exportPDF")}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport("csv")}
          >
            <Download className="w-4 h-4 mr-2" />
            {t("exportCSV")}
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("selectReport")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="users">{t("reports.users")}</SelectItem>
            <SelectItem value="requests">{t("reports.requests")}</SelectItem>
            <SelectItem value="activity">{t("reports.activity")}</SelectItem>
          </SelectContent>
        </Select>

        <DatePickerWithRange
          value={dateRange}
          onChange={setDateRange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("stats.totalUsers")}</CardTitle>
            <CardDescription>{t("stats.totalUsersDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("stats.activeUsers")}</CardTitle>
            <CardDescription>{t("stats.activeUsersDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.activeUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("stats.totalRequests")}</CardTitle>
            <CardDescription>{t("stats.totalRequestsDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activityStats.totalRequests}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("stats.satisfactionRate")}</CardTitle>
            <CardDescription>{t("stats.satisfactionRateDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activityStats.satisfactionRate}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("charts.monthlyActivity")}</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#8884d8" name={t("charts.users")} />
                <Bar
                  dataKey="requests"
                  fill="#82ca9d"
                  name={t("charts.requests")}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("charts.userRoles")}</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userRoles}
                  dataKey="count"
                  nameKey="role"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {userRoles.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
