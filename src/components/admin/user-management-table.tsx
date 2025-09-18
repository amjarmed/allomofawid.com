"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ProfileWithActivity } from "@/lib/types/supabase/admin"
import { MoreHorizontal, Shield, ShieldOff, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import ActivityTimeline from "./activity-timeline"
import RoleAssignmentDialog from "./role-assignment-dialog"

type UserAction = "activate" | "deactivate" | "delete"

export default function UserManagementTable({
  users,
}: {
  users: ProfileWithActivity[]
}) {
  const t = useTranslations("admin.users")
  const router = useRouter()
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map((user) => user.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId])
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
    }
  }

  const handleBulkAction = async (action: UserAction) => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds: selectedUsers,
          action,
        }),
      })

      if (!response.ok) throw new Error("Failed to perform bulk action")

      toast.success(t("actions.success"))
      router.refresh()
      setSelectedUsers([])
    } catch (error) {
      console.error("Error performing bulk action:", error)
      toast.error(t("actions.error"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleUpdate = async (userId: string, role: string) => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      })

      if (!response.ok) throw new Error("Failed to update role")

      toast.success(t("actions.roleUpdateSuccess"))
      router.refresh()
    } catch (error) {
      console.error("Error updating role:", error)
      toast.error(t("actions.roleUpdateError"))
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="space-y-4">
      {selectedUsers.length > 0 && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleBulkAction("activate")}
            disabled={isLoading}
          >
            <Shield className="w-4 h-4 mr-2" />
            {t("actions.activate")}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleBulkAction("deactivate")}
            disabled={isLoading}
          >
            <ShieldOff className="w-4 h-4 mr-2" />
            {t("actions.deactivate")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleBulkAction("delete")}
            disabled={isLoading}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t("actions.delete")}
          </Button>
        </div>
      )}

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedUsers.length === users.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>{t("table.name")}</TableHead>
              <TableHead>{t("table.email")}</TableHead>
              <TableHead>{t("table.role")}</TableHead>
              <TableHead>{t("table.status")}</TableHead>
              <TableHead>{t("table.created")}</TableHead>
              <TableHead className="text-right">{t("table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={(checked) =>
                      handleSelectUser(user.id, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell>{user.full_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span
                    className={
                      user.role === "admin"
                        ? "text-red-500"
                        : user.role === "huissier"
                        ? "text-blue-500"
                        : ""
                    }
                  >
                    {t(`roles.${user.role}`)}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.status === "active"
                        ? "bg-green-100 text-green-800"
                        : user.status === "inactive"
                        ? "bg-gray-100 text-gray-800"
                        : user.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {t(`statuses.${user.status}`)}
                  </span>
                </TableCell>
                <TableCell>{formatDate(user.created_at)}</TableCell>
                <TableCell className="text-right">
                  <RoleAssignmentDialog
                    userId={user.id}
                    currentRole={user.role}
                    userName={user.full_name}
                    trigger={
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    }
                    onRoleUpdate={() => router.refresh()}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Activity Timeline */}
      <div className="mt-8">
        <ActivityTimeline
          activities={users.flatMap(user => user.activity_logs)}
        />
      </div>
    </div>
  )
}
