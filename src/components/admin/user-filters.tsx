"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useTranslations } from "next-intl"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export default function UserFilters() {
  const t = useTranslations("admin.users")
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  const createQueryString = (params: Record<string, string | null>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())

    for (const [key, value] of Object.entries(params)) {
      if (value === null) {
        newSearchParams.delete(key)
      } else {
        newSearchParams.set(key, value)
      }
    }

    return newSearchParams.toString()
  }

  const handleSearch = (term: string) => {
    const query = createQueryString({ search: term || null })
    replace(`${pathname}?${query}`)
  }

  const handleRoleFilter = (role: string) => {
    const query = createQueryString({ role: role || null })
    replace(`${pathname}?${query}`)
  }

  const handleStatusFilter = (status: string) => {
    const query = createQueryString({ status: status || null })
    replace(`${pathname}?${query}`)
  }

  const clearFilters = () => {
    replace(pathname)
  }

  return (
    <div className="flex gap-4 items-center flex-wrap">
      <Input
        placeholder={t("filters.search")}
        value={searchParams.get("search") || ""}
        onChange={(e) => handleSearch(e.target.value)}
        className="max-w-xs"
      />

      <Select
        value={searchParams.get("role") || ""}
        onValueChange={handleRoleFilter}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t("filters.role")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">{t("filters.allRoles")}</SelectItem>
          <SelectItem value="user">{t("filters.roleUser")}</SelectItem>
          <SelectItem value="huissier">{t("filters.roleHuissier")}</SelectItem>
          <SelectItem value="admin">{t("filters.roleAdmin")}</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("status") || ""}
        onValueChange={handleStatusFilter}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t("filters.status")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">{t("filters.allStatuses")}</SelectItem>
          <SelectItem value="active">{t("filters.statusActive")}</SelectItem>
          <SelectItem value="inactive">{t("filters.statusInactive")}</SelectItem>
          <SelectItem value="pending">{t("filters.statusPending")}</SelectItem>
          <SelectItem value="suspended">{t("filters.statusSuspended")}</SelectItem>
        </SelectContent>
      </Select>

      {(searchParams.get("search") ||
        searchParams.get("role") ||
        searchParams.get("status")) && (
        <Button
          variant="outline"
          onClick={clearFilters}
          className="h-10"
        >
          {t("filters.clear")}
        </Button>
      )}
    </div>
  )
}
