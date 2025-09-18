export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          id: string
          created_at: string
          actor_id: string
          action: string
          entity_type: string
          entity_id: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          actor_id: string
          action: string
          entity_type: string
          entity_id: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          actor_id?: string
          action?: string
          entity_type?: string
          entity_id?: string
          metadata?: Json | null
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          full_name: string
          phone: string | null
          role: "user" | "huissier" | "admin"
          status: "active" | "inactive" | "pending" | "suspended"
          metadata: Json | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          full_name: string
          phone?: string | null
          role: "user" | "huissier" | "admin"
          status?: "active" | "inactive" | "pending" | "suspended"
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          full_name?: string
          phone?: string | null
          role?: "user" | "huissier" | "admin"
          status?: "active" | "inactive" | "pending" | "suspended"
          metadata?: Json | null
        }
      }
    }
  }
}
