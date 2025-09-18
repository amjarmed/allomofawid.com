"use client"

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface RoleAssignmentDialogProps {
  userId: string
  currentRole: string
  userName: string
  trigger: React.ReactNode
  onRoleUpdate: () => void
}

export default function RoleAssignmentDialog({
  userId,
  currentRole,
  userName,
  trigger,
  onRoleUpdate,
}: RoleAssignmentDialogProps) {
  const t = useTranslations("admin.users")
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState(currentRole)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleRoleUpdate = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: selectedRole }),
      })

      if (!response.ok) throw new Error("Failed to update role")

      toast.success(t("actions.roleUpdateSuccess"))
      onRoleUpdate()
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating role:", error)
      toast.error(t("actions.roleUpdateError"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("roleDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("roleDialog.description", { name: userName })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("roleDialog.selectRole")}
            </label>
            <Select
              value={selectedRole}
              onValueChange={setSelectedRole}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">
                  {t("roles.user")}
                </SelectItem>
                <SelectItem value="huissier">
                  {t("roles.huissier")}
                </SelectItem>
                <SelectItem value="admin">
                  {t("roles.admin")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              {t("roleDialog.cancel")}
            </Button>
            <Button
              onClick={handleRoleUpdate}
              disabled={isLoading || selectedRole === currentRole}
            >
              {isLoading ? t("roleDialog.updating") : t("roleDialog.confirm")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
