import UserFilters from "@/components/admin/user-filters"
import UserManagementTable from "@/components/admin/user-management-table"
import { createClient } from "@/lib/supabase/server"
import { ProfileWithActivity } from "@/lib/types/supabase/admin"
import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

export const metadata = {
  title: "User Management",
  description: "Manage users and their roles in the system",
}

async function getUsersData(searchParams: {
  page?: string
  limit?: string
  search?: string
  role?: string
  status?: string
  sortBy?: string
  sortOrder?: string
}) {
  const supabase = createClient()

  const page = parseInt(searchParams.page || "1")
  const limit = parseInt(searchParams.limit || "10")

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      *,
      activity_logs (
        action,
        entity_type,
        created_at
      )
    `)
    .range((page - 1) * limit, page * limit)

  if (error) throw error

  return data as ProfileWithActivity[]
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const t = await getTranslations("admin.users")

  const users = await getUsersData(searchParams as any)

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
      </div>

      <div className="space-y-4">
        <Suspense fallback={<div>{t("loading.filters")}</div>}>
          <UserFilters />
        </Suspense>

        <Suspense fallback={<div>{t("loading.table")}</div>}>
          <UserManagementTable users={users} />
        </Suspense>
      </div>
    </div>
  )
}
