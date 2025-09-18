"use client"

import { ProfileWithActivity } from "@/lib/types/supabase/admin"
import { cn } from "@/lib/utils"
import { ActivityIcon, Shield, ShieldOff, Trash2, UserPlus } from "lucide-react"
import { useTranslations } from "next-intl"

interface ActivityTimelineProps {
  activities: ProfileWithActivity["activity_logs"]
  className?: string
}

export default function ActivityTimeline({
  activities = [],
  className,
}: ActivityTimelineProps) {
  const t = useTranslations("admin.users")

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "create":
        return UserPlus
      case "delete":
        return Trash2
      case "activate":
        return Shield
      case "deactivate":
        return ShieldOff
      default:
        return ActivityIcon
    }
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  if (!activities.length) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        {t("activity.noActivity")}
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="font-semibold">{t("activity.title")}</h3>

      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = getActivityIcon(activity.action)
          return (
            <div
              key={activity.id}
              className="flex items-start gap-4 text-sm"
            >
              <div className="mt-0.5">
                <Icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-1">
                <p>
                  {t(`activity.actions.${activity.action}`, {
                    entity: t(`activity.entities.${activity.entity_type}`),
                    ...activity.metadata,
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(activity.created_at)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
