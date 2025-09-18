import { Database } from "./database"

export type ProfileWithActivity = Database["public"]["Tables"]["profiles"]["Row"] & {
  activity_logs: Array<Database["public"]["Tables"]["activity_logs"]["Row"]>
}

export type AdminActionResult = {
  error?: string
  status?: number
  user?: Database["public"]["Tables"]["profiles"]["Row"]
}

export type UserStatus = "active" | "inactive" | "pending" | "suspended"

export type ActivityLogInsert = Database["public"]["Tables"]["activity_logs"]["Insert"]

export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"]
